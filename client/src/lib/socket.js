/**
 * Socket layer: connect, join room, emit helpers.
 */

const getSocketUrl = () => import.meta.env.VITE_WS_URL || window.location.origin;

/**
 * @param {{ username: string, room: string }} params
 * @returns {Promise<import("socket.io-client").Socket>}
 */
export async function connect(params) {
  const { io } = await import("socket.io-client");
  const socket = io(getSocketUrl(), { path: "/socket.io", transports: ["websocket", "polling"] });
  socket.emit("joinRoom", params);
  return socket;
}

export function sendMessage(socket, text) {
  socket.emit("chatMessage", text);
}

export function sendNote(socket, note) {
  socket.emit("note", { note });
}

export function sendChord(socket, chordId) {
  socket.emit("chordMessage", { chord: chordId });
}
