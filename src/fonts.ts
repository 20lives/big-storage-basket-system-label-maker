/**
 * Font registry — shared by Web UI and worker.
 *
 * Single source of truth for all font metadata:
 *   - OpenSCAD scadName (fontconfig "Family:style=Style")
 *   - CSS font-family / weight for SVG preview
 *   - File paths in public/fonts/ (served to browser and WASM FS)
 *
 * Some fonts use static .ttf files (separate Regular + Bold),
 * while others use a single variable font file (all weights in one).
 * The `files` array lists all .ttf files needed for a font family.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type FontWeight = "regular" | "bold";

export interface FontVariant {
  /** OpenSCAD font spec (fontconfig name), e.g. "Roboto:style=Bold" */
  scadName: string;
  /** CSS font-weight numeric value */
  cssWeight: number;
}

export interface FontFamily {
  /** Display label in the UI */
  label: string;
  /** CSS font-family string for SVG preview */
  cssFamily: string;
  /** Visual category for grouping in UI */
  category: "sans-serif" | "serif" | "handwriting" | "display" | "hebrew";
  /** All .ttf filenames in public/fonts/ needed for this font */
  files: string[];
  /** Available variants — Partial so fonts can omit weights */
  variants: Partial<Record<FontWeight, FontVariant>>;
}

export type FontKey =
  | "roboto"
  | "open-sans"
  | "lato"
  | "montserrat"
  | "inter"
  | "oswald"
  | "raleway"
  | "poppins"
  | "pt-sans"
  | "merriweather"
  | "playfair"
  | "nunito"
  | "caveat"
  | "noto-sans-hebrew"
  | "alef"
  | "heebo"
  | "assistant";

// ─── Font Awesome (always loaded, never in font picker) ─────────────────────

export const FA_ICON_FONT = {
  scadName: "Font Awesome 7 Free:style=Solid",
  file: "fa-solid-900.ttf",
  cssFamily: '"Font Awesome 7 Free"',
  cssWeight: 900,
} as const;


// ─── Registry ───────────────────────────────────────────────────────────────
//
// scadName values verified against fc-query output on each .ttf file.
// Variable fonts register primary family name (e.g. "Montserrat") with
// fontconfig, so "Montserrat:style=Bold" resolves correctly.

export const FONTS: Record<FontKey, FontFamily> = {
  roboto: {
    label: "Roboto",
    cssFamily: '"Roboto", sans-serif',
    category: "sans-serif",
    files: ["Roboto-Variable.ttf"],
    variants: {
      regular: { scadName: "Roboto:style=Regular", cssWeight: 400 },
      bold: { scadName: "Roboto:style=Bold", cssWeight: 700 },
    },
  },
  "open-sans": {
    label: "Open Sans",
    cssFamily: '"Open Sans", sans-serif',
    category: "sans-serif",
    files: ["OpenSans-Variable.ttf"],
    variants: {
      regular: { scadName: "Open Sans:style=Regular", cssWeight: 400 },
      bold: { scadName: "Open Sans:style=Bold", cssWeight: 700 },
    },
  },
  lato: {
    label: "Lato",
    cssFamily: '"Lato", sans-serif',
    category: "sans-serif",
    files: ["Lato-Regular.ttf", "Lato-Bold.ttf"],
    variants: {
      regular: { scadName: "Lato:style=Regular", cssWeight: 400 },
      bold: { scadName: "Lato:style=Bold", cssWeight: 700 },
    },
  },
  montserrat: {
    label: "Montserrat",
    cssFamily: '"Montserrat", sans-serif',
    category: "sans-serif",
    files: ["Montserrat-Variable.ttf"],
    variants: {
      regular: { scadName: "Montserrat:style=Regular", cssWeight: 400 },
      bold: { scadName: "Montserrat:style=Bold", cssWeight: 700 },
    },
  },
  inter: {
    label: "Inter",
    cssFamily: '"Inter", sans-serif',
    category: "sans-serif",
    files: ["Inter-Variable.ttf"],
    variants: {
      regular: { scadName: "Inter:style=Regular", cssWeight: 400 },
      bold: { scadName: "Inter:style=Bold", cssWeight: 700 },
    },
  },
  oswald: {
    label: "Oswald",
    cssFamily: '"Oswald", sans-serif',
    category: "display",
    files: ["Oswald-Variable.ttf"],
    variants: {
      regular: { scadName: "Oswald:style=Regular", cssWeight: 400 },
      bold: { scadName: "Oswald:style=Bold", cssWeight: 700 },
    },
  },
  raleway: {
    label: "Raleway",
    cssFamily: '"Raleway", sans-serif',
    category: "sans-serif",
    files: ["Raleway-Variable.ttf"],
    variants: {
      regular: { scadName: "Raleway:style=Regular", cssWeight: 400 },
      bold: { scadName: "Raleway:style=Bold", cssWeight: 700 },
    },
  },
  poppins: {
    label: "Poppins",
    cssFamily: '"Poppins", sans-serif',
    category: "sans-serif",
    files: ["Poppins-Regular.ttf", "Poppins-Bold.ttf"],
    variants: {
      regular: { scadName: "Poppins:style=Regular", cssWeight: 400 },
      bold: { scadName: "Poppins:style=Bold", cssWeight: 700 },
    },
  },
  "pt-sans": {
    label: "PT Sans",
    cssFamily: '"PT Sans", sans-serif',
    category: "sans-serif",
    files: ["PTSans-Regular.ttf", "PTSans-Bold.ttf"],
    variants: {
      regular: { scadName: "PT Sans:style=Regular", cssWeight: 400 },
      bold: { scadName: "PT Sans:style=Bold", cssWeight: 700 },
    },
  },
  merriweather: {
    label: "Merriweather",
    cssFamily: '"Merriweather", serif',
    category: "serif",
    files: ["Merriweather-Variable.ttf"],
    variants: {
      regular: { scadName: "Merriweather:style=Regular", cssWeight: 400 },
      bold: { scadName: "Merriweather:style=Bold", cssWeight: 700 },
    },
  },
  playfair: {
    label: "Playfair Display",
    cssFamily: '"Playfair Display", serif',
    category: "serif",
    files: ["PlayfairDisplay-Variable.ttf"],
    variants: {
      regular: { scadName: "Playfair Display:style=Regular", cssWeight: 400 },
      bold: { scadName: "Playfair Display:style=Bold", cssWeight: 700 },
    },
  },
  nunito: {
    label: "Nunito",
    cssFamily: '"Nunito", sans-serif',
    category: "sans-serif",
    files: ["Nunito-Variable.ttf"],
    variants: {
      regular: { scadName: "Nunito:style=Regular", cssWeight: 400 },
      bold: { scadName: "Nunito:style=Bold", cssWeight: 700 },
    },
  },
  caveat: {
    label: "Caveat",
    cssFamily: '"Caveat", cursive',
    category: "handwriting",
    files: ["Caveat-Variable.ttf"],
    variants: {
      regular: { scadName: "Caveat:style=Regular", cssWeight: 400 },
      bold: { scadName: "Caveat:style=Bold", cssWeight: 700 },
    },
  },
  "noto-sans-hebrew": {
    label: "Noto Sans Hebrew",
    cssFamily: '"Noto Sans Hebrew", sans-serif',
    category: "hebrew",
    files: ["NotoSansHebrew-Regular.ttf", "NotoSansHebrew-Bold.ttf"],
    variants: {
      regular: { scadName: "Noto Sans Hebrew:style=Regular", cssWeight: 400 },
      bold: { scadName: "Noto Sans Hebrew:style=Bold", cssWeight: 700 },
    },
  },
  alef: {
    label: "Alef",
    cssFamily: '"Alef", sans-serif',
    category: "hebrew",
    files: ["Alef-Regular.ttf", "Alef-Bold.ttf"],
    variants: {
      regular: { scadName: "Alef:style=Regular", cssWeight: 400 },
      bold: { scadName: "Alef:style=Bold", cssWeight: 700 },
    },
  },
  heebo: {
    label: "Heebo",
    cssFamily: '"Heebo", sans-serif',
    category: "hebrew",
    files: ["Heebo-Regular.ttf", "Heebo-Bold.ttf"],
    variants: {
      regular: { scadName: "Heebo:style=Regular", cssWeight: 400 },
      bold: { scadName: "Heebo:style=Bold", cssWeight: 700 },
    },
  },
  assistant: {
    label: "Assistant",
    cssFamily: '"Assistant", sans-serif',
    category: "hebrew",
    files: ["Assistant-Regular.ttf", "Assistant-Bold.ttf"],
    variants: {
      regular: { scadName: "Assistant:style=Regular", cssWeight: 400 },
      bold: { scadName: "Assistant:style=Bold", cssWeight: 700 },
    },
  },
};

// ─── Derived constants ──────────────────────────────────────────────────────

export const FONT_KEYS = Object.keys(FONTS) as FontKey[];

export const DEFAULT_FONT: FontKey = "roboto";
export const DEFAULT_WEIGHT: FontWeight = "bold";

// ─── Resolution helpers ─────────────────────────────────────────────────────

/**
 * Resolve a font key + weight to the concrete variant.
 * Falls back to whichever variant exists if the requested weight is missing.
 */
export function resolveVariant(key: FontKey, weight: FontWeight): FontVariant {
  const family = FONTS[key];
  return (
    family.variants[weight] ??
    family.variants["bold"] ??
    family.variants["regular"] ??
    { scadName: `${family.label}:style=Regular`, cssWeight: 400 }
  );
}

/**
 * Collect the unique set of .ttf filenames needed for a given font selection.
 * Always includes the FA icon font and Hebrew fallback font.
 */
export function collectFontFiles(
  primaryKey: FontKey,
  subtitleKey?: FontKey,
): string[] {
  const fileSet = new Set<string>();

  // Primary font files
  for (const f of FONTS[primaryKey].files) fileSet.add(f);

  // Subtitle font files (if different)
  if (subtitleKey && subtitleKey !== primaryKey) {
    for (const f of FONTS[subtitleKey].files) fileSet.add(f);
  }


  // FA icon font (always)
  fileSet.add(FA_ICON_FONT.file);

  return [...fileSet];
}

// ─── Legacy migration ───────────────────────────────────────────────────────

/** Maps old font keys (pre-rework) to new equivalents */
const LEGACY_KEY_MAP: Record<string, FontKey> = {
  sans: "roboto",
  serif: "merriweather",
  mono: "roboto",
};

/**
 * Migrate a potentially-legacy font key to a current FontKey.
 * Returns the key unchanged if it's already valid.
 */
export function migrateFontKey(raw: string): FontKey {
  if (raw in FONTS) return raw as FontKey;
  if (raw in LEGACY_KEY_MAP) return LEGACY_KEY_MAP[raw];
  console.warn(`Unknown font key "${raw}", falling back to "${DEFAULT_FONT}"`);
  return DEFAULT_FONT;
}
