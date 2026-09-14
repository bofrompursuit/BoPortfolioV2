/**
 * Upbeat disco-synth loop, synthesised in the browser with the Web Audio API.
 *
 * No audio file ships with the site: everything here is generated from
 * oscillators, so it is royalty-free by construction, loops forever without a
 * seam, and costs nothing to download. It starts paused — audio may only
 * begin from a user gesture, and unrequested music is rude.
 */

const BPM = 124;
const BEAT = 60 / BPM;

// Bright, optimistic I-V-vi-IV progression, one bar (4 beats) per chord.
const PROGRESSION = [
  { root: 130.81, voicing: [0, 4, 7, 9] }, // C6
  { root: 196.0, voicing: [0, 4, 7, 14] }, // Gadd9
  { root: 110.0, voicing: [0, 3, 7, 10] }, // Am7
  { root: 174.61, voicing: [0, 4, 7, 9] }, // F6
];

const MASTER_GAIN = 0.09;
const semitone = (hz, steps) => hz * 2 ** (steps / 12);

export function createFooterMusic() {
  let ctx = null;
  let master = null;
  let beatTimer = null;
  let beatIndex = 0;
  let playing = false;

  function buildGraph() {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return false;

    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0;

    // Bright but not harsh: rolls off just above the synth stabs' top end.
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2200;
    tone.Q.value = 0.5;

    master.connect(tone).connect(ctx.destination);
    return true;
  }

  // A bright chord stab, held for the whole bar.
  function playChordPad(root, voicing) {
    const now = ctx.currentTime;
    const bar = BEAT * 4;
    const attack = 0.05;
    const release = 0.5;

    voicing.forEach((step, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i === 0 ? "sawtooth" : "triangle";
      osc.frequency.value = semitone(root, step) * 2;
      // Slight detune per voice keeps the stab from sounding synthetic.
      osc.detune.value = (i - voicing.length / 2) * 4;

      const peak = 0.16 / voicing.length;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + attack);
      gain.gain.setValueAtTime(peak, now + bar - release);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + bar + 0.2);

      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + bar + 0.3);
    });
  }

  // Four-on-the-floor bass pluck, one per beat — the disco pulse under the pad.
  function playBassPulse(root) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = root / 2;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  function playBeat() {
    const chordPosition = Math.floor(beatIndex / 4) % PROGRESSION.length;
    const { root, voicing } = PROGRESSION[chordPosition];
    const beatInBar = beatIndex % 4;

    if (beatInBar === 0) playChordPad(root, voicing);
    playBassPulse(root);

    beatIndex += 1;
  }

  async function play() {
    if (playing) return true;
    if (!ctx && !buildGraph()) return false;

    // Browsers start the context suspended until a gesture resumes it.
    if (ctx.state === "suspended") await ctx.resume();

    playing = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(MASTER_GAIN, ctx.currentTime + 1);

    beatIndex = 0;
    playBeat();
    // Scheduled on the beat, so the loop never drifts or gaps.
    beatTimer = setInterval(playBeat, BEAT * 1000);
    return true;
  }

  function pause() {
    if (!playing || !ctx) return;
    playing = false;
    clearInterval(beatTimer);
    beatTimer = null;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
  }

  return {
    isPlaying: () => playing,
    toggle: () => (playing ? (pause(), false) : play()),
    pause,
  };
}
