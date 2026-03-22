# Larry Skill API Documentation

Complete API reference for the Larry Skill Marketing Platform.

## Base URL

- Local Development: `http://localhost:3000`
- Production (Vercel): `https://your-domain.vercel.app`

## Authentication

All endpoints require authentication context (currently user session from Firebase Auth).

## Campaign Management

### Create Campaign

**POST** `/api/campaigns`

Creates a new marketing campaign.

**Request Body:**
```json
{
  "title": "AI Tools Marketing",
  "niche": "SaaS",
  "targetAudience": "Entrepreneurs aged 18-35 interested in AI and automation"
}
```

**Response:**
```json
{
  "id": "campaign_1705425600000",
  "title": "AI Tools Marketing",
  "niche": "SaaS",
  "targetAudience": "Entrepreneurs aged 18-35...",
  "createdAt": 1705425600000,
  "updatedAt": 1705425600000,
  "status": "draft",
  "steps": [
    { "id": "hook", "name": "Hook", "status": "pending", "result": null },
    { "id": "slides", "name": "Slides", "status": "pending", "result": null },
    { "id": "caption", "name": "Caption", "status": "pending", "result": null },
    { "id": "schedule", "name": "Schedule", "status": "pending", "result": null },
    { "id": "monitor", "name": "Monitor", "status": "pending", "result": null }
  ],
  "content": {
    "hook": "",
    "slides": [],
    "caption": "",
    "cta": "",
    "platforms": ["tiktok", "instagram"]
  },
  "metrics": {
    "views": 0,
    "likes": 0,
    "shares": 0,
    "comments": 0
  }
}
```

---

### Get All Campaigns

**GET** `/api/campaigns`

Retrieves all campaigns for the current user.

**Response:**
```json
{
  "campaigns": [
    { "id": "campaign_1", "title": "...", ... },
    { "id": "campaign_2", "title": "...", ... }
  ],
  "total": 2
}
```

---

### Get Campaign by ID

**GET** `/api/campaigns/{id}`

Retrieves a specific campaign.

**Parameters:**
- `id` (string) - Campaign ID

**Response:** Campaign object (see Create Campaign response)

---

### Update Campaign

**PUT** `/api/campaigns/{id}`

Updates campaign details or content.

**Request Body:**
```json
{
  "status": "running",
  "content": {
    "hook": "POV: You discover an AI tool that saves 10 hours/week",
    "slides": ["Slide 1 text", "Slide 2 text", ...],
    "caption": "AI just changed everything",
    "cta": "Try it free for 14 days"
  }
}
```

**Response:** Updated campaign object

---

### Delete Campaign

**DELETE** `/api/campaigns/{id}`

Deletes a campaign.

**Response:**
```json
{
  "message": "Campaign deleted successfully"
}
```

---

## Workflow Execution

### Execute Workflow Step

**POST** `/api/campaigns/{id}/execute`

Executes a specific workflow step using Claude AI.

**Parameters:**
- `id` (string) - Campaign ID

**Request Body:**
```json
{
  "step": "hook",
  "context": {
    "title": "AI Tools Marketing",
    "niche": "SaaS",
    "targetAudience": "Entrepreneurs..."
  },
  "previousResults": {
    "hook": "Optional: previous hook for reference"
  }
}
```

**Available Steps:**
- `hook` - Generate viral hook
- `slides` - Create slide content
- `caption` - Write caption and CTA
- `schedule` - Get posting schedule recommendations
- `analyze` - Analyze performance and optimize

**Response:**
```json
{
  "step": "hook",
  "result": "POV: You find an AI tool that actually understands your niche...",
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## Social Media Integration

### Post to TikTok

**POST** `/api/social/tiktok`

Posts content to TikTok.

**Request Body:**
```json
{
  "campaignId": "campaign_1",
  "content": {
    "hook": "POV: You discover...",
    "slides": ["Slide 1", "Slide 2", ...],
    "caption": "AI just changed everything",
    "cta": "Try it free"
  },
  "scheduledTime": "2024-01-16T15:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "platform": "tiktok",
  "campaignId": "campaign_1",
  "postId": "tiktok_1705425600000",
  "status": "published",
  "url": "https://tiktok.com/@yourhandle/video/...",
  "scheduledTime": "2024-01-16T15:00:00Z"
}
```

**Note:** Requires TikTok Business API access and OAuth tokens configured in environment.

---

### Get TikTok Analytics

**GET** `/api/social/tiktok`

Retrieves TikTok account analytics.

**Response:**
```json
{
  "platform": "tiktok",
  "authenticated": false,
  "message": "TikTok analytics - authentication required"
}
```

---

### Post to Instagram

**POST** `/api/social/instagram`

Posts content to Instagram.

**Request Body:**
```json
{
  "campaignId": "campaign_1",
  "content": {
    "hook": "POV: You discover...",
    "slides": ["Slide 1", "Slide 2", ...],
    "caption": "AI just changed everything",
    "cta": "Try it free"
  },
  "scheduledTime": "2024-01-16T15:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "platform": "instagram",
  "campaignId": "campaign_1",
  "postId": "instagram_1705425600000",
  "status": "published",
  "url": "https://instagram.com/p/...",
  "scheduledTime": "2024-01-16T15:00:00Z"
}
```

**Note:** Requires Facebook/Instagram Graph API access tokens configured in environment.

---

### Get Instagram Analytics

**GET** `/api/social/instagram`

Retrieves Instagram account insights.

**Response:**
```json
{
  "platform": "instagram",
  "authenticated": false,
  "message": "Instagram insights - Graph API credentials required"
}
```

---

## Analytics

### Get Analytics

**GET** `/api/analytics`

Retrieves aggregated performance analytics.

**Query Parameters:**
- `timeframe` (string, optional) - `7days` (default), `30days`, `90days`, `all`
- `platform` (string, optional) - Filter by platform: `tiktok`, `instagram`, `linkedin`, `youtube`

**Example:** `GET /api/analytics?timeframe=30days&platform=tiktok`

**Response:**
```json
{
  "timeframe": "30days",
  "platform": "tiktok",
  "metrics": [
    {
      "campaignId": "campaign_1",
      "title": "AI Tools Marketing",
      "platform": "tiktok",
      "views": 12450,
      "likes": 890,
      "shares": 234,
      "comments": 156,
      "engagementRate": 8.9,
      "createdAt": "2024-01-14T10:30:00Z"
    }
  ],
  "summary": {
    "totalViews": 12450,
    "totalEngagement": 1280,
    "avgEngagementRate": "8.9",
    "campaignCount": 1
  }
}
```

---

### Log Custom Event

**POST** `/api/analytics`

Logs a custom event for a campaign.

**Request Body:**
```json
{
  "campaignId": "campaign_1",
  "event": "click",
  "data": {
    "platform": "tiktok",
    "timestamp": "2024-01-16T10:30:00Z",
    "sourceUrl": "https://..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "campaignId": "campaign_1",
  "event": "click",
  "logged": true,
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## Claude AI Chat

### Send Message to Claude

**POST** `/api/claude/chat`

Sends a message to Claude AI for marketing advice and content generation.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Generate a hook for AI tools for entrepreneurs" }
  ],
  "context": "Campaign: AI Tools, Niche: SaaS, Audience: Entrepreneurs aged 18-35"
}
```

**Response:**
```json
{
  "role": "assistant",
  "content": "POV: You discover an AI tool that actually saves you 10 hours per week on repetitive tasks..."
}
```

**Message Format:**
- `messages` (array) - Array of message objects with `role` (user/assistant) and `content` (string)
- `context` (string, optional) - Campaign context for better advice

---

## Client Library Usage

Use the provided `LarryAPI` client library for easier integration:

```typescript
import { getLarryAPI } from '@/lib/larry-api';

const api = getLarryAPI();

// Create campaign
const campaign = await api.createCampaign({
  title: 'AI Tools',
  niche: 'SaaS',
  targetAudience: 'Entrepreneurs',
});

// Execute workflow step
const result = await api.executeStep(
  campaign.id,
  'hook',
  { title: campaign.title, niche: campaign.niche, targetAudience: campaign.targetAudience }
);

// Get analytics
const analytics = await api.getAnalytics('7days', 'tiktok');

// Chat with Claude
const advice = await api.chat(
  [{ role: 'user', content: 'How to improve engagement?' }],
  `Campaign: ${campaign.title}`
);
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

Error Response Format:
```json
{
  "error": "Description of the error"
}
```

---

## Rate Limiting

Currently no rate limiting. For production:
- Implement rate limiting per user
- Cache frequently accessed data
- Batch analytics updates

---

## Future Enhancements

1. **Real Social Media APIs** - Connect to actual TikTok, Instagram, LinkedIn APIs
2. **Image Generation** - DALL-E or Midjourney integration for slide images
3. **Video Generation** - Runway ML or similar for carousel videos
4. **Advanced Scheduling** - Cron-based scheduling system
5. **A/B Testing** - Test multiple hook variations
6. **Webhooks** - Real-time notifications for engagement updates
7. **Batch Processing** - Process multiple campaigns simultaneously

---

## Support

For issues or questions, check:
1. [LARRY_SKILL_SETUP.md](./LARRY_SKILL_SETUP.md) - Setup guide
2. [Browser Console](about:blank) - Detailed error messages
3. API logs - Check server logs for backend errors

## Resources

- [Anthropic API Docs](https://docs.anthropic.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
