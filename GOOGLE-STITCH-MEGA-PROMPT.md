# Google Stitch Mega Prompt — Larry Brain Marketing Skill

Paste this into Google Stitch (https://stitch.withgoogle.com) to generate the UI for the Larry Brain Marketing platform.

---

## PROMPT FOR STITCH

```
Design a dark cyberpunk AI marketing command centre web app called "$TUD#X D#V0P$ — Agent Command Server Warehouse". This is a professional marketing automation platform.

DESIGN SYSTEM:
- Background: dark charcoal #1a1a2e (NOT pure black)
- Primary accent: neon pink #ff1493
- Secondary: neon cyan #00ffff
- Tertiary: neon purple #9d00ff
- Gold highlights: #C9A84C for premium elements
- Fonts: Orbitron (headings), Rajdhani (body), Share Tech Mono (code/data)
- Glass morphism cards with backdrop blur
- Scanline overlay effect
- Cyber grid background pattern
- Glow effects on interactive elements

PAGE 1 — LANDING PAGE (public):
- Top nav: "$TUD#X" logo in neon pink + links: AGENTS, WAREHOUSE, SPECS, DEPLOY, MEAT (gold)
- Hero: Large text "$TUD#X D#V0P$ AGENT COMMAND SERVER WAREHOUSE" with glitch animation
- Stats bar: "43 Agents Online | 7M+ Views | 10+ Platforms | 1M+ Followers"
- 6 feature cards in grid: Agent Swarm Control, Neural Warehouse, Real-Time Telemetry, Autonomous Deployment, Cyber Security Mesh, Quantum Sync
- Terminal readout section with ASCII art and live system specs
- CTA: "INITIALIZE SYSTEM" button with glow

PAGE 2 — MARKETING DASHBOARD (authenticated):
- Sidebar: Dashboard, Marketing, Deals, Messages, Settings links with icons
- Header: "Marketing Dashboard" + Create Post button
- 4 KPI cards: Total Posts, Platform Reach, Drafts, Success Rate
- Recent posts list with status badges (posted/draft/failed)
- Quick Actions panel: Create Slideshow, View Analytics, Settings
- Connected Platforms list with status indicators
- Posting Schedule with time slots

PAGE 3 — CREATE SLIDESHOW (wizard):
- 5-step progress indicator: Hook & Strategy > Slide Images > Text Overlays > Caption & CTA > Preview & Post
- Step 1: Hook category selector (7 types), hook template buttons, text input, image prompt input
- Step 2: 6 image upload cards in 2x3 grid (2:3 portrait ratio) + "Generate 6 Slides with AI" button
- Step 3: 6 text overlay inputs with slide labels (Hook, Problem, Discovery, Transformation x2, CTA)
- Step 4: Caption textarea, CTA input, platform toggle buttons (9 platforms)
- Step 5: Slide preview carousel + post details + "Save Draft" and "Post to N Platforms" buttons

PAGE 4 — ANALYTICS:
- Tab navigation: Overview, Hook Performance, Diagnostics, Reports
- Overview: Platform metrics cards, hook category breakdown chart
- Hook Performance: Sortable table with impressions, conversions, status
- Diagnostics: Two-axis framework visualization (Views vs Conversions quadrant)
  - Top-right: "SCALE" (green)
  - Top-left: "FIX CTA" (amber)
  - Bottom-right: "FIX HOOKS" (blue)
  - Bottom-left: "FULL RESET" (red)
- Reports: Daily report cards with recommendations

PAGE 5 — CAMPAIGN MANAGER:
- Tabs: All Posts, Drafts, Posted, Failed (with counts)
- Post cards showing: slide preview thumbnail, hook text, platform badges, status, hook category
- Delete action on draft posts

PAGE 6 — SETTINGS:
- Sections: Business Profile, Image Generation (Nano Banana/Gemini default), Upload-Post Connection, Posting Schedule, RevenueCat Integration
- Each section in its own card with form fields

PAGE 7 — MEAT DASHBOARD (separate theme):
- Warm charcoal/brown palette (#2a2420 bg, #C9A84C gold accents)
- Factory banner with 5 pixel-art agent avatars (animated)
- KPI strip: Products, Suppliers, Coverage metrics
- Tabbed interface: Price Matrix, Supplier View, Quote Builder
- Price matrix: Color-coded table (green=best, amber=mid, red=highest)
- Quote builder with markup buttons (20%/25%/30%) and email send

MOBILE (iOS 26):
- Full responsive design
- Safe area insets for iPhone notch/Dynamic Island
- 44px minimum touch targets
- Collapsible sidebar → hamburger menu on mobile
- Bottom nav bar on mobile screens
- Swipe gestures for tab navigation
- Pull-to-refresh on data views

ANIMATIONS:
- Neon flicker on headings
- Glitch effect on hero text
- Smooth slide transitions in wizard
- Pulse glow on active buttons
- Card hover lift with glow border

Export as: Next.js / React with Tailwind CSS
```

---

## HOW TO USE IN STITCH

1. Go to https://stitch.withgoogle.com
2. Click "New Design" or use Voice Canvas
3. Paste the prompt above
4. Stitch generates all 7 pages
5. Export as React + Tailwind CSS
6. Copy the component code into your `studex-frontend/app/` directory
7. Deploy to Vercel

Note: Stitch generates frontend UI only. The backend (Firebase, Upload-Post API, Gemini) is already built in this repo.
