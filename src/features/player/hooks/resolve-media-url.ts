/**
 * Resolve a gesture's media filename to a servable URL.
 * Content lives at src/content/gestures/<id>/<filename>.
 * In Vite dev, we use the base path; in production, files must be in public/.
 */
export function resolveGestureMediaUrl(gestureId: string, filename: string): string {
  // Files in src/content/ are served via Vite's asset pipeline
  return `/src/content/gestures/${gestureId}/${filename}`;
}
