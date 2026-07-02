# AGENTS.md

## Cursor Cloud specific instructions

This repo is a loosely-coupled multi-part JS/TS project (no root `package.json`/workspace tool). Dependencies for all three parts are installed by the startup update script (`npm ci`/`npm install` per part), so you normally don't need to install anything manually.

### Parts and how to run them
- `studex-frontend/` — Next.js 14 flagship web app. Dev: `npm run dev` (port 3000). Static checks: `npm run type-check` and `npm run build` (see lint caveat below).
- `server/` — plain Express server serving the customer Store (`/`) and internal Nexus ops dashboard (`/nexus`). Dev: `npm run dev` (nodemon). See `server/package.json`.
- `firebase-backend/functions/` — Firebase Cloud Functions (TypeScript). Build: `npm run build` (tsc). Running the emulator needs `firebase-tools` (not installed by the update script) and a Firebase project.

### Non-obvious gotchas
- **Port clash**: both `studex-frontend` and `server` default to port 3000. Run the Express server on another port, e.g. `PORT=8080 npm run dev` in `server/`.
- **Frontend renders only `/` outside deployment**: `next.config.js` sets `output: 'export'` + `assetPrefix: '.'` + `trailingSlash: true`. Because assets are referenced relatively (`./_next/...`), only the root page `/` loads its JS/CSS. Nested routes (`/signup/`, `/dashboard/`, `/marketing/`, etc.) resolve assets to `/<route>/_next/...` and 404, producing blank pages — this happens in `next dev` AND when statically serving `dist/`. Full multi-page rendering only works via the intended Firebase Hosting deployment. This is a pre-existing app config quirk, not an environment problem.
- **Frontend Firebase**: `lib/firebase.ts` falls back to dummy config, so `npm run dev`/`build` succeed without secrets, but real auth/Firestore/Storage calls (signup, login, deals, etc.) require real `NEXT_PUBLIC_FIREBASE_*` env vars in `studex-frontend/.env.local`. The frontend is not wired to the Firebase emulators.
- **Lint is not configured**: neither `studex-frontend` nor `firebase-backend/functions` ships an ESLint config. `studex-frontend`'s `npm run lint` (`next lint`) prompts interactively (no config) and `firebase-backend/functions`'s `npm run lint` fails with "ESLint couldn't find a configuration file". Use `npm run type-check` (frontend) and `npm run build` (functions) as the static checks instead.
- **Node engine**: Node 22 is used; `firebase-backend/functions` declares `engines.node: 18`, producing a harmless `EBADENGINE` warning on install. It still installs and builds (`tsc`) fine.
- **Nexus dashboard**: reachable at `/nexus/?key=<NEXUS_PASSWORD>` (set `NEXUS_PASSWORD` when starting the server). The Shopify proxy returns built-in mock data when `SHOPIFY_ACCESS_TOKEN` is unset only if you pass `?mock=1` (otherwise it 500s). The Nexus sidebar tab switching is a UI stub — the content area does not change between tabs.
