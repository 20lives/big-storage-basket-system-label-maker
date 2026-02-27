# Contributing

Thanks for your interest in contributing! Here's how to get started.

## Prerequisites

- **Bun** — [Install Bun](https://bun.sh)
- **OpenSCAD** (optional) — Only needed if developing the CLI label generator

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `bun install`
3. Start the web UI: `bun run dev`
4. Or test the CLI: `bun run generate --text "LABEL"`

## Project Structure

- **`src/`** — CLI core logic (`label.ts`, `fa-icons.ts`, `render.ts`)
- **`app/`** — Web UI (TanStack Start + Vite)
- **`src/label.ts`** — Shared parametric 3D model (used by both CLI and web)
- **`src/fa-icons.ts`** — Shared Font Awesome icon map

## Guidelines

- Follow existing code patterns
- Use TypeScript strict mode — no `any` types
- Test your changes before submitting a PR
- Keep commits focused and descriptive

## Questions?

Open an issue or start a discussion. We're here to help!
