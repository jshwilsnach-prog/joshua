import type { Encounter, GameSnap } from "./types";

const close = { id: "leave", label: "Step back", effects: [{ type: "close" as const }] };

/** How does one draw a seven-pointed star with will? The house will not grade you. */
export function sevenStar(s: GameSnap): Encounter {
  const spoken = String(s.flags.sevenWill ?? "").trim();
  if (spoken) {
    return {
      speaker: "A star that will not construct",
      text: `You answered with will. The house will not grade it. Sight could not cut seven. The old circle would not seat it. What you said stays yours:\n\n${spoken}`,
      options: [{ id: "seven-again", label: "Answer again", input: "line" }, close],
    };
  }
  return {
    speaker: "A star that will not construct",
    text: "Compass and unmarked straightedge refuse it. The twelve-month sky refuses it. Seven will not sit in three hundred and sixty. The four corners of the earth already do.\n\nHow does one draw a seven-pointed star with will?",
    options: [
      { id: "seven-will", label: "Answer with will", input: "line" },
      {
        id: "sight",
        label: "I will draw what I can see",
        effects: [
          { type: "whisper", text: "The eye can count seven lamps. It cannot construct the angle. That was knowable." },
          { type: "close" },
        ],
      },
      close,
    ],
  };
}

/** One from a guessed end. One from the perfect now. They meet. They do not own a last digit. */
export function piMeeting(s: GameSnap): Encounter {
  const spoken = String(s.flags.piWill ?? "").trim();
  if (spoken) {
    return {
      speaker: "Two counts on a circle",
      text: `You answered with will. The house will not grade it. They meet. They do not own a last digit. What you said stays yours:\n\n${spoken}`,
      options: [{ id: "pi-again", label: "Answer again", input: "line" }, close],
    };
  }
  return {
    speaker: "Two counts on a circle",
    text: "A line asked to become a world. No last digit. One being counts from a guessed end — a bound, not a finish. One being counts from the perfect now — the unit underfoot, not the whole circle.\n\nIf either stops, the wheel seizes. Two pits. A religion.\n\nIf they keep walking, they figure a meeting, not a who.\n\nHow is π known, if not by a last lamp?",
    options: [
      { id: "pi-will", label: "Answer with will", input: "line" },
      {
        id: "last-digit",
        label: "There is a last digit. I will reach it.",
        effects: [
          { type: "whisper", text: "The end-counter believed they had finished. That was the downfall, named without being named." },
          { type: "close" },
        ],
      },
      {
        id: "now-is-all",
        label: "Now is the whole circle.",
        effects: [
          { type: "whisper", text: "The now-counter took the unit for the world. The diameter is not the walk." },
          { type: "close" },
        ],
      },
      close,
    ],
  };
}
