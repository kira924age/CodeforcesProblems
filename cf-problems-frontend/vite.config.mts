import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // @nivo/calendar 0.67 expects webpack's browser `global` shim.
  define: { global: "globalThis" },
  // Preserve relative asset URLs and the existing GitHub Pages publication job.
  base: "./",
  build: {
    outDir: "build",
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
  },
});
