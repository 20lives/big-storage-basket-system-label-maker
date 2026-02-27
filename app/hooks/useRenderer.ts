import { useState, useRef, useCallback, useEffect } from "react";
import { zipSync } from "fflate";
import type { LabelConfig } from "../../src/label";

type RenderPart = "combined" | "base" | "top";

interface RenderState {
  status: "idle" | "loading" | "error";
  progress: string;
  error: string | null;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || "label";
}

export function useRenderer() {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<RenderState>({
    status: "idle",
    progress: "",
    error: null,
  });

  // Create worker on first use
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../worker/render.worker.ts", import.meta.url),
        { type: "module" },
      );
    }
    return workerRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  /** Render a single part and return the raw STL ArrayBuffer + filename */
  const renderPart = useCallback(
    (config: LabelConfig, part: RenderPart): Promise<{ stl: ArrayBuffer; filename: string }> => {
      return new Promise((resolve, reject) => {
        const worker = getWorker();

        const handler = (e: MessageEvent) => {
          const msg = e.data;

          switch (msg.type) {
            case "progress":
              setState((s) => ({ ...s, progress: msg.message }));
              break;

            case "result":
              worker.removeEventListener("message", handler);
              resolve({ stl: msg.stl, filename: msg.filename });
              break;

            case "error":
              worker.removeEventListener("message", handler);
              reject(new Error(msg.message));
              break;
          }
        };

        worker.addEventListener("message", handler);
        worker.postMessage({ type: "render", config, part });
      });
    },
    [getWorker],
  );

  /** Render a single STL and trigger download */
  const renderSTL = useCallback(
    async (config: LabelConfig, part: RenderPart): Promise<void> => {
      setState({ status: "loading", progress: "Initializing...", error: null });
      try {
        const { stl, filename } = await renderPart(config, part);
        triggerDownload(new Blob([stl], { type: "application/octet-stream" }), filename);
        setState({ status: "idle", progress: "", error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setState({ status: "error", progress: "", error: message });
      }
    },
    [renderPart],
  );

  /** Render base + top, zip them together, and download as a single .zip */
  const renderZip = useCallback(
    async (config: LabelConfig): Promise<void> => {
      setState({ status: "loading", progress: "Rendering base...", error: null });
      try {
        const base = await renderPart(config, "base");

        setState((s) => ({ ...s, progress: "Rendering text layer..." }));
        const top = await renderPart(config, "top");

        setState((s) => ({ ...s, progress: "Creating ZIP..." }));
        const zipped = zipSync({
          [base.filename]: new Uint8Array(base.stl),
          [top.filename]: new Uint8Array(top.stl),
        });

        const name = safeName(config.labelText);
        triggerDownload(new Blob([zipped], { type: "application/zip" }), `${name}.zip`);
        setState({ status: "idle", progress: "", error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setState({ status: "error", progress: "", error: message });
      }
    },
    [renderPart],
  );

  return { ...state, renderSTL, renderZip } as const;
}
