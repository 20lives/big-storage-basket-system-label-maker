<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/banner.svg">
  <source media="(prefers-color-scheme: light)" srcset=".github/assets/banner.svg">
  <img alt="Label Maker — Parametric 3D-printable labels for storage baskets" src=".github/assets/banner.svg" width="100%">
</picture>

<br>

[![CI](https://github.com/20lives/Big-Storage-Basket-System-Label-Maker/actions/workflows/ci.yml/badge.svg)](https://github.com/20lives/Big-Storage-Basket-System-Label-Maker/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)

**Generate beautiful dual-color 3D-printable labels for storage baskets.**<br>
Web UI with live preview · CLI for batch generation · 600+ Font Awesome icons

[Web App](#-web-ui) · [CLI Usage](#-cli) · [Printing Guide](#-dual-color-printing) · [Contributing](CONTRIBUTING.md)

</div>

<br>

<div align="center">
  <img src=".github/assets/label-preview.png" alt="3D label preview showing a TOOLS label with wrench icon" width="600">
  <br>
  <sub>Example: dual-color label with icon, border, and subtitle</sub>
</div>

<br>

## Highlights

- **Dual-color ready** — generates separate base and top layers for multi-color 3D printing
- **Web UI** — browser-based editor with real-time 3D preview (via OpenSCAD WASM)
- **CLI** — single labels or batch generation from JSON
- **600+ icons** — built-in Font Awesome icon library
- **Fully parametric** — width, height, font size, border, corner radius, and more
- **Three output modes** — combined, base-only, and top-only `.scad` files

## Quick Start

```bash
# Install dependencies
bun install

# Launch the web UI
bun run dev

# Or generate a label via CLI
bun run generate --text "LEGO"
```

> **Prerequisites:** [Bun](https://bun.sh) (runtime & package manager). [OpenSCAD](https://openscad.org) needed only for CLI `.scad` → STL export.

---

## 🖥 Web UI

Start the development server and open your browser:

```bash
bun run dev
```

The web editor lets you:
- Configure label text, dimensions, fonts, and icons
- See a live 3D preview rendered with OpenSCAD WASM
- Download STL files directly from the browser

<div align="center">
  <img src=".github/assets/web-ui.png" alt="Web UI screenshot showing the label editor with live preview" width="720">
  <br>
  <sub>Web editor with live preview, icon picker, and STL download</sub>
</div>

---

## ⌨ CLI

### Single Label

```bash
bun run generate --text "LEGO"
bun run generate --text "TOOLS" --width 70 --height 30 --font-size 9
```

### Batch Generation

```bash
# Use the included example file
bun run batch

# Or specify your own
bun run generate --batch my-labels.json
```

<details>
<summary>Example <code>labels.json</code></summary>

```json
[
  { "labelText": "LEGO", "width": 60, "height": 25 },
  { "labelText": "DUPLO", "width": 60, "height": 25 },
  { "labelText": "TOOLS", "width": 70, "height": 25, "fontSize": 8 }
]
```

</details>

### All Options

| Flag | Default | Description |
|------|---------|-------------|
| `--text` | `LABEL` | Label text |
| `--width` | `60` | Width in mm |
| `--height` | `25` | Height in mm |
| `--depth` | `3` | Base thickness in mm |
| `--font-size` | `7` | Font size in mm |
| `--border` | `1.5` | Border width in mm |
| `--corner-radius` | `2` | Corner radius in mm |
| `--text-layer` | `0.6` | Raised layer height in mm |
| `--batch` | — | Path to batch JSON file |

### Output

```
out/
  label.scad          # Combined model (preview & export)
  label_base.scad     # Color 1 — base plate
  label_top.scad      # Color 2 — border + text
```

---

## 🎨 Dual-Color Printing

<details>
<summary><b>Method A:</b> Filament change (AMS / pause at layer)</summary>

1. Export the combined `.scad` to STL via OpenSCAD
2. Import into your slicer
3. Add a filament change at **Z = base depth** (default: 3 mm)
4. Color 1 below, Color 2 above

</details>

<details>
<summary><b>Method B:</b> Separate prints + assembly</summary>

1. Print `_base.scad` → STL in Color 1
2. Print `_top.scad` → STL in Color 2
3. Glue the top onto the base

</details>

<details>
<summary><b>Method C:</b> Multi-material (IDEX / toolchanger)</summary>

Import both `_base.scad` and `_top.scad` as separate STLs, assign different extruders, print simultaneously.

</details>

---

## 🏗 Architecture

```
src/
├── label.ts        # Parametric 3D model (shared: CLI + web)
├── fa-icons.ts     # Font Awesome icon map (shared)
├── render.ts       # OpenSCAD rendering logic
├── fonts.ts        # Font path resolution
└── generate.ts     # CLI entry point

app/
├── routes/         # TanStack Start pages
├── components/     # React UI components
├── hooks/          # Custom React hooks
├── worker/         # Web Worker for WASM rendering
└── styles/         # Tailwind CSS
```

---

## 🧑‍💻 Programmatic Usage

```typescript
import { makeLabel, serializeLabel } from "./index";

const scad = serializeLabel({
  labelText: "BOLTS M3",
  width: 65,
  height: 25,
  baseDepth: 3,
  cornerRadius: 2,
  textLayerHeight: 0.6,
  fontSize: 6,
  hasBorder: true,
  borderWidth: 1.5,
  textMargin: 1,
});

await Bun.write("out/bolts_m3.scad", scad);
```

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Credits

Based on the [Big Storage Basket System Label Maker](https://makerworld.com/en/models/1049761-big-storage-basket-system-label-maker) on MakerWorld.

Built with [scad-js](https://github.com/scad-js/scad-js), [Bun](https://bun.sh), [TanStack Start](https://tanstack.com/start), and [Tailwind CSS](https://tailwindcss.com).

## License

[MIT](LICENSE) © [20lives](https://github.com/20lives)
# big-storage-basket-system-label-maker
