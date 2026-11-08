# cf-problems-frontend

This is the sole frontend application for the project. It is built and deployed
by GitHub Actions and uses React, Vite Plus, and Node.js 26 LTS.

## Development

```sh
cd cf-problems-frontend
nvm use # or install Node.js 26 using your preferred version manager
npm ci
npm run dev
```

Vite Plus prints the development URL (normally http://localhost:5173).
The project-local `vp` command is installed by `npm ci`; a global Vite Plus
installation is not required. The former `start` script has been removed.

## Validation and production preview

```sh
npm test
npm run format:check
npm run lint
npm run build
npm run preview
```

`npm test` runs Vite Plus's bundled Vitest once; `npm run test:watch` watches for changes.
`npm run build` runs TypeScript checks before bundling; type checks can also be
run separately with `npm run typecheck`. The preview URL is normally
http://localhost:4173. Tests run in jsdom and use the setup in `src/setupTests.ts`.

## Local bundle analysis

```sh
npm run analyze
```

This builds in production mode with the bundle analyzer enabled, then serves
the interactive treemap at http://127.0.0.1:8888. Click a rectangle to zoom into
a package or module, hover to inspect its size, and use the filter to narrow
the report. Stop the server with Ctrl+C and rerun the command after changes.
Port 8888 must be available; an occupied port is reported as an error.

To generate the report without starting a server:

```sh
npm run analyze:build
```

The self-contained HTML report is `.bundle-analysis/index.html` and can also be
opened directly in a browser. The analysis build goes to `.bundle-analysis/app/`;
both are ignored by Git, formatting, and linting. This leaves the tracked legacy
`build/` files untouched. Normal builds and deployments do not enable the
analyzer or generate a report.

The report shows uncompressed rendered-module sizes, before final minification.
Source-map attribution is disabled because generated JSON string literals have
no mappings and would disappear from the treemap, including the large contest
dataset. gzip and Brotli sizes are disabled. Public assets are not module
contributions, and these sizes differ from CI's final emitted JS/CSS totals.
Use the report to find large modules and dependencies; use the PR bundle-size
report to compare complete emitted files.

## Formatting

```sh
npm run format
npm run format:check
```

Formatting uses Vite Plus's Oxfmt (`vp fmt`) instead of Prettier. Its settings
live in the `fmt` section of `vite.config.mts`. The existing 80-column width and
ES5 trailing commas are retained; imports and package fields are not reordered.
Tracked legacy `build/` files, generated `src/utils/contests.json`, and the npm
lockfile are excluded. PR CI checks formatting as well as tests and the build.

## Linting

```sh
npm run lint
npm run lint:fix
```

Linting uses Vite Plus's Oxlint with type-aware rules and type checks enabled
in `vite.config.mts`. CI runs `npm run lint` and rejects both errors and warnings.
`npm run lint:fix` applies available safe fixes; remaining issues need manual
changes. Generated `build/` files are excluded from linting.

## Deployment compatibility

Vite Plus writes production files to `build/` for GitHub Pages publication.
`Deploy frontend` publishes on frontend changes pushed to `main` and can also
be run manually in GitHub Actions (select `main`, then **Run workflow**). It
runs tests and builds without crawling Codeforces. The daily crawler calls the
same deployment workflow after saving data. Deployment always builds the latest
`main`, serializes publication, and writes only to `gh-pages`; it does not commit
generated build files to `main`. `public/` is copied into
that output, including `CNAME`, icons, manifests, and the social preview image.
The HTML entry point is now `index.html` at the project root. Relative asset
URLs (`base: "./"`) and the existing hash routes are preserved.

Node.js 26 is declared in `.nvmrc`, `package.json`, and both frontend build
workflows. The crawler retains Python 3.11. No OpenSSL legacy option is needed.
Vite's default production browser target replaces CRA's Browserslist settings;
legacy browsers outside that target are not included in this migration.

Large bundle and Sass `@import` warnings remain separate follow-up work. Workers
hosting and removal of tracked build artifacts are also separate changes.

The Vite Plus configuration uses `.mts` for ESM. The `vite` dependency and npm
override point to the same Vite Plus core so the React plugin and test runner
share one build toolchain. Standalone Prettier and Vitest dependencies are no
longer needed.

## Achievement calculations

Problem counts and the cumulative Climbing chart use each problem's first `OK`
submission, identified by `contestId:index`. Later ACs never move its solve date.
The previous month and year mean the previous **calendar** month and year, in the
viewer's local timezone, rather than a rolling 30/365-day window.

Activity days and streaks count days with at least one first AC. A day containing
only repeat ACs does not count. Current Streak must include today (otherwise it
is zero); Longest Streak is the longest run of these days, and Streak Sum is the
number of distinct such days. Calendar days are compared without assuming each
day is exactly 24 hours. Heatmap continues to count submissions, so it can show
activity on days that do not count toward a first-AC streak.

## PR bundle-size reports

PR CI builds the exact base commit and PR merge result using each version's own
lockfile on Node.js 26. It compares uncompressed JS/CSS sizes, using Vite manifests
to match chunks across hashed filenames. Source maps and images are excluded.

Only changed files are shown in a table with explanatory text and separate
base/PR size columns. Only signed size/percentage deltas are colored: green for
reductions and red for increases, using GitHub inline MathJax formatting. The total is shown only when it changes. If no file size changes, no
comment is posted and an existing report comment is removed.

The report is available in the CI summary and a `bundle-size` artifact for 7 days.
Same-repository PRs receive one bot comment, updated on subsequent commits. The
comment job does not check out or execute application code. Fork PRs receive the
summary/artifact only because their tokens cannot post comments. Reports are
informational and do not block merging. Sizes cover all generated chunks, not
just the initial page transfer. No compressed sizes are measured.

## Native table bundle results

Both the submission list and contest list use native HTML tables with Ant Design
Pagination. Contest cells are generated only for the visible page. The final
JS/CSS output decreased by 206,410 bytes (201.57 KiB, 8.67%) compared with both
Ant Tables. See the [measurement and verification report](../docs/native-table-bundle-report.md)
for commit-by-commit sizes, analyzer attribution, behavior checks, and reproduction steps.

## Submission heatmap

Heatmap uses a responsive SVG calendar with no calendar/charting dependency.
Year selection still uses Ant Design Select. It counts all submissions per local
calendar day, independently of the first-AC statistics used by Climbing.
Colors retain the four-step green palette, with thresholds based on the minimum
and maximum daily counts across the entire history, not just the selected year.
Hover or tap a day to see its date and submission count. Focus the calendar and
use Up/Down for adjacent days, Left/Right for adjacent weeks, Home/End for year
boundaries, and Escape to dismiss the tooltip. Empty days show zero submissions.
