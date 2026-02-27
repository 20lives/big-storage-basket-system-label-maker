import { useState } from "react";
import type { LabelConfig } from "../../src/label";
import { serializeLabel } from "../../src/label";

interface DownloadPanelProps {
  config: LabelConfig;
  renderSTL: (
    config: LabelConfig,
    part: "combined" | "base" | "top",
  ) => Promise<void>;
  renderZip: (config: LabelConfig) => Promise<void>;
  status: "idle" | "loading" | "error";
  progress: string;
  error: string | null;
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type Method = "combined" | "separate";

export function DownloadPanel({
  config,
  renderSTL,
  renderZip,
  status,
  progress,
  error,
}: DownloadPanelProps) {
  const [method, setMethod] = useState<Method>("combined");
  const isLoading = status === "loading";
  const isEmpty = !config.labelText.trim();

  const safeName = config.labelText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  const handleScadDownload = () => {
    const scad = serializeLabel(config);
    downloadText(scad, `${safeName}.scad`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Download
        </h3>
        <p className="mt-1 text-xs text-gray-400">
          Two-color printing — choose how your slicer handles colors.
        </p>
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMethod("combined")}
          className={`rounded-lg border-2 px-3 py-2.5 text-left transition ${
            method === "combined"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <span className={`text-sm font-semibold ${method === "combined" ? "text-blue-700" : "text-gray-700"}`}>
            Single file
          </span>
          <span className={`mt-0.5 block text-xs leading-snug ${method === "combined" ? "text-blue-500" : "text-gray-400"}`}>
            Color change by layer
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMethod("separate")}
          className={`rounded-lg border-2 px-3 py-2.5 text-left transition ${
            method === "separate"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <span className={`text-sm font-semibold ${method === "separate" ? "text-blue-700" : "text-gray-700"}`}>
            Two files
          </span>
          <span className={`mt-0.5 block text-xs leading-snug ${method === "separate" ? "text-blue-500" : "text-gray-400"}`}>
            One file per color
          </span>
        </button>
      </div>

      {/* Method explanation + download buttons */}
      {method === "combined" ? (
        <div className="flex flex-col gap-3">
          <p className="text-xs leading-relaxed text-gray-500">
            Downloads everything as one STL.
            In your slicer, set a <strong className="text-gray-600">color change</strong> at
            {" "}<strong className="text-gray-600">Z = {config.baseDepth}mm</strong> —
            everything below is color 1 (background), above is color 2 (text).
            With AMS/MMU, just assign colors per layer in your slicer.
            Without it, add a pause at that layer and swap the filament by hand.
          </p>

          <button
            type="button"
            disabled={isLoading || isEmpty}
            onClick={() => renderSTL(config, "combined")}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? <Spinner /> : <DownloadIcon />}
            {isLoading ? progress : "Download STL"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs leading-relaxed text-gray-500">
            Downloads the base plate and text layer as separate STLs.
            Import both into your slicer and <strong className="text-gray-600">assign a different color to each</strong>.
            Best for multi-material setups (Bambu AMS, Prusa MMU, IDEX).
          </p>

          <button
            type="button"
            disabled={isLoading || isEmpty}
            onClick={() => renderZip(config)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? <Spinner /> : <DownloadIcon />}
            {isLoading ? progress : "Download ZIP"}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SCAD source */}
      <button
        type="button"
        disabled={isEmpty}
        onClick={handleScadDownload}
        className="flex items-center justify-center gap-1.5 text-xs text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon size={14} />
        Download .scad source
      </button>
    </div>
  );
}

function DownloadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="shrink-0"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
