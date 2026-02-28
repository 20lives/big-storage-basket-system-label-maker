import { useState, useRef, useEffect, useMemo } from "react";
import { searchIcons, isValidIcon } from "../lib/icons";
import type { IconResult } from "../lib/icons";

interface IconPickerProps {
  value: string | undefined;
  onChange: (icon: string | undefined) => void;
  iconPosition?: "left" | "right";
  onPositionChange?: (position: "left" | "right") => void;
}

export function IconPicker({ value, onChange, iconPosition, onPositionChange }: IconPickerProps) {
  const [query, setQuery] = useState(value ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchIcons(query, 40), [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectIcon = (icon: IconResult) => {
    setQuery(icon.name);
    onChange(icon.name);
    setIsOpen(false);
  };

  const clearIcon = () => {
    setQuery("");
    onChange(undefined);
    setIsOpen(false);
  };

  const isValid = value ? isValidIcon(value) : true;

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5">
        {/* Current icon preview */}
        {value && isValid && (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface text-base text-zinc-300"
            style={{ fontFamily: '"Font Awesome 7 Free"', fontWeight: 900 }}
          >
            {results.find((r) => r.name === value)?.codepoint ?? ""}
          </span>
        )}

        <input
          type="text"
          placeholder="Icon (e.g. wrench, gamepad)"
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            setIsOpen(true);
            if (isValidIcon(v)) {
              onChange(v);
            } else if (!v) {
              onChange(undefined);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 transition focus:ring-1 focus:outline-none ${
            value && !isValid
              ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/30"
              : "border-border-subtle focus:border-blue-500/50 focus:ring-blue-500/30"
          }`}
        />

        {value && (
          <>
            {/* Clear button */}
            <button
              type="button"
              onClick={clearIcon}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface text-zinc-500 transition hover:border-border-hover hover:text-zinc-300"
              title="Clear icon"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Position toggle */}
            {onPositionChange && (
              <div className="inline-flex shrink-0 rounded-md border border-border-subtle bg-surface p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => onPositionChange("left")}
                  className={`rounded px-2 py-1 font-medium transition ${
                    iconPosition !== "right"
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Left
                </button>
                <button
                  type="button"
                  onClick={() => onPositionChange("right")}
                  className={`rounded px-2 py-1 font-medium transition ${
                    iconPosition === "right"
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Right
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {value && !isValid && (
        <p className="mt-1 text-xs text-red-400">
          Icon &ldquo;{value}&rdquo; not found in Font Awesome
        </p>
      )}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-lg border border-border-subtle bg-panel-bg shadow-2xl shadow-black/40 studio-scroll">
          <div className="grid grid-cols-5 gap-1 p-2 sm:grid-cols-6 md:grid-cols-8">
            {results.map((icon) => (
              <button
                key={icon.name}
                type="button"
                onClick={() => selectIcon(icon)}
                className={`group flex flex-col items-center gap-0.5 rounded-md p-1.5 transition ${
                  icon.name === value
                    ? "bg-blue-600/20 ring-1 ring-blue-500/40"
                    : "hover:bg-surface-hover"
                }`}
                title={
                  icon.matchedAlias
                    ? `${icon.name} (alias: ${icon.matchedAlias})`
                    : icon.name
                }
              >
                <span
                  className={`text-lg transition ${
                    icon.name === value
                      ? "text-blue-400"
                      : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                  style={{
                    fontFamily: '"Font Awesome 7 Free"',
                    fontWeight: 900,
                  }}
                >
                  {icon.codepoint}
                </span>
                <span
                  className={`w-full truncate text-center text-[9px] leading-tight transition ${
                    icon.name === value
                      ? "text-blue-400"
                      : "text-zinc-600 group-hover:text-zinc-400"
                  }`}
                >
                  {icon.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
