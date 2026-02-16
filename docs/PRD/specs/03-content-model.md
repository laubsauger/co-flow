# Content Model

## Gesture (Atomic)
- **ID**: Slug (kebab-case).
- **Metadata**: 
  - `name` (string)
  - `tags` (string array)
  - `bodyAreas` (string array: neck, shoulders, jaw, etc.)
  - `intensity` (1-5)
  - `durationDefaults` (min, default, max)
- **Media**: 
  - `audio` (REQUIRED, mp3/m4a)
  - `video` (OPTIONAL, mp4)
  - `poster` (OPTIONAL, webp)
  - `captions` (OPTIONAL, vtt)
- **Therapeutic**: 
  - `contraindications` (string array)
  - `equipment` (string array)

## Flow
### Step Flow
Sequence of gestures. Used for custom flows & UI remixing.
- Can be paused/resumed per step.
- Audio is chained dynamically.

### Compiled Flow
Single long audio/video file. Used for "press play and don't touch".
- Best for uninterrupted immersion.
- Less flexible (cannot skip easily in early versions).
