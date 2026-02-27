import type { LabelConfig } from "../../src/label";
import { FONTS, FONT_KEYS } from "../../src/fonts";
import type { FontKey } from "../../src/fonts";
import { IconPicker } from "./IconPicker";

interface LabelFormProps {
  config: LabelConfig;
  onChange: (patch: Partial<LabelConfig>) => void;
  onReset: () => void;
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 0.1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm tabular-nums focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
    </label>
  );
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.5,
  unit = "mm",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-xs tabular-nums text-gray-400">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </label>
  );
}

export function LabelForm({ config, onChange, onReset }: LabelFormProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* ── Content ─────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Content
        </legend>

        <input
          type="text"
          placeholder="Label text *"
          value={config.labelText}
          onChange={(e) => onChange({ labelText: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />

        <input
          type="text"
          placeholder="Sub-text (optional)"
          value={config.labelText2 ?? ""}
          onChange={(e) =>
            onChange({ labelText2: e.target.value || undefined })
          }
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />

        <IconPicker
          value={config.icon}
          onChange={(icon) => onChange({ icon })}
          iconPosition={config.iconPosition}
          onPositionChange={(iconPosition) => onChange({ iconPosition })}
        />
      </fieldset>

      {/* ── Appearance ────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Appearance
        </legend>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Font</span>
          <select
            value={config.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value as FontKey })}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            style={{ fontFamily: FONTS[config.fontFamily].cssFamily, fontWeight: 700 }}
          >
            {FONT_KEYS.map((key) => (
              <option key={key} value={key} style={{ fontFamily: FONTS[key].cssFamily, fontWeight: 700 }}>
                {FONTS[key].label}
              </option>
            ))}
          </select>
        </label>

        <SliderInput
          label="Font size"
          value={config.fontSize}
          onChange={(v) => onChange({ fontSize: v })}
          min={3}
          max={12}
          step={0.5}
        />
        <SliderInput
          label="Border width"
          value={config.hasBorder ? config.borderWidth : 0}
          onChange={(v) => onChange(v === 0 ? { hasBorder: false } : { hasBorder: true, borderWidth: v })}
          min={0}
          max={4}
          step={0.5}
        />
      </fieldset>

      {/* ── Depth ─────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Depth
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Base"
            value={config.baseDepth}
            onChange={(v) => onChange({ baseDepth: v })}
            min={0.1}
            max={2}
            step={0.1}
          />
          <NumberInput
            label="Text layer"
            value={config.textLayerHeight}
            onChange={(v) => onChange({ textLayerHeight: v })}
            min={0.1}
            max={2}
            step={0.1}
          />
        </div>
      </fieldset>

      {/* ── Actions ──────────────────────────────────────── */}
      <button
        type="button"
        onClick={onReset}
        className="self-start rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
      >
        Reset to defaults
      </button>
    </div>
  );
}
