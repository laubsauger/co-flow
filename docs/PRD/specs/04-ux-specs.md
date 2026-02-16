# UX Specifications

## Glanceability
- **Primary Goal**: Readable from 3-4 feet away.
- **Constraints**: 
  - Minimize copy on the "Now Playing" screen.
  - Controls should be large (thumb-sized +).
  - Use high contrast for critical info (timer, instruction).

## Audio Experience
- **Narration**: Clear, calm voice.
- **Cues**: Start, Halfway, 10s left, Switch Side.
- **Chaining**: 
  - seamless transition between steps.
  - 50-150ms crossfade to avoid pops.
  - Preload next audio chunk.

## Motion Guidelines
- **Target**: "Smooth 60fps" feel.
- **Transitions**:
  - Shared element transitions (List -> Detail).
  - Calm, readable transitions in Player (no jarring cuts).
  - Use `layoutId` for hero images.
- **Reduced Motion**: Respect user OS preference.
