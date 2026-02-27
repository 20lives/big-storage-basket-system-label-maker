/**
 * CLI entry point — generates .scad and .stl files for labels
 *
 * Usage:
 *   bun run generate --text "LEGO"
 *   bun run generate --text "TOOLS" --stl
 *   bun run generate --batch examples/labels.json --stl
 *
 * Output:
 *   out/<text>.scad        — combined (preview in OpenSCAD)
 *   out/<text>_base.scad   — Color 1 only
 *   out/<text>_top.scad    — Color 2 only
 *   out/<text>_base.stl    — Color 1 STL (with --stl)
 *   out/<text>_top.stl     — Color 2 STL (with --stl)
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defaultConfig, makeLabel, serializeLabel, type LabelConfig } from "./label";
import { renderToStl } from "./render";

// ─── Argument parsing ─────────────────────────────────────────────────────────

function parseArgs(): { configs: LabelConfig[]; outDir: string; stl: boolean } {
  const args = process.argv.slice(2);
  const outDir = "out";
  const stl = args.includes("--stl");

  // Batch mode: --batch labels.json
  const batchIdx = args.indexOf("--batch");
  if (batchIdx !== -1) {
    const batchFile = args[batchIdx + 1];
    if (!batchFile) {
      console.error("--batch requires a JSON file path");
      process.exit(1);
    }
    const raw = JSON.parse(require("node:fs").readFileSync(batchFile, "utf8"));
    const configs: LabelConfig[] = Array.isArray(raw)
      ? raw.map((item: Partial<LabelConfig>) => ({ ...defaultConfig, ...item }))
      : [{ ...defaultConfig, ...raw }];
    return { configs, outDir, stl };
  }

  // Single label mode
  const cfg: LabelConfig = { ...defaultConfig };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--text":         cfg.labelText = args[++i]; break;
      case "--text2":        cfg.labelText2 = args[++i]; break;
      case "--icon":         cfg.icon = args[++i]; break;
      case "--width":        cfg.width = Number(args[++i]); break;
      case "--height":       cfg.height = Number(args[++i]); break;
      case "--depth":        cfg.baseDepth = Number(args[++i]); break;
      case "--font-size":    cfg.fontSize = Number(args[++i]); break;
      case "--border":       cfg.borderWidth = Number(args[++i]); break;
      case "--corner-radius":cfg.cornerRadius = Number(args[++i]); break;
      case "--text-layer":   cfg.textLayerHeight = Number(args[++i]); break;
      case "--stl": break; // handled above
      default:
        if (!args[i].startsWith("--")) break;
        console.warn(`Unknown argument: ${args[i]}`);
    }
  }

  return { configs: [cfg], outDir, stl };
}

// ─── File generation ──────────────────────────────────────────────────────────

function safeName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    || "label";
}

async function generateLabel(cfg: LabelConfig, outDir: string, stl: boolean) {
  const { base, top } = makeLabel(cfg);
  const name = safeName(cfg.labelText);

  const combined = serializeLabel(cfg);

  const baseScad = `// ── BASE (Color 1: background color) ──\n$fn = 32;\n` + base.serialize({ $fn: 32 });
  const topScad  = `// ── TOP (Color 2: text / accent color) ──\n$fn = 32;\n` + top.serialize({ $fn: 32 });

  await mkdir(outDir, { recursive: true });

  const writes: Promise<void>[] = [
    writeFile(join(outDir, `${name}.scad`), combined),
    writeFile(join(outDir, `${name}_base.scad`), baseScad),
    writeFile(join(outDir, `${name}_top.scad`), topScad),
  ];

  if (stl) {
    process.stdout.write(`  Rendering STL for "${cfg.labelText}"...`);
    // openscad-wasm is single-threaded — renders must be sequential
    const baseStl = await renderToStl(base, { $fn: 32 });
    const topStl  = await renderToStl(top,  { $fn: 32 });
    writes.push(
      writeFile(join(outDir, `${name}_base.stl`), baseStl),
      writeFile(join(outDir, `${name}_top.stl`), topStl),
    );
    process.stdout.write(" done\n");
  }

  await Promise.all(writes);

  console.log(`✓ ${cfg.labelText} → ${name}_{base,top}.scad${stl ? ", .stl" : ""}`);
  console.log(`  Size: ${cfg.width}×${cfg.height}×${(cfg.baseDepth + cfg.textLayerHeight).toFixed(1)}mm`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { configs, outDir, stl } = parseArgs();

  console.log(`Generating ${configs.length} label(s)${stl ? " + STL" : ""}...\n`);

  for (const cfg of configs) {
    await generateLabel(cfg, outDir, stl);
  }

  console.log(`\nDone! Files in out/`);
  if (!stl) {
    console.log(`Tip: add --stl to also render STL files via openscad-wasm (no OpenSCAD install needed)`);
  }
  console.log(`\nDual-color slicer: filament change at Z = ${configs[0]?.baseDepth ?? 0.4}mm`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
