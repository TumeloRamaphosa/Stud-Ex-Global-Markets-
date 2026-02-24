# Studex Global Markets MVP - Complete Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Google OAuth Configuration](#google-oauth-configuration)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Testing](#testing)
8. [Post-Launch](#post-launch)

---

## Prerequisites

### Required Tools
- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)
- Firebase CLI (`npm install -g firebase-tools`)
- Git (`git --version`)

### Required Accounts
- Google Cloud Account (free tier available)
- Firebase Account (free tier)
- GitHub Account (for version control)

### System Requirements
- 2GB RAM minimum
- 1GB disk space
- Stable internet connection

---

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `studex-global-markets`
4. Accept terms and click "Create project"
5. Wait for project initialization (2-3 minutes)

### Step 2: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Select **Start in production mode**
4. Choose location: **us-central1** (or nearest to you)
5. Click "Create"

### Step 3: Enable Authentication

1. Go to **Authentication**
2. Click "Get started"
3. Enable providers:
   - **Email/Password** (Enable email/password sign-in)
   - **Google** (You'll set this up next)

### Step 4: Enable Storage

1. Go to **Storage**
2. Click "Get started"
3. Start in **Production mode**
4. Select location: **us-central1**
5. Click "Done"

### Step 5: Enable Cloud Functions

1. Go to **Functions** (may take a moment to load)
2. Click "Get started"

### Step 6: Deploy Firestore Security Rules

```bash
cd firebase-backend
firebase login
firebase init (use existing project: studex-global-markets)
firebase deploy --only firestore:rules
```

---

## Google OAuth Configuration

### Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Studex project
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Select **Web application**
6. Name it: `Studex MVP Web App`

### Step 2: Configure Authorized Redirect URIs

Add the following URIs:

**For Development:**
```
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/auth/google/callback
```

**For Production:**
```
https://studex-mvp.web.app
https://studex-mvp.web.app/login
https://studex-mvp.web.app/auth/google/callback
```

### Step 3: Copy Credentials

1. Click on your OAuth credential
2. Copy **Client ID** and **Client Secret**
3. Save these securely (you'll need them in environment setup)

### Step 4: Enable Google Calendar API (Optional - for future meeting scheduling)

1. Go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click "Enable"

---

## Frontend Deployment

### Step 1: Install Dependencies

```bash
cd studex-frontend
npm install
```

### Step 2: Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

Get these values from:
- Firebase Console: **Project Settings** (gear icon)
- Google Cloud Console: **Credentials** > OAuth 2.0 Client ID

### Step 3: Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000

Test:
- [ ] Landing page loads
- [ ] Sign up works
- [ ] Login works
- [ ] Google OAuth sign-in works
- [ ] Dashboard loads after login

### Step 4: Build for Production

```bash
npm run build
npm run start
```

### Step 5: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your frontend is now live at: `https://studex-mvp.web.app`

---

## Backend Deployment

### Step 1: Install Dependencies

```bash
cd firebase-backend/functions
npm install
```

### Step 2: Configure Environment Variables

Create `.env` file in `firebase-backend/functions/`:

```
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### Step 3: Download Service Account Key

1. Firebase Console > **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Save as `firebase-backend/functions/service-account-key.json`
4. **Add this file to `.gitignore`** (never commit secrets!)

### Step 4: Build Functions

```bash
npm run build
```

### Step 5: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

Monitor deployment:
```bash
firebase functions:log
```

---

## Environment Configuration

### Update Frontend Firebase Config

In `studex-frontend/lib/firebase.ts`, verify:

```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

### Update Backend Service Account

Verify `firebase-backend/functions/service-account-key.json` has these fields:
```json
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "..."
}
```

---

## Testing

### Unit Tests

```bash
cd studex-frontend
npm run test
```

### Integration Tests

```bash
cd studex-frontend
npm run test:e2e
```

### Manual Testing Checklist

#### Authentication Flow
- [ ] Email signup works
- [ ] Email login works
- [ ] Google OAuth login works
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Email verification works

#### Dashboard Features
- [ ] User can create asset listing
- [ ] User can view their assets
- [ ] Dashboard metrics load
- [ ] Calendar displays correctly
- [ ] Time tracker works

#### Meetings
- [ ] User can schedule meeting
- [ ] Meeting appears in calendar
- [ ] Meeting notifications send
- [ ] Users can join meeting

#### Deals
- [ ] User can create deal
- [ ] Deal appears in pipeline
- [ ] User can add collaborators
- [ ] Deal status updates work

### Performance Testing

```bash
npm run build
npm run analyze  # Bundle analysis
```

Check:
- [ ] Build time < 60 seconds
- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse score > 80

---

## Post-Launch

### Monitor in Real-Time

Firebase Console Dashboard:
- **Firestore**: Monitor reads/writes
- **Functions**: Check execution logs
- **Hosting**: View traffic and errors
- **Auth**: Monitor user creation

### Set Up Alerts

1. Firebase Console > **Monitoring**
2. Create alerts for:
   - High error rates
   - High function execution time
   - Quota limits

### Daily Checklist

- [ ] Check error logs
- [ ] Verify user signups
- [ ] Check function execution time
- [ ] Monitor storage usage
- [ ] Review Firestore read/write counts

### Weekly Tasks

- [ ] Backup Firestore (automatic, but verify)
- [ ] Review KYC submissions
- [ ] Check user feedback
- [ ] Monitor performance metrics
- [ ] Update status dashboard

### Scaling Preparation

As you approach 100 users:
- [ ] Upgrade to Blaze plan (pay-as-you-go)
- [ ] Monitor Firestore indexes
- [ ] Optimize queries
- [ ] Implement caching
- [ ] Plan for 500+ users architecture

---

## Troubleshooting

### Common Issues

**Issue**: "Firebase project not found"
```bash
firebase projects:list
firebase use YOUR_PROJECT_ID
```

**Issue**: "CORS error on API calls"
- Verify CORS is enabled in functions
- Check security rules allow requests
- Verify origin is whitelisted

**Issue**: "Firestore out of quota"
- Check free tier limits
- Upgrade to Blaze plan
- Optimize query efficiency

**Issue**: "Functions not deploying"
```bash
npm run build
firebase deploy --only functions --debug
```

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firebase Community Forum](https://stackoverflow.com/questions/tagged/firebase)

---

## Quick Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy everything
firebase deploy

# Deploy only frontend
firebase deploy --only hosting

# Deploy only backend
firebase deploy --only functions

# View logs
firebase functions:log

# Start emulator
firebase emulators:start

# Stop emulator
Ctrl + C
```

---

## Security Checklist

Before going live:
- [ ] Security rules deployed
- [ ] Firebase key restrictions enabled
- [ ] CORS properly configured
- [ ] Service account key secured
- [ ] Environment variables set
- [ ] HTTPS enforced
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] Error messages don't leak secrets
- [ ] Backup plan documented

---

**Estimated Timeline**:
- Firebase setup: 15 minutes
- OAuth configuration: 10 minutes
- Frontend deployment: 10 minutes
- Backend deployment: 10 minutes
- Testing: 30 minutes
- **Total: ~1.5 hours**

You're now ready to launch the Studex MVP! 🚀
