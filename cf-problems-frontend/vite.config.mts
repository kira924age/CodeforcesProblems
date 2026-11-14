import { defineConfig, lazyPlugins } from "vite-plus";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  fmt: {
    printWidth: 80,
    trailingComma: "es5",
    sortImports: false,
    sortPackageJson: false,
    ignorePatterns: [
      "build/**",
      ".cloudflare/**",
      "src/utils/contests.json",
      "pnpm-lock.yaml",
      ".bundle-analysis/**",
    ],
  },
  lint: {
    ignorePatterns: ["build/**", ".bundle-analysis/**", ".cloudflare/**"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  plugins: lazyPlugins(async () => [
    react(),
    mode === "workers" &&
      (await import("@cloudflare/vite-plugin")).cloudflare(),
    mode === "analyze" &&
      (await import("rollup-plugin-visualizer")).visualizer({
        filename: fileURLToPath(
          new URL("./.bundle-analysis/index.html", import.meta.url)
        ),
        title: "Codeforces Problems — Bundle Analysis",
        template: "treemap",
        // Generated JSON string literals have no source-map mappings. Use the
        // rendered modules so the large contest dataset remains visible.
        sourcemap: false,
        gzipSize: false,
        brotliSize: false,
        open: false,
      }),
  ]),
  // Preserve relative asset URLs and existing hash routes on either host.
  base: "./",
  build: {
    outDir: mode === "analyze" ? ".bundle-analysis/app" : "build",
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
  },
}));
