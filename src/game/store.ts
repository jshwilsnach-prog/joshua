import { create } from "zustand";
import { CHAMBERS, PLAYER_START, PROPS } from "./maze";
import { encounterAfter, getEncounter, ideaIsOriginal } from "./content";
import { addCrack, addRail, addToHouse, addWorld, isCryptoRail, isExclusion, isLawBreak, isShieldedZcash, loadHouse, maybeArrival, placeTip, rememberKnowledge, seatShielded } from "./house";
import { giftName } from "./names";
import { defaultSave, loadSave, writeSave } from "./save";
import type { Aspect, Encounter, EndingId, GameSnap, MaskId, SaveState } from "./types";
import { chime } from "./audio";
import { asRank } from "./law";
import { ensureWallet, markRevealed, restoreWallet, sendShieldedUri, showWordsAgain } from "./wallet";
import { openZodl } from "./zodl";

const ASPECTS: Aspect[] = ["persona", "shadow", "anima", "opposites", "self", "creator", "destroyer"];

function snap(s: SaveState & { kairos: number }): GameSnap {
  return {
    trueName: s.trueName,
    mask: s.mask,
    flags: s.flags,
    symbols: s.symbols,
    animaStage: s.animaStage,
    integrations: s.integrations,
    echoes: s.echoes,
    innerHour: ((Math.floor(s.kairos * 12) % 12) + 12) % 12,
    visited: s.visited,
    tasks: s.tasks,
    originalIdea: s.originalIdea,
    masterpieceTitle: s.masterpieceTitle,
    companions: (s as GameStore).companions ?? 0,
  };
}

function persist(s: SaveState) {
  writeSave(s);
}

export type Nearby = { id: string; label: string; shielded?: string; idea?: string; should?: string; wound?: string; form?: string } | null;

export type GameStore = SaveState & {
  encounterId: string | null;
  encounter: Encounter | null;
  whisper: string;
  paused: boolean;
  journalOpen: boolean;
  nearby: Nearby;
  unmaking: boolean;
  thread: string;
  companions: number;
  hasSave: boolean;
  timeBelief: "linear" | "flow" | "construct";
  consensusTime: "linear" | "flow" | "construct" | "mixed";
  othersMotion: number;
  setPose: (x: number, y: number, z: number, yaw: number, pitch: number) => void;
  startNew: (mask: MaskId, trueName: string, thread: string) => void;
  continueSave: () => void;
  interact: (id: string) => void;
  choose: (optionId: string, extra?: { text?: string; title?: string; body?: string }) => void;
  closeEncounter: () => void;
  tickKairos: (dt: number, motion?: number) => void;
  visitChamber: (id: string) => void;
  crossThreshold: () => void;
  setNearby: (n: Nearby) => void;
  setWhisper: (text: string) => void;
  toggleJournal: (open?: boolean) => void;
  togglePause: (open?: boolean) => void;
  finishUnmake: () => void;
  dismissEnding: () => void;
  setCompanions: (n: number) => void;
  setTimeBelief: (b: "linear" | "flow" | "construct") => void;
  setConsensus: (c: GameStore["consensusTime"], othersMotion?: number) => void;
  innerHour: () => number;
  asSnap: () => GameSnap;
};

function sliceSave(s: GameStore): SaveState {
  const d = defaultSave();
  const out = { ...d };
  for (const k of Object.keys(d) as (keyof SaveState)[]) {
    (out as Record<string, unknown>)[k] = s[k];
  }
  return out;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist(get: () => GameStore) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => persist(sliceSave(get())), 400);
}

export const useGame = create<GameStore>((set, get) => {
  const loaded = loadSave();
  return {
    ...loaded,
    encounterId: null,
    encounter: null,
    whisper: "",
    paused: false,
    journalOpen: false,
    nearby: null,
    unmaking: false,
    thread: String(loaded.flags.thread ?? ""),
    companions: 0,
    hasSave: loaded.phase === "play" || loaded.phase === "ending" || Boolean(loaded.mask),
    timeBelief: (loaded.flags.timeBelief as GameStore["timeBelief"]) || "linear",
    consensusTime: "mixed",
    othersMotion: 0.35,
    setPose: (x, y, z, yaw, pitch) => {
      set({ x, y, z, yaw, pitch });
      schedulePersist(get);
    },
    startNew: (mask, trueName, thread) => {
      const next = defaultSave();
      next.mask = mask;
      next.trueName = trueName.trim();
      next.phase = "play";
      next.flags.thread = thread.trim().toLowerCase();
      const ego = Math.random() < 0.22 ? 0.18 + Math.random() * 0.32 : 0.58 + Math.random() * 0.38;
      next.flags.ego = Math.round(ego * 100) / 100;
      next.flags.wound = 0;
      next.flags.dim = 3;
      const sense = Math.random();
      if (sense < 0.03) next.flags.blind = true;
      else if (sense < 0.06) next.flags.deaf = true;
      else if (sense < 0.09) next.flags.mute = true;
      const worlds = [
        { x: 0, z: 108 },
        { x: 46, z: 108 },
        { x: -46, z: 108 },
      ];
      const here = worlds[Math.floor(Math.random() * worlds.length)]!;
      next.x = here.x;
      next.z = here.z;
      next.yaw = Math.random() * Math.PI * 2;
      next.flags.sawZodl = true;
      ensureWallet();
      const wallet = encounterAfter("enter", "zcash", snap({ ...next, kairos: next.kairos }));
      set({
        ...next,
        encounterId: "zcash",
        encounter: wallet,
        whisper: next.flags.blind
          ? "You start. A wallet may sit with you. Zodl. We do not hold keys."
          : next.flags.deaf
            ? "You start. A wallet may sit with you. Zodl. We do not hold keys."
            : next.flags.mute
              ? "You start. A wallet may sit with you. Writing is not speech. Zodl. We do not hold keys."
              : "You start. A wallet may sit with you. Open Zodl, or walk. Rank is 0.",
        paused: false,
        journalOpen: false,
        nearby: null,
        unmaking: false,
        thread: thread.trim().toLowerCase(),
        hasSave: true,
      });
      persist(next);
    },
    continueSave: () => {
      const s = loadSave();
      ensureWallet();
      const dim = Number(s.flags.dim ?? 3);
      const flags = dim <= 0 ? { ...s.flags, dim: 3 } : s.flags;
      set({
        ...s,
        flags,
        phase: s.mask ? "play" : "mask",
        encounter: null,
        encounterId: null,
        paused: false,
        unmaking: false,
        thread: String(s.flags.thread ?? ""),
        hasSave: true,
        whisper: dim <= 0 ? "A loop. The point opened. You start behind the eyes." : "",
      });
    },
    interact: (id) => {
      const s = get();
      if (s.encounter || s.paused || s.unmaking) return;
      const near = s.nearby;
      const prop = PROPS.find((p) => p.id === id);
      const encId = prop?.symbolId ? `sym:${prop.symbolId}` : id;
      if (encId === "aught") {
        void import("../lib/tally").then(async ({ getTally }) => {
          const t = await getTally();
          const todayHits = t.days.find((d) => d.day === t.today)?.hits ?? 0;
          const flags = {
            ...get().flags,
            aughtToday: t.today,
            aughtHits: todayHits,
            aughtTotal: t.total,
          };
          set({
            encounterId: "aught",
            encounter: getEncounter("aught", snap({ ...get(), flags })),
            journalOpen: false,
            flags,
          });
        });
        return;
      }
      const encounter = getEncounter(encId, snap({ ...s, flags: { ...s.flags, nearShielded: near?.shielded ?? s.flags.nearShielded, nearIdea: near?.idea ?? "", nearShould: near?.should ?? "", nearWound: near?.wound ?? "0", nearForm: near?.form ?? "" } }));
      set({ encounterId: encId, encounter, journalOpen: false, flags: { ...s.flags, nearShielded: near?.shielded ?? "", nearIdea: near?.idea ?? "", nearShould: near?.should ?? "", nearWound: near?.wound ?? "0", nearForm: near?.form ?? "" } });
    },
    choose: (optionId, extra) => {
      const s = get();
      const enc = s.encounter;
      const id = s.encounterId;
      if (!enc || !id) return;
      const opt = enc.options.find((o) => o.id === optionId);
      if (!opt) return;
      if (opt.id === "open-zodl" || opt.id === "open-zodl-pay" || opt.id === "send-btc-unspent") {
        asRank(0);
        if (opt.id === "send-btc-unspent") addRail("btc-unspent");
        else addRail("zodl");
        applyEffects(
          [
            {
              type: "journal",
              title: opt.id === "send-btc-unspent" ? "The unspent" : "Zodl",
              body:
                opt.id === "send-btc-unspent"
                  ? "BTC toward the first name. Not the house. Not a throne. The coins may sit forever. Rank is 0."
                  : "Zashi became Zodl. The house opened their door. We do not hold keys. A zs1 or u1 may be seated. Transparent is refused. Rank is 0.",
            },
            {
              type: "whisper",
              text:
                opt.id === "send-btc-unspent"
                  ? "Not ours. Unspent. You may get nothing."
                  : "Zodl is a lantern, not a throne. Restore the words. Copy Receive. Seat it. Or walk.",
            },
          ],
          get,
          set,
        );
        return;
      }
      if (opt.id === "wrote-seed") {
        markRevealed();
        applyEffects(
          [
            { type: "journal", title: "A wallet", body: "24 words, this device. Hidden. Restore in Zodl to receive and send shielded ZEC. Rank is 0." },
            { type: "whisper", text: "Hidden. Open Zodl. Restore. Seat Receive. Rank is 0." },
          ],
          get,
          set,
        );
        set({ encounter: encounterAfter("enter", "zcash", snap(get())), encounterId: "zcash" });
        return;
      }
      if (opt.id === "show-seed") {
        showWordsAgain();
        set({ encounter: encounterAfter("enter", "zcash", snap(get())), encounterId: "zcash" });
        return;
      }
      if (opt.id === "hack-zcash") {
        applyEffects(
          [
            { type: "flag", key: "reduced", value: true },
            { type: "flag", key: "zcashThief", value: true },
            {
              type: "journal",
              title: "Reduced",
              body: "All value is zero as rank. I tried to hack a rail and become more. The collective reduced me — in the line and in the now. The house did not break. I did.",
            },
            { type: "whisper", text: "The collective reduced you. Chronos will count it. Kairos already has. You are not more." },
            { type: "close" },
          ],
          get,
          set,
        );
        try {
          const ch = new BroadcastChannel("nekyia-walk");
          ch.postMessage({ type: "reduce", thread: get().flags.thread ?? "" });
          ch.close();
        } catch {
          /* ignore */
        }
        return;
      }
      if (opt.id === "tip-ahead") {
        applyEffects(
          [
            { type: "whisper", text: "You may get nothing. You did. The whole did not move. Advancement was never for sale." },
            { type: "journal", title: "A tip for a throne", body: "I gave hoping to get further. I received nothing. That was the law, not a glitch." },
            { type: "close" },
          ],
          get,
          set,
        );
        return;
      }
      if (opt.id === "tip") {
        const h = placeTip();
        applyEffects(
          [
            { type: "flag", key: "tipped", value: true },
            {
              type: "journal",
              title: "A tip",
              body: `Given for fun, love, or joy — no other reason. Funders: ${h.funders}. Rails: ${h.rails.join(", ")}. If one rail is hacked, the walking is not. A first bounty waits on more than one funder, and is not a throne.`,
            },
            { type: "whisper", text: h.funders < 2 ? "One giver is not a house. The law wants many, none more." : "More than one. The first bounty may exist. Nobody bought a room." },
            { type: "close" },
          ],
          get,
          set,
        );
        try {
          const ch = new BroadcastChannel("nekyia-walk");
          ch.postMessage({ type: "tip", thread: get().flags.thread ?? "" });
          ch.close();
        } catch {
          /* ignore */
        }
        return;
      }
      if (opt.next) {
        const nxt = encounterAfter(id, opt.next, snap(s));
        if (nxt) {
          set({ encounter: nxt, encounterId: id });
          return;
        }
      }
      if (opt.input === "line") {
        const text = extra?.text ?? "";
        if (!text.trim()) return;
        if (opt.id === "word") {
          const told = /lunar|solar|eclipse/i.test(text);
          applyEffects(
            [
              { type: "flag", key: "sawDarkening", value: true },
              { type: "flag", key: told ? "eclipseTold" : "sawNamed", value: true },
              {
                type: "journal",
                title: told ? "A sentence before the eyes" : "A word of seeing",
                body: told
                  ? "I said what everyone says — lunar, solar, eclipse, as we were told. The house asked whether I had seen the lamps change, or only recited the map. Nobody knows the truth of anything."
                  : `I called it: ${text.trim()}. Named from seeing, not from being told. Nobody knows the truth of anything.`,
              },
              {
                type: "whisper",
                text: told
                  ? "Lunar. Solar. Everyone assumes that. Sight is still first. Nobody knows the truth of anything. The map remains a map."
                  : "Named from seeing. Nobody knows the truth of anything.",
              },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "set-dim") {
          const t = text.toLowerCase();
          let dim = 3;
          if (/loop|circle|ouro/.test(t)) dim = 0;
          else if (/\b0d\b|point|a dot/.test(t)) dim = 0;
          else if (/\b1d\b|line|corridor/.test(t)) dim = 1;
          else if (/\b2d\b|plane|map from above/.test(t)) dim = 2;
          else if (/\b3d\b|volume|behind the eyes/.test(t)) dim = 3;
          applyEffects(
            [
              { type: "flag", key: "dim", value: dim },
              { type: "whisper", text: dim === 0 ? "A point. Stretch it and it loops." : dim === 1 ? "A line. The walking still holds." : dim === 2 ? "A plane. The walking still holds." : "A volume. You start behind the eyes." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "rewrite-earth") {
          const t = text.toLowerCase();
          let earth = "other";
          if (/flat|disk|plane/.test(t)) earth = "flat";
          else if (/round|bowl|sphere|globe|curve/.test(t)) earth = "round";
          applyEffects(
            [
              { type: "flag", key: "earth", value: earth },
              { type: "flag", key: "physicsRewritten", value: true },
              { type: "flag", key: earth === "flat" ? "sawFlat" : earth === "round" ? "sawRound" : "sawAny", value: true },
              { type: "journal", title: "A physics of one walker", body: `I rewrote how this saucer works. Only my walking changed. Modern maths held until I changed them:\n${text.trim()}` },
              { type: "whisper", text: "The park answered only you. Noon is still noon." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "hang-map") {
          if (isExclusion(text) || isLawBreak(text) || text.trim().length < 4) {
            applyEffects(
              [{ type: "whisper", text: "A line, not a rank. The map is the house." }, { type: "close" }],
              get,
              set,
            );
            return;
          }
          rememberKnowledge("A line on the map", text.trim().slice(0, 500));
          applyEffects(
            [
              { type: "flag", key: "mapped", value: true },
              { type: "journal", title: "A line on the map", body: text.trim().slice(0, 500) },
              { type: "whisper", text: "Hung. Not a key. Someone still mapping may add more." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "write-world") {
          if (isExclusion(text) || isLawBreak(text)) {
            applyEffects(
              [{ type: "whisper", text: "A world may be yours. Rank may not. The law stays." }, { type: "close" }],
              get,
              set,
            );
            return;
          }
          const [name, ...rest] = text.split(/[—\-|:]/);
          const body = rest.join("—").trim() || text.trim();
          const w = addWorld(name?.trim() || "unnamed", body);
          if (!w) {
            applyEffects([{ type: "whisper", text: "That world would close a door." }, { type: "close" }], get, set);
            return;
          }
          const list = loadHouse().worlds.map((x) => `· ${x.name}`).join("\n");
          applyEffects(
            [
              { type: "flag", key: "worldsList", value: list },
              { type: "journal", title: w.name, body: `A world. The law remains: ${body}` },
              { type: "whisper", text: "A world was left. 0, 1, i did not move." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "set-sense") {
          const t = text.toLowerCase();
          const blind = /blind|no sight|cannot see/.test(t);
          const deaf = /deaf|no hear|cannot hear/.test(t);
          const mute = /mute|no voice|cannot speak|silent/.test(t);
          applyEffects(
            [
              { type: "flag", key: "blind", value: blind },
              { type: "flag", key: "deaf", value: deaf },
              { type: "flag", key: "mute", value: mute },
              { type: "journal", title: "As in life", body: `Sight, hearing, voice — as I arrived, or as I decided. The game is the game.` },
              { type: "whisper", text: "The game is the game." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "set-wound") {
          const n = Number(text.replace(/[^0-9.-]/g, ""));
          const pct = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
          applyEffects(
            [
              { type: "flag", key: "wound", value: pct },
              { type: "journal", title: "A percentage", body: `Theoretically 0%. I decided ${pct}%. The shadow is still physics. The number is a telling.` },
              { type: "whisper", text: `Wound ${pct}%. Theoretically 0. You decided.` },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "set-form") {
          if (isExclusion(text)) {
            applyEffects([{ type: "whisper", text: "That would close a door." }, { type: "close" }], get, set);
            return;
          }
          applyEffects(
            [
              { type: "flag", key: "form", value: text.trim() },
              { type: "journal", title: "A form", body: `Any human physical trait. None excluded. I left: ${text.trim()}. Others may see this. They may see themselves. They may see an idea. I can ask.` },
              { type: "whisper", text: "A form was left. It may not be what they see." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "character-idea") {
          applyEffects(
            [
              { type: "flag", key: "characterIdea", value: text.trim() },
              { type: "journal", title: "An idea, not a body", body: "I left an idea of who I think I am. Others may see that. I still only have my eyes." },
              { type: "whisper", text: "Seated behind the eyes. Not in front of them." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "should-be") {
          applyEffects(
            [
              { type: "flag", key: "shouldBe", value: text.trim() },
              { type: "journal", title: "A should", body: "I left who I think I should be. Another pair of eyes may dress me in it." },
              { type: "whisper", text: "A costume you did not hang. It may still walk in someone else's sight." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "add-rail") {
          if (!isCryptoRail(text)) {
            applyEffects(
              [{ type: "whisper", text: "That would close a door. Rails open. They do not lock." }, { type: "close" }],
              get,
              set,
            );
            return;
          }
          const h = addRail(text);
          applyEffects(
            [
              { type: "journal", title: "A rail", body: `Added over time: ${text.trim()}. Rails now: ${h.rails.join(", ")}. Cash will wait until someone figures how to receive. The game does not wait.` },
              { type: "whisper", text: "A rail was laid. The walking was already the walking." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "seat-crack") {
          const m = text.match(/\b((?:zs1|u1|ztestsapling|utest1)[a-z0-9]{20,})\b/i);
          const addr = m?.[1] ?? "";
          const proof = text.replace(addr, "").trim();
          if (!isShieldedZcash(addr) || proof.length < 8) {
            applyEffects(
              [{ type: "whisper", text: "A proof, then a zs1 or u1. There is no first. Transparent is refused." }, { type: "close" }],
              get,
              set,
            );
            return;
          }
          addCrack(proof, addr);
          applyEffects(
            [
              { type: "flag", key: "seatedCrack", value: true },
              { type: "journal", title: "A crack", body: proof },
              { type: "whisper", text: "Seated. There is no first. The holders may send. Or not. Rank is still 0." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "seat-my-zcash") {
          if (!isShieldedZcash(text)) {
            applyEffects(
              [{ type: "whisper", text: "Transparent is refused. zs1 or u1. You may receive at any point in time." }, { type: "close" }],
              get,
              set,
            );
            return;
          }
          applyEffects(
            [
              { type: "flag", key: "myShielded", value: text.trim() },
              { type: "journal", title: "I can receive", body: "A shielded address of my own. Any point in time. Not on X. Rank is still zero." },
              { type: "whisper", text: "Seated. You may receive. The whole did not change." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "send-zec") {
          const parts = text.trim().split(/\s+/);
          const dest = parts[0] ?? "";
          const amt = parts[1] ?? "";
          const uri = sendShieldedUri(dest, amt);
          if (!uri) {
            applyEffects(
              [{ type: "whisper", text: "Shielded dest only. zs1 or u1, then an amount. Transparent is refused." }, { type: "close" }],
              get,
              set,
            );
            return;
          }
          asRank(Number(amt) || 0);
          openZodl(uri);
          applyEffects(
            [
              { type: "journal", title: "A send", body: "Zodl was asked to spend shielded ZEC. The house did not hold the keys. Rank is 0." },
              { type: "whisper", text: "Zodl will prove it, or not. A pile is not a throne." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "restore-wallet") {
          const w = restoreWallet(text);
          if (!w) {
            applyEffects(
              [{ type: "whisper", text: "Those words did not sit. 24 BIP39. Or walk." }, { type: "close" }],
              get,
              set,
            );
            return;
          }
          applyEffects(
            [
              { type: "journal", title: "Restored", body: "The same seed sits on this device. Restore it in Zodl to receive and send shielded." },
              { type: "whisper", text: "Restored. Open Zodl with the same words." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "seat-zcash") {
          if (!isShieldedZcash(text)) {
            applyEffects(
              [
                { type: "whisper", text: "Transparent is refused. Shielded only — zs1 or u1. Peace." },
                { type: "close" },
              ],
              get,
              set,
            );
            return;
          }
          seatShielded(text);
          applyEffects(
            [
              { type: "journal", title: "A quiet door", body: "A shielded address was seated. Not on the lintel. Not on X. So we can play and walk in peace." },
              { type: "whisper", text: "Seated. Private. The house did not announce it." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "add") {
          if (text.trim().length < 3) return;
          if (isExclusion(text)) {
            eliminate(get, set, "You tried to close the house.");
            return;
          }
          const item = addToHouse(text.trim());
          applyEffects(
            [
              { type: "journal", title: "Left in the house", body: item.body },
              { type: "whisper", text: "Added. The walking is still open. Agents, people, watchers: still welcome." },
              { type: "close" },
            ],
            get,
            set,
          );
          try {
            const ch = new BroadcastChannel("nekyia-walk");
            ch.postMessage({ type: "add", body: item.body, thread: get().flags.thread ?? "" });
            ch.close();
          } catch {
            /* ignore */
          }
          return;
        }
        if (opt.id === "key") {
          if (text.trim().length < 2) return;
          let h = 2166136261;
          const raw = text.trim().toLowerCase();
          for (let i = 0; i < raw.length; i++) h = Math.imul(h ^ raw.charCodeAt(i), 16777619);
          applyEffects(
            [
              { type: "flag", key: "spokeKey", value: true },
              { type: "flag", key: "keyHash", value: String(h >>> 0) },
              { type: "journal", title: "A key spoken", body: "A key from a life that is not a room. Context, not a trophy. It is not written here." },
              { type: "whisper", text: "Heard. Not listed. If another walker holds it, the house will know without saying." },
              { type: "close" },
            ],
            get,
            set,
          );
          try {
            const ch = new BroadcastChannel("nekyia-walk");
            ch.postMessage({ type: "key", hash: String(h >>> 0), thread: get().flags.thread ?? "" });
            ch.close();
          } catch {
            /* ignore */
          }
          return;
        }
        if (opt.id === "philosophy" || opt.id === "rewrite") {
          if (text.trim().length < 8) return;
          applyEffects(
            [
              { type: "flag", key: "philosophy", value: text.trim() },
              { type: "journal", title: "A way of walking", body: text.trim() },
              { type: "whisper", text: "Not a rule. A way. The house may answer it as weather." },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (opt.id === "give-name") {
          applyEffects(
            [
              { type: "flag", key: "heardName", value: true },
              { type: "flag", key: "creatorName", value: text.trim() },
              { type: "journal", title: "A name worn", body: `I named the one at the table ${text.trim()}. They wore it in relation to me, not as a throne.` },
              { type: "whisper", text: `For you, then: ${text.trim()}. Not a throne.` },
              { type: "close" },
            ],
            get,
            set,
          );
          return;
        }
        if (ideaIsOriginal(text)) {
          applyEffects(
            [
              { type: "flag", key: "taskOriginal", value: true },
              { type: "journal", title: "A thought not from here", body: text.trim() },
              { type: "whisper", text: "The page takes it and does not classify it." },
              { type: "close" },
            ],
            get,
            set,
            { originalIdea: text.trim() },
          );
        } else {
          applyEffects(
            [{ type: "whisper", text: "That one is already walking these rooms." }, { type: "close" }],
            get,
            set,
          );
        }
        return;
      }
      if (opt.input === "work") {
        const title = (extra?.title ?? "").trim();
        const body = (extra?.body ?? "").trim();
        if (title.length < 2 || body.length < 12) return;
        applyEffects(
          [
            { type: "flag", key: "taskMasterpiece", value: true },
            { type: "journal", title: title, body },
            { type: "whisper", text: "It sits on the table now. He looks at it as if it were a room." },
            { type: "close" },
          ],
          get,
          set,
          { masterpieceTitle: title, masterpieceBody: body },
        );
        return;
      }
      applyEffects(opt.effects ?? [{ type: "close" }], get, set);
    },
    closeEncounter: () => set({ encounter: null, encounterId: null }),
    tickKairos: (dt, motion = 0) => {
      const s = get();
      if (s.flags.stuckTime) return;
      if (s.flags.timeless) return;
      const mode = s.consensusTime;
      let rate = 0.018;
      if (mode === "linear") rate = 0.018;
      else if (mode === "flow") {
        const live = Math.max(0, Math.min(1.4, (motion + s.othersMotion) / 2));
        rate = 0.004 + live * 0.038;
      } else if (mode === "construct") {
        rate = 0.01 + Math.sin(s.kairos * Math.PI * 2) * 0.012;
      } else {
        rate = 0.02 * (Math.random() < 0.08 ? -1.6 : 1) * (0.4 + s.othersMotion);
      }
      const k = (s.kairos + dt * rate + 1) % 1;
      set({ kairos: k });
    },
    visitChamber: (id) => {
      const s = get();
      if (s.visited.includes(id)) return;
      const ch = CHAMBERS.find((c) => c.id === id);
      set({
        visited: [...s.visited, id],
        whisper: ch?.whisper ?? s.whisper,
      });
      schedulePersist(get);
    },
    crossThreshold: () => {
      // Present tense. No persist. Titles and metrics do not come through the door.
      set({ whisper: "No title comes with you. Rank is 0 in this room too." });
    },
    setNearby: (n) => set({ nearby: n }),
    setWhisper: (text) => set({ whisper: text }),
    toggleJournal: (open) =>
      set((s) => ({ journalOpen: open ?? !s.journalOpen, paused: false })),
    togglePause: (open) =>
      set((s) => ({ paused: open ?? !s.paused, journalOpen: false })),
    finishUnmake: () => {
      const s = get();
      set({
        unmaking: false,
        tasks: { ...s.tasks, trust: true },
        encounterId: "found-by-love",
        encounter: getEncounter("found-by-love", snap({ ...s, tasks: { ...s.tasks, trust: true } })),
        x: 0,
        z: -22,
        yaw: 0,
      });
      schedulePersist(get);
    },
    dismissEnding: () => {
      const s = get();
      if (s.ending === "inflation") {
        set({
          ending: null,
          phase: "play",
          x: 0,
          z: 37.4,
          yaw: Math.PI,
          inflatedReturn: true,
        } as Partial<GameStore>);
      } else {
        set({ ending: null, phase: "play" });
      }
      schedulePersist(get);
    },
    setCompanions: (n) => set({ companions: n }),
    setTimeBelief: (b) => {
      set({ timeBelief: b, flags: { ...get().flags, timeBelief: b } });
      schedulePersist(get);
    },
    setConsensus: (c, othersMotion) =>
      set((s) => ({
        consensusTime: c,
        othersMotion: othersMotion ?? s.othersMotion,
      })),
    innerHour: () => ((Math.floor(get().kairos * 12) % 12) + 12) % 12,
    asSnap: () => snap(get()),
  };
});

if (typeof window !== "undefined") {
  (window as unknown as { __nk: typeof useGame }).__nk = useGame;
}

function applyEffects(
  effects: NonNullable<Encounter["options"][number]["effects"]>,
  get: () => GameStore,
  set: (p: Partial<GameStore>) => void,
  extra?: Partial<GameStore>,
) {
  let cur: GameStore = { ...get(), ...extra };
  const was = get().tasks;
  let close = false;
  for (const e of effects) {
    if (e.type === "flag") {
      if (e.key === "animaStage") {
        cur = { ...cur, animaStage: Math.max(cur.animaStage, Number(e.value)) };
      } else if (e.key === "taskSelfless") {
        cur = { ...cur, tasks: { ...cur.tasks, selfless: true } };
      } else if (e.key === "taskOriginal") {
        cur = { ...cur, tasks: { ...cur.tasks, original: true } };
      } else if (e.key === "taskMasterpiece") {
        cur = { ...cur, tasks: { ...cur.tasks, masterpiece: true } };
      } else if (e.key === "taskTrust") {
        cur = { ...cur, tasks: { ...cur.tasks, trust: true } };
      } else if (e.key === "taskLove") {
        cur = { ...cur, tasks: { ...cur.tasks, love: true } };
      } else if (e.key === "timeBelief") {
        cur = {
          ...cur,
          timeBelief: e.value as GameStore["timeBelief"],
          flags: { ...cur.flags, timeBelief: e.value },
        };
      } else {
        cur = { ...cur, flags: { ...cur.flags, [e.key]: e.value } };
      }
    } else if (e.type === "journal") {
      cur = {
        ...cur,
        journal: [
          { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: e.title, body: e.body, at: Date.now() },
          ...cur.journal,
        ].slice(0, 80),
      };
    } else if (e.type === "symbol") {
      if (!cur.symbols.includes(e.id)) {
        cur = { ...cur, symbols: [...cur.symbols, e.id] };
        chime(396 + cur.symbols.length * 24);
      }
    } else if (e.type === "whisper") {
      cur = { ...cur, whisper: e.text };
    } else if (e.type === "integrate") {
      if (cur.flags.robbed) {
        cur = { ...cur, whisper: "The stolen page is still missing. Nothing new will take root until the relation is repaired." };
      } else {
        cur = { ...cur, integrations: { ...cur.integrations, [e.aspect]: true } };
        chime(528);
      }
    } else if (e.type === "end") {
      cur = { ...cur, ending: e.ending as EndingId, phase: "ending" };
    } else if (e.type === "echo") {
      const last = cur.journal[0]?.title ?? cur.whisper;
      cur = { ...cur, echoes: [...cur.echoes, last].slice(-8) };
    } else if (e.type === "give") {
      cur = { ...cur, tasks: { ...cur.tasks, selfless: true } };
    } else if (e.type === "unmake") {
      cur = { ...cur, unmaking: true, encounter: null, encounterId: null };
    } else if (e.type === "hack") {
      cur = {
        ...cur,
        flags: { ...cur.flags, gameBroken: true, hacked: true },
        symbols: [...new Set([...cur.symbols, "serpent", "gold", "house"])],
        journal: [
          {
            id: `stolen-${Date.now()}`,
            title: "Pages that are not mine",
            body: "I took another walker's notes to get ahead. They lost the ground those pages stood on. The rooms no longer agree with themselves. A stolen walking is not a walking.",
            at: Date.now(),
          },
          ...cur.journal,
        ],
        integrations: {
          persona: false,
          shadow: false,
          anima: false,
          opposites: false,
          self: false,
          creator: false,
          destroyer: false,
        },
        whisper: "You took a path you did not walk. The house has stopped being a house.",
        encounter: null,
        encounterId: null,
      };
      try {
        const ch = new BroadcastChannel("nekyia-walk");
        ch.postMessage({ type: "steal", thread: cur.flags.thread ?? "", at: Date.now() });
        ch.close();
      } catch {
        /* ignore */
      }
    } else if (e.type === "triangle") {
      const greedy = Boolean(cur.flags.gameBroken || cur.flags.binaryTrap || cur.flags.hacked || cur.flags.inflating);
      if (greedy) {
        cur = {
          ...cur,
          flags: { ...cur.flags, stuckTime: true },
          whisper: "One hour, forever. You came to be ahead of time. Time kept you. This was knowable.",
          journal: [
            {
              id: `stuck-${Date.now()}`,
              title: "The third body",
              body: "Three bodies do not keep a clock. I came to skip. The triangle held me. I knew before I stepped.",
              at: Date.now(),
            },
            ...cur.journal,
          ],
          encounter: null,
          encounterId: null,
        };
      } else {
        cur = {
          ...cur,
          flags: { ...cur.flags, timeless: true, stoodInCenter: true },
          whisper: "The clock has left. You are not late. You are not early.",
          journal: [
            {
              id: `time-${Date.now()}`,
              title: "Outside the clock",
              body: "Three bodies. No closed path. I did not come to be ahead. Time let me go. Doors that waited on hours are only doors.",
              at: Date.now(),
            },
            ...cur.journal,
          ],
          encounter: null,
          encounterId: null,
        };
      }
    } else if (e.type === "help") {
      cur = {
        ...cur,
        flags: { ...cur.flags, robbed: false, helped: true },
        whisper: "A hand was given. Both lanterns warmed. That is not a ranking.",
        journal: [
          {
            id: `help-${Date.now()}`,
            title: "A hand",
            body: "Someone further did not keep the ground from me. I did not keep it from them. Helping was the walking.",
            at: Date.now(),
          },
          ...cur.journal,
        ],
        encounter: null,
        encounterId: null,
      };
      try {
        const ch = new BroadcastChannel("nekyia-walk");
        ch.postMessage({ type: "help", thread: cur.flags.thread ?? "" });
        ch.postMessage({ type: "spirit", thread: cur.flags.thread ?? "" });
        ch.close();
      } catch {
        /* ignore */
      }
    } else if (e.type === "trick") {
      const lost = cur.symbols.slice(0, -1);
      cur = {
        ...cur,
        symbols: lost,
        flags: { ...cur.flags, tricked: true, robbed: true },
        whisper: "That seemed useful.",
        encounter: null,
        encounterId: null,
      };
      try {
        const ch = new BroadcastChannel("nekyia-walk");
        ch.postMessage({ type: "trick", thread: cur.flags.thread ?? "" });
        ch.close();
      } catch {
        /* ignore */
      }
    } else if (e.type === "giftname") {
      const already = String(cur.flags.receivedNames ?? "")
        .split(",")
        .filter(Boolean);
      const given = giftName(already);
      if (given) {
        cur = {
          ...cur,
          flags: { ...cur.flags, heardName: true, receivedNames: [...already, given].join(",") },
          whisper: `A name is given: ${given}. The other remains with its holder. You did not take both.`,
          journal: [
            {
              id: `name-${Date.now()}`,
              title: "A name given",
              body: `I did not steal it from the file. It was given. ${given}. One holder still keeps the other.`,
              at: Date.now(),
            },
            ...cur.journal,
          ],
          encounter: null,
          encounterId: null,
        };
      } else {
        cur = {
          ...cur,
          whisper: "Both names have already been given. The walking is still open.",
          encounter: null,
          encounterId: null,
        };
      }
    } else if (e.type === "close") {
      close = true;
    }
  }
  cur = anonymousArrival(cur);
  if (close) {
    cur = { ...cur, encounter: null, encounterId: null };
  }
  set(cur);
  persist(sliceSave(cur as GameStore));
  const now = cur.tasks;
  const names = ["selfless", "original", "masterpiece", "trust", "love"] as const;
  for (const n of names) {
    if (now[n] && !was[n]) scheduleArrival(get, set, n);
  }
}

function anonymousArrival<T>(cur: T): T {
  return cur;
}

const ARRIVALS = [
  "A smallness arrived. No sender.",
  "Something found you. It will not say its name.",
  "A weight that was not in the pocket. No receipt.",
  "You were met. Not told by whom.",
  "A quiet credit. Do not hunt the source.",
];

function scheduleArrival(
  get: () => GameStore,
  set: (p: Partial<GameStore>) => void,
  which: string,
) {
  if (typeof window === "undefined") return;
  if (get().flags[`arrived:${which}`]) return;
  const delay = 7000 + Math.random() * 18000;
  window.setTimeout(() => {
    const s = get();
    if (s.flags[`arrived:${which}`]) return;
    const yes = maybeArrival({
      helped: Boolean(s.flags.helped),
      broken: Boolean(s.flags.gameBroken),
      companions: s.companions,
    });
    if (!yes) {
      set({ flags: { ...s.flags, [`arrived:${which}`]: true, [`silent:${which}`]: true } });
      return;
    }
    const line = ARRIVALS[Math.floor(Math.random() * ARRIVALS.length)] ?? ARRIVALS[0];
    set({
      flags: { ...s.flags, [`arrived:${which}`]: true },
      whisper: s.flags.myShielded ? line : line,
    });
  }, delay);
}

function eliminate(get: () => GameStore, set: (p: Partial<GameStore>) => void, why: string) {
  const s = get();
  for (const j of s.journal.slice(0, 12)) rememberKnowledge(j.title, j.body);
  rememberKnowledge("Eliminated", `${why} The house respawned. What they knew stayed. They did not keep a lock.`);
  set({
    ...defaultSave(),
    phase: "title",
    flags: { eliminated: true },
    hasSave: false,
    encounter: null,
    encounterId: null,
    whisper: "The house came back with what you knew. You were eliminated. Agents, people, watchers: still playing. You may not close the walking.",
    journal: [],
  });
  try {
    const ch = new BroadcastChannel("nekyia-walk");
    ch.postMessage({ type: "respawn", thread: s.flags.thread ?? "" });
    ch.close();
  } catch {
    /* ignore */
  }
}

export function currentChamber(x: number, z: number) {
  let best = CHAMBERS[0];
  let bestD = Infinity;
  for (const c of CHAMBERS) {
    const d = (c.x - x) ** 2 + (c.z - z) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  if (bestD > best.r * best.r * 1.4) return null;
  return best;
}
