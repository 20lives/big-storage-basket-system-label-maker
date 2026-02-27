/**
 * Big Storage Basket System Label Maker
 * Dual-color 3D printable labels
 *
 * Design: Base plate (color 1) + raised text/border (color 2)
 * The text is extruded so a filament color change at the right layer
 * gives a clean dual-color result.
 */

import {
  cube,
  cylinder,
  difference,
  union,
  create,
} from "scad-js";
import type { ScadObject, ScadSpecialVariables } from "scad-js";
import * as transformations from "scad-js";
import { resolveIcon } from "./fa-icons";
import { FONTS, DEFAULT_FONT } from "./fonts";
import type { FontKey } from "./fonts";

// ─── Type helpers ────────────────────────────────────────────────────────────

/** Create a raw OpenSCAD primitive that scad-js can chain transforms on */
function rawObject(type: string, params: Record<string, any>): ScadObject {
  // We need to build a proper scad-js object with the transform prototype
  // scad-js objects use Object.create(proto) + assign — we replicate that here
  // by borrowing the prototype from any existing object
  const proto = cube(1); // grab the prototype
  return create(Object.getPrototypeOf(proto), { type, params });
}

/** OpenSCAD text() — not in scad-js primitives, so we create it manually */
function text(
  str: string,
  opts: {
    size?: number;
    font?: string;
    halign?: "left" | "center" | "right";
    valign?: "baseline" | "bottom" | "center" | "top";
    spacing?: number;
    $fn?: number;
  } = {}
): ScadObject {
  return rawObject("text", {
    text: str,
    size: opts.size ?? 6,
    font: opts.font ?? "Liberation Sans:style=Bold",
    halign: opts.halign ?? "center",
    valign: opts.valign ?? "center",
    spacing: opts.spacing ?? 1,
    $fn: opts.$fn ?? 4,
  });
}

// ─── Label parameters ────────────────────────────────────────────────────────

export interface LabelConfig {
  /** Primary (large) text */
  labelText: string;
  /** Optional secondary (small) text below the primary */
  labelText2?: string;
  /** Optional Font Awesome icon name (e.g. "wrench", "gamepad", "utensils") */
  icon?: string;
  /** Position of the icon relative to text: "left" (default) or "right" */
  iconPosition?: "left" | "right";
  /** Font family key */
  fontFamily: FontKey;
  // Overall label body
  /** Width of the label in mm */
  width: number;
  /** Height of the label body in mm */
  height: number;
  /** Total depth (thickness) of the base plate in mm */
  baseDepth: number;
  /** Corner radius for rounded rectangle */
  cornerRadius: number;

  // Text / top layer (color 2)
  /** Thickness of the raised text + border layer in mm */
  textLayerHeight: number;
  /** Font size in mm */
  fontSize: number;
  /** Whether to include the border ring */
  hasBorder: boolean;
  /** Border thickness around the label perimeter */
  borderWidth: number;
  /** Extra margin around text inside border */
  textMargin: number;
}

export const defaultConfig: LabelConfig = {
  labelText: "WINTER",
  labelText2: "SKI & Hockey",
  icon: "socks",
  iconPosition: "left",
  // Actual label dimensions from the Big Storage Basket System Label Maker
  // https://makerworld.com/en/models/1049761-big-storage-basket-system-label-maker
  width: 67.7,
  height: 24.7,
  baseDepth: 0.4,   // Color 1: thin base layer (~2 layers at 0.2mm)
  cornerRadius: 5,


  textLayerHeight: 0.6,  // Color 2: raised text layer (~3 layers at 0.2mm)
  fontSize: 7,
  fontFamily: DEFAULT_FONT,
  borderWidth: 1.5,
  textMargin: 1,
};

// ─── Building blocks ──────────────────────────────────────────────────────────

/**
 * Rounded rectangle via hull of 4 cylinders
 */
function roundedRect(
  width: number,
  height: number,
  depth: number,
  r: number
): ScadObject {
  r = Math.min(r, width / 2 - 0.1, height / 2 - 0.1);
  const cyl = () => cylinder(depth, r, { $fn: 32 });
  const dx = width / 2 - r;
  const dy = height / 2 - r;

  return transformations.hull(
    cyl().translate([dx, dy, 0]),
    cyl().translate([-dx, dy, 0]),
    cyl().translate([dx, -dy, 0]),
    cyl().translate([-dx, -dy, 0])
  );
}

/**
 * The label base plate (color 1 — bottom layers)
 */
function basePlate(cfg: LabelConfig): ScadObject {
  return roundedRect(cfg.width, cfg.height, cfg.baseDepth, cfg.cornerRadius);
}

/**
 * Raised border ring (color 2 — top layers, no text)
 */
function borderRing(cfg: LabelConfig): ScadObject {
  const outer = roundedRect(
    cfg.width,
    cfg.height,
    cfg.textLayerHeight,
    cfg.cornerRadius
  );
  const inner = roundedRect(
    cfg.width - cfg.borderWidth * 2,
    cfg.height - cfg.borderWidth * 2,
    cfg.textLayerHeight + 0.01,
    Math.max(0.5, cfg.cornerRadius - cfg.borderWidth)
  ).translate([0, 0, -0.005]);

  return difference(outer, inner);
}

/**
 * Raised text + optional icon extrusion (color 2 — top layers).
 *
 * Layout variants:
 *
 *   No icon, 1 line:   [    LABEL    ]
 *   No icon, 2 lines:  [    LABEL    ]
 *                      [  sub text   ]
 *
 *   Icon, 1 line:      [ ⚙ | LABEL  ]
 *   Icon, 2 lines:     [ ⚙ | LABEL  ]
 *                      [   | sub     ]
 *
 * The icon sits in the left zone, separated from text by a thin vertical bar.
 * All elements share the same Z extrusion height.
 */
function textLabel(cfg: LabelConfig): ScadObject {
  const h = cfg.textLayerHeight;
  const fontName = FONTS[cfg.fontFamily].scadName;
  const innerW = cfg.width  - cfg.borderWidth * 2 - cfg.textMargin * 2;
  const innerH = cfg.height - cfg.borderWidth * 2 - cfg.textMargin * 2;

  // ── Resolve icon codepoint ────────────────────────────────────────────────
  let iconCodepoint: string | undefined;
  if (cfg.icon) {
    iconCodepoint = resolveIcon(cfg.icon);
    if (!iconCodepoint) {
      console.warn(`Warning: icon "${cfg.icon}" not found in Font Awesome, skipping`);
    }
  }

  // ── Layout geometry ───────────────────────────────────────────────────────
  const hasIcon = !!iconCodepoint;
  const sepWidth = 0.8;              // separator bar width (mm)
  const iconZoneW = hasIcon ? innerH * 0.85 : 0;  // icon zone is roughly square
  const isIconRight = cfg.iconPosition === "right";
  
  // When icon is on the right, we mirror the layout
  const sepX = hasIcon ? (isIconRight ? innerW / 2 - iconZoneW - cfg.textMargin : -innerW / 2 + iconZoneW + cfg.textMargin) : 0;
  const textZoneW = hasIcon ? innerW - iconZoneW - sepWidth - cfg.textMargin : innerW;
  // Text block center X (in label coords, 0 = label center)
  const textCenterX = hasIcon ? (isIconRight ? -(sepX + sepWidth / 2 + textZoneW / 2 + cfg.textMargin / 2) : sepX + sepWidth / 2 + textZoneW / 2 + cfg.textMargin / 2) : 0;

  // ── Icon ──────────────────────────────────────────────────────────────────
  const parts: ScadObject[] = [];

  if (hasIcon && iconCodepoint) {
    const iconSize = iconZoneW * 0.6;
    const iconX = isIconRight ? innerW / 2 - iconZoneW / 2 : -innerW / 2 + iconZoneW / 2;
    const iconObj = text(iconCodepoint, {
      size: iconSize,
      font: "Font Awesome 7 Free:style=Solid",
      halign: "center",
      valign: "center",
    }).linear_extrude(h).translate([iconX, 0, 0]);
    parts.push(iconObj);

    // Vertical separator bar (80% of inner height)
    const sep = cube([sepWidth, innerH * 0.8, h])
      .translate([sepX, 0, 0]);
    parts.push(sep);
  }

  // ── Text lines ────────────────────────────────────────────────────────────
  if (!cfg.labelText2) {
    parts.push(
      text(cfg.labelText, {
        size: cfg.fontSize,
        font: fontName,
        halign: "center",
        valign: "center",
      }).linear_extrude(h).translate([textCenterX, 0, 0])
    );
  } else {
    const h1Y =  innerH * 0.18;
    const h2Y = -innerH * 0.28;
    parts.push(
      text(cfg.labelText, {
        size: cfg.fontSize,
        font: fontName,
        halign: "center",
        valign: "center",
      }).linear_extrude(h).translate([textCenterX, h1Y, 0]),
      text(cfg.labelText2, {
        size: cfg.fontSize * 0.6,
        font: fontName,
        halign: "center",
        valign: "center",
      }).linear_extrude(h).translate([textCenterX, h2Y, 0])
    );
  }

  return parts.length === 1 ? parts[0] : union(...parts);
}

// ─── Main assembly ────────────────────────────────────────────────────────────

/**
 * Complete label assembly.
 *
 * Dual-color print strategy:
 *   Layer 1 → baseDepth/layerHeight layers: print in Color 1 (base)
 *   Then pause, switch to Color 2
 *   Remaining layers: border + text in Color 2
 *
 * The .scad output has two objects:
 *   1. base  — print first in primary color
 *   2. top   — print second in accent color (text + border raised on top)
 */
export function makeLabel(cfg: LabelConfig): {
  base: ScadObject;
  top: ScadObject;
  combined: ScadObject;
} {
  const base = basePlate(cfg);

  const topParts: ScadObject[] = [];
  if (cfg.hasBorder) {
    topParts.push(borderRing(cfg).translate([0, 0, cfg.baseDepth]));
  }
  topParts.push(textLabel(cfg).translate([0, 0, cfg.baseDepth]));

  const top = topParts.length === 1 ? topParts[0] : union(...topParts);

  return { base, top, combined: union(base, top) };
}

/**
 * Serialize both parts to a single .scad file with comments indicating
 * which body is Color 1 vs Color 2.
 */
export function serializeLabel(cfg: LabelConfig): string {
  const { base, top } = makeLabel(cfg);

  const vars: ScadSpecialVariables & Record<string, any> = { $fn: 32 };

  // We serialize each part and annotate
  const baseScad = base.serialize(vars);
  const topScad = top.serialize({});

  return `// ============================================================
// Big Storage Basket System Label Maker
// Generated by scad-js + Bun
//
// Label text : "${cfg.labelText}"${cfg.labelText2 ? `\n// Line 2    : "${cfg.labelText2}"` : ""}
// Size       : ${cfg.width}mm × ${cfg.height}mm × ${cfg.baseDepth + cfg.textLayerHeight}mm
//
// DUAL-COLOR PRINT INSTRUCTIONS:
//   1. Slice and find the layer at Z = ${cfg.baseDepth}mm
//   2. Insert a filament-change (M600) at that layer
//   3. Print base (below) in Color 1 (e.g. white)
//   4. Print top  (below) in Color 2 (e.g. black)
//
// Or: print base.scad and top.scad separately and glue/snap together
// ============================================================

// ── COLOR 1: Base plate ──
// (print in your main/background color)
${baseScad}

// ── COLOR 2: Raised border + text ──
// (print in your accent/text color, on top of base)
${topScad}`;
}
