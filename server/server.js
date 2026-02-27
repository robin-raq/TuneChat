const http = require("http");
const { Server } = require("socket.io");
const config = require("./config");
const app = require("./app");
const { attachSockets } = require("./sockets");

const server = http.createServer(app);
const io = new Server(server);

attachSockets(io);

if (require.main === module) {
  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

module.exports = { server, io, app };
