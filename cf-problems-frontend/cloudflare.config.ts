import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "codeforces-problems",
    compatibilityDate: "2026-11-14",
    workersDev: true,
    domains: ["cf.kira924age.com"],
    assets: {
      notFoundHandling: "single-page-application",
      runWorkerFirst: false,
    },
  },
});
