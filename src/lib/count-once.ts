import { recordVisit } from "@/lib/tally";

const SESSION_KEY = "aught.entry";

let inFlight: Promise<void> | null = null;

export function alreadyCounted(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function countOnce(): Promise<void> {
  if (alreadyCounted()) return Promise.resolve();
  if (!inFlight) {
    inFlight = recordVisit()
      .then(() => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* private mode — still counted server-side this load */
        }
      })
      .catch((err: unknown) => {
        inFlight = null;
        throw err;
      });
  }
  return inFlight;
}
