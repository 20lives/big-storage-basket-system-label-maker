import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import "../styles/app.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Big Storage Basket System — Label Maker" },
      { name: "theme-color", content: "#09090b" },
    ],
    links: [
      {
        rel: "preload",
        href: "/fonts/fa-solid-900.ttf",
        as: "font",
        type: "font/ttf",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex h-screen items-center justify-center bg-app-bg">
      <p className="text-zinc-500">Page not found</p>
    </div>
  ),
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-app-bg text-zinc-100 antialiased md:overflow-hidden">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
