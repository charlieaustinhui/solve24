# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server at http://localhost:5173 (no API — leaderboard falls back to local)
npm run dev:full   # vercel dev: Vite + the /api functions (needs `npx vercel env pull .env.development.local` once)
npm test           # Vitest, full suite (vitest run)
npx vitest run src/lib/__tests__/solver.test.ts   # single test file
npx vitest run -t "rejects unsolvable hands"      # single test by name
npm run lint       # ESLint — includes react-hooks v7 purity rules (see below)
npm run build      # tsc -b type-check + vite build (the pre-merge gauntlet is lint → test → build)
```

## Architecture

Single-page Vite + React 19 + TypeScript + Tailwind v4 game. No router — `src/App.tsx` is a phase machine (`idle → playing → gameover`) that swaps `StartScreen` / `GameBoard` / `GameOverModal`. Personal persistence is localStorage; the **global leaderboard** is the one server-side piece (see below).

### Engine (`src/lib/`) — pure, fully unit-tested, no React

- `rational.ts` — exact fraction arithmetic `{num, den}`. Required correctness foundation: hands like `3,3,8,8` are only solvable via fractional intermediates (`8÷(3−8÷3)`), which floats would corrupt. `div` returns `null` on divide-by-zero rather than throwing.
- `solver.ts` — `solve()` recursively combines any ordered pair of remaining values with any operator (commutative ops tried once per unordered pair); this covers every permutation *and* parenthesization without enumerating shapes. `countSolutions()` counts all derivation paths to 24 — it is the **difficulty metric**.
- `deck.ts` — `dealHand(difficulty)` redraws until a hand's `countSolutions` falls in the tier's band (`BANDS`: easy ≥35 paths, medium 14–34, hard 4–13; calibrated empirically over 3000 hands). Bounded by `MAX_ATTEMPTS` with a solvable fallback so a degenerate RNG can never hang. The band constants are duplicated in `deck.test.ts` — change both.
- `scoring.ts` — round length, speed bonus, streak multiplier (caps ×2), `difficultyForScore()` (score thresholds `MEDIUM_AT`/`HARD_AT` — tests assert via these constants, so retuning them doesn't break tests), and `comboTier()` (streak 3/5/8 → samurai/emperor/dragon celebrations).
- `audio.ts` — every sound is synthesized via Web Audio (oscillators + noise + envelopes); there are no audio asset files. All sfx check the module-level mute flag (persisted in localStorage).
- `highscores.ts` / `stats.ts` / `achievements.ts` — localStorage stores sharing the same defensive pattern: `storage()` try/catch accessor, garbage-tolerant JSON parse. Tests mock localStorage with `vi.stubGlobal` (see `highscores.test.ts` for the pattern). `HighScore.name` is 1–10 chars (was 3-letter `initials`; `loadHighScores` migrates old entries).
- `leaderboard.ts` — shared by client **and** the API function: `sanitizeEntry()` (authoritative validation — name `[A-Z0-9 ]{1,10}`, profanity check via `obscenity`, score plausibility bound `hands × MAX_HAND_SCORE` derived from scoring constants), `globalQualifies()`, and fetch/submit helpers that return `null` on any failure (the offline signal).

### Global leaderboard (`api/leaderboard.ts`)

- Vercel serverless function (root `api/` folder, Web-handler signature). `GET` → top 10; `POST` → `sanitizeEntry()` → `ZADD` to Upstash Redis sorted set `lb:scores` (member JSON `{i,h,d,n}`, score in the zset), trimmed to 100, returns fresh top 10. 400 carries `{error: "invalid" | "inappropriate"}` so the form can react; Redis trouble → 503.
- **The client never sends a trusted score-path**: the game submits its own computed score, the player only types a name, the server re-validates and sets the date. Scores are still client-computed (replay verification deliberately deferred).
- Env vars: `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_*` — both supported), injected by the Upstash Vercel Marketplace integration; pull locally with `npx vercel env pull .env.development.local`.
- UI: `LeaderboardTabs.tsx` (Global ⇄ Local) — fetch-on-view, no polling; Global degrades to the local board with a notice when the API is unreachable (e.g. plain `npm run dev`).

### Game flow

`GameBoard` owns all in-round state: cards merge pairwise (click card → operator → card; merged card gets a fresh id and is appended), undo is a stack of previous card arrays, and the solve path is `combine() → handleSolve() → dealNext(newScore)`. Difficulty for the *next* hand is computed from score-including-this-solve; a tier increase fires `sfx.levelUp()` + a stamp overlay, and `Background` (keyed by difficulty) cuts scenes instantly. Round end flows through `finished` state → effect → `onGameOver(summary)`; `App`'s handler records stats/achievements (deliberately in the event handler, **not** an effect, so StrictMode can't double-record).

`?level=easy|medium|hard` in the URL pins the difficulty for the whole round (scene preview/testing). A HUD badge shows when it's active.

### Performance rules (learned the hard way — there are regression-test habits around these)

- **Render purity is enforced by lint** (react-hooks v7): no `Date.now()`/ref reads during render. Wall-clock time flows through refs written in effects/handlers (`nowRef`, `handStart`, `endTime` in GameBoard).
- **Never re-render the board on a timer.** The 200ms poll only calls `setTimeLeft` when the *displayed second* changes. A 5×/sec full-tree re-render previously caused 100–500ms click latency.
- `Background` is `memo()`-wrapped; the scene layer re-renders only on tier change. It carries `-z-10` because an absolutely-positioned sibling otherwise paints **above** non-positioned in-flow UI (this bug hid the operator buttons once).
- New animations must be one-shot CSS keyframes on `transform`/`opacity` only (GPU-composited), triggered by element mount via React keys — no JS timers, no state. `ScoreTicker` is the lone exception and is isolated so only its own span re-renders.
- Verification standard: a `PerformanceObserver` `longtask` sample during active play should show **zero** long tasks.

### Scenes & art

`public/backgrounds/{easy,medium,hard,menu}.png` are user-supplied pixel art (AI-generated; replacements go in the same paths). `Background.tsx` layers: image (Ken Burns drift at *constant scale* — animating scale forces re-rasterization) → dark scrim (`bg-ink-950/60`, the art is bright) → per-tier CSS particles (leaves/gold/storm clouds). Missing images fail soft to the ink background. Card palettes per tier live in `SKIN` in `Card.tsx`. Theme tokens (`ink-*`, `lantern-*`, `gold-*`, `paper-*`, `font-brush`, `font-arcade`) are defined in `@theme` in `src/index.css`.

## Workflow & deploy

- This repo doubles as a git curriculum (`GIT_GUIDE.md`); keep the conventions: feature branches (`feature/...`, `fix/...`), Conventional Commits, `--no-ff` merges into `main`, semver annotated tags (`vX.Y.Z`). Trivial tested tweaks may go straight to `main`.
- **Pushing `main` auto-deploys** to https://solve24-kohl.vercel.app via the connected GitHub repo (`charlieaustinhui/solve24`). Tags are manual (`git tag -a` + `git push --tags`). When verifying a deploy, check served *content* (e.g. grep a changed constant in the bundle JS), not bundle filenames — Vercel's build hash differs from local.
- Proprietary license: all rights reserved, intentionally **no** LICENSE file. Do not add an open-source license.
