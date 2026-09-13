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
