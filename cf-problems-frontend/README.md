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
npm run build
npm run preview
```

`npm test` runs Vite Plus's bundled Vitest once; `npm run test:watch` watches for changes.
`npm run build` runs TypeScript checks before bundling; type checks can also be
run separately with `npm run typecheck`. The preview URL is normally
http://localhost:4173. Tests run in jsdom and use the setup in `src/setupTests.ts`.

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
