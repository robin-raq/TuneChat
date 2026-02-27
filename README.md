# TuneChat

Realtime chat + shared music (chords and notes) over Socket.io. Built with Vite, ES modules, and Tone.js.

## Quick start

```bash
npm install
npm run dev
```

- **Client:** http://localhost:5173  
- **Server:** http://localhost:3000  

Open the client URL → enter username and room → **Join Chat** → **Click to enable sound** → use chord buttons and the piano keyboard. Others in the same room hear notes and chords in real time.

## Scripts

| Command         | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Run server + Vite client             |
| `npm run server`| Backend only (port 3000)             |
| `npm run client`| Vite dev server only (port 5173)     |
| `npm run build` | Build client for production          |
| `npm start`     | Run server (serves built client)     |

## Production

```bash
npm run build
npm start
```

Open http://localhost:3000. Set `PORT` in the environment if needed. Health check: `GET /health`.

## Structure

- **client/** – Vite app (entry: `src/main.js`, app + audio + socket in `src/`)
- **server/** – Express + Socket.io (app, config, sockets, utils)

## Tech

- **Frontend:** Vanilla JS, Vite, Tone.js (lazy init on user gesture), Socket.io client  
- **Backend:** Node, Express, Socket.io  
- **Audio:** Tone.js; custom piano keyboard; no @tonejs/ui  
