# Git Guide — learned while building Solve 24

A running cheat sheet of every git concept used in this project, in the order we met them.

## Lesson 1 — Starting a repository

| Command | What it does |
|---|---|
| `git init -b main` | Creates the repo (the hidden `.git/` folder) with a default branch named `main` |
| `git status` | Shows what changed since the last commit: `M` modified, `D` deleted, `A` staged, `??` untracked |
| `git add <file>` / `git add .` | **Stages** changes — picks what goes into the next snapshot |
| `git commit -m "msg"` | Takes the snapshot of everything staged |
| `git log --oneline` | Compact history, newest first |

### Key ideas

- **The repo is the `.git/` folder.** Delete it and you have a plain folder again.
- **Two-step save:** working files → (`git add`) → staging area → (`git commit`) → history.
  The staging area exists so you can commit *part* of your changes deliberately.
- **`.gitignore`** lists files git should never track: `node_modules/` (reinstallable from
  `package.json`), `dist/` (build output), `.env` (secrets). Commit recipes, not ingredients.
- **Commit messages** follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`,
  `refactor:`, `test:` + a short imperative summary ("add solver", not "added solver").
- **Never commit code you haven't run.** We ran `npm run build` before committing.
- The `LF will be replaced by CRLF` warnings on Windows are harmless line-ending
  normalization notices.
