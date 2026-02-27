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
import { FONTS, FONT_KEYS } from "../../src/fonts";
import type { OpenSCAD } from "openscad-wasm";

// Font bytes cached across instances to avoid re-fetching

const FONTS_CONF = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>/fonts</dir>
</fontconfig>`;

function post(msg: any) {
  self.postMessage(msg);
}

let fontCache: Map<string, Uint8Array> | null = null;

async function loadFonts() {
  if (fontCache) return fontCache;

  post({ type: "progress", message: "Loading fonts..." });

  // Fetch all text fonts + FA icon font in parallel
  const fontFiles = FONT_KEYS.map((key) => FONTS[key].file);
  const allFiles = [...fontFiles, "fa-solid-900.ttf"];
  const responses = await Promise.all(allFiles.map((f) => fetch(`/fonts/${f}`)));

  fontCache = new Map();
  for (let i = 0; i < allFiles.length; i++) {
    if (responses[i].ok) {
      fontCache.set(allFiles[i], new Uint8Array(await responses[i].arrayBuffer()));
    }
  }
  return fontCache;
}

async function createInstance(): Promise<OpenSCAD> {
  // Pre-fetch fonts before WASM creation (cached after first call)
  const fonts = await loadFonts();

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
    const scad = await createInstance();

    post({ type: "progress", message: "Building geometry..." });
    const label = makeLabel(config);

    const obj = label[part];
    const scadCode = obj.serialize({ $fn: 32 });
    const safeName = config.labelText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
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
