/**
 * Maps body areas to distinct oklch colors for visual categorization.
 * Used as tint overlays on gesture/flow card images.
 */
const BODY_AREA_COLORS: Record<string, string> = {
  head: 'oklch(0.55 0.12 250)',      // blue
  neck: 'oklch(0.55 0.12 220)',      // teal-blue
  face: 'oklch(0.55 0.10 290)',      // lavender
  shoulders: 'oklch(0.55 0.12 190)', // teal
  back: 'oklch(0.55 0.12 155)',      // sage green
  chest: 'oklch(0.55 0.10 350)',     // warm rose
  arms: 'oklch(0.55 0.12 70)',       // amber
  hands: 'oklch(0.55 0.12 55)',      // gold
  legs: 'oklch(0.55 0.12 120)',      // yellow-green
  feet: 'oklch(0.55 0.12 30)',       // coral
};

const FALLBACK_COLOR = 'oklch(0.55 0.08 160)'; // sage

/** Returns the oklch color string for the primary body area. */
export function getBodyAreaColor(bodyAreas: string[]): string {
  const area = bodyAreas[0]?.toLowerCase();
  return BODY_AREA_COLORS[area] ?? FALLBACK_COLOR;
}
