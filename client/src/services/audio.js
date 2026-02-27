/**
 * Audio service: Tone.js init and playback.
 * Lazy-loaded so the first run happens in a user gesture (no AudioContext warning).
 */

let polySynth = null;
let noteSynth = null;
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
  const Tone = (await import("tone")).default;
  await Tone.start();
  polySynth = new Tone.PolySynth(4, Tone.Synth).toDestination();
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
  if (!noteSynth) return;
  noteSynth.triggerAttackRelease(note, NOTE_DURATION);
}

/**
 * @param {string} chordId - e.g. "sad🎶", "happy🎶", "meh🎶"
 */
export function playChord(chordId) {
  if (!polySynth) return;
  const notes = CHORDS[chordId] || CHORDS["meh🎶"];
  polySynth.triggerAttackRelease(notes, NOTE_DURATION);
}
