/**
 * POC: Client-side STL generation
 * Run: bun --hot web/server.ts
 */
import index from "./index.html";

const LIBERATION_FONT = "/usr/share/fonts/liberation/LiberationSans-Bold.ttf";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
  },
  fetch(req) {
    const url = new URL(req.url);

    // Serve font files for the WASM FS
    if (url.pathname === "/fonts/LiberationSans-Bold.ttf") {
      return new Response(Bun.file(LIBERATION_FONT));
    }
    if (url.pathname === "/fonts/fa-solid-900.ttf") {
      return new Response(Bun.file("fonts/fa-solid-900.ttf"));
    }

    return new Response("Not found", { status: 404 });
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`\n  POC running at http://localhost:${server.port}\n`);
