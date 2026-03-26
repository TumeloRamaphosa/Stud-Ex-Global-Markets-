# Stud-Ex Global Markets — Mega Prompt

## Copy this entire prompt into Google Antigravity, Claude Code, or any AI assistant to continue development.

---

## Project Overview
**Stud-Ex Global Markets** is a Next.js 14 trading and marketing platform with AI-powered content creation and social media automation.

- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Backend**: Firebase (Auth, Firestore, Cloud Storage)
- **AI Engine**: Anthropic Claude API
- **Hosting**: Vercel (deployed at stud-ex-global-markets.vercel.app)
- **Branch**: `claude/marketing-skill-app-T6FPF`
- **Repo**: `TumeloRamaphosa/Stud-Ex-Global-Markets-`

## Monorepo Structure
```
Stud-Ex-Global-Markets-/
├── studex-frontend/          # Next.js 14 app (MAIN)
│   ├── app/                  # App Router pages
│   │   ├── page.tsx          # Landing page
│   │   ├── dashboard/        # Trading dashboard
│   │   ├── marketing/        # Marketing hub (campaigns, analytics, create, settings)
│   │   ├── larry-skill/      # Larry Marketing Skill UI
│   │   ├── setup/            # Firebase setup wizard
│   │   ├── login/ & signup/  # Auth pages
│   │   ├── deals/            # Deal tracker
│   │   ├── messages/         # Messaging
│   │   ├── tracker/          # Portfolio tracker
│   │   └── api/              # API routes (Claude chat, campaigns, social, analytics)
│   ├── components/           # Shared UI components
│   ├── lib/                  # Firebase, auth, API, hooks, models
│   ├── config/               # Content pipeline config
│   └── .agents/skills/       # 37 installed AI skills (see below)
├── gobot-marketing-hub/      # Marketing bot (legacy)
└── firebase-backend/         # Cloud Functions (future)
```

## 37 Installed Skills
```
board, board-prep, browserstack, business-growth-skills, c-level-advisor,
challenge, coverage, engineering-advanced-skills, engineering-skills, eval,
extract, finance-skills, fix, generate, hard-call, init, loop,
marketing-skills, merge, migrate, nano-banana, pm-skills, postmortem,
product-skills, promote, ra-qm-skills, remember, remotion-best-practices,
report, resume, review, run, setup, spawn, status, stress-test, testrail,
tiktok-app-marketing
```

### Key Skills for Content Creation:
| Skill | Purpose | Command |
|---|---|---|
| **nano-banana** | AI image generation (Gemini 3 Pro) | Generate product images, marketing visuals |
| **remotion-best-practices** | Video creation from React code | TikTok videos, Instagram Reels, product demos |
| **tiktok-app-marketing** | 43-agent TikTok/Instagram automation | Slideshow generation → posting → analytics |
| **marketing-skills** | Marketing strategy & campaigns | Content calendars, audience targeting |
| **business-growth-skills** | Growth hacking & scaling | User acquisition, retention strategies |

## Content Pipeline
```
[Nano Banana] → Generate images → [Google Drive: generated-images/]
[Remotion] → Create videos → [Google Drive: generated-videos/]
[Larry Skill] → Build slideshows → [Google Drive: tiktok-slideshows/]
      ↓
[Upload-Post] → Publish to TikTok + Instagram
      ↓
[Analytics] → Track performance → Iterate
```

### Google Drive Storage
- **Folder**: https://drive.google.com/drive/folders/1hoMlNAVfKWHb4ttczoyqAp6rlyqF7ehM
- Subfolders: generated-images/, generated-videos/, tiktok-slideshows/, instagram-content/, analytics-reports/

## Firebase Configuration
```
Project: studex-global-markets
Auth Domain: studex-global-markets.firebaseapp.com
Storage: studex-global-markets.firebasestorage.app
Auth Providers: Email/Password, Google (ENABLE THESE IN FIREBASE CONSOLE)
```

## Environment Variables Needed
```env
# Firebase (hardcoded as defaults, but set in Vercel for production)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDBSb8lCjAMFM9gcEItnSkhuPzFHovLwEw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studex-global-markets.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studex-global-markets
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studex-global-markets.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=79450400945
NEXT_PUBLIC_FIREBASE_APP_ID=1:79450400945:web:3295bf3c1dd2d622175a90

# AI & Marketing (GET NEW KEYS)
ANTHROPIC_API_KEY=sk-ant-your-new-key-here
UPLOAD_POST_API_KEY=your-upload-post-key
GEMINI_API_KEY=your-gemini-key-for-nano-banana
```

## Current Status
- [x] Next.js frontend built and deployed to Vercel
- [x] Firebase project created (studex-global-markets)
- [x] Firebase config hardcoded in lib/firebase.ts
- [x] Larry Marketing Skill installed (TikTok + Instagram)
- [x] Nano Banana image generation skill installed
- [x] Remotion video creation skill installed
- [x] 37 total skills installed from claude-skills repo
- [x] Content pipeline config created
- [x] Setup wizard page at /setup
- [ ] Enable Firebase Auth providers (Email/Password + Google)
- [ ] Get new Anthropic API key (old one was leaked!)
- [ ] Get Upload-Post API key for social media posting
- [ ] Get Gemini API key for Nano Banana image generation
- [ ] Add env vars to Vercel dashboard
- [ ] Disable Vercel Deployment Protection for public access
- [ ] Wire Remotion into frontend UI
- [ ] Wire Nano Banana into frontend UI
- [ ] Build content calendar page
- [ ] Build analytics dashboard for social media
- [ ] Set up Google Drive API for automated uploads

## Next Steps — What to Ask the AI
1. "Fix the Vercel deployment — check build logs and resolve errors"
2. "Create a content creation page that uses Nano Banana for images and Remotion for videos"
3. "Build an analytics dashboard that tracks TikTok and Instagram performance"
4. "Set up the Larry Skill pipeline to auto-generate and post TikTok slideshows"
5. "Add Google Drive integration to store generated content automatically"
6. "Create a content calendar with scheduled posts"
7. "Build a campaign ROI tracker"

## Development Frameworks
- **Ralph Wiggum Loop**: Build → Test → Fix errors → Rebuild (iterate until passing)
- **BMaD (Big Model as Developer)**: Swarm 5-8 parallel agents for independent tasks
- **GSD (Get Sh*t Done)**: Identify blocker → Remove it → Ship
