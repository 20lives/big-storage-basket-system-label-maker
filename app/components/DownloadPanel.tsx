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
    <div className="relative mx-auto w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Method selector — segmented control */}
        <div className="flex shrink-0 self-start rounded-lg border border-border-subtle bg-surface p-0.5">
        <button
          type="button"
          onClick={() => setMethod("combined")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            method === "combined"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Single file
        </button>
        <button
          type="button"
          onClick={() => setMethod("separate")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            method === "separate"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Two files
        </button>
      </div>

      {/* Download button */}
      <button
        type="button"
        disabled={isLoading || isEmpty}
        onClick={() =>
          method === "combined"
            ? renderSTL(config, "combined")
            : renderZip(config)
        }
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading ? <Spinner /> : <DownloadIcon />}
        {isLoading
          ? progress
          : method === "combined"
            ? "Download STL"
            : "Download ZIP"}
      </button>

      {/* SCAD source link */}
      <button
        type="button"
        disabled={isEmpty}
        onClick={handleScadDownload}
        className="flex shrink-0 items-center gap-1 rounded-md border border-border-subtle px-2 py-1.5 text-xs text-zinc-400 transition hover:border-border-hover hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
        title="Download .scad source"
      >
        <DownloadIcon size={12} />
        .scad
        </button>
      </div>

      {/* Method explanation */}
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        {method === "combined" ? (
          <>
            One STL — set a <strong className="text-zinc-400">color change</strong> at{" "}
            <strong className="text-zinc-400">Z&nbsp;=&nbsp;{config.baseDepth}mm</strong> in your slicer.
            Below is color&nbsp;1 (base), above is color&nbsp;2 (text).
          </>
        ) : (
          <>
            Two STLs — import both into your slicer and{" "}
            <strong className="text-zinc-400">assign a different color to each</strong>.
            Best for AMS, MMU, or IDEX setups.
          </>
        )}
      </p>
      {/* Error toast */}
      {error && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-red-500/20 bg-red-950/80 px-3 py-2 text-xs text-red-300 backdrop-blur-sm">
          {error}
        </div>
      )}
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
