/**
 * POC: Prove client-side STL generation works.
 *
 * Flow: scad-js builds CSG tree → serialize to .scad text → openscad-wasm renders to STL → download
 */
import { makeLabel, defaultConfig } from "../src/label";
import { createOpenSCAD } from "openscad-wasm";

const btn = document.getElementById("generate") as HTMLButtonElement;
const status = document.getElementById("status")!;

const FONTS_CONF = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/fonts</dir>
  <cachedir>/tmp/cache</cachedir>
</fontconfig>`;

function log(msg: string) {
  status.textContent = msg;
  console.log(msg);
}

btn.addEventListener("click", async () => {
  btn.disabled = true;
  const t0 = performance.now();

  try {
    // 1. Build label geometry using scad-js (runs instantly — pure JS)
    log("Building label geometry...");
    const cfg = { ...defaultConfig, labelText: "TOOLS", icon: "wrench" };
    const { combined } = makeLabel(cfg);
    const scadCode = combined.serialize({ $fn: 32 });
    log(`scad-js: generated ${scadCode.length} chars of OpenSCAD code`);

    // 2. Initialize openscad-wasm (loads ~14MB WASM from base64)
    log("Loading OpenSCAD WASM engine...");
    const instance = await createOpenSCAD({
      print: (msg: string) => console.log("[scad]", msg),
      printErr: (msg: string) => console.warn("[scad]", msg),
    });
    const scad = instance.getInstance();
    log("WASM engine ready");

    // 3. Inject fonts into WASM virtual FS
    log("Loading fonts...");
    const [liberationRes, faRes] = await Promise.all([
      fetch("/fonts/LiberationSans-Bold.ttf"),
      fetch("/fonts/fa-solid-900.ttf"),
    ]);

    scad.FS.mkdir("/fonts");

    if (liberationRes.ok) {
      scad.FS.writeFile("/fonts/LiberationSans-Bold.ttf", new Uint8Array(await liberationRes.arrayBuffer()));
    } else {
      console.warn("Liberation Sans not available — text may not render");
    }

    if (faRes.ok) {
      scad.FS.writeFile("/fonts/fa-solid-900.ttf", new Uint8Array(await faRes.arrayBuffer()));
    }

    // fontconfig so OpenSCAD discovers the fonts
    try { scad.FS.mkdir("/etc"); } catch {}
    try { scad.FS.mkdir("/etc/fonts"); } catch {}
    scad.FS.writeFile("/etc/fonts/fonts.conf", FONTS_CONF);

    // 4. Render .scad → .stl
    log("Rendering STL (this may take a few seconds)...");
    scad.FS.writeFile("/input.scad", scadCode);
    scad.callMain(["/input.scad", "-o", "/output.stl"]);
    const stl = scad.FS.readFile("/output.stl", { encoding: "utf8" });

    const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
    log(`Done in ${elapsed}s — STL is ${(stl.length / 1024).toFixed(0)} KB`);

    // 5. Trigger browser download
    const blob = new Blob([stl], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "label.stl";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`Error: ${msg}`);
    console.error(err);
  } finally {
    btn.disabled = false;
  }
});
