/**
 * Maps body areas to distinct oklch colors for visual categorization.
 * Used as tint overlays on gesture/flow card images.
 */
export const BODY_AREA_COLORS: Record<string, string> = {
  head: 'oklch(0.55 0.12 250)',      // blue
  neck: 'oklch(0.55 0.12 220)',      // teal-blue
  shoulders: 'oklch(0.55 0.12 190)', // teal
  back: 'oklch(0.55 0.12 155)',      // sage green
  chest: 'oklch(0.55 0.10 350)',     // warm rose
  arms: 'oklch(0.55 0.12 70)',       // amber
  hands: 'oklch(0.55 0.12 55)',      // gold
  legs: 'oklch(0.55 0.12 120)',      // yellow-green
  feet: 'oklch(0.55 0.12 30)',       // coral
};

export const FALLBACK_COLOR = 'oklch(0.55 0.08 160)'; // sage

/** Returns the oklch color string for the primary body area. */
export function getBodyAreaColor(bodyAreas: string[]): string {
  const area = bodyAreas[0]?.toLowerCase();
  return BODY_AREA_COLORS[area] ?? FALLBACK_COLOR;
}

/** Generates a CSS gradient based on the body areas present in a flow. */
export function getFlowGradient(bodyAreas: string[]): string {
  const uniqueAreas = Array.from(new Set(bodyAreas.map(a => a.toLowerCase())));
  const colors = uniqueAreas
    .map(area => BODY_AREA_COLORS[area])
    .filter(Boolean);

  if (colors.length === 0) {
    // Default generic gradient (Sage to Teal)
    return `linear-gradient(135deg, ${FALLBACK_COLOR}, ${BODY_AREA_COLORS.shoulders})`;
  }

  if (colors.length === 1) {
    // Single color -> fade to transparent/lighter
    return `linear-gradient(135deg, ${colors[0]}, color-mix(in oklch, ${colors[0]}, white 20%))`;
  }

  // Multiple colors (limit to top 3 for sanity)
  return `linear-gradient(135deg, ${colors.slice(0, 3).join(', ')})`;
}
