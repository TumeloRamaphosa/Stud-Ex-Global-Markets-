# ⚡ Quick Start (5 Minutes)

## Step 1: Create Firebase Project (2 min)

```bash
# Install Firebase CLI if you don't have it
npm install -g firebase-tools

# Login to Firebase
firebase login

# Go to firebase-backend
cd firebase-backend

# Initialize Firebase project (select "studex-global-markets")
firebase init
```

Or manually create at: https://console.firebase.google.com

## Step 2: Get Your Keys (1 min)

1. Firebase Console > **Project Settings** (⚙️)
2. Copy:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Sender ID
   - App ID

3. Google Cloud Console > **Credentials**
4. Copy: **Client ID** (for OAuth)

## Step 3: Configure Environment (1 min)

```bash
cd ../studex-frontend
cp .env.local.example .env.local
```

Paste your keys into `.env.local`

## Step 4: Run Locally (1 min)

```bash
npm install
npm run dev
```

Visit: http://localhost:3000 ✅

## Step 5: Deploy (1 min)

```bash
cd ..
firebase deploy
```

Live at: https://studex-mvp.web.app ✅

---

## ✅ Test It

1. Visit your live URL
2. Sign up with email
3. Create an asset
4. View dashboard

**Done!** You've launched Studex MVP 🚀

---

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Deploy everything
firebase deploy

# View logs
firebase functions:log

# Start emulator
firebase emulators:start

# Redeploy specific service
firebase deploy --only hosting      # Frontend
firebase deploy --only functions    # Backend
```

---

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed setup.
