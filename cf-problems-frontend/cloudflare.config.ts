import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "codeforces-problems",
    compatibilityDate: "2026-11-14",
    workersDev: true,
    domains: ["cf.kira924age.com"],
    // Hash routes need only the root HTML. Serve assets without Worker code.
    assets: { runWorkerFirst: false },
  },
});
