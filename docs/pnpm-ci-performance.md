# pnpm migration: CI performance

Measured on 2026-11-08 in [GitHub Actions run 42485539366](https://github.com/kira924age/CodeforcesProblems/actions/runs/42485539366).

Node 26.13.0, npm and pnpm 12.18.0 ran alternately on the same Ubuntu runner. The npm baseline was main `87e5c46`; the pnpm candidate was `20b8573`. Application code and output JS/CSS were identical. Each run removed node_modules before installing locked dependencies. Build includes TypeScript checking and production bundling.

| Cache condition | Manager | Install | Build | Install + build |
| --- | --- | ---: | ---: | ---: |
| Empty cache/store (one sample) | npm | 4.413 s | 1.846 s | 6.259 s |
| Empty cache/store (one sample) | pnpm | 1.438 s | 2.317 s | 3.755 s |
| Reused cache/store (median of three) | npm | 3.212 s | 1.727 s | 4.939 s |
| Reused cache/store (median of three) | pnpm | 0.228 s | 1.591 s | 1.819 s |

With a reused cache/store, install time fell 92.9%, build time fell 7.9%, and the sum of these medians fell 63.2% (3.120 s). With an empty cache/store, the combined time fell 40.0%, although the build itself was slower in that single sample. The main benefit is installation, rather than a consistent acceleration of the compiler or bundler.

These timings exclude runner queue/startup, checkout, tool setup, GitHub cache restore/save, tests, lint, artifact upload and deployment. They are not end-to-end CI job durations. Only three warm samples and one cold sample were taken, so the small build-only difference should not be treated as a guaranteed improvement.

Raw samples (install / build seconds):

- npm cold: 4.413 / 1.846
- pnpm cold: 1.438 / 2.317
- npm warm: 3.212 / 1.727; 3.219 / 1.707; 3.206 / 1.735
- pnpm warm: 0.250 / 1.586; 0.228 / 1.591; 0.197 / 1.630

The temporary comparison workflow was removed after collecting the results. Normal CI now installs from pnpm-lock.yaml and caches the pnpm store. PR bundle comparison retains an npm fallback for older base commits.
