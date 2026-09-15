import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(here, "house"),
  publicDir: resolve(here, "public"),
  plugins: [tailwindcss(), viteReact()],
  build: {
    outDir: resolve(here, "dist"),
    emptyOutDir: true,
    assetsDir: "assets",
  },
});
