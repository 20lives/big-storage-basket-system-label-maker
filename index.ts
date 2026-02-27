/**
 * Big Storage Basket System Label Maker
 *
 * Quick start:
 *   bun run generate            — generate a default label
 *   bun run generate --text "LEGO" --width 60
 *   bun run batch               — batch-generate from examples/labels.json
 *
 * See src/generate.ts for all CLI options.
 * See src/label.ts for the parametric model.
 */
export { makeLabel, serializeLabel, defaultConfig } from "./src/label";
export type { LabelConfig } from "./src/label";
export { FONTS, FONT_KEYS, DEFAULT_FONT } from "./src/fonts";
export type { FontKey, FontInfo } from "./src/fonts";
