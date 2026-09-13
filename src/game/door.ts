/** The play door. Not a throne. The walking is Nekyia; the night is named. */
export const PLAY_URL = "https://joshua.grok.me";
export const SOURCE_URL = "https://github.com/jshwilsnach-prog/nekyia";

export function shareUrl() {
  try {
    const here = window.location.origin;
    if (/localhost|127\.0\.0\.1/.test(here)) return PLAY_URL;
    return here;
  } catch {
    return PLAY_URL;
  }
}
