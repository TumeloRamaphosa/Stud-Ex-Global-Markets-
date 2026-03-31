import { ResolutionPreset } from './types';

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  // --- Landscape ---
  { id: '720p', label: '720p HD', width: 1280, height: 720, aspectRatio: '16:9', category: 'landscape', providers: ['higgsfield', 'kling', 'runway', 'pika', 'luma'] },
  { id: '1080p', label: '1080p Full HD', width: 1920, height: 1080, aspectRatio: '16:9', category: 'landscape', providers: ['higgsfield', 'kling', 'runway', 'pika', 'luma'] },
  { id: '2k', label: '2K QHD', width: 2560, height: 1440, aspectRatio: '16:9', category: 'landscape', providers: ['higgsfield', 'kling'] },
  { id: '4k', label: '4K Ultra HD', width: 3840, height: 2160, aspectRatio: '16:9', category: 'landscape', providers: ['higgsfield', 'kling'] },
  { id: '8k', label: '8K (Upscaled)', width: 7680, height: 4320, aspectRatio: '16:9', category: 'landscape', providers: ['higgsfield'] },

  // --- Portrait (Social Media) ---
  { id: '720p-portrait', label: '720p Portrait', width: 720, height: 1280, aspectRatio: '9:16', category: 'portrait', providers: ['higgsfield', 'kling', 'runway', 'pika', 'luma'] },
  { id: '1080p-portrait', label: '1080p Portrait', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait', providers: ['higgsfield', 'kling', 'runway', 'pika', 'luma'] },
  { id: 'ig-feed', label: 'Instagram Feed', width: 1080, height: 1350, aspectRatio: '4:5', category: 'portrait', providers: ['higgsfield', 'kling'] },
  { id: 'ig-story', label: 'Instagram Story/Reel', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait', providers: ['higgsfield', 'kling', 'runway', 'pika'] },
  { id: 'tiktok', label: 'TikTok', width: 1080, height: 1920, aspectRatio: '9:16', category: 'portrait', providers: ['higgsfield', 'kling', 'runway', 'pika'] },

  // --- Square ---
  { id: 'square-1080', label: '1080x1080 Square', width: 1080, height: 1080, aspectRatio: '1:1', category: 'square', providers: ['kling', 'runway', 'pika'] },

  // --- Cinematic ---
  { id: 'cinemascope', label: 'CinemaScope 21:9', width: 2560, height: 1080, aspectRatio: '21:9', category: 'cinematic', providers: ['higgsfield'] },
  { id: 'anamorphic', label: 'Anamorphic 2.39:1', width: 2560, height: 1072, aspectRatio: '2.39:1', category: 'cinematic', providers: ['higgsfield'] },
];

export function getResolutionsForProvider(provider: string): ResolutionPreset[] {
  return RESOLUTION_PRESETS.filter((r) => r.providers.includes(provider as any));
}

export function getResolutionsByCategory(category: string): ResolutionPreset[] {
  return RESOLUTION_PRESETS.filter((r) => r.category === category);
}
