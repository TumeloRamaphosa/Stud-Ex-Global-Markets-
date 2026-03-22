# Larry Skill Marketing Platform - Setup Guide

The Larry Skill Marketing Platform is an AI-powered automated content creation and distribution system built into Studex Global Markets.

## What is the Larry Skill?

The Larry Skill is a proven marketing methodology that has generated:
- 7M+ total views
- 1M+ TikTok followers
- $670/month recurring revenue

It automates the complete funnel:
1. **Hook Creation** - AI generates viral hooks based on proven formulas
2. **Content Design** - 6-slide carousel posts (hook → problem → discovery → transformation → result → CTA)
3. **Multi-Platform Posting** - Auto-distribute to TikTok, Instagram, LinkedIn
4. **Real-Time Tracking** - Monitor engagement and performance metrics
5. **Optimization** - Learn patterns and improve over time
6. **Scaling** - Repeat successful content formats

## Quick Start

### 1. Local Development Setup

Copy the example environment file and add your API keys:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with:

```env
# Firebase credentials (from your Firebase project)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Anthropic API Key (for Claude AI)
ANTHROPIC_API_KEY=sk-ant-v0-... # Get from https://console.anthropic.com/
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000/larry-skill`

## Deploying to Vercel

### 1. Connect Repository to Vercel

```bash
npm install -g vercel
vercel
```

### 2. Add Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all the variables from your `.env.local` file
3. Make sure they're available in Production, Preview, and Development environments

### 3. Deploy

```bash
vercel --prod
```

Or push to GitHub and enable automatic deployments.

## Features

### AI-Assisted Content Creation
- Claude AI integration for real-time advice and suggestions
- Hook formula templates (person-conflict, budget, before-after, POV, self-discovery)
- Slide content generation with proven narrative structure
- Caption and CTA optimization

### Automated Campaign Execution
- One-click campaign launch
- Multi-step workflow automation
- Real-time progress tracking
- Performance metrics and engagement data

### Session Memory & Learning
- Track campaign performance patterns
- Record successful formulas
- Store optimization insights
- Build institutional knowledge

### Comprehensive Reporting
- Detailed campaign reports
- Engagement metrics (views, likes, shares, comments)
- Performance analysis
- Downloadable reports for stakeholders

## API Endpoints

### POST /api/claude/chat
Send messages to Claude AI for marketing advice and content generation.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Generate a hook for AI tools..." }
  ],
  "context": "Campaign: AI Tools, Niche: SaaS, Audience: Entrepreneurs"
}
```

**Response:**
```json
{
  "role": "assistant",
  "content": "POV: You discover an AI tool that actually saves you 10 hours per week..."
}
```

## Environment Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | Firebase Console |
| `ANTHROPIC_API_KEY` | Claude API key | Anthropic Console |

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Ensure all Firebase variables are set in `.env.local`
- Check that keys match your Firebase project

### "ANTHROPIC_API_KEY not configured"
- Set `ANTHROPIC_API_KEY` in environment
- Verify key is valid at https://console.anthropic.com/

### Chat not responding
- Check browser console for errors
- Verify API endpoint `/api/claude/chat` is accessible
- Ensure ANTHROPIC_API_KEY is set in environment

## Development

### Project Structure

```
studex-frontend/
├── app/
│   ├── api/claude/chat/route.ts       # Claude API integration
│   ├── larry-skill/page.tsx           # Main Larry Skill page
│   └── ...
├── components/
│   ├── LarrySkillChat.tsx             # AI chat component
│   └── ...
├── lib/
│   ├── larry-workflow.ts              # Workflow automation
│   ├── marketing-types.ts             # Marketing data types
│   └── ...
└── ...
```

### Building for Production

```bash
npm run build
npm start
```

## Next Steps

1. **Connect Real Marketing APIs** - Integrate with Blotato, TikTok API, Instagram Graph API
2. **Enable Image Generation** - Add DALL-E or Midjourney integration
3. **Schedule Automation** - Implement automatic scheduling and batching
4. **Advanced Analytics** - Real engagement tracking and ROI calculation
5. **Mobile App** - React Native companion app

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review environment variable configuration
3. Check browser console for detailed error messages
4. Review API logs for backend issues

## Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
