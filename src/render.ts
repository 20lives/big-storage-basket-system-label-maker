/**
 * Custom render helper that injects fonts into the openscad-wasm FS
 * so that text() calls produce actual geometry.
 *
 * openscad-wasm exits after each callMain, so a fresh instance is
 * created per render call.
 */

import { createOpenSCAD } from "openscad-wasm";
import type { ScadObject, ScadSpecialVariables } from "scad-js";
import { FONTS, FA_ICON_FONT, FONT_KEYS } from "./fonts";

const FONTS_CONF = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/fonts</dir>
  <cachedir>/tmp/cache</cachedir>
</fontconfig>`;

// Resolve font file paths relative to this module
function fontPath(filename: string): string {
  return new URL(`../public/fonts/${filename}`, import.meta.url).pathname;
}

// Cache font bytes — read from disk once
let fontBytesCache: Map<string, Uint8Array> | null = null;

async function loadAllFonts(): Promise<Map<string, Uint8Array>> {
  if (fontBytesCache) return fontBytesCache;
  fontBytesCache = new Map();

  // Load all text font files
  const allFiles = new Set<string>();
  for (const key of FONT_KEYS) {
    for (const f of FONTS[key].files) allFiles.add(f);
  }
  allFiles.add(FA_ICON_FONT.file);

  for (const filename of allFiles) {
    const bytes = await Bun.file(fontPath(filename)).bytes();
    fontBytesCache.set(filename, bytes);
  }

  return fontBytesCache;
}

async function freshInstance() {
  const fonts = await loadAllFonts();
  const inst = await createOpenSCAD({ print: () => {}, printErr: () => {} });
  const scad = inst.getInstance();

  scad.FS.mkdir("/fonts");
  for (const [filename, data] of fonts) {
    scad.FS.writeFile(`/fonts/${filename}`, data);
  }

  try { scad.FS.mkdir("/etc"); } catch {}
  try { scad.FS.mkdir("/etc/fonts"); } catch {}
  scad.FS.writeFile("/etc/fonts/fonts.conf", FONTS_CONF);

  return scad;
}

export async function renderToStl(
  obj: ScadObject,
  vars: ScadSpecialVariables & Record<string, any> = {},
): Promise<string> {
  const scad = await freshInstance();
  const code = obj.serialize(vars);
  scad.FS.writeFile("/input.scad", code);
  scad.callMain(["/input.scad", "-o", "/output.stl"]);
  return scad.FS.readFile("/output.stl", { encoding: "utf8" });
}
