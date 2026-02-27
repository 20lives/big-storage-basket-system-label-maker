/**
 * Icon search utilities over FA_ICONS + FA_ALIASES
 */
import { FA_ICONS, FA_ALIASES, resolveIcon } from "../../src/fa-icons";

export interface IconResult {
  /** Canonical icon name (key in FA_ICONS) */
  name: string;
  /** Unicode codepoint string */
  codepoint: string;
  /** The alias that matched (if search matched an alias, not the name) */
  matchedAlias?: string;
}

// Pre-compute: build a reverse alias map and a flat search list
const aliasToName = new Map<string, string>();
for (const [alias, canonical] of Object.entries(FA_ALIASES)) {
  aliasToName.set(alias, canonical);
}

// All searchable entries: canonical names + aliases
const allNames = Object.keys(FA_ICONS);

/**
 * Search icons by name or alias. Returns up to `limit` results.
 * Empty query returns popular/common icons.
 */
export function searchIcons(query: string, limit = 50): IconResult[] {
  const q = query.toLowerCase().replace(/_/g, "-").trim();

  if (!q) {
    // Return a curated set of common icons when no query
    return POPULAR_ICONS.slice(0, limit)
      .map((name) => {
        const cp = FA_ICONS[name];
        return cp ? { name, codepoint: cp } : null;
      })
      .filter((x): x is IconResult => x !== null);
  }

  const results: IconResult[] = [];
  const seen = new Set<string>();

  // 1. Exact match on canonical names
  if (FA_ICONS[q] && !seen.has(q)) {
    results.push({ name: q, codepoint: FA_ICONS[q]! });
    seen.add(q);
  }

  // 2. Exact match on aliases
  const aliasTarget = FA_ALIASES[q];
  if (aliasTarget && FA_ICONS[aliasTarget] && !seen.has(aliasTarget)) {
    results.push({
      name: aliasTarget,
      codepoint: FA_ICONS[aliasTarget]!,
      matchedAlias: q,
    });
    seen.add(aliasTarget);
  }

  // 3. Prefix match on canonical names
  for (const name of allNames) {
    if (results.length >= limit) break;
    if (name.startsWith(q) && !seen.has(name)) {
      results.push({ name, codepoint: FA_ICONS[name]! });
      seen.add(name);
    }
  }

  // 4. Contains match on canonical names
  for (const name of allNames) {
    if (results.length >= limit) break;
    if (name.includes(q) && !seen.has(name)) {
      results.push({ name, codepoint: FA_ICONS[name]! });
      seen.add(name);
    }
  }

  // 5. Alias contains match
  for (const [alias, canonical] of Object.entries(FA_ALIASES)) {
    if (results.length >= limit) break;
    if (alias.includes(q) && FA_ICONS[canonical] && !seen.has(canonical)) {
      results.push({
        name: canonical,
        codepoint: FA_ICONS[canonical]!,
        matchedAlias: alias,
      });
      seen.add(canonical);
    }
  }

  return results;
}

/** Is the given name a valid icon? */
export function isValidIcon(name: string): boolean {
  return !!resolveIcon(name);
}

const POPULAR_ICONS = [
  "wrench",
  "screwdriver-wrench",
  "toolbox",
  "bolt",
  "gear",
  "gamepad",
  "puzzle-piece",
  "cube",
  "box",
  "boxes-stacked",
  "battery-full",
  "plug",
  "lightbulb",
  "paint-roller",
  "pen",
  "scissors",
  "tape",
  "ruler",
  "hammer",
  "screwdriver",
  "utensils",
  "mug-hot",
  "shirt",
  "socks",
  "book",
  "music",
  "camera",
  "star",
  "heart",
  "house",
  "car",
  "bicycle",
  "tree",
  "leaf",
  "paw",
  "fish",
  "cat",
  "dog",
  "basketball",
  "football",
];
