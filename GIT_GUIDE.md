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

## Lesson 2 — Feature branches

| Command | What it does |
|---|---|
| `git switch -c feature/x` | Create a branch and move onto it (older form: `git checkout -b`) |
| `git branch` | List branches; `*` marks the current one |
| `git add <specific files>` | Stage only some files — lets one work session become several logical commits |
| `git log --oneline` | Verify your history tells a readable story |

### Key ideas

- **`main` always works.** Risky or in-progress work lives on a feature branch and only
  merges back when tested.
- **A branch is a 41-byte pointer**, not a copy of the project. Creating one is instant
  and free — branch liberally.
- **Naming convention:** `feature/...`, `bugfix/...`, `chore/...` prefixes group branches.
- **One logical change per commit.** We built the whole engine, then made 3 commits by
  staging subsets: test wiring → rational math → solver/deck/scoring.
- **When a test fails, decide whether the code or the test is wrong** before "fixing".
  Ours was a too-strict assertion — the test got fixed, not the solver.

## Lesson 3 — Merging

| Command | What it does |
|---|---|
| `git merge <branch>` | Replays the branch's changes onto the current branch |
| `git merge --no-ff <branch>` | Forces a merge commit even when fast-forward is possible |
| `git branch -d <branch>` | Deletes a merged branch (the commits live on in main) |
| `git log --oneline --graph --all` | Draws the branch/merge picture |

### Key ideas

- **Fast-forward**: if `main` hasn't moved since you branched, git can just slide the
  pointer forward — no new commit. `--no-ff` instead records a merge commit so history
  shows "these commits were one feature". GitHub PRs do this by default.
- **Switching branches rewrites your working files.** The feature's files literally
  vanish from disk on `main` until you merge — branches are parallel universes.

## Lesson 5 — Merge conflicts

| Command | What it does |
|---|---|
| `git merge <branch>` → `CONFLICT` | Both branches edited the same lines; git asks you to decide |
| `git status` | Lists conflicted files as "both modified" |
| `git add <file>` | Marks the conflict resolved |
| `git commit` | Completes the merge |
| `git merge --abort` | Bail out and return to the pre-merge state |

### Key ideas

- Conflict markers: `<<<<<<< HEAD` (your side) / `=======` / `>>>>>>> branch` (their
  side). Edit the file to the final desired state and delete every marker.
- Git auto-merges everything it can — conflicts only happen where **both** branches
  touched the **same lines**.
- **Honor both intents.** We kept the new `Celebration` component (the feature) and
  carried the `分` suffix into it (the hotfix). Don't blindly pick a side.
- **Build/test before committing the merge** — a file with leftover `>>>>>>>` markers
  won't compile, but subtler logical conflicts can.
