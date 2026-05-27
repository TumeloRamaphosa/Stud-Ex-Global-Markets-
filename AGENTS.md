# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

- **Frontend**: Next.js 14 app in `studex-frontend/` (port 3000)
- **Backend**: Firebase Cloud Functions (Express) in `firebase-backend/functions/` (port 5001 via emulators)
- **Emulator Suite**: Auth (9099), Firestore (8080), Functions (5001), Hosting (5000), PubSub (8085), UI (4000)

### Running the dev environment

**Frontend**: `cd studex-frontend && npm run dev` — starts on http://localhost:3000

**Firebase Emulators**: `cd firebase-backend && firebase emulators:start --project demo-studex` — starts all emulators. The `demo-` prefix project ID allows emulators to run without real Firebase credentials. Requires Java (OpenJDK 21 is pre-installed). Requires `firebase-tools` on PATH (installed at `$HOME/.npm-global/bin/firebase`).

**Backend build**: `cd firebase-backend/functions && npx tsc` — must be run before starting emulators if source changes are made.

### Lint commands

- Frontend: `cd studex-frontend && npx next lint`
- Backend: `cd firebase-backend/functions && npx eslint --ext .js,.ts src/`

### Known issues

- `next build` fails due to pre-existing ESLint errors in source files (`react/no-unescaped-entities` in `dashboard/page.tsx` and `login/page.tsx`). The compilation itself succeeds; only the lint-during-build step blocks production builds.
- `next.config.js` has a deprecation warning: `experimental.serverActions` is now enabled by default in Next.js 14 and should be removed.
- Backend `firebase-admin` v12 has a breaking change: `admin.firestore.FieldValue.serverTimestamp()` is no longer valid. The correct import is `import { FieldValue } from 'firebase-admin/firestore'` and use `FieldValue.serverTimestamp()`. This causes runtime errors on all API endpoints that write timestamps.
- The backend `package.json` specifies `"engines": {"node": "18"}` for Cloud Functions deployment, but dev builds work fine on Node 22.

### Environment variables

The frontend reads Firebase config from `.env.local`. For local dev with emulators, use `demo-studex` as the project ID. A `.env.local` file with placeholder values is sufficient since the frontend connects directly to Firestore/Auth — the emulators intercept based on environment, not config values.

### PATH note

`firebase-tools` is installed at `$HOME/.npm-global/bin`. Ensure `$HOME/.npm-global/bin` is on PATH (already added to `~/.bashrc`).
