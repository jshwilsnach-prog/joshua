let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let droneGain: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let oscA: OscillatorNode | null = null;
let oscB: OscillatorNode | null = null;
let unlocked = false;

export function unlockAudio() {
  if (unlocked && ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC({ latencyHint: "interactive" });
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);

  const music = ctx.createGain();
  music.gain.value = 0.9;
  music.connect(master);

  filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 220;
  filter.Q.value = 0.7;
  droneGain = ctx.createGain();
  droneGain.gain.value = 0.05;
  filter.connect(droneGain);
  droneGain.connect(music);

  oscA = ctx.createOscillator();
  oscA.type = "sine";
  oscA.frequency.value = 55;
  oscB = ctx.createOscillator();
  oscB.type = "sine";
  oscB.frequency.value = 82.4;
  oscA.connect(filter);
  oscB.connect(filter);
  oscA.start();
  oscB.start();
  unlocked = true;
  if (ctx.state === "suspended") void ctx.resume();
}

export function setDrone(freq: number, brightness: number) {
  if (!ctx || !oscA || !oscB || !filter || !droneGain) return;
  const t = ctx.currentTime;
  oscA.frequency.setTargetAtTime(freq, t, 0.8);
  oscB.frequency.setTargetAtTime(freq * 1.498, t, 0.8);
  filter.frequency.setTargetAtTime(160 + brightness * 420, t, 0.6);
  droneGain.gain.setTargetAtTime(0.035 + brightness * 0.04, t, 0.4);
}

export function chime(freq = 528) {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 1.7);
}

export function footstep() {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  const n = ctx.createBufferSource();
  const len = Math.floor(ctx.sampleRate * 0.05);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  n.buffer = buf;
  n.playbackRate.value = 0.7 + Math.random() * 0.3;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 180 + Math.random() * 80;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.08, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  n.connect(f);
  f.connect(g);
  g.connect(master);
  n.start(t);
}

export function resumeAudio() {
  if (ctx?.state === "suspended") void ctx.resume();
}
