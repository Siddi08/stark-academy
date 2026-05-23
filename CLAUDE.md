# Stark Academy — Claude Code Memory

## What this is

A local-first PWA teaching a 26-module Iron Man curriculum.

- Runs locally via `npm run dev` after git clone
- All progress in localStorage (key: 'stark-academy-v1')
- Sync: `npm run sync-server` on laptop, phone enters laptop's LAN IP in Settings
- No cloud, no account, no deployment needed

Owner: Anthony (RAAF, 24, maritime archaeologist in training).

## Stack

- Vite + React 18 + TypeScript strict
- Tailwind CSS v3 — custom design system (see tailwind.config.js)
  - Font: Syne (headings), DM Sans (body), Geist Mono (code)
  - DO NOT use Inter, Roboto, or Space Grotesk
  - Primary accent: spark-500 (#5456F5)
  - Dark theme only — void/surface/raised backgrounds
- React Router v6 client-side
- Zustand + localStorage persist ('stark-academy-v1')
- Anthropic SDK browser mode (dangerouslyAllowBrowser: true)
- Express sync server (sync-server/server.ts, port 3001)

## Design system — commit to this

- All colours from tailwind tokens only (never hardcode hex)
- Font headings: font-heading (Syne)
- Font body: font-body (DM Sans)
- Buttons: .btn-primary, .btn-secondary, .btn-ghost, .btn-danger, .btn-sync classes
- Cards: .card, .card-raised, .card-glow classes
- Prose: .prose-iron class for lesson markdown
- Animations: fade-up, fade-in, shimmer, spark keyframes
- Phase colours: phase1(teal) phase2(coral) phase3(periwinkle) phase4(amber) phase5(violet)

## Curriculum structure

- 26 modules across 5 arcs
- Each module: 4 lessons, 4 lesson quizzes, 1 module quiz, 1 project
- Arc finals: modules 6, 12, 16, 20, 26
- Content in src/data/curriculum/arc1.ts through arc5.ts

## Responsive layout

- Mobile (<768px): BottomNav, single column, 44px min touch targets
- Desktop (≥1024px): Sidebar (260px), 2-3 column layouts

## Code rules

- Functional components only, TypeScript strict
- All API calls only in src/api/
- cn() from src/utils/cn.ts for conditional classnames
- Claude model: claude-sonnet-4-20250514 always
- Always try/catch API calls with user-facing error messages
- min-h-[44px] on all interactive elements (mobile touch target)

## Key files

- src/types/index.ts — all interfaces
- src/data/curriculum/index.ts — all 26 modules exported
- src/store/useAppStore.ts — single source of truth
- sync-server/server.ts — local network sync
- src/utils/sync.ts — merge logic
