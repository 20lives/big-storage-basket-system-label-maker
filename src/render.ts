/**
 * Custom render helper that injects fonts into the openscad-wasm FS
 * so that text() calls produce actual geometry.
 *
 * openscad-wasm exits after each callMain, so a fresh instance is
 * created per render call.
 */

import { createOpenSCAD } from "openscad-wasm";
import type { ScadObject, ScadSpecialVariables } from "scad-js";

const LIBERATION_PATH = "/usr/share/fonts/liberation/LiberationSans-Bold.ttf";
const FA_FONT_PATH = new URL("../fonts/fa-solid-900.ttf", import.meta.url).pathname;

const FONTS_CONF = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/fonts</dir>
  <cachedir>/tmp/cache</cachedir>
</fontconfig>`;

// Cache font bytes — read from disk once
let liberationBytes: Uint8Array | null = null;
let faBytes: Uint8Array | null = null;

async function freshInstance() {
  const inst = await createOpenSCAD({ print: () => {}, printErr: () => {} });
  const scad = inst.getInstance();

  liberationBytes ??= await Bun.file(LIBERATION_PATH).bytes();
  faBytes         ??= await Bun.file(FA_FONT_PATH).bytes();

  scad.FS.mkdir("/fonts");
  scad.FS.writeFile("/fonts/LiberationSans-Bold.ttf", liberationBytes);
  scad.FS.writeFile("/fonts/fa-solid-900.ttf", faBytes);

  try { scad.FS.mkdir("/etc"); } catch {}
  try { scad.FS.mkdir("/etc/fonts"); } catch {}
  scad.FS.writeFile("/etc/fonts/fonts.conf", FONTS_CONF);

  return scad;
}

export async function renderToStl(
  obj: ScadObject,
  vars: ScadSpecialVariables & Record<string, any> = {}
): Promise<string> {
  const scad = await freshInstance();
  const code = obj.serialize(vars);

  scad.FS.writeFile("/input.scad", code);
  scad.callMain(["/input.scad", "-o", "/output.stl"]);
  return scad.FS.readFile("/output.stl", { encoding: "utf8" });
}
