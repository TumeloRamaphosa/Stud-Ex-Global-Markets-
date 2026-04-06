# AI Market Audit

AI-powered website marketing & conversion analysis tool. Enter any URL, get instant scores, critical issues, SEO analysis, content strategy, and a downloadable report.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Features

- **One-Click Audit** — Enter any URL, get a comprehensive marketing analysis
- **Interactive Dashboard** — Dark-mode dashboard with animated charts and data tables
- **7-Category Scoring** — Brand, UX, Social Proof, SEO, Conversion, Content, Competitive
- **Critical Issues Detection** — Missing reviews, SEO gaps, urgency mechanics, etc.
- **Conversion Optimization** — Actionable recommendations with estimated conversion lift
- **SEO Analysis** — Title tags, meta descriptions, schema markup, alt text, blog content
- **Content Strategy** — Content pillars, TikTok/Reels hook ideas, platform recommendations
- **Email Marketing Flows** — Pre-built sequences (Welcome, Abandoned Cart, Post-Purchase, Win-Back, VIP)
- **30-Day Action Plan** — Week-by-week checklist to implement all fixes
- **Projected Impact Chart** — Visual breakdown of expected conversion & revenue improvements
- **PDF Download** — One-click printable report generation
- **Google Drive Storage** — Auto-save all reports to a shared Drive folder

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | App Router, API routes, SSR |
| TypeScript | Type safety |
| Tailwind CSS | Styling (dark theme) |
| Recharts | Radar & bar charts |
| Lucide React | Icons |
| React Hot Toast | Notifications |
| Google Drive API | Report storage |

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/TumeloRamaphosa/ai-market-audit.git
cd ai-market-audit
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Dashboard Sections

| Tab | Content |
|-----|---------|
| **Overview** | Score gauge, radar chart, category bars, quick stats |
| **Issues** | Critical issues with severity, fix steps, impact estimates |
| **SEO** | Element status table (pass/fail/missing) |
| **Conversion** | Optimization cards + competitive landscape |
| **Content** | Content pillars + video hook ideas |
| **Email** | 5 automated email flow recommendations |
| **Impact** | Bar chart + data table with revenue estimates |
| **Action Plan** | 4-week implementation checklist |

## How It Works

1. User enters a website URL
2. API route fetches the page HTML
3. Analysis engine scores 7 categories using heuristics:
   - HTML structure, meta tags, schema markup
   - Social proof signals (reviews, testimonials)
   - Conversion elements (CTAs, urgency, bundles)
   - Content depth and quality indicators
   - SEO completeness
4. Results rendered in interactive dashboard
5. Report saved to Google Drive (if configured)
6. User can download PDF

## Project Structure

```
ai-market-audit/
├── app/
│   ├── page.tsx                    # Main dashboard page (homepage)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── components/
│   │   ├── ScoreGauge.tsx          # Animated circular score ring
│   │   ├── CategoryScores.tsx      # Color-coded category progress bars
│   │   ├── RadarChart.tsx          # Performance radar (Recharts)
│   │   ├── ImpactChart.tsx         # Projected impact bar chart
│   │   ├── IssueCard.tsx           # Expandable issue cards
│   │   ├── SEOTable.tsx            # SEO status table
│   │   ├── DataTable.tsx           # Reusable data table
│   │   └── ActionPlan.tsx          # Weekly action plan cards
│   └── api/
│       └── audit/
│           └── route.ts            # Website analysis API endpoint
├── lib/
│   ├── audit-types.ts              # TypeScript interfaces
│   ├── google-drive.ts             # Google Drive upload utility
│   └── utils.ts                    # Utility functions
└── components/
    └── ui/
        ├── Card.tsx                # Reusable card component
        ├── Button.tsx              # Button with variants & loading
        ├── Badge.tsx               # Status badge component
        └── LoadingSpinner.tsx      # Spinner component
```

## Deploy to Vercel (Free)

### Step 1: Push to GitHub
Make sure your code is pushed to `github.com/TumeloRamaphosa/ai-market-audit`.

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import the `ai-market-audit` repository
4. Framework Preset will auto-detect **Next.js**
5. Click **Deploy**

### Step 3: Add Environment Variables (for Google Drive)
1. In Vercel dashboard, go to your project **Settings > Environment Variables**
2. Add the 3 Google Drive variables (see below)
3. Redeploy

That's it! Your app will be live at `https://ai-market-audit.vercel.app` (or your custom domain).

Every push to `main` will auto-deploy.

## Google Drive Setup (Optional)

Enable this to automatically save every audit report to a shared Google Drive folder.

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** > **"New Project"**
3. Name it (e.g., `ai-market-audit`) and click **Create**

### Step 2: Enable the Google Drive API
1. In the Cloud Console, go to **APIs & Services > Library**
2. Search for **"Google Drive API"**
3. Click on it, then click **Enable**

### Step 3: Create a Service Account
1. Go to **IAM & Admin > Service Accounts**
2. Click **"Create Service Account"**
3. Name: `audit-drive-uploader`
4. Click **Create and Continue**
5. Role: Select **"Editor"** (or skip, we only need Drive access)
6. Click **Done**

### Step 4: Download the JSON Key
1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key > Create new key**
4. Select **JSON** and click **Create**
5. A `.json` file will download — keep this safe!

### Step 5: Create and Share a Google Drive Folder
1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder (e.g., `Market Audit Reports`)
3. Right-click the folder > **Share**
4. Paste the service account email (from the JSON file, the `client_email` field)
5. Give it **Editor** access
6. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                           This is your FOLDER ID
   ```

### Step 6: Set Environment Variables
Create a `.env.local` file in the project root:

```env
GOOGLE_DRIVE_FOLDER_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ
GOOGLE_SERVICE_ACCOUNT_EMAIL=audit-drive-uploader@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgI...\n-----END PRIVATE KEY-----"
```

The `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_KEY` values are found in the downloaded JSON key file as `client_email` and `private_key`.

### Step 7: Restart
Restart your dev server (`npm run dev`) or redeploy on Vercel.

Reports will now automatically upload to the shared Drive folder after each audit.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_DRIVE_FOLDER_ID` | No | Google Drive folder ID for report storage |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | No | Service account email for Drive API |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | No | Private key from service account JSON |

## License

MIT

---

Built with Next.js, Tailwind CSS, and Recharts.
