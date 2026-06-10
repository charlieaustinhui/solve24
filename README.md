# 算二十四 · Solve 24

A Chinese/anime-inspired speed-math arcade game. You're dealt four cards (1–10);
combine **all four** with `+ − × ÷` to make exactly **24** before the 60-second
round ends. Solve fast for bonus points, chain solves to summon the samurai, the
emperor… and the dragon.

## Play

```bash
npm install
npm run dev      # http://localhost:5173
```

## How it works

- **Tap a card, an operator, then another card** — they merge into one card showing
  the result (fractions like `8/3` are legal mid-solve). Get the last card to 24.
- Every dealt hand is **guaranteed solvable** — a brute-force solver using exact
  rational arithmetic checks each deal (hands like `3 3 8 8` need `8÷(3−8÷3)`).
- **Scoring:** 100 base + up to 150 speed bonus (fades over 15 s) × streak
  multiplier (caps at ×2).
- **Combo tiers:** streak 3+ summons the samurai 斬!, 5+ the emperor, 8+ the divine
  dragon (screen shake + lantern rain).
- **Top-10 high scores** persist in `localStorage` with arcade-style initials.
- **All audio is synthesized** with the Web Audio API — gongs, pentatonic arpeggios,
  katana shings. No sound files. Mute with the 音 button.
- All art is hand-built inline SVG. No image assets.

## Commands

```bash
npm run dev      # dev server with hot reload
npm test         # Vitest unit tests (solver, scoring, high scores)
npm run lint     # ESLint (react-hooks v7 purity rules)
npm run build    # type-check + production build
```

## Project layout

| Path | Role |
|---|---|
| `src/lib/` | Pure game logic: rational math, 24 solver, dealer, scoring, audio synth, high scores |
| `src/components/` | React UI: board, cards, timer, HUD, screens |
| `src/components/effects/` | Celebrations: confetti, ink stamp, samurai, emperor, dragon, lanterns |
| `GIT_GUIDE.md` | Git cheat sheet built while developing this project branch-by-branch |

Built as a learning project — the git history is the curriculum: check
`git log --oneline --graph` to see the feature-branch workflow, including a
deliberately staged merge conflict.
