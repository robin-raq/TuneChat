import * as audio from "./services/audio.js";
import * as socketLib from "./lib/socket.js";

const ROOMS = ["House", "Techno", "Reggae", "DnB", "Electronic", "IDM"];
const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS = ["C#", "D#", "F#", "G#", "A#"];

let state = {
  view: "join",
  username: "",
  room: "",
  users: [],
  messages: [],
  audioReady: false,
  socket: null,
};

let appRoot = null;

function setState(updates) {
  Object.assign(state, updates);
  render();
}

function render() {
  if (!appRoot) return;
  if (state.view === "join") {
    appRoot.replaceChildren(renderJoin());
    return;
  }
  appRoot.replaceChildren(renderChat());
}

function renderJoin() {
  const wrap = document.createElement("div");
  wrap.className = "join-container";
  wrap.innerHTML = `
    <header class="join-header">
      <h1><i class="fas fa-music"></i> TuneChat</h1>
    </header>
    <main class="join-main">
      <form class="join-form">
        <div class="form-control">
          <label for="username">Username</label>
          <input type="text" id="username" name="username" placeholder="Enter username..." required />
        </div>
        <div class="form-control">
          <label for="room">Room</label>
          <select id="room" name="room">
            ${ROOMS.map((r) => `<option value="${r}">${r}</option>`).join("")}
          </select>
        </div>
        <button type="submit" class="btn">Join Chat</button>
      </form>
    </main>
  `;
  wrap.querySelector(".join-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = wrap.querySelector("#username").value.trim();
    const room = wrap.querySelector("#room").value;
    if (!username) return;
    const sock = await socketLib.connect({ username, room });
    state.socket = sock;
    attachSocketListeners(sock);
    setState({ view: "chat", username, room });
  });
  return wrap;
}

function attachSocketListeners(socket) {
  socket.on("roomUsers", ({ room, users }) => setState({ room, users }));
  socket.on("message", (msg) => {
    state.messages.push(msg);
    setState({ messages: [...state.messages] });
  });
  socket.on("note", (payload) => {
    if (audio.isReady()) audio.playNote(payload.note);
  });
  socket.on("chordMessage", (payload) => {
    if (audio.isReady()) audio.playChord(payload.chord);
  });
}

function renderChat() {
  const wrap = document.createElement("div");
  wrap.className = "chat-container";
  wrap.innerHTML = `
    <header class="chat-header">
      <h1><i class="fas fa-music"></i> TuneChat</h1>
      <button type="button" class="btn" id="leave-room">Leave Room</button>
    </header>
    <main class="chat-main">
      <div class="chat-sidebar">
        <h3><i class="fas fa-comments"></i> Room</h3>
        <h2 id="room-name">${escapeHtml(state.room)}</h2>
        <h3><i class="fas fa-users"></i> Users</h3>
        <ul id="users">${state.users.map((u) => `<li>${escapeHtml(u.username)}</li>`).join("")}</ul>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${state.messages.map((m) => `
          <div class="message">
            <p class="meta">${escapeHtml(m.username)}<span> ${escapeHtml(m.time)}</span></p>
            <p class="text">${escapeHtml(m.text)}</p>
          </div>
        `).join("")}
      </div>
    </main>
    <div class="chat-form-container">
      <form id="chat-form">
        <input id="msg" type="text" placeholder="Enter message" autocomplete="off" />
        <button type="submit" class="btn"><i class="fas fa-paper-plane"></i> Send</button>
      </form>
      <div class="chord-btns">
        <button type="button" class="chord-btn" data-chord="sad🎶">Sad Chord</button>
        <button type="button" class="chord-btn" data-chord="happy🎶">Happy Chord</button>
        <button type="button" class="chord-btn" data-chord="meh🎶">Meh Chord</button>
      </div>
      <div class="keyboard-container" id="keyboard-container"></div>
    </div>
  `;

  const messagesEl = wrap.querySelector("#chat-messages");
  if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;

  const leaveBtn = wrap.querySelector("#leave-room");
  if (leaveBtn) {
    leaveBtn.addEventListener("click", () => {
      if (state.socket) state.socket.disconnect();
      setState({ view: "join", socket: null, users: [], messages: [] });
    });
  }

  wrap.querySelector("#chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = wrap.querySelector("#msg");
    const text = input.value.trim();
    if (text && state.socket) {
      socketLib.sendMessage(state.socket, text);
      input.value = "";
    }
  });

  wrap.querySelectorAll(".chord-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chord = btn.dataset.chord;
      if (!chord || !state.socket) return;
      if (audio.isReady()) audio.playChord(chord);
      socketLib.sendChord(state.socket, chord);
      socketLib.sendMessage(state.socket, `played a ${chord}`);
    });
  });

  const keyboardContainer = wrap.querySelector("#keyboard-container");
  if (keyboardContainer) keyboardContainer.replaceChildren(renderKeyboard());

  if (!state.audioReady) {
    const overlay = document.createElement("div");
    overlay.className = "sound-overlay";
    overlay.setAttribute("role", "button");
    overlay.setAttribute("tabindex", "0");
    overlay.innerHTML = `<span><i class="fas fa-volume-up"></i> Click to enable sound</span>`;
    overlay.addEventListener("click", async () => {
      await audio.init();
      setState({ audioReady: true });
    });
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        audio.init().then(() => setState({ audioReady: true }));
      }
    });
    wrap.appendChild(overlay);
  }

  return wrap;
}

const WHITE_KEY_WIDTH = 26;
const BLACK_KEY_WIDTH = 16;
const BLACK_KEY_OFFSET = 8; // overlap into adjacent white keys

/** Per octave: white key indices (0–6) that have a black key to the right (C,D,F,G,A). */
const BLACK_AFTER_WHITE_INDEX = [0, 1, 3, 4, 5];

function renderKeyboard() {
  const wrap = document.createElement("div");
  wrap.className = "piano-keyboard";

  // White keys only (C3–B3, C4–B4, C5–B5) – one row
  const whiteNotes = [];
  for (let oct = 3; oct <= 5; oct++) {
    WHITE_KEYS.forEach((name) => whiteNotes.push(name + oct));
  }

  const row = document.createElement("div");
  row.className = "piano-keys";

  const whiteRow = document.createElement("div");
  whiteRow.className = "piano-keys-white";
  whiteNotes.forEach((name) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "piano-key piano-key-white";
    el.textContent = name.replace(/#/g, "♯");
    el.dataset.note = name;
    el.title = name;
    el.addEventListener("click", () => playKey(name));
    whiteRow.appendChild(el);
  });
  row.appendChild(whiteRow);

  // Black keys: absolutely positioned between the correct white keys
  const blackNotes = [];
  for (let oct = 3; oct <= 4; oct++) {
    BLACK_KEYS.forEach((name) => blackNotes.push(name + oct));
  }

  const blackRow = document.createElement("div");
  blackRow.className = "piano-keys-black";
  blackNotes.forEach((name, i) => {
    const oct = Math.floor(i / 5);
    const idxInOctave = i % 5;
    const afterWhite = oct * 7 + BLACK_AFTER_WHITE_INDEX[idxInOctave];
    const leftPx = (afterWhite + 1) * WHITE_KEY_WIDTH - BLACK_KEY_OFFSET;

    const el = document.createElement("button");
    el.type = "button";
    el.className = "piano-key piano-key-black";
    el.dataset.note = name;
    el.title = name;
    el.style.left = `${leftPx}px`;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      playKey(name);
    });
    blackRow.appendChild(el);
  });
  row.appendChild(blackRow);

  wrap.appendChild(row);
  return wrap;
}

function playKey(note) {
  if (!state.socket) return;
  if (audio.isReady()) audio.playNote(note);
  socketLib.sendNote(state.socket, note);
  socketLib.sendMessage(state.socket, `played ${note}`);
}

function noteToSort(note) {
  const n = note.replace(/#/g, "");
  const oct = parseInt(n.slice(-1), 10);
  const name = n.slice(0, -1);
  const idx = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(name);
  return oct * 12 + idx;
}

function escapeHtml(s) {
  if (s == null) return "";
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

export function mountApp(rootEl) {
  if (!rootEl) return;
  appRoot = rootEl;
  const params = new URLSearchParams(window.location.search);
  const username = params.get("username");
  const room = params.get("room");
  if (username && room) {
    state.view = "chat";
    state.username = username;
    state.room = room;
    socketLib.connect({ username, room }).then((sock) => {
      state.socket = sock;
      attachSocketListeners(sock);
      render();
    });
  } else {
    state.view = "join";
    render();
  }
}
