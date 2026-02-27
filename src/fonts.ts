/**
 * Font registry — shared by CLI, Web UI, and worker.
 *
 * Each entry maps a short key to the info needed by OpenSCAD (font name)
 * and the browser (CSS family, file path for @font-face / WASM FS).
 */

export type FontKey =
  | "sans"
  | "serif"
  | "mono"
  | "roboto"
  | "poppins"
  | "oswald"
  | "nunito"
  | "caveat";

export interface FontInfo {
  /** Display label in the UI */
  label: string;
  /** OpenSCAD font spec (name:style) */
  scadName: string;
  /** CSS font-family for SVG preview */
  cssFamily: string;
  /** Filename in public/fonts/ (and WASM /fonts/) */
  file: string;
}

export const FONTS: Record<FontKey, FontInfo> = {
  sans: {
    label: "Sans-serif",
    scadName: "Liberation Sans:style=Bold",
    cssFamily: '"Liberation Sans", "Arial", sans-serif',
    file: "LiberationSans-Bold.ttf",
  },
  serif: {
    label: "Serif",
    scadName: "Liberation Serif:style=Bold",
    cssFamily: '"Liberation Serif", "Times New Roman", serif',
    file: "LiberationSerif-Bold.ttf",
  },
  mono: {
    label: "Monospace",
    scadName: "Liberation Mono:style=Bold",
    cssFamily: '"Liberation Mono", "Courier New", monospace',
    file: "LiberationMono-Bold.ttf",
  },
  roboto: {
    label: "Roboto",
    scadName: "Roboto:style=Bold",
    cssFamily: '"Roboto", "Arial", sans-serif',
    file: "Roboto-Bold.ttf",
  },
  poppins: {
    label: "Poppins",
    scadName: "Poppins:style=Bold",
    cssFamily: '"Poppins", "Arial", sans-serif',
    file: "Poppins-Bold.ttf",
  },
  oswald: {
    label: "Oswald",
    scadName: "Oswald:style=Bold",
    cssFamily: '"Oswald", "Arial Narrow", sans-serif',
    file: "Oswald-Bold.ttf",
  },
  nunito: {
    label: "Nunito",
    scadName: "Nunito:style=Bold",
    cssFamily: '"Nunito", "Arial", sans-serif',
    file: "Nunito-Bold.ttf",
  },
  caveat: {
    label: "Caveat",
    scadName: "Caveat:style=Bold",
    cssFamily: '"Caveat", cursive',
    file: "Caveat-Bold.ttf",
  },
};

export const FONT_KEYS = Object.keys(FONTS) as FontKey[];

export const DEFAULT_FONT: FontKey = "sans";
