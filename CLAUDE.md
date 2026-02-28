
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Project structure

### Web UI (TanStack Start + Vite)
- Entry: `app/routes/index.tsx`
- Dev: `bun run dev` (runs `bunx vite`)
- Build: `bun run build` (runs `bunx vite build`)
- Uses TanStack Start in SPA mode (no SSR)
- Tailwind CSS via `@tailwindcss/vite`
- Web Worker for openscad-wasm STL rendering (`app/worker/render.worker.ts`)
- Static fonts in `public/fonts/`

### Core logic (src/)
- `src/label.ts` — parametric 3D model (used by web worker)
- `src/fa-icons.ts` — Font Awesome icon map (used by web UI)
- `src/fonts.ts` — Font registry (used by web UI and worker)
- These files must remain browser-compatible (`console.warn` not `process.stderr`)

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
