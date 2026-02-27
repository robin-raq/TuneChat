const formatMessage = require("../utils/messages").formatMessage;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("../utils/users");

function attachSockets(io) {
  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);

      socket.emit("message", formatMessage("ChatBot", "Welcome to TuneChat"));
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage("ChatBot", `${user.username} has joined the chat`)
        );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    });

    socket.on("chatMessage", (msg) => {
      const user = getCurrentUser(socket.id);
      if (user) {
        io.to(user.room).emit("message", formatMessage(user.username, msg));
      }
    });

    socket.on("note", (payload) => {
      const user = getCurrentUser(socket.id);
      if (user) {
        io.to(user.room).emit("note", { ...payload, username: user.username });
      }
    });

    socket.on("chordMessage", (payload) => {
      const user = getCurrentUser(socket.id);
      if (user) {
        io.to(user.room).emit("chordMessage", {
          ...payload,
          username: user.username,
        });
      }
    });

    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage("ChatBot", `${user.username} has left the chat`)
        );
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
}

module.exports = { attachSockets };
