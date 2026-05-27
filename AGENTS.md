# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

Studex Global Markets MVP — an AI-powered international trading/consignment exchange platform with a Next.js 14 frontend and Firebase Cloud Functions backend.

### Services

| Service | Directory | Dev Command | Port |
|---------|-----------|-------------|------|
| Frontend (Next.js) | `studex-frontend/` | `npm run dev` | 3000 |
| Firebase Emulators | `firebase-backend/` | `firebase emulators:start --project demo-project` | Auth:9099, Functions:5001, Firestore:8080, UI:4000 |

### Running the dev environment

1. **Frontend**: `cd studex-frontend && npm run dev` — starts at http://localhost:3000
2. **Backend (Firebase emulators)**: `cd firebase-backend && firebase emulators:start --project demo-project` — requires `firebase-tools` on PATH (`$HOME/.local/bin`)

A `.env.local` file is required in `studex-frontend/` for the Firebase SDK to initialize. For local development with emulators, placeholder values work (see existing `.env.local`).

### Lint / Type-check / Build

- **Frontend lint**: `cd studex-frontend && npm run lint` (requires `.eslintrc.json`)
- **Frontend type-check**: `cd studex-frontend && npm run type-check`
- **Frontend build**: `cd studex-frontend && npm run build`
- **Backend lint**: `cd firebase-backend/functions && npm run lint` — NOTE: currently missing `.eslintrc` config (pre-existing repo issue)
- **Backend build**: `cd firebase-backend/functions && npm run build`

### Known issues (pre-existing)

- `next build` fails due to a TypeScript error in `app/dashboard/page.tsx` (ButtonProps missing `children`). The dev server (`next dev`) works fine.
- `next.config.js` has a deprecated `experimental.serverActions: true` — shows a warning but doesn't block.
- Backend functions `package.json` specifies `engines.node: "18"` but runs fine on Node 22 (warning only).
- Backend ESLint config file is missing from the repo; `npm run lint` in `firebase-backend/functions/` will fail.

### PATH setup

`firebase-tools` is installed to `~/.local/bin`. Ensure `PATH` includes `$HOME/.local/bin` when running Firebase commands.

### Hello world / smoke test

To verify the full stack is working:
1. Start Firebase emulators (see above)
2. Create a test user via Auth emulator: `curl -X POST "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key" -H "Content-Type: application/json" -d '{"email":"test@studex.com","password":"Test123456","returnSecureToken":true}'`
3. Start frontend and open http://localhost:3000
