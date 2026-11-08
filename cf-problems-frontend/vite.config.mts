import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react";

export default defineConfig({
  fmt: {
    printWidth: 80,
    trailingComma: "es5",
    sortImports: false,
    sortPackageJson: false,
    ignorePatterns: [
      "build/**",
      "src/utils/contests.json",
      "package-lock.json",
    ],
  },
  lint: {
    ignorePatterns: ["build/**"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  plugins: lazyPlugins(() => [react()]),
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
