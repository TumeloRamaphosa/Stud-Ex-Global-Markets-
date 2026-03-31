# AI Content Studio

**Create incredible AI-generated influencer content with professional cinema-grade tools.**

AI Content Studio is a unified platform that connects to Higgsfield AI, Kling AI, Runway, Pika, Luma, and other AI providers — giving you an easy-to-use interface with cinematic camera presets, professional resolutions, and step-by-step guides to produce stunning videos and images.

---

## Features

### Multi-Provider AI Integration
- **Higgsfield AI** — Text-to-Video, Image-to-Video, Soul Mode (ultra-realistic AI influencers), 50+ camera motion presets, up to 8K upscaling, 80+ art styles
- **Kling AI** — Native 4K video, built-in audio (5 languages), lip-sync, multi-reference elements (up to 7 images), video extension up to 3 minutes
- **Runway ML** — Gen-3 Alpha video generation, motion brush, advanced editing
- **Pika** — Creative effects, scene modification, lip sync
- **Luma Dream Machine** — Realistic physics, character consistency

### Easy API Key Management
- Simple paste-and-save interface for all providers
- Direct links to where each API key is found
- Keys stored securely in your browser's local storage
- Add, update, or remove keys anytime
- Never sent to any external server

### 30+ Cinematic Camera Presets
| Category | Presets |
|----------|---------|
| **Dolly** | Dolly In, Dolly Out, Dolly Zoom (Vertigo) |
| **Crane** | Crane Up, Crane Down, Crane Sweep |
| **Orbit** | 360° Orbit, Orbit Left, Orbit Right |
| **Zoom** | Zoom In, Zoom Out, Crash Zoom In, Crash Zoom Out |
| **Pan/Tilt** | Pan Left, Pan Right, Tilt Up, Tilt Down, Whip Pan |
| **FPV** | FPV Drone, FPV Walk |
| **Static** | Wide, Close-Up, Medium |
| **Special** | Dutch Angle, Hyperlapse, Focus Pull, Tracking, Steadicam |

### 14 Resolution Presets
- **Landscape:** 720p, 1080p, 2K, 4K, 8K
- **Portrait/Social:** 720p Portrait, 1080p Portrait, Instagram Feed (4:5), Instagram Story/Reel (9:16), TikTok (9:16)
- **Square:** 1080x1080
- **Cinematic:** CinemaScope (21:9), Anamorphic (2.39:1)

### Built-in Guides & Prompt Templates
- Step-by-step generation guides for every provider and mode
- Pro tips for lighting, camera direction, and mood
- Clickable example prompts you can use instantly
- Prompt writing masterclass for influencer content
- Templates: Talking Head, Product Showcase, Lifestyle/Travel, Fashion/Editorial, Fitness

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/TumeloRamaphosa/ai-content-studio.git
cd ai-content-studio/studex-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

### 4. Open the app
Navigate to [http://localhost:3000/content-studio](http://localhost:3000/content-studio)

### 5. Add your API keys
Go to **API Keys** page and paste your keys:
- **Higgsfield** → Get yours at [cloud.higgsfield.ai](https://cloud.higgsfield.ai/)
- **Kling** → Get yours at [klingai.com/dev](https://klingai.com/dev)
- **Runway** → Get yours at [app.runwayml.com/settings/api-keys](https://app.runwayml.com/settings/api-keys)

### 6. Start generating
Choose a provider, mode, camera preset, resolution — write your prompt and hit **Generate**.

---

## Project Structure

```
studex-frontend/
├── app/
│   ├── content-studio/
│   │   ├── page.tsx              # Dashboard
│   │   ├── layout.tsx            # Navigation layout
│   │   ├── api-keys/page.tsx     # API key management
│   │   ├── generate/page.tsx     # Content generation interface
│   │   └── guides/page.tsx       # Guides & reference
│   └── api/
│       └── content-studio/
│           └── generate/route.ts # Server-side API proxy
├── lib/
│   └── content-studio/
│       ├── types.ts              # TypeScript type definitions
│       ├── providers.ts          # AI provider configurations
│       ├── camera-presets.ts     # 30+ camera motion presets
│       ├── resolutions.ts        # 14 resolution presets
│       ├── api-key-store.ts      # Local storage key management
│       └── guides.ts             # Generation guides & tips
```

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI:** Custom components with Framer Motion, Lucide icons
- **API:** Server-side proxy routes for secure provider calls
- **Storage:** Browser localStorage for API keys (zero server-side storage)

---

## Generation Modes

| Mode | Description | Providers |
|------|-------------|-----------|
| **Text-to-Video** | Generate video from text description | Higgsfield, Kling, Runway, Pika, Luma |
| **Image-to-Video** | Animate a still image into video | Higgsfield, Kling, Runway, Pika, Luma |
| **Text-to-Image** | Generate still images from text | Higgsfield |
| **Soul Mode** | Ultra-realistic AI human generation | Higgsfield |
| **Video Extend** | Extend video duration up to 3 min | Kling |

---

## Security

- API keys are stored **only in your browser's local storage**
- Keys are **never transmitted** to our servers
- Server-side API proxy strips keys after forwarding to providers
- `.env` file is git-ignored to prevent accidental credential commits

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-provider`)
3. Commit your changes (`git commit -m 'Add new provider integration'`)
4. Push to the branch (`git push origin feature/new-provider`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with AI for creators, by creators.
