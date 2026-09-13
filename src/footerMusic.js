/**
 * Ambient footer music, synthesised in the browser with the Web Audio API.
 *
 * No audio file ships with the site: the pad is generated from oscillators, so
 * it is royalty-free by construction, loops forever without a seam, and costs
 * nothing to download. It starts paused — audio may only begin from a user
 * gesture, and unrequested music is rude.
 */

// Soft jazzy pad, looping. Semitone offsets from the root of each chord.
const PROGRESSION = [
  { root: 174.61, voicing: [0, 4, 7, 11] }, // Fmaj7
  { root: 146.83, voicing: [0, 3, 7, 10] }, // Dm7
  { root: 196.0, voicing: [0, 3, 7, 10] }, // Gm7
  { root: 130.81, voicing: [0, 4, 7, 10] }, // C7
];

const CHORD_SECONDS = 7;
const MASTER_GAIN = 0.07; // deliberately low — this sits under the page
const semitone = (hz, steps) => hz * 2 ** (steps / 12);

export function createFooterMusic() {
  let ctx = null;
  let master = null;
  let timer = null;
  let chordIndex = 0;
  let playing = false;

  function buildGraph() {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return false;

    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0;

    // Rolls the top off the oscillators so the pad is warm rather than buzzy.
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 900;
    tone.Q.value = 0.4;

    // Very slow breathing movement.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 0.022;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();

    master.connect(tone).connect(ctx.destination);
    return true;
  }

  function playChord() {
    const { root, voicing } = PROGRESSION[chordIndex % PROGRESSION.length];
    chordIndex += 1;

    const now = ctx.currentTime;
    const attack = 2.2;
    const release = 2.6;

    voicing.forEach((step, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i === 0 ? "sine" : "triangle";
      // Slight detune per voice keeps the chord from sounding synthetic.
      osc.frequency.value = semitone(root, step) * (i === 0 ? 1 : 2);
      osc.detune.value = (i - 1.5) * 5;

      const peak = 0.26 / voicing.length;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + attack);
      gain.gain.setValueAtTime(peak, now + CHORD_SECONDS - release);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_SECONDS + 0.4);

      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + CHORD_SECONDS + 0.6);
    });
  }

  async function play() {
    if (playing) return true;
    if (!ctx && !buildGraph()) return false;

    // Browsers start the context suspended until a gesture resumes it.
    if (ctx.state === "suspended") await ctx.resume();

    playing = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(MASTER_GAIN, ctx.currentTime + 2);

    playChord();
    // Chords overlap slightly so there is never a gap in the loop.
    timer = setInterval(playChord, (CHORD_SECONDS - 0.5) * 1000);
    return true;
  }

  function pause() {
    if (!playing || !ctx) return;
    playing = false;
    clearInterval(timer);
    timer = null;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
  }

  return {
    isPlaying: () => playing,
    toggle: () => (playing ? (pause(), false) : play()),
    pause,
  };
}
