# Visual Style Guide

This document outlines the visual style, color coding, and illustration guidelines for Co-Flow content.

## Color Coding (Body Areas)

We use the Oklch color space for consistent, accessible, and perceptually uniform colors.

| Body Area | Color Description | Oklch Value |
| :--- | :--- | :--- |
| **Head** | Soft Blue | `oklch(0.65 0.10 250)` |
| **Neck** | Soft Teal-Blue | `oklch(0.65 0.10 220)` |
| **Shoulders** | Soft Teal | `oklch(0.65 0.10 190)` |
| **Back** | Soft Sage Green | `oklch(0.65 0.10 155)` |
| **Chest** | Soft Warm Rose | `oklch(0.65 0.10 350)` |
| **Arms** | Soft Amber | `oklch(0.65 0.10 70)` |
| **Hands** | Soft Gold | `oklch(0.65 0.10 55)` |
| **Legs** | Soft Yellow-Green | `oklch(0.65 0.10 120)` |
| **Feet** | Soft Coral | `oklch(0.65 0.10 30)` |

**Usage:**
- These colors are used as tint overlays on gesture and flow cards.
- They are also used as the primary accent color in gesture illustrations.

---

## Illustration Style

### Gesture Illustrations

**Style:** Modern Medical Diagram / Minimalist Vector
**Background:** Dark Charcoal (`#1a1a1a` approx, usually transparent in app logic)
**Elements:**
- **Thick Lines:** Use relatively thick, clean lines for visibility.
- **No Text:** Illustrations should be purely visual. Use arrows to indicate motion or pressure.
- **No Skeletons:** Focus on the living body (clothed or outline). Avoid skulls or skeletal diagrams unless strictly necessary for anatomical clarity (rare).
- **Primary Color:** Use the corresponding body area color (from the table above) for the main action elements (hands, arrows, focal points).

**Prompt Template (Midjourney/DALL-E):**
> Minimalist flat vector illustration of [Technique Name]. Modern medical diagram style with thick lines on a dark charcoal background. [Specific action description, e.g., Hands pressing on the shoulders]. Primary color: [Body Area Color Name] (oklch [Hue] hue). [Action specific details, e.g., Arrows indicating downward pressure]. No text.

### Flow Posters

**Style:** Abstract / Semi-Abstract / Dreamy
**Goal:** Evoke a feeling of relaxation, flow, and the specific energy of the sequence.
**Colors:** Warm, earthy, calming palette (terracotta, sage, sand, soft blues).
**Elements:**
- Stylized figures in deep stretch or meditation.
- Soft, flowing lines (energy, wind, breath).
- Organic shapes.
- No text.

**Prompt Template:**
> A beautiful, premium cover image for a '[Flow Name]' flow. Abstract or semi-abstract representation of deep relaxation and energy flow. Warm, earthy, calming colors (terracotta, sage, sand). Soft, dreamy aesthetic, maybe suggesting a figure in a deep stretch or meditation but very stylized and artistic. No text.
