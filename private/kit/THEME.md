# Visual Theme: "Chunky Flat Toy"

One look for every game you build with this kit: flat shapes, a thick dark outline, one highlight per shape, no gradients on actors, and a fixed 16-color palette. Backgrounds are muted and low-contrast; characters are bright and outlined, so they always stand out. Everything is drawn in code with Phaser Graphics, so no image files are needed and there is nothing to license. The starter platformer already uses it (`starter/src/textures.js`).

## 1. Palette (16 colors)

Defined as `PALETTE` in `src/config.js`. Use these names in code, never new hex values.

| Name | Hex | Role |
|---|---|---|
| `ink` | `#1b1f2e` | Every outline, dark text, shadows |
| `slateDark` | `#2e3550` | Panels, terrain body, ground fill |
| `slate` | `#4a5373` | Terrain, panel highlight, disabled buttons |
| `slateLight` | `#8a93ad` | Far hills, poles, inactive UI |
| `skyMuted` | `#a9c4d4` | Sky top, far background |
| `cloud` | `#e9edf5` | Sky bottom, clouds, light panels |
| `white` | `#ffffff` | Text, highlights, **hit flash** |
| `oliveDark` | `#55613a` | Terrain shading |
| `olive` | `#7d8a52` | Grass, near hills, trees |
| `oliveLight` | `#a9b47a` | Grass highlight, near hills |
| `red` | `#ef4f4f` | **Danger**: enemies, spikes, damage, game over |
| `gold` | `#ffc93c` | **Money / reward**: coins, score, prices, goal |
| `cyan` | `#3ec9e6` | **The player** and player projectiles |
| `blue` | `#4d7cff` | **Friendly / slowed**: allies, frost, slow rings |
| `green` | `#5bd16b` | **Heal / poison**: health pickups, poison, "you win" |
| `purple` | `#a45ee5` | **Magic / rare**: power-ups, rare loot, special abilities |

Fixed color meanings (same in every genre): red = danger, gold = money, cyan/blue = player/friendly/slowed, green = heal/poison, purple = magic/rare, white flash = hit. Terrain stays olive and slate. A tower, weapon, or effect uses the color of its damage type, and so do its projectiles.

## 2. Shape rules

- Outline: `OUTLINE` = 3 px of `ink` around every actor, pickup, and UI panel. Backgrounds get no outline.
- One highlight per shape: a small white blob at 40-60% alpha near the top-left.
- Characters get a big head or a big single shape, with large white eyes and ink pupils.
- Every enemy type gets a distinct shape and speed, not just a color: circle (basic), triangle (fast), square (tanky), diamond (flying), hexagon (boss).
- Backgrounds: two parallax layers of soft hills in the muted colors (`skyMuted`, `slateLight`, `olive`, `oliveLight`), sky gradient `skyMuted` to `cloud`.
- Health bars appear only after damage. Status effects are a colored ring (blue slow, green poison, purple magic).

## 3. Font

**Lilita One** (SIL Open Font License 1.1), bundled at `starter/public/assets/fonts/LilitaOne-Regular.ttf` with `OFL.txt`, loaded in `BootScene` via the `FontFace` API. Create all text with `addText(scene, x, y, text, size, color)` from `src/ui.js`: it adds the ink outline and a 3 px drop shadow. Sizes: 56 titles, 22-26 HUD and buttons, 16-20 body. Text stays short.

## 4. UI components (`src/ui.js`)

| Component | Look | Code |
|---|---|---|
| Text | Lilita One, white or a role color, ink outline (size/5, min 4 px) + ink shadow | `addText()` |
| Panel | `slateDark` rounded rect (r 18), 4 px ink outline, solid ink drop shadow 6 px, `slate` highlight bar | `addPanel(scene, w, h, x?, y?)` |
| Background | Sky gradient + `bg-far` (scroll 0.15) + `bg-near` (scroll 0.4) | `createParallax()`, `updateParallax()` |
| HUD | Top-left: icon + number (gold for money), size 26, `setScrollFactor(0)`. Top-right: pause/speed. | GameScene `createHud()` |
| Button (to add) | Small `addPanel` + `addText`; hover = gold text; only the button is interactive | build from the two helpers |
| Particles | 8 px white `spark` tinted by role: gold collect, red hurt, gold win, green heal, purple magic | GameScene `burst()` |
| Motion | Sine bobs (coins 600 ms, titles 1200 ms), pulsing prompts, title pop with `Back.out`, 200 ms shake on death, 300 ms fade-in | scenes |

## 5. The 6 genres in this style

All drawn with Graphics in `textures.js`; reuse the starter's draw functions where noted.

| Genre | Player | Enemies / obstacles | World and UI |
|---|---|---|---|
| Platformer (starter) | Cyan blob `drawPlayer` | Red circle walkers, red spikes | Olive/slate tiles, gold coins and flag |
| Endless runner | Same cyan blob, run anim | Red spikes (ground), red diamonds (flying), tall slate walls | Scrolling `bg-far`/`bg-near`, distance in white, coins gold |
| Top-down roguelite | Cyan blob seen from above, cyan bullets | Red circle / triangle (dasher) / square (brute), red bullets | Slate floor tiles with olive edges; upgrade cards as panels with purple border for rare |
| Idle / clicker | Big gold coin as the click target | n/a | Shop rows as panels, prices in gold, disabled = `slate`; purple for prestige |
| Puzzle (Sokoban) | Cyan blob | n/a | Slate floor, ink walls, gold-outlined targets, olive crates turning green on target |
| Tower defense | Towers as outlined shapes colored by damage type: cyan bolt, blue frost, purple arc (use `gold` for a splash/mortar tower) | Shape-coded red enemies per section 2 | Olive ground, `cloud` path, dashed-circle build pads, range circle on hover; lives red, gold gold, wave white |

Store pages use the same look: `ink` to `slateDark` background, Lilita One headline in white and gold with ink outline, chunky pill chips with ink borders, game screenshots in an ink-framed card, big code-drawn sprites rendered at 6x.

## 6. Sources and licenses

| Item | Source | License |
|---|---|---|
| All art | Drawn in code, `starter/src/textures.js` | Part of the starter code (`LICENSE.md`) |
| Lilita One font | Juan Montoreano, via Google Fonts | SIL OFL 1.1 (`starter/public/assets/fonts/OFL.txt`) |

Want image files later? Kenney's CC0 packs (kenney.nl) are safe to use; pick flat, outlined ones so they match, and list them in `starter/CREDITS.md`.
