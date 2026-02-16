# Content Pipeline

## Storage
- **Location**: `src/content/gestures/<slug>/gesture.json`
- **Format**: JSON + static assets (mp3, mp4, webp).

## Tools
- **`pnpm content:new-gesture`**: Scaffolding CLI to generate structure.
- **`pnpm content:validate`**: Validates JSON schema and audio file presence.
- **`pnpm content:scan`**: Generates runtime index for quick lookup (no FS in browser).

## Rules
- Content is versioned in Git.
- Slug must be unique.
- Audio is required; Video is optional.
