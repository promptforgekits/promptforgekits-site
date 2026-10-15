# Browser Game Starter (Phaser 3 + Vite)

A tiny, working platformer you can grow into your own game with AI coding tools.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # once
npm run dev      # opens http://localhost:5173
```

Controls: Arrow keys or A/D to move, Space / Up / W to jump. Collect gold coins, avoid red spikes and red walkers, don't fall in pits, reach the gold flag.

## Build for publishing

```bash
npm run build    # outputs dist/
npm run preview  # test the build locally
```

Upload the **contents** of `dist/` (see `PUBLISH.md` in the kit).

## Project layout

| File | What it does |
|---|---|
| `src/main.js` | Creates the game and lists the scenes |
| `src/config.js` | Every number you might want to tweak: speed, jump, gravity, the color palette, parallax, particles |
| `src/textures.js` | All the art, drawn in code: one function per sprite |
| `src/ui.js` | Shared text style (bundled font), panels, and the parallax background |
| `src/scenes/BootScene.js` | Draws the textures, sets up animations, loads the font |
| `src/scenes/MenuScene.js` | Title screen |
| `src/scenes/GameScene.js` | The game itself; level layout arrays (in tiles) at the top |
| `src/scenes/GameOverScene.js` | Score, high score, restart |
| `public/assets/fonts/` | The Lilita One font (OFL) |
| `CREDITS.md` | Where each asset came from and its license |
| `AGENTS.md` / `CLAUDE.md` / `.cursorrules` | Rules your AI tool reads automatically |

## Quick tweaks to try first

- Higher jump: change `PLAYER.jumpVelocity` in `src/config.js` (more negative = higher).
- New level: edit the `PLATFORMS`, `COINS`, `ENEMIES` arrays in `GameScene.js`.
- Colors and text: edit `COLORS` and `FONT` in `src/config.js`.

## The art

All art is drawn in code in `src/textures.js` in the kit's "Chunky Flat Toy" style (flat shapes, thick dark outline, a 16-color palette; see `THEME.md` in the kit). There are no image files, so there is nothing to license. The font is Lilita One (SIL Open Font License); see `CREDITS.md`.

To change a sprite, edit its draw function (e.g. `drawPlayer`). To use an image instead, put it in `public/assets/`, load it in a `preload()` method in `BootScene` with `this.load.image('player-idle-0', 'assets/hero.png')`, and remove that `save(...)` line in `textures.js`. Use only art you made or have a license for (e.g. CC0 packs from kenney.nl), and add it to `CREDITS.md`.

## Use with AI

Start with `git init && git add -A && git commit -m "starter works"`. Then follow `PROMPTS.md` one prompt at a time, testing and committing after each.

## License

You may use this code in your own games, including commercial ones. You may not resell or redistribute the kit itself. See `LICENSE.md` in the kit folder for the full terms.
