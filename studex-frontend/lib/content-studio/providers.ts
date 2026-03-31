import { ProviderInfo } from './types';

export const AI_PROVIDERS: ProviderInfo[] = [
  {
    id: 'higgsfield',
    name: 'Higgsfield AI',
    description: 'Cinematic AI video & image generation with 50+ camera presets, Soul mode for realistic influencer content, and up to 8K upscaling.',
    websiteUrl: 'https://higgsfield.ai',
    apiKeyUrl: 'https://cloud.higgsfield.ai/',
    features: [
      'Text-to-Video',
      'Image-to-Video',
      'Soul Mode (realistic images)',
      '50+ Camera Motion Presets',
      'Up to 8K Upscaling',
      '80+ Art Styles',
    ],
    hasSecret: true,
    logo: '🎬',
  },
  {
    id: 'kling',
    name: 'Kling AI',
    description: 'Powerful video generation with native 4K, built-in audio, lip-sync, multi-reference elements, and up to 3-minute video extension.',
    websiteUrl: 'https://klingai.com',
    apiKeyUrl: 'https://klingai.com/dev',
    features: [
      'Text-to-Video (up to 15s)',
      'Image-to-Video',
      'Native 4K Resolution',
      'Built-in Audio (5 languages)',
      'Lip-Sync & Expression Control',
      'Multi-Reference Elements (up to 7 images)',
      'Video Extension (up to 3 min)',
    ],
    hasSecret: true,
    logo: '🎥',
  },
  {
    id: 'runway',
    name: 'Runway ML',
    description: 'Industry-leading AI video generation with Gen-3 Alpha, motion brush, and advanced editing tools.',
    websiteUrl: 'https://runwayml.com',
    apiKeyUrl: 'https://app.runwayml.com/settings/api-keys',
    features: [
      'Gen-3 Alpha Video Generation',
      'Motion Brush',
      'Image-to-Video',
      'Video-to-Video',
      'Advanced Editing Tools',
    ],
    hasSecret: false,
    logo: '🎞️',
  },
  {
    id: 'pika',
    name: 'Pika',
    description: 'Creative AI video platform with unique effects, scene modification, and lip-sync capabilities.',
    websiteUrl: 'https://pika.art',
    apiKeyUrl: 'https://pika.art/developers',
    features: [
      'Text-to-Video',
      'Image-to-Video',
      'Scene Modification',
      'Lip Sync',
      'Creative Effects',
    ],
    hasSecret: false,
    logo: '⚡',
  },
  {
    id: 'luma',
    name: 'Luma Dream Machine',
    description: 'High-quality video generation with realistic physics, camera control, and character consistency.',
    websiteUrl: 'https://lumalabs.ai',
    apiKeyUrl: 'https://lumalabs.ai/api',
    features: [
      'Text-to-Video',
      'Image-to-Video',
      'Realistic Physics',
      'Camera Control',
      'Character Consistency',
    ],
    hasSecret: false,
    logo: '✨',
  },
];

export function getProvider(id: string): ProviderInfo | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}
