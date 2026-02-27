/**
 * Audio service: Tone.js init and playback.
 * Lazy-loaded so the first run happens in a user gesture (no AudioContext warning).
 */

let polySynth = null;
let noteSynth = null;
let toneModule = null;
let lastScheduledTime = 0;
let initialized = false;

const CHORDS = {
  "sad🎶": ["E4", "G4", "B4"],
  "happy🎶": ["C4", "E4", "G4", "B4"],
  "meh🎶": ["C3", "D3", "F3"],
};

const NOTE_DURATION = 1;

/**
 * Initialize Tone (call from user gesture). Returns true if ready.
 * @returns {Promise<boolean>}
 */
export async function init() {
  if (initialized) return true;
  const Tone = await import("tone");
  toneModule = Tone;
  await Tone.start();
  lastScheduledTime = Tone.now();
  polySynth = new Tone.PolySynth({ voice: Tone.Synth, maxPolyphony: 4 }).toDestination();
  noteSynth = new Tone.Synth().toDestination();
  initialized = true;
  return true;
}

/**
 * @returns {boolean}
 */
export function isReady() {
  return initialized && polySynth && noteSynth;
}

/**
 * @param {string} note - e.g. "C4"
 */
export function playNote(note) {
  if (!noteSynth || !toneModule) return;
  const now = toneModule.now();
  const when = Math.max(now, lastScheduledTime + 0.001);
  lastScheduledTime = when + NOTE_DURATION;
  noteSynth.triggerAttackRelease(note, NOTE_DURATION, when);
}

/**
 * @param {string} chordId - e.g. "sad🎶", "happy🎶", "meh🎶"
 */
export function playChord(chordId) {
  if (!polySynth || !toneModule) return;
  const notes = CHORDS[chordId] || CHORDS["meh🎶"];
  const now = toneModule.now();
  const when = Math.max(now, lastScheduledTime + 0.001);
  lastScheduledTime = when + NOTE_DURATION;
  polySynth.triggerAttackRelease(notes, NOTE_DURATION, when);
}
