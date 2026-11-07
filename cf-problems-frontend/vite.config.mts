import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Preserve relative asset URLs and the existing GitHub Pages publication job.
  base: "./",
  build: {
    outDir: "build",
    sourcemap: true,
  },
  test: {
    // React 17's extensionless jsx-runtime import needs Vite resolution in Nivo ESM.
    server: { deps: { inline: [/@nivo\//] } },
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
  },
});
