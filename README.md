# ⚡ STARK ACADEMY

> A 26-module curriculum to build Iron Man-level AI knowledge.
> From binary to frontier research — one integrated track.

## Quick start

```bash
git clone https://github.com/[your-username]/stark-academy
cd stark-academy
npm install
npm run dev

# Opens at http://localhost:5173
```

## Install as an app

**Android (Chrome):**
Open `http://localhost:5173` → Chrome menu → Add to Home Screen

**Windows (Chrome or Edge):**
Open `http://localhost:5173` → install icon in address bar

> Note: The install prompt requires HTTPS in production. For local dev,
> Chrome treats localhost as a secure origin, so "Add to Home Screen" works.

## First run

1. App opens with onboarding
2. Go to **Settings → API Key** — enter your Anthropic key
   (Get one free at https://console.anthropic.com)
3. Start **Module 1**

## Syncing between phone and laptop

1. Make sure both devices are on the **same WiFi network**
2. On your **laptop**: run `npm run sync-server`
   — it shows your local IP (e.g. `192.168.1.42`)
3. On your **phone**: Settings → Sync → enter `192.168.1.42`
4. Tap **Sync Now** — progress merges automatically
5. Keep `npm run sync-server` running while syncing

Your progress stays local on each device and merges when you sync.
The sync server runs only on your LAN — nothing goes to the internet.

## Curriculum — 26 modules, 5 arcs

| Arc | Modules | Focus |
|-----|---------|-------|
| 1 — Foundation | 1–6 | Binary, algorithms, networking, linear algebra, calculus, probability |
| 2 — Intelligence | 7–12 | Neural networks, transformers, scaling, alignment, advanced architectures |
| 3 — Engineering | 13–16 | Anthropic API, Claude Code, RAG, production |
| 4 — Systems | 17–20 | Safety, evals, cost, geopolitics of AI |
| 5 — Mastery | 21–26 | MCP, fine-tuning, research, Linus OS, maritime AI, capstone |

104 lessons · 130 quizzes · 26 GitHub projects

## Moving progress between machines

**Export:** Settings → Export Save → copy the code

**Import:** On new machine → Settings → Import Save → paste

## Tech

Vite + React + TypeScript · Tailwind CSS · Zustand · Anthropic API · Express (sync)

## License

MIT
