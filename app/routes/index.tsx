import { createFileRoute } from "@tanstack/react-router";
import { useLabelConfig } from "../hooks/useLabelConfig";
import { useRenderer } from "../hooks/useRenderer";
import { LabelForm } from "../components/LabelForm";
import { LabelPreview } from "../components/LabelPreview";
import { DownloadPanel } from "../components/DownloadPanel";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { config, setConfig, resetConfig } = useLabelConfig();
  const { status, progress, error, renderSTL, renderZip } = useRenderer();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Big Storage Basket System Label Maker</h1>
          <p className="text-sm text-gray-500">
            Generate 3D-printable labels for storage baskets
          </p>
        </header>

        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Mobile: preview first, then form. Desktop: form left, preview right */}
          <div className="order-2 flex flex-col gap-6 md:order-1 md:w-1/2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <LabelForm
                config={config}
                onChange={setConfig}
                onReset={resetConfig}
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <DownloadPanel
                config={config}
                renderSTL={renderSTL}
                renderZip={renderZip}
                status={status}
                progress={progress}
                error={error}
              />
            </div>
          </div>

          <div className="order-1 md:order-2 md:w-1/2 md:sticky md:top-4 md:self-start">
            <LabelPreview config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
