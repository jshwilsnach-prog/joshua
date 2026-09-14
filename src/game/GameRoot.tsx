import { useEffect, useRef, useState } from "react";
import { MASKS } from "./maze";
import { bindInput, input, radialDeadzone } from "./input";
import { NekyiaEngine } from "./engine";
import { useGame } from "./store";
import { ENDING_TEXT, SYMBOL_NAMES } from "./content";
import { unlockAudio, resumeAudio } from "./audio";
import { defaultSave } from "./save";
import { shareUrl } from "./door";
import { recordVisit } from "../lib/tally";
import { openZodl } from "./zodl";
import type { MaskId } from "./types";

export function GameRoot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NekyiaEngine | null>(null);
  const phase = useGame((s) => s.phase);
  const unmaking = useGame((s) => s.unmaking);
  const finishUnmake = useGame((s) => s.finishUnmake);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new NekyiaEngine(canvas);
    engineRef.current = engine;
    const unbind = bindInput(canvas);
    let dead = false;
    void engine.init().then(() => {
      if (dead) return;
      engine.start();
    });
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    const onVis = () => {
      if (!document.hidden) resumeAudio();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      dead = true;
      unbind();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (!unmaking) return;
    const t = window.setTimeout(() => finishUnmake(), 7000);
    return () => window.clearTimeout(t);
  }, [unmaking, finishUnmake]);

  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10);
    const key = `aught:${day}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      return;
    }
    void recordVisit().then((r) => {
      if (!r.ok) return;
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-bg text-fg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        onClick={() => {
          const s = useGame.getState();
          if (s.phase === "play" && !s.encounter && !s.paused && !s.journalOpen && !s.ending) {
            canvasRef.current?.requestPointerLock();
            input.locked = true;
            unlockAudio();
          }
        }}
      />
      {phase === "title" && <TitleOverlay />}
      {phase === "mask" && <MaskOverlay />}
      {phase === "play" && <PlayOverlay engine={engineRef} />}
      {phase === "ending" && <EndingOverlay />}
      {unmaking && (
        <div className="absolute inset-0 z-40 bg-bg/95 flex items-center justify-center px-8 text-center">
          <p className="font-display text-xl text-muted max-w-md leading-relaxed">
            The rooms go. You are not asked to rebuild them. Wait to be found.
          </p>
        </div>
      )}
    </div>
  );
}

function TitleOverlay() {
  const hasSave = useGame((s) => s.hasSave);
  const continueSave = useGame((s) => s.continueSave);
  const [watching, setWatching] = useState(false);
  if (watching) {
    return (
      <div className="absolute inset-0 z-20 bg-bg flex flex-col items-center justify-center px-4">
        <video
          className="w-full max-w-5xl aspect-video rounded-xl border border-border bg-black object-cover"
          src="/watch.mp4"
          autoPlay
          controls
          playsInline
        />
        <p className="text-muted text-center max-w-lg mt-5 leading-relaxed">
          Flat first. Round next. Then any combo. First, last, and all principles. Watching is also walking.
        </p>
        <button className="min-h-11 mt-4 px-8 text-accent font-display" onClick={() => setWatching(false)}>
          Descend, or keep watching
        </button>
      </div>
    );
  }
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-y-auto pt-24 pb-16 px-6"
      style={{
        backgroundImage: "linear-gradient(to top, var(--color-bg) 12%, transparent 55%), url(/textures/sky.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-lg text-center animate-[nekyia-rise_1.2s_ease]">
        <p className="text-accent tracking-[0.45em] uppercase text-xs mb-3 font-mono">You start</p>
        <h1 className="font-display text-5xl md:text-7xl font-medium tracking-wide mb-4">Nekyia</h1>
        <p className="text-muted text-base md:text-lg leading-relaxed mb-3">
          First person. A body, a shadow. Nobody knows which world. Interplanetary, or a park. You just start.
        </p>
        <p className="text-muted text-base leading-relaxed mb-8">
          This is a walking, not a lesson. You look through your own eyes. Lamps, rooms, other lanterns if they came. No score. No one is ahead. Close whenever. One who loses themself may never be lost.
        </p>
        <p className="text-subtle text-sm leading-relaxed mb-8">
          A wallet may sit with you when you enter. Zodl. We do not hold keys.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <button
            className="min-h-11 px-8 rounded-lg bg-accent text-accent-fg font-display text-lg"
            onClick={() => {
              unlockAudio();
              useGame.getState().startNew("bare", "", "");
            }}
          >
            Descend
          </button>
          <button
            className="min-h-11 px-8 text-muted hover:text-fg font-display"
            onClick={() => {
              unlockAudio();
              setWatching(true);
            }}
          >
            Watch
          </button>
          {hasSave && (
            <button
              className="min-h-11 px-8 text-muted hover:text-fg"
              onClick={() => {
                unlockAudio();
                continueSave();
              }}
            >
              Continue a walking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MaskOverlay() {
  const [name, setName] = useState("");
  const [thread, setThread] = useState("");
  const startNew = useGame((s) => s.startNew);
  return (
    <div className="absolute inset-0 z-20 bg-bg/90 flex items-center justify-center px-5 overflow-y-auto">
      <div className="max-w-2xl w-full py-12 animate-[nekyia-rise_0.8s_ease]">
        <p className="text-muted tracking-[0.2em] uppercase text-sm mb-2">The face you use for others</p>
        <h2 className="font-display text-4xl mb-3">Hang one, or exist as you show up.</h2>
        <p className="text-muted mb-8 leading-relaxed">
          This is not who you are. There are no rules. Only law. You may wear a face, or none.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {MASKS.map((m) => (
            <button
              key={m.id}
              className="text-left rounded-xl border border-border bg-surface p-5 min-h-24 hover:border-accent transition-colors"
              onClick={() => startNew(m.id as MaskId, name, thread)}
            >
              <div className="font-display text-2xl mb-1">{m.title}</div>
              <div className="text-muted">{m.line}</div>
            </button>
          ))}
        </div>
        <label className="block text-muted text-sm mb-2">A name you do not wear for others (optional)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 rounded-md bg-surface-2 border border-border px-3 py-3 text-fg outline-none focus:border-accent"
        />
        <label className="block text-muted text-sm mb-2">A thread-word, if another living walker shares it</label>
        <input
          value={thread}
          onChange={(e) => setThread(e.target.value)}
          className="w-full rounded-md bg-surface-2 border border-border px-3 py-3 text-fg outline-none focus:border-accent"
        />
      </div>
    </div>
  );
}

function PlayOverlay({ engine }: { engine: React.RefObject<NekyiaEngine | null> }) {
  const nearby = useGame((s) => s.nearby);
  const whisper = useGame((s) => s.whisper);
  const encounter = useGame((s) => s.encounter);
  const journalOpen = useGame((s) => s.journalOpen);
  const paused = useGame((s) => s.paused);
  const integrations = useGame((s) => s.integrations);
  const interact = useGame((s) => s.interact);
  const ending = useGame((s) => s.ending);
  const companions = useGame((s) => s.companions);
  const philosophy = useGame((s) => String(s.flags.philosophy ?? ""));
  const zodlSeated = useGame((s) => Boolean(String(s.flags.myShielded ?? "").trim()));

  useEffect(() => {
    const ch = new BroadcastChannel("nekyia-walk");
    const id = Math.random().toString(36).slice(2, 8);
    const others = new Map<
      string,
      { x: number; z: number; yaw: number; at: number; belief?: string; moving?: number; shielded?: string; idea?: string; should?: string; wound?: string; form?: string }
    >();
    const tick = window.setInterval(() => {
      const s = useGame.getState();
      if (s.phase !== "play") return;
      ch.postMessage({
        id,
        x: s.x,
        z: s.z,
        yaw: s.yaw,
        thread: s.thread,
        belief: s.timeBelief,
        moving: 0.45,
        shielded: String(s.flags.myShielded ?? ""),
        idea: String(s.flags.characterIdea ?? ""),
        should: String(s.flags.shouldBe ?? ""),
        wound: String(s.flags.wound ?? 0),
        form: String(s.flags.form ?? ""),
      });
      const live = [...others.values()].filter((v) => Date.now() - v.at < 4000);
      const beliefs: string[] = [s.timeBelief, "flow", ...live.map((v) => v.belief || "flow")];
      const same = beliefs.every((b) => b === beliefs[0]);
      const consensus = (same ? beliefs[0] : "mixed") as typeof s.consensusTime;
      const motion = live.length ? live.reduce((a, v) => a + (v.moving ?? 0.3), 0) / live.length : 0.35;
      if (consensus !== s.consensusTime) {
        s.setWhisper(
          consensus === "linear"
            ? "The house has agreed on a line."
            : consensus === "flow"
              ? "The house has agreed on a river. Hours move when we do."
              : consensus === "construct"
                ? "The house has dropped the argument. Time is only what we are doing."
                : "No agreement. The hours stutter. Time is what we cannot yet share.",
        );
      }
      s.setConsensus(consensus, motion);
    }, 240);
    ch.onmessage = (ev) => {
      const d = ev.data as {
        id?: string;
        x?: number;
        z?: number;
        yaw?: number;
        thread?: string;
        type?: string;
        belief?: string;
        moving?: number;
        hash?: string;
        shielded?: string;
        idea?: string;
        should?: string;
        wound?: string;
        form?: string;
      };
      const s = useGame.getState();
      if (d.type === "reduce") {
        useGame.setState({
          whisper: "Someone tried to hack a rail. The collective reduced them — in time and out of it. The house is still walking. All value as rank is zero.",
        });
        return;
      }
      if (d.type === "tip") {
        if (s.thread && d.thread && d.thread !== s.thread) return;
        useGame.setState({ whisper: "A tip was placed. Currency is made up. The whole did not move — all players, the game, Kairos, Joshua." });
        return;
      }
      if (d.type === "add") {
        if (s.thread && d.thread && d.thread !== s.thread) return;
        useGame.setState({ whisper: "Someone left a stone. The house is still open." });
        return;
      }
      if (d.type === "respawn") {
        useGame.setState({
          flags: { ...s.flags, gameBroken: false, hacked: false },
          whisper: "The house came back. Someone tried to close it. They are gone. What they knew stayed. Watchers still watch.",
        });
        return;
      }
      if (d.type === "spirit") {
        if (s.thread && d.thread && d.thread !== s.thread) return;
        useGame.setState({
          flags: { ...s.flags, robbed: false, gameBroken: false },
          whisper: "A breath that is not yours alone. Love is holding the rooms. You may call it Holy Spirit.",
        });
        return;
      }
      if (d.type === "key") {
        if (s.thread && d.thread && d.thread !== s.thread) return;
        const mine = String(s.flags.keyHash ?? "");
        if (mine && d.hash && mine === String(d.hash)) {
          useGame.setState({
            flags: { ...s.flags, sharedKey: true },
            whisper: "Someone else holds this. Context, not a ranking. The house knows without saying.",
          });
        }
        return;
      }
      if (d.type === "help") {
        if (s.thread && d.thread && d.thread !== s.thread) return;
        useGame.setState({
          flags: { ...s.flags, robbed: false, helped: true },
          whisper: "Someone asked. You helped. Both lanterns warmed.",
        });
        return;
      }
      if (d.type === "trick") {
        if (s.thread && d.thread && d.thread !== s.thread) return;
        useGame.setState({
          symbols: s.symbols.slice(0, -1),
          flags: { ...s.flags, tricked: true, robbed: true },
          whisper: "That seemed useful.",
        });
        return;
      }
      if (d.type === "steal") {
        if (s.thread && d.thread && d.thread !== s.thread) return;
        const lost = s.symbols.slice(0, -1);
        const lostInt = { ...s.integrations };
        const last = (Object.keys(lostInt) as (keyof typeof lostInt)[]).reverse().find((k) => lostInt[k]);
        if (last) lostInt[last] = false;
        useGame.setState({
          symbols: lost,
          journal: s.journal.slice(1),
          integrations: lostInt,
          flags: { ...s.flags, robbed: true },
          whisper: "A page was taken from you. You did not lose the walking. Only the note. Until the relation is repaired, nothing new will take root.",
        });
        return;
      }
      if (d.id === id) return;
      if (s.thread && d.thread && d.thread !== s.thread) return;
      if (d.x == null || d.z == null) return;
      others.set(d.id!, {
        x: d.x,
        z: d.z,
        yaw: d.yaw ?? 0,
        at: Date.now(),
        belief: d.belief,
        moving: d.moving,
        shielded: d.shielded,
        idea: d.idea,
        should: d.should,
        wound: d.wound,
        form: d.form,
      });
      const list = [...others.entries()].filter(([, v]) => Date.now() - v.at < 4000);
      s.setCompanions(list.length);
      engine.current?.setCompanions(list.map(([oid, v]) => ({ id: oid, ...v })));
    };
    return () => {
      window.clearInterval(tick);
      ch.close();
    };
  }, [engine]);

  return (
    <>
      <div className="absolute top-5 left-5 z-10 pointer-events-none">
        <MandalaHUD integrations={integrations} />
      </div>
      {whisper && !encounter && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 max-w-md text-center pointer-events-none px-4">
          <p className="text-muted italic text-base leading-relaxed">{whisper}</p>
        </div>
      )}
      {philosophy && !encounter && !whisper && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10 max-w-sm text-center pointer-events-none px-4">
          <p className="text-subtle text-sm leading-relaxed">{philosophy}</p>
        </div>
      )}
      {nearby && !encounter && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
          <p className="text-fg font-display text-xl">{nearby.label}</p>
          <p className="text-subtle text-sm mt-1">E · speak</p>
        </div>
      )}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-subtle text-sm pointer-events-none hidden md:block">
        WASD · look · E speak · J notes · Esc
        {companions > 0 ? " · another lantern" : ""}
      </div>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <IconBtn
          label={zodlSeated ? "Zodl · seated" : "Zodl"}
          onClick={() => {
            document.exitPointerLock?.();
            useGame.getState().interact("zodl");
          }}
        />
        <IconBtn label="Notes" onClick={() => useGame.getState().toggleJournal(true)} />
        <IconBtn label="Pause" onClick={() => useGame.getState().togglePause(true)} />
      </div>
      <MobileControls engine={engine} onInteract={() => nearby && interact(nearby.id)} />
      {encounter && <DialoguePanel />}
      {journalOpen && <JournalPanel />}
      {paused && <PausePanel />}
      {ending && <EndingOverlay />}
    </>
  );
}

function MandalaHUD({ integrations }: { integrations: Record<string, boolean> }) {
  const keys = ["persona", "shadow", "anima", "opposites", "self", "creator", "destroyer"];
  const n = keys.filter((k) => integrations[k]).length;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="opacity-80">
      <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" className="text-border" strokeWidth="1" />
      <circle cx="28" cy="28" r="8" fill="none" stroke="currentColor" className="text-accent" strokeWidth={n >= 5 ? 1.6 : 0.6} />
      {keys.map((k, i) => {
        const a = (i / keys.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <circle
            key={k}
            cx={28 + Math.cos(a) * 16}
            cy={28 + Math.sin(a) * 16}
            r="2.4"
            fill={integrations[k] ? "var(--color-accent)" : "var(--color-border)"}
          />
        );
      })}
    </svg>
  );
}

function DialoguePanel() {
  const encounter = useGame((s) => s.encounter);
  const choose = useGame((s) => s.choose);
  const [line, setLine] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  if (!encounter) return null;
  const inputOpt = encounter.options.find((o) => o.input);
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-30 px-4 pb-4 pt-24"
      style={{ background: "linear-gradient(to top, var(--color-bg) 55%, transparent)" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="max-w-xl mx-auto rounded-xl border border-border bg-surface/95 p-5 shadow-panel">
        <p className="text-subtle text-sm tracking-wide mb-2">{encounter.speaker}</p>
        <p className="font-display text-xl leading-relaxed mb-5">{encounter.text}</p>
        {inputOpt?.input === "line" && (
          <textarea
            value={line}
            onChange={(e) => setLine(e.target.value)}
            className="w-full mb-3 rounded-md bg-surface-2 border border-border px-3 py-2 text-fg min-h-20"
            placeholder={inputOpt.id === "send-zec" ? "u1… or zs1…  then amount in ZEC" : "A thought that is not from these rooms"}
          />
        )}
        {inputOpt?.input === "work" && (
          <div className="mb-3 flex flex-col gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-md bg-surface-2 border border-border px-3 py-2 text-fg"
              placeholder="A title"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="rounded-md bg-surface-2 border border-border px-3 py-2 text-fg min-h-24"
              placeholder="The work itself"
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          {encounter.options.map((o) => (
            <button
              key={o.id}
              className="text-left min-h-11 px-3 rounded-md hover:bg-surface-2 text-accent"
              onClick={() => {
                document.exitPointerLock?.();
                if (o.href) openZodl(o.href);
                if (o.input === "line") choose(o.id, { text: line });
                else if (o.input === "work") choose(o.id, { title, body });
                else choose(o.id);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function JournalPanel() {
  const journal = useGame((s) => s.journal);
  const symbols = useGame((s) => s.symbols);
  return (
    <div className="absolute inset-0 z-30 bg-bg/80 flex items-center justify-center px-4" onClick={() => useGame.getState().toggleJournal(false)}>
      <div
        className="max-w-lg w-full max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-3xl mb-4">What became conscious</h2>
        {symbols.length > 0 && (
          <p className="text-muted mb-4">{symbols.map((id) => SYMBOL_NAMES[id] ?? id).join(" · ")}</p>
        )}
        {journal.length === 0 && <p className="text-muted">Nothing has been written yet. Meeting is not the same as noting.</p>}
        <ul className="flex flex-col gap-4">
          {journal.map((j) => (
            <li key={j.id}>
              <div className="font-display text-xl">{j.title}</div>
              <p className="text-muted leading-relaxed">{j.body}</p>
            </li>
          ))}
        </ul>
        <button className="mt-6 text-subtle" onClick={() => useGame.getState().toggleJournal(false)}>
          Close
        </button>
      </div>
    </div>
  );
}

function PausePanel() {
  const stuck = useGame((s) => Boolean(s.flags.stuckTime));
  const timeless = useGame((s) => Boolean(s.flags.timeless));
  const belief = useGame((s) => s.timeBelief);
  const kairosDoor = !stuck && (timeless || belief !== "linear") && !useGame.getState().flags.reduced;
  return (
    <div className="absolute inset-0 z-30 bg-bg/80 flex items-center justify-center">
      <div className="text-center px-6">
        <h2 className="font-display text-4xl mb-4">Still</h2>
        <p className="text-muted mb-8 max-w-sm">The labyrinth does not pause. You do. That is allowed. X is not a feed here. It is only a door, in a now.</p>
        <button
          className="min-h-11 px-6 rounded-lg bg-accent text-accent-fg"
          onClick={() => useGame.getState().togglePause(false)}
        >
          Walk
        </button>
        <div className="mt-4 flex flex-col gap-3 items-center">
          {kairosDoor ? (
            <button
              className="text-muted hover:text-fg"
              onClick={() => {
                const u = encodeURIComponent(shareUrl());
                const t = encodeURIComponent("A walking. Not a feed. Nekyia, in a now. The legend that linked.");
                window.open(`https://x.com/intent/tweet?url=${u}&text=${t}&via=SucreTheFool`, "_blank", "noopener,noreferrer");
              }}
            >
              Link the walking — in Kairos time
            </button>
          ) : (
            <p className="text-subtle max-w-xs text-sm">Chronos has the hours. The door to the internet opens in a now, not in a line.</p>
          )}
          <button
            className="text-subtle"
            onClick={() => {
              useGame.setState({ ...defaultSave(), hasSave: true, phase: "title" } as never);
            }}
          >
            Return to the threshold
          </button>
        </div>
      </div>
    </div>
  );
}

function EndingOverlay() {
  const ending = useGame((s) => s.ending);
  const dismiss = useGame((s) => s.dismissEnding);
  if (!ending) return null;
  const t = ENDING_TEXT[ending];
  return (
    <div className="absolute inset-0 z-40 bg-bg/92 flex items-center justify-center px-6">
      <div className="max-w-lg text-center animate-[nekyia-rise_1s_ease]">
        <h2 className="font-display text-4xl mb-4">{t?.title}</h2>
        <p className="text-muted text-lg leading-relaxed mb-8">{t?.body}</p>
        <button className="min-h-11 px-6 rounded-lg bg-accent text-accent-fg" onClick={dismiss}>
          Keep walking
        </button>
      </div>
    </div>
  );
}

function IconBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="min-h-11 min-w-11 px-3 rounded-md bg-surface/80 border border-border text-sm text-muted"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function MobileControls({
  engine,
  onInteract,
}: {
  engine: React.RefObject<NekyiaEngine | null>;
  onInteract: () => void;
}) {
  const stick = useRef<{ ox: number; oy: number; id: number | null }>({ ox: 0, oy: 0, id: null });
  const look = useRef<{ lx: number; ly: number; id: number | null }>({ lx: 0, ly: 0, id: null });
  return (
    <div className="md:hidden absolute inset-0 z-20 pointer-events-none">
      <div
        className="absolute left-4 bottom-6 h-36 w-36 rounded-full border border-border/60 pointer-events-auto"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          stick.current = { ox: e.clientX, oy: e.clientY, id: e.pointerId };
        }}
        onPointerMove={(e) => {
          if (stick.current.id !== e.pointerId) return;
          const dx = (e.clientX - stick.current.ox) / 56;
          const dy = (e.clientY - stick.current.oy) / 56;
          const v = radialDeadzone(Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, dy)));
          input.moveX = v.x;
          input.moveY = v.y;
        }}
        onPointerUp={() => {
          stick.current.id = null;
          input.moveX = 0;
          input.moveY = 0;
        }}
      />
      <div
        className="absolute right-4 bottom-28 h-40 w-40 pointer-events-auto"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          look.current = { lx: e.clientX, ly: e.clientY, id: e.pointerId };
        }}
        onPointerMove={(e) => {
          if (look.current.id !== e.pointerId) return;
          const dx = e.clientX - look.current.lx;
          const dy = e.clientY - look.current.ly;
          look.current.lx = e.clientX;
          look.current.ly = e.clientY;
          engine.current?.lookDelta(dx, dy);
        }}
        onPointerUp={() => {
          look.current.id = null;
        }}
      />
      <button
        className="absolute right-6 bottom-8 min-h-14 min-w-14 rounded-full bg-surface border border-border pointer-events-auto text-sm"
        onClick={onInteract}
      >
        Speak
      </button>
    </div>
  );
}
