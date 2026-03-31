import { GuideSection } from './types';

export const GUIDES: GuideSection[] = [
  // --- HIGGSFIELD GUIDES ---
  {
    id: 'hf-t2v',
    title: 'Text-to-Video with Higgsfield',
    provider: 'higgsfield',
    mode: 'text-to-video',
    content: `Higgsfield's Text-to-Video mode generates cinematic videos from text descriptions alone. Use detailed prompts describing the scene, subject, action, lighting, and camera movement for best results.

**Models Available:**
- **DOP Lite** — Fast previews, lower cost
- **DOP Preview** — Balanced quality and speed
- **DOP Turbo** — Maximum quality output

**Key Parameters:**
- **Prompt** — Describe your scene in detail (subject, action, environment, mood, lighting)
- **Resolution** — 480p to 1080p native, with upscaling to 4K/8K
- **Aspect Ratio** — 16:9 (landscape), 9:16 (portrait/reels), 4:5 (Instagram feed)
- **Camera Preset** — Choose from 50+ cinematic camera movements
- **Seed** — Set a number (1-1,000,000) for reproducible results
- **Enhance Prompt** — Let AI refine your prompt for better output`,
    tips: [
      'Be specific about lighting: "golden hour sunlight", "neon-lit alley", "soft studio lighting"',
      'Include camera movement in your prompt for more dynamic results',
      'Use seed values to reproduce and iterate on results you like',
      'Start with DOP Lite for quick tests, switch to Turbo for final output',
      'Describe the mood: "cinematic", "documentary style", "dreamy atmosphere"',
    ],
    examplePrompts: [
      'A confident young woman walking through a vibrant Tokyo street at night, neon reflections on wet pavement, cinematic dolly in shot, shallow depth of field, 4K quality',
      'Professional male influencer speaking directly to camera in a modern minimalist studio, soft key lighting, static medium shot, natural expression',
      'Aerial FPV drone shot flying through a lush tropical forest, morning mist, golden sunlight filtering through trees, cinematic color grading',
    ],
  },
  {
    id: 'hf-i2v',
    title: 'Image-to-Video with Higgsfield',
    provider: 'higgsfield',
    mode: 'image-to-video',
    content: `Transform any still image into a dynamic video. Upload a reference photo and describe the motion you want. Perfect for bringing influencer photos to life.

**Key Parameters:**
- **Source Image** — Upload the photo you want to animate
- **Prompt** — Describe the motion and action
- **Camera Fixed** — Toggle whether the camera moves or stays static
- **Motion Strength** — 0.0 (subtle) to 1.0 (dramatic movement)
- **Motion Preset** — Choose from 100+ specialized motion presets

**Motion Categories:**
- 3D Rotations — Rotate the subject in 3D space
- Cinematic Effects — Professional film-style movements
- Dynamic Transitions — Smooth scene transitions
- Dolly Movements — Forward/backward camera motion`,
    tips: [
      'Use high-quality source images (at least 1080p) for best results',
      'Keep motion strength at 0.3-0.5 for natural-looking movement',
      'Set camera_fixed=true if you only want the subject to move, not the camera',
      'Describe what moves: "hair blowing in wind, slight smile forming, eyes blinking"',
      'For influencer content, use subtle motion (0.2-0.4) for a natural feel',
    ],
    examplePrompts: [
      'The person in the photo turns slightly toward the camera and smiles naturally, hair gently moving in a breeze, soft lighting',
      'Subtle breathing motion, slight head turn to the left, warm expression, background slightly out of focus',
      'The subject walks forward confidently, coat flowing with movement, urban background with bokeh lights',
    ],
  },
  {
    id: 'hf-soul',
    title: 'Soul Mode — Realistic AI Influencers',
    provider: 'higgsfield',
    mode: 'soul-mode',
    content: `Soul Mode is Higgsfield's specialized model for generating ultra-realistic human images. Perfect for creating consistent AI influencer characters.

**Key Parameters:**
- **Prompt** — Detailed description of the person and scene
- **Reference Images** — Upload 1-4 reference images for character consistency
- **Style ID** — Choose from 80+ visual styles (Realistic, Cinematic, Fashion, etc.)
- **Style Strength** — 0.0 to 1.0 (how strongly the style is applied)
- **Quality** — Medium (faster) or High (better detail)
- **Enhance Prompt** — AI refinement for complex scenes

**Available Styles Include:**
Realistic, Medieval, Creatures, Fashion Editorial, Cinematic Portrait, Street Photography, Studio Glamour, and 70+ more.`,
    tips: [
      'Use 2-4 reference images of the same character from different angles for best consistency',
      'Set style_strength to 0.7-0.9 for strong style influence while keeping realism',
      'Always enable enhance_prompt for complex scene descriptions',
      'For influencer content, use "Realistic" or "Fashion Editorial" styles',
      'Include specific details: ethnicity, age range, expression, clothing, environment',
    ],
    examplePrompts: [
      'A 25-year-old woman with long dark hair, wearing a casual white linen outfit, sitting in a sunlit Mediterranean cafe, warm natural lighting, fashion editorial photography style',
      'Professional headshot of a young man, clean shave, wearing a navy blazer, confident smile, soft studio lighting, white background, 8K detailed',
      'Lifestyle photo of a fitness influencer in workout gear, gym environment, motivational pose, dramatic side lighting, Instagram style',
    ],
  },
  // --- KLING GUIDES ---
  {
    id: 'kling-t2v',
    title: 'Text-to-Video with Kling AI',
    provider: 'kling',
    mode: 'text-to-video',
    content: `Kling AI generates high-quality videos with native 4K resolution, built-in audio, and excellent temporal consistency. Kling 3.0 is the latest model.

**Models Available:**
- **Kling 3.0** — Latest, 4K capable, built-in audio
- **Kling 3.0 Omni** — Video reference capability
- **Kling 2.6 Pro** — 1080p cinematic generation
- **Kling 2.5 Turbo** — 40% faster, up to 1080p

**Key Parameters:**
- **Prompt** — 80-150 words for best 3-15 second videos
- **Negative Prompt** — What to avoid in the generation
- **Duration** — 3 to 15 seconds (up to 3 min with extension)
- **Resolution** — 720p, 1080p, 2K, or 4K
- **Aspect Ratio** — 16:9, 9:16, or 1:1
- **CFG Scale** — Creative control intensity
- **Audio** — Enable built-in audio generation (5 languages)

**Prompt Structure (Recommended):**
1. Scene Setting → 2. Subject Description → 3. Context/Action → 4. Camera/Lighting`,
    tips: [
      'Use 80-150 words in your prompt for optimal 3-15 second videos',
      'Structure prompts: Scene → Subject → Action → Camera/Lighting',
      'Enable audio for talking-head influencer content',
      'Use negative prompts to avoid common issues: "blurry, distorted, low quality"',
      'Start with 720p to test, then upgrade to 4K for final output',
      'Use Kling 3.0 for the best quality, 2.5 Turbo for faster iteration',
    ],
    examplePrompts: [
      'A young female influencer sitting in a cozy coffee shop, speaking to the camera with an engaging smile. She gestures naturally while explaining something. Warm ambient lighting, shallow depth of field, bokeh background. Medium close-up shot, slight camera dolly in.',
      'Cinematic establishing shot of a luxury penthouse at sunset. Camera slowly pans across floor-to-ceiling windows revealing a city skyline. Golden hour lighting, lens flare, 4K ultra detailed.',
      'A male fitness trainer demonstrating exercises in a modern gym. Dynamic camera following his movements, high energy, professional lighting, motivational atmosphere.',
    ],
  },
  {
    id: 'kling-i2v',
    title: 'Image-to-Video with Kling AI',
    provider: 'kling',
    mode: 'image-to-video',
    content: `Transform static images into videos with Kling's advanced motion generation. Supports multi-reference elements for character consistency.

**Elements Feature (Multi-Reference):**
- Upload up to 4 reference images (7 with Kling O1)
- Maintains character identity across generations
- Perfect for consistent influencer content

**Key Parameters:**
- **Source Image** — The image to animate
- **Element Images** — Additional reference images for consistency
- **Prompt** — Describe the desired action and motion
- **Duration** — 3-15 seconds
- **Resolution** — Up to 4K`,
    tips: [
      'Use 2-4 reference images for best character consistency',
      'Clear, high-resolution source images produce the best results',
      'Describe specific actions: "turns head left", "raises hand", "walks forward"',
      'Use the Elements feature to maintain the same character across multiple videos',
      'Combine with Video Extension to create longer narratives up to 3 minutes',
    ],
    examplePrompts: [
      'The person in the image turns to face the camera and begins speaking with natural gestures and expressions, warm indoor lighting',
      'Slow motion shot of the subject walking through the scene, hair flowing, confident posture, cinematic atmosphere',
      'The influencer picks up a product from the table, examines it with interest, then looks at the camera with an approving smile',
    ],
  },
];

export function getGuidesForProvider(provider: string): GuideSection[] {
  return GUIDES.filter((g) => g.provider === provider);
}

export function getGuideForMode(provider: string, mode: string): GuideSection | undefined {
  return GUIDES.find((g) => g.provider === provider && g.mode === mode);
}
