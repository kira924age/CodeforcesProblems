# cf-problems-frontend

The production React application uses Vite and Node.js 26 LTS.
The sibling `codeforces-problems-frontend` directory is an unfinished prototype;
it is not built or deployed by these workflows.

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
