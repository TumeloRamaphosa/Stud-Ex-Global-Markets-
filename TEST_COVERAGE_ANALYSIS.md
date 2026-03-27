# Test Coverage Analysis — Studex Global Markets

**Date**: 2026-03-27
**Current Coverage**: 0% — No test files exist in the codebase

## Executive Summary

Despite Jest being installed as a dependency in both frontend and backend packages, the codebase contains **zero test files**. The backend has a `"test": "jest"` script configured but no tests to execute. The frontend lacks even a test script in `package.json`.

For a financial trading platform handling authentication, deal pipelines, KYC verification, messaging, and marketing workflows, this represents a significant risk.

---

## Priority Areas for Test Coverage

### 1. Backend Cloud Functions — CRITICAL

**File**: `firebase-backend/functions/src/index.ts` (686 lines)

All server-side business logic lives in a single file with no tests. Key functions to test:

| Function / Endpoint | Risk | What to Test |
|---|---|---|
| `onUserCreate` trigger | Data corruption | Profile creation, default claims, error handling |
| `onUserDelete` trigger | Orphan data | Cascade deletion of assets, deals, profile |
| `POST /deals/create` | Financial integrity | Deal creation, participant validation, required fields |
| `POST /deals/:id/update-status` | Financial integrity | Status transitions, authorization checks |
| `POST /kyc/submit` | Compliance | Document storage, status tracking |
| `POST /kyc/:id/verify` | Compliance | Admin-only access, user claim updates |
| `POST /meetings/schedule` | User experience | Scheduling logic, notification dispatch |
| `POST /marketing/reports/generate` | Data accuracy | Report generation, diagnostic classification |
| `cleanupOldMeetings` (scheduled) | Data hygiene | Age-based filtering, deletion logic |

**Tools**: `firebase-functions-test`, Jest (already installed), mocked Firestore/Auth

### 2. API / Service Layer — HIGH

**Files**: `studex-frontend/lib/api.ts`, `studex-frontend/lib/marketing-api.ts`

9+ API modules (users, deals, meetings, messages, assets, notifications, files, KYC, forms) and 9 marketing API modules. Each performs Firestore CRUD with query logic and data transformations.

**Priority test targets**:
- `dealsApi` — query filtering, snapshot handling, participant-based access
- `messagesApi` — conversation ordering, real-time updates
- `marketingPostsApi` — post CRUD, platform posting integration
- `classifyPerformance()` — pure diagnostic logic, easiest to test
- `uploadPostApi.postToPlatforms()` — external API integration

### 3. Utility Functions — HIGH (Easy Win)

**File**: `studex-frontend/lib/utils.ts`

12 pure functions requiring no mocks:

- `formatCurrency()` — currency formatting edge cases
- `slugify()` — special characters, unicode, empty strings
- `isValidEmail()` — valid/invalid email patterns
- `calculatePercentage()` — division by zero, rounding
- `truncate()` — boundary conditions, empty strings
- `formatDate()` / `formatDateTime()` / `formatTimeDistance()` — date edge cases
- `getInitials()` — single names, empty strings
- `cn()` — class name merging
- `getPaginationOffset()` — page boundary calculations

**This is the fastest way to establish a testing baseline.**

### 4. Authentication Flow — HIGH

**Files**: `studex-frontend/lib/auth.ts`, `studex-frontend/components/providers/AuthProvider.tsx`

| Function | What to Test |
|---|---|
| `signUpWithEmail()` | Successful registration, duplicate email handling, Firestore profile creation |
| `signInWithEmail()` | Valid credentials, invalid credentials, error messages |
| `signInWithGoogle()` | OAuth flow, new vs returning user |
| `signOut()` | Session cleanup |
| `getUserProfile()` | Profile fetch, missing profile handling |
| `searchUsers()` | Query construction, result filtering |
| `AuthProvider` | Route protection, redirect behavior, loading states |

**Tools**: Jest with mocked Firebase Auth, React Testing Library for AuthProvider

### 5. Custom React Hooks — MEDIUM

**File**: `studex-frontend/lib/hooks.ts`

8 hooks used across the application:

- `useFirestoreQuery()` — real-time query subscription, loading/error states, cleanup
- `useDebounce()` — timing behavior, value updates
- `useLocalStorage()` — persistence, serialization, SSR safety
- `useAsync()` — loading/error/success state transitions
- `useMediaQuery()` / `useIsMobile()` — responsive behavior
- `useUser()` / `useIsAuthenticated()` — auth state access

**Tools**: `@testing-library/react` with `renderHook`

### 6. UI Components — MEDIUM

**Directory**: `studex-frontend/components/ui/` (13 components)

| Component | What to Test |
|---|---|
| `Button` | Variants (primary, secondary, outline, ghost), sizes, loading/disabled states, click handlers |
| `Modal` | Open/close behavior, backdrop click, escape key |
| `Tabs` | Tab switching, active state |
| `Select` | Option rendering, selection, placeholder |
| `Input` / `Textarea` | Value changes, validation states, icon rendering |
| `Badge` | Variant rendering (success, error, warning, info) |
| `StatusIndicator` | Status display correctness |
| `LoadingSpinner` | Render without errors |

**Tools**: React Testing Library, Jest

### 7. Page Components — LOWER (Integration Tests)

**Directory**: `studex-frontend/app/` (14 pages)

Focus on critical user flows:
- Dashboard data loading and metric display
- Deal creation and pipeline management
- Login/signup form submission and validation
- Marketing post creation workflow
- Message sending and conversation display

### 8. Firestore Security Rules — MEDIUM

**File**: `firebase-backend/firestore.rules`

Verify row-level security:
- Users can only read/write their own profile
- Deal access restricted to participants
- Meeting access restricted to participants
- KYC verification restricted to admins
- Notification read access restricted to owner

**Tools**: `@firebase/rules-unit-testing`

---

## Recommended Implementation Plan

### Phase 1: Foundation (Week 1)
1. Configure Jest for frontend (`jest.config.ts`, test script, TypeScript transform)
2. Verify backend Jest setup works
3. Write tests for `utils.ts` (12 pure functions, ~30-40 test cases)
4. Write tests for `classifyPerformance()` diagnostic engine

### Phase 2: Core Business Logic (Week 2-3)
5. Test backend Cloud Functions with `firebase-functions-test`
6. Test `api.ts` service modules with mocked Firestore
7. Test `auth.ts` authentication functions

### Phase 3: UI & Integration (Week 4)
8. Test custom hooks with `renderHook`
9. Test UI components with React Testing Library
10. Test `AuthProvider` route protection

### Phase 4: Security & E2E (Week 5)
11. Test Firestore security rules
12. Add integration tests for critical page flows

---

## Test Infrastructure Requirements

### Frontend (`studex-frontend/package.json`)

Add to devDependencies:
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "ts-jest": "^29.1.1"
}
```

Add test script:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Backend (`firebase-backend/functions/package.json`)

Already has Jest installed. Add:
```json
{
  "firebase-functions-test": "^3.0.0",
  "@firebase/rules-unit-testing": "^3.0.0"
}
```

---

## Coverage Targets

| Phase | Target Coverage | Focus Area |
|---|---|---|
| Phase 1 | ~10% | Utility functions, pure logic |
| Phase 2 | ~40% | Backend functions, API layer, auth |
| Phase 3 | ~60% | Hooks, UI components |
| Phase 4 | ~75% | Security rules, integration tests |

A minimum of **60% overall coverage** is recommended before any production deployment of new features.
