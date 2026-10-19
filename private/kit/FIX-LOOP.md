# The Fix Loop: Recovering When AI Breaks Your Game

AI tools are fast at writing code and also fast at breaking it. This guide is the habit that keeps you shipping instead of spiraling.

## The golden rule: 3 tries, then roll back

```
Change breaks something
  -> Try 1: paste the exact error + what you did (Template A)
  -> Try 2: give more context: file contents, what you expected (Template B)
  -> Try 3: ask the AI to explain the cause BEFORE fixing (Template C)
  -> Still broken? ROLL BACK to your last commit. Re-ask with a smaller step.
```

Why: after 3 failed fixes the AI is usually patching its own patches. Each attempt adds code, and the bug gets buried deeper. Rolling back costs you 2 minutes; spiraling costs you an evening.

## Git checkpoints (your save points)

Run once at the start of a project:
```bash
git init
git add -A
git commit -m "starter works"
```

**After every working step** (a feature works and you tested it):
```bash
git add -A
git commit -m "player can double jump"
```

See your save points:
```bash
git log --oneline
```

**Undo all uncommitted changes** (go back to the last save point):
```bash
git checkout .          # restore changed files
git clean -fd           # remove new untracked files (careful: deletes them)
```
Or with newer git: `git restore .`

**See what the AI changed since the last commit:**
```bash
git diff
git status
```

**Go back to an older save point** (keeps history, safe):
```bash
git log --oneline             # find the commit id, e.g. a1b2c3d
git revert --no-edit HEAD     # undo the most recent commit with a new commit
```
Or just look at an old version without changing anything:
```bash
git checkout a1b2c3d          # look around, run npm run dev
git checkout main             # come back (or "master" on older setups)
```

**Try something risky on a branch:**
```bash
git checkout -b experiment    # work here
git checkout main             # abandon it: just switch back
git merge experiment          # keep it: merge into main
```

Tip: Cursor has a "Restore checkpoint" button and Claude Code has `/rewind` (Esc twice); Lovable and Bolt have version history. Use them too, but git is the one that always works.

## Before you ask the AI: 60-second triage

1. **Open the browser console** (F12 or Cmd+Option+J, "Console" tab). Red text is your error. Copy all of it.
2. **Check the terminal** running `npm run dev` for build errors.
3. **Hard refresh** (Ctrl+Shift+R / Cmd+Shift+R). Sometimes it's just stale.
4. **Name the symptom precisely:** "black screen", "player falls through floor", "score doesn't reset on restart". Vague in = vague out.

## Debug prompt templates

### Template A: error message (Try 1)
```
After your last change the game is broken.
What I did: <e.g. pressed Space on the menu>
What I expected: <the game starts>
What happened: <black screen>
Console error (exact):
<paste the full red error text>
Fix only this bug. Change as little code as possible and tell me which files you changed and how to test the fix.
```

### Template B: no error, wrong behavior (Try 2)
```
There is no error, but the behavior is wrong.
Expected: <coins disappear when touched and score goes up by 10>
Actual: <score goes up by hundreds per coin>
Relevant file: src/scenes/GameScene.js
Here is the current code of the function involved:
<paste the function>
Explain in one paragraph why this happens, then make the smallest fix.
```

### Template C: diagnose before fixing (Try 3)
```
We have tried to fix this twice and it is still broken. Do NOT write code yet.
1. List the 3 most likely causes of: <symptom>.
2. For each, tell me one thing I can check (a console.log to add or a value to look at).
Wait for my results before changing code.
```

### Template D: add logging to find the bug
```
Add temporary console.log statements to trace <the problem>, e.g. log the player's position and velocity every 30 frames, and log when <event> fires. Prefix each log with [DEBUG] so I can remove them later. Don't change any game logic.
```

### Template E: after rolling back (fresh start)
```
I rolled back to my last working commit. Previously, trying to add <feature> in one step broke <thing>.
Let's do it in smaller steps. Give me just step 1 of <feature>: the smallest change that is visible and testable. Stop after that step.
```

### Template F: "it was working before"
```
Here is the output of `git diff` since the last working version:
<paste diff>
Something in this diff broke <thing>. Identify which change caused it and revert only that part.
```

### Template G: performance (game is slow/laggy)
```
The game gets slow after <30 seconds / many enemies>. Check for: objects created every frame and never destroyed, tweens or timers that pile up, listeners added in update(). Show me what's leaking and fix it with minimal changes.
```

## Classic Phaser bugs and quick fixes

| Symptom | Usual cause | Fix |
|---|---|---|
| Black screen, no error | Scene key typo / scene not in `main.js` list | Check `super('Key')` matches `scene.start('Key')` |
| Things happen hundreds of times | Overlap callback runs every frame | Guard with a flag or destroy/disable the object |
| State not reset after restart | Variables set in constructor | Reset them in `create()` |
| Player falls through platforms | Missing `physics.add.collider` / very high speed | Add the collider; lower speed or make platforms thicker |
| Image is a green box with a slash | Wrong asset path or key | Files in `public/` load as `'name.png'`; check key spelling |
| Works in dev, blank on itch.io | Absolute paths | Keep `base: './'` in `vite.config.js`, no leading `/` in asset paths |
| HUD scrolls away | Camera follows player | `.setScrollFactor(0)` on HUD objects |
| Input stops working after restart | Listeners added with `on` stack up | Use `once`, or remove listeners in `shutdown` |

## When the AI keeps "fixing" things you didn't ask for
```
Stop. Only change what I ask. Do not refactor, rename, or reformat other code. Re-read AGENTS.md and follow the "small steps" rules.
```


## Saves and private browsing
The starter ships `src/storage.js`: every localStorage/sessionStorage call is wrapped in try/catch with an in-memory fallback, so the game keeps running in Incognito and sandboxed iframes (Poki and CrazyGames require this). If a fix prompt touches saving, say: "Use only `storage` / `session` from src/storage.js; never call localStorage or sessionStorage directly." Test it: DevTools > Application > block site data (or open in a private window) and play a full round.
