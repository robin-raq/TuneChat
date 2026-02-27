const path = require("path");
const express = require("express");

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));

app.get("*", (req, res, next) => {
  if (req.path === "/health" || req.path.startsWith("/socket")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

module.exports = app;
