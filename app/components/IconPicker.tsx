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
      <div className="flex items-center gap-1">
        {/* Current icon preview */}
        {value && isValid && (
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border border-gray-300 text-lg"
            style={{ fontFamily: '"Font Awesome 6 Free"', fontWeight: 900 }}
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
            // Auto-apply if it's a valid icon name
            if (isValidIcon(v)) {
              onChange(v);
            } else if (!v) {
              onChange(undefined);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className={`w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
            value && !isValid
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }`}
        />

        {value && (
          <>
            {/* Clear button */}
            <button
              type="button"
              onClick={clearIcon}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Clear icon"
            >
              ×
            </button>

            {/* Position toggle */}
            {onPositionChange && (
              <div className="inline-flex flex-shrink-0 rounded-md border border-gray-300 text-sm">
                <button
                  type="button"
                  onClick={() => onPositionChange("left")}
                  className={`px-2 py-1.5 rounded-l-md ${iconPosition !== "right" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  Left
                </button>
                <button
                  type="button"
                  onClick={() => onPositionChange("right")}
                  className={`px-2 py-1.5 rounded-r-md ${iconPosition === "right" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  Right
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {value && !isValid && (
        <p className="mt-1 text-xs text-red-500">
          Icon "{value}" not found in Font Awesome
        </p>
      )}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="grid grid-cols-5 gap-1 p-2 sm:grid-cols-6 md:grid-cols-8">
            {results.map((icon) => (
              <button
                key={icon.name}
                type="button"
                onClick={() => selectIcon(icon)}
                className={`group flex flex-col items-center gap-0.5 rounded p-1.5 transition hover:bg-blue-50 ${
                  icon.name === value ? "bg-blue-100" : ""
                }`}
                title={
                  icon.matchedAlias
                    ? `${icon.name} (alias: ${icon.matchedAlias})`
                    : icon.name
                }
              >
                <span
                  className="text-lg text-gray-700 group-hover:text-blue-600"
                  style={{
                    fontFamily: '"Font Awesome 6 Free"',
                    fontWeight: 900,
                  }}
                >
                  {icon.codepoint}
                </span>
                <span className="w-full truncate text-center text-[9px] leading-tight text-gray-400 group-hover:text-blue-500">
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
