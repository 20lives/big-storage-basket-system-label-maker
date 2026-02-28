import type { LabelConfig } from "../../src/label";
import { FONTS, FONT_KEYS, resolveVariant } from "../../src/fonts";
import type { FontKey, FontWeight } from "../../src/fonts";
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
      <span className="text-xs text-zinc-400">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={() => {
          const clamped = Math.min(max ?? Infinity, Math.max(min, value));
          if (clamped !== value) onChange(clamped);
        }}
        className="w-20 rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs tabular-nums text-zinc-200 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
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
    <label className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-500">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}

const FONT_CATEGORIES = [
  { label: "Sans-serif", value: "sans-serif" as const },
  { label: "Serif", value: "serif" as const },
  { label: "Display", value: "display" as const },
  { label: "Handwriting", value: "handwriting" as const },
  { label: "Hebrew", value: "hebrew" as const },
];

function WeightToggle({
  weight,
  onChange,
}: {
  weight: FontWeight;
  onChange: (w: FontWeight) => void;
}) {
  return (
    <div className="flex rounded-md border border-border-subtle overflow-hidden">
      <button
        type="button"
        className={`px-2.5 py-1 text-xs transition ${
          weight === "regular"
            ? "bg-blue-600 text-white"
            : "bg-surface text-zinc-400 hover:text-zinc-200"
        }`}
        onClick={() => onChange("regular")}
      >
        Regular
      </button>
      <button
        type="button"
        className={`px-2.5 py-1 text-xs font-bold transition ${
          weight === "bold"
            ? "bg-blue-600 text-white"
            : "bg-surface text-zinc-400 hover:text-zinc-200"
        }`}
        onClick={() => onChange("bold")}
      >
        Bold
      </button>
    </div>
  );
}

function FontSelect({
  value,
  weight,
  onChange,
}: {
  value: FontKey;
  weight: FontWeight;
  onChange: (key: FontKey) => void;
}) {
  const cssWeight = resolveVariant(value, weight).cssWeight;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FontKey)}
      className="flex-1 rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-zinc-200 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
      style={{ fontFamily: FONTS[value].cssFamily, fontWeight: cssWeight }}
    >
      {FONT_CATEGORIES.map((cat) => {
        const keys = FONT_KEYS.filter((k) => FONTS[k].category === cat.value);
        if (keys.length === 0) return null;
        return (
          <optgroup key={cat.value} label={cat.label}>
            {keys.map((key) => (
              <option
                key={key}
                value={key}
                style={{ fontFamily: FONTS[key].cssFamily, fontWeight: cssWeight }}
              >
                {FONTS[key].label}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

export function LabelForm({ config, onChange, onReset }: LabelFormProps) {
  const sameAsText = !config.subtitleFontFamily;
  return (
    <div className="flex flex-col gap-6">
      {/* ── Content ─────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          Content
        </legend>

        <input
          type="text"
          placeholder="Label text"
          value={config.labelText}
          onChange={(e) => onChange({ labelText: e.target.value })}
          className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
        />

        <input
          type="text"
          placeholder="Sub-text (optional)"
          value={config.labelText2 ?? ""}
          onChange={(e) =>
            onChange({ labelText2: e.target.value || undefined })
          }
          className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 focus:outline-none"
        />

        <IconPicker
          value={config.icon}
          onChange={(icon) => onChange({ icon })}
          iconPosition={config.iconPosition}
          onPositionChange={(iconPosition) => onChange({ iconPosition })}
        />

        {config.icon && (
          <SliderInput
            label="Icon size"
            value={config.iconScale ?? 0.85}
            onChange={(v) => onChange({ iconScale: v })}
            min={0.3}
            max={1}
            step={0.05}
            unit=""
          />
        )}
      </fieldset>

      {/* ── Typography ─────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          Typography
        </legend>

        {/* Primary font */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-400">Text font</span>
          <div className="flex gap-2">
            <FontSelect
              value={config.fontFamily}
              weight={config.fontWeight}
              onChange={(fontFamily) => onChange({ fontFamily })}
            />
            <WeightToggle
              weight={config.fontWeight}
              onChange={(fontWeight) => onChange({ fontWeight })}
            />
          </div>
        </div>

        {/* Subtitle font (only when subtitle text exists) */}
        {config.labelText2 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Sub-text font</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsText}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? { subtitleFontFamily: undefined, subtitleFontWeight: undefined }
                        : { subtitleFontFamily: config.fontFamily, subtitleFontWeight: "regular" },
                    )
                  }
                  className="rounded border-border-subtle bg-surface text-blue-600 focus:ring-blue-500/30"
                />
                <span className="text-[10px] text-zinc-500">Same as text</span>
              </label>
            </div>
            {!sameAsText && (
              <div className="flex gap-2">
                <FontSelect
                  value={config.subtitleFontFamily!}
                  weight={config.subtitleFontWeight ?? "regular"}
                  onChange={(subtitleFontFamily) => onChange({ subtitleFontFamily })}
                />
                <WeightToggle
                  weight={config.subtitleFontWeight ?? "regular"}
                  onChange={(subtitleFontWeight) => onChange({ subtitleFontWeight })}
                />
              </div>
            )}
          </div>
        )}

        <SliderInput
          label="Font size"
          value={config.fontSize}
          onChange={(v) => onChange({ fontSize: v })}
          min={3}
          max={12}
          step={0.5}
        />

        {config.labelText2 && (
          <SliderInput
            label="Sub-text size"
            value={config.subtitleFontSize ?? config.fontSize * 0.6}
            onChange={(v) => onChange({ subtitleFontSize: v })}
            min={2}
            max={10}
            step={0.5}
          />
        )}
      </fieldset>

      {/* ── Border ──────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          Border
        </legend>
        <SliderInput
          label="Border width"
          value={config.hasBorder ? config.borderWidth : 0}
          onChange={(v) => onChange(v === 0 ? { hasBorder: false } : { hasBorder: true, borderWidth: v })}
          min={0}
          max={4}
          step={0.5}
        />
      </fieldset>

      {/* ── Advanced ───────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          Advanced
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Width"
            value={config.width}
            onChange={(v) => onChange({ width: v })}
            min={20}
            max={120}
            step={0.1}
          />
          <NumberInput
            label="Height"
            value={config.height}
            onChange={(v) => onChange({ height: v })}
            min={10}
            max={60}
            step={0.1}
          />
        </div>

        <SliderInput
          label="Corner radius"
          value={config.cornerRadius}
          onChange={(v) => onChange({ cornerRadius: v })}
          min={0}
          max={12}
          step={0.5}
        />

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Base depth"
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

        <SliderInput
          label="Text margin"
          value={config.textMargin}
          onChange={(v) => onChange({ textMargin: v })}
          min={0}
          max={4}
          step={0.5}
        />
      </fieldset>

      {/* ── Actions ──────────────────────────────────────── */}
      <button
        type="button"
        onClick={onReset}
        className="self-start rounded-md border border-border-subtle px-3 py-1.5 text-xs text-zinc-400 transition hover:border-border-hover hover:bg-surface hover:text-zinc-200"
      >
        Reset to defaults
      </button>
    </div>
  );
}
