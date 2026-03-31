import { CameraPreset } from './types';

export const CAMERA_PRESETS: CameraPreset[] = [
  // --- Dolly ---
  { id: 'dolly-in', name: 'Dolly In', description: 'Camera moves forward toward the subject', category: 'dolly', provider: 'higgsfield', promptTag: 'dolly in shot, camera moving forward' },
  { id: 'dolly-out', name: 'Dolly Out', description: 'Camera pulls back from the subject', category: 'dolly', provider: 'higgsfield', promptTag: 'dolly out shot, camera pulling back' },
  { id: 'dolly-zoom', name: 'Dolly Zoom (Vertigo)', description: 'Dramatic perspective shift effect', category: 'dolly', provider: 'higgsfield', promptTag: 'dolly zoom vertigo effect, dramatic perspective shift' },

  // --- Crane ---
  { id: 'crane-up', name: 'Crane Up', description: 'Camera rises vertically revealing the scene', category: 'crane', provider: 'higgsfield', promptTag: 'crane up shot, camera rising vertically' },
  { id: 'crane-down', name: 'Crane Down', description: 'Camera descends vertically toward subject', category: 'crane', provider: 'higgsfield', promptTag: 'crane down shot, camera descending' },
  { id: 'crane-sweep', name: 'Crane Sweep', description: 'Sweeping crane movement across the scene', category: 'crane', provider: 'higgsfield', promptTag: 'sweeping crane shot across the scene' },

  // --- Orbit ---
  { id: 'orbit-360', name: '360° Orbit', description: 'Full rotation around the subject', category: 'orbit', provider: 'higgsfield', promptTag: '360 degree orbit shot around the subject' },
  { id: 'orbit-left', name: 'Orbit Left', description: 'Camera orbits left around subject', category: 'orbit', provider: 'higgsfield', promptTag: 'orbit left around the subject' },
  { id: 'orbit-right', name: 'Orbit Right', description: 'Camera orbits right around subject', category: 'orbit', provider: 'higgsfield', promptTag: 'orbit right around the subject' },

  // --- Zoom ---
  { id: 'zoom-in', name: 'Zoom In', description: 'Lens zoom toward the subject', category: 'zoom', provider: 'higgsfield', promptTag: 'zoom in shot, lens zooming toward subject' },
  { id: 'zoom-out', name: 'Zoom Out', description: 'Lens zoom away from the subject', category: 'zoom', provider: 'higgsfield', promptTag: 'zoom out shot, lens zooming away' },
  { id: 'crash-zoom-in', name: 'Crash Zoom In', description: 'Extremely fast dramatic zoom in', category: 'zoom', provider: 'higgsfield', promptTag: 'crash zoom in, extremely fast dramatic zoom' },
  { id: 'crash-zoom-out', name: 'Crash Zoom Out', description: 'Extremely fast dramatic zoom out', category: 'zoom', provider: 'higgsfield', promptTag: 'crash zoom out, extremely fast dramatic zoom' },

  // --- Pan ---
  { id: 'pan-left', name: 'Pan Left', description: 'Camera pans horizontally to the left', category: 'pan', provider: 'higgsfield', promptTag: 'pan left, horizontal camera movement' },
  { id: 'pan-right', name: 'Pan Right', description: 'Camera pans horizontally to the right', category: 'pan', provider: 'higgsfield', promptTag: 'pan right, horizontal camera movement' },
  { id: 'tilt-up', name: 'Tilt Up', description: 'Camera tilts vertically upward', category: 'pan', provider: 'higgsfield', promptTag: 'tilt up, vertical camera movement upward' },
  { id: 'tilt-down', name: 'Tilt Down', description: 'Camera tilts vertically downward', category: 'pan', provider: 'higgsfield', promptTag: 'tilt down, vertical camera movement downward' },
  { id: 'whip-pan', name: 'Whip Pan', description: 'Extremely fast horizontal pan creating motion blur', category: 'pan', provider: 'higgsfield', promptTag: 'whip pan shot, extremely fast horizontal pan with motion blur' },

  // --- FPV ---
  { id: 'fpv-drone', name: 'FPV Drone', description: 'First-person view drone footage style', category: 'fpv', provider: 'higgsfield', promptTag: 'FPV drone shot, first person view aerial footage' },
  { id: 'fpv-walk', name: 'FPV Walk', description: 'First-person walking perspective', category: 'fpv', provider: 'higgsfield', promptTag: 'first person walking shot, POV movement' },

  // --- Static ---
  { id: 'static-wide', name: 'Static Wide', description: 'Fixed wide-angle shot', category: 'static', provider: 'higgsfield', promptTag: 'static wide angle shot, fixed camera' },
  { id: 'static-closeup', name: 'Static Close-Up', description: 'Fixed close-up shot', category: 'static', provider: 'higgsfield', promptTag: 'static close-up shot, fixed camera, detailed' },
  { id: 'static-medium', name: 'Static Medium', description: 'Fixed medium shot', category: 'static', provider: 'higgsfield', promptTag: 'static medium shot, fixed camera' },

  // --- Special ---
  { id: 'dutch-angle', name: 'Dutch Angle', description: 'Tilted camera creating dramatic tension', category: 'special', provider: 'higgsfield', promptTag: 'dutch angle shot, tilted camera, dramatic tension' },
  { id: 'hyperlapse', name: 'Hyperlapse', description: 'Time-compressed movement through a scene', category: 'special', provider: 'higgsfield', promptTag: 'hyperlapse shot, time-compressed movement through scene' },
  { id: 'focus-pull', name: 'Focus Pull', description: 'Shift focus between foreground and background', category: 'special', provider: 'higgsfield', promptTag: 'focus pull shot, rack focus between foreground and background' },
  { id: 'tracking', name: 'Tracking Shot', description: 'Camera follows alongside the subject', category: 'special', provider: 'higgsfield', promptTag: 'tracking shot, camera following alongside subject' },
  { id: 'steadicam', name: 'Steadicam', description: 'Smooth floating camera movement', category: 'special', provider: 'higgsfield', promptTag: 'steadicam shot, smooth floating camera movement' },

  // --- Kling Camera Movements ---
  { id: 'kling-pan-left', name: 'Pan Left', description: 'Horizontal pan left', category: 'pan', provider: 'kling', promptTag: 'camera panning left horizontally' },
  { id: 'kling-pan-right', name: 'Pan Right', description: 'Horizontal pan right', category: 'pan', provider: 'kling', promptTag: 'camera panning right horizontally' },
  { id: 'kling-tilt-up', name: 'Tilt Up', description: 'Vertical tilt upward', category: 'pan', provider: 'kling', promptTag: 'camera tilting upward vertically' },
  { id: 'kling-tilt-down', name: 'Tilt Down', description: 'Vertical tilt downward', category: 'pan', provider: 'kling', promptTag: 'camera tilting downward vertically' },
  { id: 'kling-zoom-in', name: 'Zoom In', description: 'Camera zooms in', category: 'zoom', provider: 'kling', promptTag: 'camera zooming in toward subject' },
  { id: 'kling-zoom-out', name: 'Zoom Out', description: 'Camera zooms out', category: 'zoom', provider: 'kling', promptTag: 'camera zooming out from subject' },
  { id: 'kling-orbit', name: '360° Orbit', description: 'Full orbit around subject', category: 'orbit', provider: 'kling', promptTag: '360 degree orbit around the subject' },
  { id: 'kling-fpv', name: 'FPV Drone', description: 'First-person drone view', category: 'fpv', provider: 'kling', promptTag: 'FPV drone shot, first person aerial view' },
];

export function getPresetsForProvider(provider: string): CameraPreset[] {
  return CAMERA_PRESETS.filter((p) => p.provider === provider);
}

export function getPresetsByCategory(category: string): CameraPreset[] {
  return CAMERA_PRESETS.filter((p) => p.category === category);
}
