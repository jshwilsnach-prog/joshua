/** The play door. The name stands without grok.me. */
export const PLAY_URL = "https://nekyia.me";
export const SOURCE_URL = "https://github.com/jshwilsnach-prog/joshua";

export function shareUrl() {
  try {
    const here = window.location.origin;
    if (/localhost|127\.0\.0\.1/.test(here)) return PLAY_URL;
    return here;
  } catch {
    return PLAY_URL;
  }
}
