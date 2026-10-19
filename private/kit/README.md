# Browser Game Starter Kit

*by **Prompt Forge Kits**, [promptforgekits.com](https://promptforgekits.com)*

Start here, then open `GUIDE.pdf` for the full guide. License terms: `LICENSE.md`.

## Quick Start

**What you need:** a computer, [Node.js 18+](https://nodejs.org) (LTS), [Git](https://git-scm.com), and an AI coding tool (Cursor, Claude Code, Windsurf, or Copilot).

*Works best with AI tools that open a local folder: Cursor, Claude Code, Windsurf, or VS Code + Copilot.*

**1. Unzip the kit** and open the `starter/` folder in your AI tool (Cursor: File > Open Folder; Claude Code: `cd starter && claude`).

**2. Install and run:**
```bash
npm install
npm run dev
```
A browser tab opens with a tiny platformer. Play it: arrows to move, Space to jump.

**3. Make your first save point:**
```bash
git init
git add -A
git commit -m "starter works"
```

**4. Plan your game.** Fill in the one-page `GDD.md`. Keep v1 tiny.

**5. Pick your genre in `PROMPTS.md`** and paste Prompt 0, then P1. Test. Commit. Repeat. (Finished v1 and want more content? See `GROW-YOUR-GAME.md`.)

**6. When something breaks,** open `FIX-LOOP.md`. Three tries, then roll back.

**7. Ship it** with `PUBLISH.md`: itch.io, GitHub Pages, or Netlify.

**Using Lovable or Bolt?** These run in the browser instead of opening a local folder. Bolt can import a project from GitHub; Lovable is built around its own React template, so for Lovable the smoothest route is to keep the game code in your own GitHub repo and use an editor (Cursor, Claude Code, Windsurf) for game work. In either case, paste `AGENTS.md` as your first message so the AI follows the rules.

### What's in the kit

| File | Use it for |
|---|---|
| `starter/` | Working Phaser 3 + Vite game with menu, game, and game-over scenes, art drawn in code, and a bundled OFL font (`starter/CREDITS.md`) |
| `starter/AGENTS.md`, `CLAUDE.md`, `.cursorrules` | Rules your AI reads automatically: architecture + "small steps" |
| `THEME.md` | The kit's visual theme: palette, color meanings, font, UI style, and how each genre looks in it |
| `GDD.md` | One-page game design doc template |
| `PROMPTS.md` | 6 genre prompt sequences with test checkpoints |
| `GROW-YOUR-GAME.md` | Adding levels, waves, enemies, weapons, items, and modes after v1: data tables, the one-prompt rule, balance tips, a playtest loop, and example prompts for each genre |
| `FIX-LOOP.md` | Debugging and rollback system |
| `PUBLISH.md` | Publishing to itch.io, GitHub Pages, Netlify |
| `LICENSE.md` | What you can and can't do with the kit |
| `LICENSE-MUSIC.txt` | The included background music (PFK Theme, our own): free to use in your games |

### The 4 rules that make vibe-coded games actually ship
1. **One prompt = one feature.** Never ask for five things at once.
2. **Test after every change.** Play it. Look at the console (F12).
3. **Commit every working step.** Git is your save game.
4. **Three failed fixes = roll back.** Then ask for a smaller step.

---

**Browser Game Starter Kit by Prompt Forge Kits** · [promptforgekits.com](https://promptforgekits.com) · X [@promptforgekits](https://x.com/promptforgekits)  
Support: [promptforgekits.com](https://promptforgekits.com) or email **support@promptforgekits.com**
