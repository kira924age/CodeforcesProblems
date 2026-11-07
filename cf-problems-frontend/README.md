# cf-problems-frontend

This is the sole frontend application for the project. It is built and deployed
by GitHub Actions and uses React, Vite, and Node.js 26 LTS.

## Development

```sh
cd cf-problems-frontend
nvm use # or install Node.js 26 using your preferred version manager
npm ci
npm start
```

Vite prints the development URL (normally http://localhost:5173).
`npm run dev` is an alias for `npm start`.

## Validation and production preview

```sh
npm test
npm run build
npm run preview
```

`npm test` runs Vitest once; `npm run test:watch` watches for changes.
`npm run build` runs TypeScript checks before bundling; type checks can also be
run separately with `npm run typecheck`. The preview URL is normally
http://localhost:4173. Tests run in jsdom and use the setup in `src/setupTests.ts`.

## Deployment compatibility

Vite writes production files to `build/` for GitHub Pages publication.
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

React and the UI libraries remain on their existing major versions. Large
bundle and Sass `@import` warnings remain separate follow-up work. Workers
hosting and removal of tracked build artifacts are also separate changes.

The Vite configuration uses `.mts` for ESM, while the application package keeps
its original module classification for Babel-style CommonJS dependencies such
as react-toggle. Nivo also requires the `globalThis` compatibility definition.

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

Only changed files are shown. GitHub diff formatting displays reductions in
green and increases in red, with base → PR sizes and signed size/percentage
deltas. The total is shown only when it changes. If no file size changes, no
comment is posted and an existing report comment is removed.

The report is available in the CI summary and a `bundle-size` artifact for 7 days.
Same-repository PRs receive one bot comment, updated on subsequent commits. The
comment job does not check out or execute application code. Fork PRs receive the
summary/artifact only because their tokens cannot post comments. Reports are
informational and do not block merging. Sizes cover all generated chunks, not
just the initial page transfer. No compressed sizes are measured.
