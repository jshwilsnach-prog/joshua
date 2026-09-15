import { dirname, resolve } from "node:path";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const here = dirname(fileURLToPath(import.meta.url));

function omitGrokScaffold() {
  return {
    name: "omit-grok-scaffold",
    apply: "build" as const,
    closeBundle() {
      rmSync(resolve(here, "dist/__grok"), { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  root: resolve(here, "house"),
  publicDir: resolve(here, "public"),
  plugins: [tailwindcss(), viteReact(), omitGrokScaffold()],
  build: {
    outDir: resolve(here, "dist"),
    emptyOutDir: true,
    assetsDir: "assets",
  },
});
