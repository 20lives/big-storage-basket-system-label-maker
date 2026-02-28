/**
 * Web Worker: openscad-wasm STL rendering (off main thread)
 *
 * Protocol:
 *   Main → Worker: { type: "render", config: LabelConfig, part: "combined"|"base"|"top" }
 *   Worker → Main: { type: "ready" }
 *   Worker → Main: { type: "progress", message: string }
 *   Worker → Main: { type: "result", stl: ArrayBuffer, filename: string }
 *   Worker → Main: { type: "error", message: string }
 */
import { makeLabel } from "../../src/label";
import { createOpenSCAD } from "openscad-wasm";
import type { LabelConfig } from "../../src/label";
import { FONTS, FA_ICON_FONT, collectFontFiles } from "../../src/fonts";
import type { FontKey } from "../../src/fonts";
import type { OpenSCAD } from "openscad-wasm";

const FONTS_CONF = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>/fonts</dir>
  <cachedir>/tmp/cache</cachedir>
</fontconfig>`;

function post(msg: any) {
  self.postMessage(msg);
}

// Per-file cache to dedupe font fetches
const fontFileCache = new Map<string, Promise<Uint8Array>>();

function fetchFont(filename: string): Promise<Uint8Array> {
  let cached = fontFileCache.get(filename);
  if (!cached) {
    cached = fetch(`/fonts/${filename}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch font: ${filename}`);
        return r.arrayBuffer();
      })
      .then((buf) => new Uint8Array(buf));
    fontFileCache.set(filename, cached);
  }
  return cached;
}

async function loadFontsForConfig(
  primaryKey: FontKey,
  subtitleKey?: FontKey,
): Promise<Map<string, Uint8Array>> {
  const needed = collectFontFiles(primaryKey, subtitleKey);
  const entries = await Promise.all(
    needed.map(async (f) => [f, await fetchFont(f)] as const),
  );
  return new Map(entries);
}

async function createInstance(fonts: Map<string, Uint8Array>): Promise<OpenSCAD> {
  post({ type: "progress", message: "Loading OpenSCAD WASM engine..." });

  const instance = await createOpenSCAD({
    print: (msg: string) => console.log("[scad-worker]", msg),
    printErr: (msg: string) => console.warn("[scad-worker]", msg),
    // Inject fonts into WASM FS BEFORE C++ constructors run.
    // This ensures fontconfig's FcInit() finds our config and fonts
    // during initRuntime(), preventing the "indirect call to null" crash.
    preRun: (mod: any) => {
      mod.FS.mkdir("/fonts");
      mod.FS.writeFile("/fonts/fonts.conf", FONTS_CONF);
      for (const [filename, data] of fonts) {
        mod.FS.writeFile(`/fonts/${filename}`, data);
      }
      try {
        mod.FS.mkdir("/tmp");
      } catch {}
      try {
        mod.FS.mkdir("/tmp/cache");
      } catch {}
      mod.ENV.FONTCONFIG_FILE = "/fonts/fonts.conf";
    },
  });

  return instance.getInstance();
}

function renderSTL(
  scad: OpenSCAD,
  scadCode: string,
  filename: string,
): ArrayBuffer {
  scad.FS.writeFile("/input.scad", scadCode);
  scad.callMain(["/input.scad", "-o", "/output.stl"]);
  const stlData = scad.FS.readFile("/output.stl", { encoding: "binary" });

  // Clean up
  scad.FS.unlink("/input.scad");
  scad.FS.unlink("/output.stl");

  return (stlData as Uint8Array).buffer;
}

self.onmessage = async (
  e: MessageEvent<{
    type: "render";
    config: LabelConfig;
    part: "combined" | "base" | "top";
  }>,
) => {
  const { config, part } = e.data;

  try {
    post({ type: "progress", message: "Loading fonts..." });
    const fonts = await loadFontsForConfig(
      config.fontFamily as FontKey,
      config.subtitleFontFamily as FontKey | undefined,
    );

    const scad = await createInstance(fonts);

    post({ type: "progress", message: "Building geometry..." });
    const label = makeLabel(config);

    const obj = label[part];
    const scadCode = obj.serialize({ $fn: 32 });
    const safeName = config.labelText
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "_")
      .replace(/^_|_$/g, "");
    const suffix = part === "combined" ? "" : `_${part}`;
    const filename = `${safeName}${suffix}.stl`;

    post({ type: "progress", message: "Rendering STL..." });
    const stl = renderSTL(scad, scadCode, filename);

    post({ type: "result", stl, filename }, [stl] /* transfer */);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    post({ type: "error", message });
  }
};

// Signal ready
post({ type: "ready" });
