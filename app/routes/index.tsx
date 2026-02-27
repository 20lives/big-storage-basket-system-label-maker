import { useState } from "react";
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
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col md:h-screen md:overflow-hidden">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtle bg-panel-bg px-4 md:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-[10px] font-black text-white">
            L
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-200">
            Big Storage Basket System
          </span>
          <span className="hidden text-[11px] text-zinc-500 md:inline">
            Label Maker
          </span>
        </div>

        <nav className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 transition hover:bg-surface hover:text-zinc-200"
          >
            <InfoIcon />
            <span className="hidden sm:inline">About</span>
          </button>
          <a
            href="https://github.com/20lives/Big-Storage-Basket-System-Label-Maker"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 transition hover:bg-surface hover:text-zinc-200"
          >
            <GitHubIcon />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* ── Sidebar: form controls ────────────────────────── */}
        <aside className="studio-scroll order-2 flex w-full shrink-0 flex-col border-t border-border-subtle md:order-1 md:h-full md:w-80 md:border-t-0 md:border-r lg:w-88">
          {/* Form (scrollable) */}
          <div className="flex-1 overflow-y-auto p-5">
            <LabelForm
              config={config}
              onChange={setConfig}
              onReset={resetConfig}
            />
          </div>

          {/* Sidebar footer */}
          <div className="shrink-0 border-t border-border-subtle px-5 py-3">
            <p className="text-[10px] leading-relaxed text-zinc-600">
              Built with{" "}
              <FooterLink href="https://bun.sh">Bun</FooterLink>
              {", "}
              <FooterLink href="https://github.com/scad-js/scad-js">scad-js</FooterLink>
              {" & "}
              <FooterLink href="https://tanstack.com/start">TanStack Start</FooterLink>
              .{" "}
              <FooterLink href="https://github.com/20lives/Big-Storage-Basket-System-Label-Maker/blob/main/LICENSE">
                MIT License
              </FooterLink>
              .
            </p>
          </div>
        </aside>

        {/* ── Main: preview + download ──────────────────────── */}
        <main className="order-1 flex min-h-[60vh] flex-1 flex-col md:order-2 md:min-h-0">
          {/* Canvas area */}
          <div className="canvas-grid flex min-h-[200px] flex-1 items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-xl">
              <LabelPreview config={config} />
            </div>
          </div>

          {/* Download bar (pinned to bottom) */}
          <div className="shrink-0 border-t border-border-subtle bg-panel-bg px-5 py-4">
            <DownloadPanel
              config={config}
              renderSTL={renderSTL}
              renderZip={renderZip}
              status={status}
              progress={progress}
              error={error}
            />
          </div>
        </main>
      </div>

      {/* ── About modal ─────────────────────────────────────── */}
      {aboutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAboutOpen(false);
          }}
        >
          <div className="relative mx-4 w-full max-w-md rounded-xl border border-border-subtle bg-panel-bg shadow-2xl shadow-black/40">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setAboutOpen(false)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition hover:bg-surface hover:text-zinc-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">
                  L
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">Big Storage Basket System</h2>
                  <p className="text-xs text-zinc-500">Label Maker</p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
                <p>
                  A custom label generator for the{" "}
                  <a
                    href="https://makerworld.com/en/collections/4738058-big-storage-basket-system"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline decoration-blue-400/30 underline-offset-2 transition hover:text-blue-300"
                  >
                    Big Storage Basket System
                  </a>
                  .
                </p>
                <p>
                  The original label maker that came with the system was limited &mdash; no
                  real customization, poor language support, and rigid templates. So I built
                  this from scratch as a proper replacement with full control over text,
                  fonts, icons, and dimensions.
                </p>
                <p>
                  Labels render as parametric OpenSCAD models, exported to STL for
                  dual-color 3D printing. Everything runs in the browser via WebAssembly.
                </p>
              </div>

              <hr className="my-5 border-border-subtle" />

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
                <AboutLink href="https://github.com/20lives/Big-Storage-Basket-System-Label-Maker">
                  <GitHubIcon size={13} /> Source code
                </AboutLink>
                <AboutLink href="https://makerworld.com/en/collections/4738058-big-storage-basket-system">
                  <CubeIcon size={13} /> Basket System
                </AboutLink>
                <AboutLink href="https://github.com/20lives/Big-Storage-Basket-System-Label-Maker/blob/main/LICENSE">
                  <LicenseIcon size={13} /> MIT License
                </AboutLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small components ────────────────────────────────────────── */

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-zinc-500 transition hover:text-zinc-300"
    >
      {children}
    </a>
  );
}

function AboutLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-zinc-400 transition hover:text-zinc-200"
    >
      {children}
    </a>
  );
}

/* ── Icons ───────────────────────────────────────────────────── */

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function CubeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function LicenseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12h6M9 16h6M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" />
      <path d="M13 2v7h7" />
    </svg>
  );
}
