import { useState, useCallback } from "react";
import { defaultConfig } from "../../src/label";
import type { LabelConfig } from "../../src/label";
import { migrateFontKey } from "../../src/fonts";

// These params are fixed — not user-editable
const FIXED: Partial<LabelConfig> = {
  width: defaultConfig.width,
  height: defaultConfig.height,
  cornerRadius: 5,
  textMargin: 0,
};

export function useLabelConfig() {
  const [config, setConfigRaw] = useState<LabelConfig>({ ...defaultConfig });

  const setConfig = useCallback(
    (patch: Partial<LabelConfig>) => {
      // Migrate legacy font keys if present
      if (patch.fontFamily) {
        patch = { ...patch, fontFamily: migrateFontKey(patch.fontFamily) };
      }
      if (patch.subtitleFontFamily) {
        patch = { ...patch, subtitleFontFamily: migrateFontKey(patch.subtitleFontFamily) };
      }
      return setConfigRaw((prev) => ({ ...prev, ...patch, ...FIXED }));
    },
    [],
  );

  const resetConfig = useCallback(
    () => setConfigRaw({ ...defaultConfig }),
    [],
  );

  return { config, setConfig, resetConfig } as const;
}
