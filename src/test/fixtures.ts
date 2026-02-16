import type { Gesture } from '@/lib/types/gesture';
import type { Flow } from '@/lib/types/flow';

export const testGestures: Gesture[] = [
  {
    id: 'upper-back-circles',
    name: 'Upper Back Circles',
    tags: ['relaxation', 'back'],
    bodyAreas: ['upper-back'],
    summary: 'Circular motions on the upper back',
    description: 'Gentle circular pressure across the upper back muscles.',
    durationDefaults: { minSec: 30, defaultSec: 60, maxSec: 120 },
    media: { audio: 'audio.mp3' },
    intensity: 2,
  },
  {
    id: 'neck-glides',
    name: 'Neck Glides',
    tags: ['relaxation', 'neck'],
    bodyAreas: ['neck'],
    summary: 'Smooth gliding strokes along the neck',
    description: 'Long gliding strokes down the neck to release tension.',
    durationDefaults: { minSec: 20, defaultSec: 45, maxSec: 90 },
    media: { audio: 'audio.mp3' },
    intensity: 1,
    contraindications: ['cervical injury', 'recent neck surgery'],
  },
  {
    id: 'hand-massage',
    name: 'Hand Massage',
    tags: ['relaxation', 'hands'],
    bodyAreas: ['hands'],
    summary: 'Thumb pressure across the palm',
    description: 'Detailed thumb work across the palm and fingers.',
    durationDefaults: { minSec: 30, defaultSec: 60, maxSec: 180 },
    media: { audio: 'audio.mp3', video: 'video.mp4' },
    intensity: 3,
  },
];

export const testGestureMap = new Map(testGestures.map((g) => [g.id, g]));

export const testFlow: Flow = {
  id: 'quick-neck-relief',
  name: 'Quick Neck Relief',
  description: 'A short flow targeting neck and upper back tension.',
  tags: ['quick', 'neck'],
  steps: [
    { gestureId: 'neck-glides', durationSec: 45, side: 'left' },
    { gestureId: 'neck-glides', durationSec: 45, side: 'right' },
    { gestureId: 'upper-back-circles', durationSec: 60 },
  ],
};
