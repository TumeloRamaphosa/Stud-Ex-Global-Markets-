# AGENTS.md

## Cursor Cloud specific instructions

### Product layout

| Path | Role |
|------|------|
| `studex-frontend/` | Next.js 14 app (primary UI) — `npm run dev` → http://localhost:3000 |
| `firebase-backend/` | Firestore rules + Cloud Functions + emulator config |
| `studex_theme/` | Static CSS demo only (no build) |

### Local development (recommended: Firebase emulators)

The frontend **requires** Firebase config. For Cloud/local VMs without a cloud Firebase project, use the **Firebase Emulator Suite** plus `studex-frontend/.env.local` with `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` (see `.env.local.example`).

**Terminal 1 — emulators** (from repo root):

```bash
cd firebase-backend
npx firebase-tools emulators:start --only auth,firestore --project demo-studex
```

Emulator UI: http://127.0.0.1:4000 (Auth **9099**, Firestore **8080**).

**Terminal 2 — frontend**:

```bash
cd studex-frontend
cp .env.local.example .env.local   # first time only; emulator block is documented in example
npm run dev
```

Create a test user via the Auth emulator REST API or the app signup flow, e.g. `dev@studex.local` / `password123`.

### Production / cloud Firebase

Replace `.env.local` with real values from Firebase Console → Project settings → Web app. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` to `false` or remove it. Google OAuth needs `NEXT_PUBLIC_GOOGLE_CLIENT_ID` plus Firebase Console Google provider setup.

### Lint, type-check, build

| Command | Location | Notes |
|---------|----------|--------|
| `npm run lint` | `studex-frontend/` | Uses `.eslintrc.json`; some `react/no-unescaped-entities` errors fail `next build` |
| `npm run type-check` | `studex-frontend/` | Pre-existing `Button` `children` prop errors on several pages |
| `npm run build` | `studex-frontend/` | Runs lint; may fail until ESLint issues are fixed |
| `npm run build` | `firebase-backend/functions/` | TypeScript compile for functions |
| `npm run lint` | `firebase-backend/functions/` | No ESLint config in repo; command fails until config is added |

There is **no** frontend `npm test` script despite README mentions.

### Tooling notes

- Use `npx firebase-tools` (global `firebase-tools` install may hit permission errors on the VM).
- `firebase-backend/functions` declares Node **18**; Node **22** on the VM works for install/build but may warn `EBADENGINE`.
- If port 3000 is busy, Next.js uses **3001** automatically.
- Mock data powers dashboard/deals/messages; auth + marketing use Firebase.
