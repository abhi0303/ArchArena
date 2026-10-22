/**
 * True for the browser-only build (e.g. GitHub Pages). There is no API server: questions,
 * evaluation, progress and drafts are handled in the browser and stored on this device.
 */
export const STATIC_MODE: boolean = __STATIC_MODE__;

/** Path the app is served from: "/" normally, "/<repo>/" on GitHub Pages. Always ends with "/". */
export const BASE_URL = import.meta.env.BASE_URL;

/** An absolute URL path inside the app, for plain links that bypass the router. */
export function appPath(path: string): string {
  return `${BASE_URL}${path.replace(/^\//, '')}`;
}
