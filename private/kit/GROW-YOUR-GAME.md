# Grow Your Game: Add Content Without Breaking It

*Browser Game Starter Kit by Prompt Forge Kits*

You shipped v1. People played it and said "more!" This chapter shows how to add levels, waves, enemies, weapons, items, and new modes with an AI coding tool, without the game turning into a pile of patches.

It is written against the real starter in `starter/`. Where a snippet is shown, we built it into the starter and played it in a browser to check it (noted below). The numbers in examples are **placeholders to tune**, not recommendations. The only balance numbers we quote as tested are the Core Keepers ones already in `PROMPTS.md`.

## 1. What the starter gives you (and what it doesn't)

Read this once so your prompts match the code:

| Where | What lives there |
|---|---|
| `src/config.js` | Every tunable number, `PALETTE`, `COLORS`, `TEXT`, `PLAYER`, `ENEMY` (patrol distance and duration), `SCORE`, `STORAGE_KEYS`, and the `INFO` object (every on-screen name and one-line description) |
| `src/textures.js` | All art: one draw function per sprite, registered with `save('key', w, h, ...)` inside `createTextures()` |
| `src/scenes/BootScene.js` | Builds textures and the animations (`anim(key, frameKeys, fps)`), loads the font |
| `src/scenes/GameScene.js` | **One hard-coded level**: the arrays `PLATFORMS`, `COINS`, `ENEMIES`, `SPIKES`, `GOAL` at the top, in tiles (1 tile = `TILE` = 36 px) |
| `src/ui.js` | `addText`, `addPanel`, `addTag`, `addLegend`, `addBanner`, `addTooltip`, parallax helpers |

Two facts shape everything below:

1. **Level content is already data** (the arrays), but only one level exists and it lives inside the scene. Step one of growing is moving it into its own file.
2. **Every new thing needs three entries:** a draw function (`textures.js`), a behavior (a scene or `src/` file), and an on-screen name plus one-line description (`INFO` in `config.js`). `AGENTS.md` already tells your AI this; remind it when it forgets.

## 2. The growth rules

1. **One prompt = one content addition.** One enemy, one level, one item. Not "add three enemies and a boss".
2. **Tables first, content second.** Build the table (section 3) in one prompt. After that, adding content is adding a row.
3. **Play the new thing alone before combining.** Make a throwaway level or room with only the new enemy in it.
4. **Commit before and after every addition.** `git add -A && git commit -m "add runner enemy"`.
5. **Cap the scope.** Write in `GDD.md` section 7 what v2 will NOT have. Content is endless; your time is not.
6. **If a prompt fails three times, roll back** (`FIX-LOOP.md`) and split it into two smaller prompts.

### The prompt shape that works for content

```
Add <ONE thing>. Files you may change: <list>. 
It must have: a draw function in textures.js in the Chunky Flat Toy style (THEME.md, palette colors only), 
an entry in <the table>, and an INFO name + one-line description in config.js.
Do not change unrelated code. List what you changed and tell me how to test it.
```

Telling the AI which files it may touch is the single best way to stop a 40-line request becoming a 400-line rewrite.

## 3. Make content data, not code

If adding an enemy means editing five methods, the AI will eventually break one. If it means adding a line to a table, it can't. The kit already uses this pattern: Tower Defense keeps every number in `src/settings.js`, Idle keeps upgrades in `src/economy.js`, Puzzle keeps levels as strings in `src/levels.js`, and Platformer prompt P7 moves levels to `src/levels.js`.

### Levels as data (checked in the starter)

We moved the arrays out of `GameScene.js` into `src/levels.js`:

```js
// src/levels.js: all level content is data. Add a level = add an object.
// Platforms: [tileX, tileY, widthInTiles]. Everything else: [tileX, groundRow].
export const LEVELS = [
  {
    name: 'Level 1',
    platforms: [[0, 11, 14], [17, 11, 12], /* ... */],
    coins: [[8, 8], [9, 8], /* ... */],
    enemies: [[9, 11], [21, 11] /* ... */],
    spikes: [[27, 11] /* ... */],
    goal: [65, 11]
  },
  { name: 'Level 2', /* same fields, new numbers */ }
];
```

`GameScene` then reads `this.level = LEVELS[this.levelIndex]` instead of the old constants, takes `levelIndex` and `score` in `init(data)`, and on the flag either starts `GameScene` with `{ levelIndex: next, score: this.score }` or calls `endGame(true)` after the last level. `MenuScene` and `GameOverScene` must start a fresh run with explicit data (`{ levelIndex: 0, score: 0 }`), because `scene.start()` without data can reuse the old data (see the pitfalls in `AGENTS.md`).

We built this with a second level and played it headless: menu, level 1, flag, level 2, flag, the end screen, restart back on level 1, with no console errors. The prompt that does it is in section 12 (Platformer). Note that `PROMPTS.md` P7 already contains it, so if you followed the playbook you have this.

### Enemy kinds as a table (checked in the starter)

Right now `ENEMY` in `config.js` holds one patrol setting for all walkers. Turn it into one entry per kind:

```js
// config.js: one entry per enemy kind
export const ENEMY_TYPES = {
  walker: { patrolDistance: 2 * TILE, patrolDuration: 1400 },
  runner: { patrolDistance: 3 * TILE, patrolDuration: 800 } // shorter duration = faster
};
```

and let each level row name its kind: `enemies: [[9, 11], [15, 11, 'runner']]` (the third value defaults to `'walker'`). We did exactly this (the runner row has a shorter duration, so it moves faster) and the game built and ran through all levels with no console errors. A real new enemy should also get its own look (section 5), not a recolor.

### The rule for every table

- Plain numbers and short strings only (no functions). Easy for the AI to extend and for you to read.
- One name per row, used everywhere (`'runner'`, not three different spellings).
- Display text lives in the table row or in `INFO`, never inline in scenes.
- Ask the AI to **validate on load** in dev: `console.warn` if a level row names an enemy kind that doesn't exist. A one-line check saves a black screen.

## 4. Levels and waves

**Platformer levels.** Add one object to `LEVELS` per prompt. Ask the AI to keep every platform gap jumpable: with the starter's `PLAYER.speed` (220) and `PLAYER.jumpVelocity` (-460) and `WORLD.gravity` (900), measure the real jump by testing in game, then write the max gap (in tiles) at the top of `levels.js` as a comment and tell the AI never to exceed it.

**Roguelite rooms and runner chunks.** Don't hand-place everything. Give the AI a table of room templates or obstacle "chunks" and let a function pick from them, so more content = more templates.

**Tower defense waves.** The kit's `WAVES` table in `src/settings.js` already drives `buildWave(n)` (count, hp growth, unlock waves, boss waves). To grow: extend `WAVES.total`, add an enemy to `ENEMIES`, and add its wave to `WAVES.unlock`. No wave code changes.

**Puzzle levels.** One string array per level in `levels.js` (`'#'` wall, `'.'` floor, `'P'` player, `'B'` box, `'T'` target). The cheapest content to add, and the easiest to get wrong: ask the AI to add a solver check or have you test-solve every level before committing.

**Pacing a set of levels:**
- Introduce one new thing per level, in a safe spot, before using it dangerously. (The kit's wave builder does this: an enemy's first appearance is alone, with a one-line tip.)
- Alternate hard and easy. Two hard levels in a row is where players quit.
- Put the new level's mechanics on screen using the `INFO` helpers (`addBanner` for the goal, `addTag` for the first of each new thing).

## 5. New enemies

A new enemy is four small edits. Do them as **one** prompt per enemy:

1. **Draw function** in `textures.js` + a `save('enemy-runner-0', w, h, ...)` line in `createTextures()`. Two frames if it animates, and an `anim(...)` line in `BootScene.createAnimations()`.
2. **Table row** (`ENEMY_TYPES` or `ENEMIES`).
3. **Behavior** if it isn't a patroller: a small method or a new file in `src/` (for example `src/systems/`), not a rewrite of `GameScene`.
4. **`INFO` entry**: name and one line ("Runner: fast, avoid").

**Make it read at a glance (THEME.md):** a new enemy gets a distinct **shape and speed or size**, not only a new color. All enemies stay `red` (red = danger); the kit's shape language is circle (basic), triangle (fast), square (tanky), diamond (flying), hexagon (boss). Don't tint a baddie gold: gold means money.

**Behavior ideas that need no new engine:** patroller (starter), faster patroller, jumper (tween on `y`), shooter (fires every N ms, bullets destroyed off-screen), chaser (moves toward the player), armored (takes N hits), splitter (spawns two small ones on death). Ask for one per prompt.

## 6. Weapons and towers

- **Every weapon is a table row of numbers**: damage, rate (seconds between shots), range, speed, plus a text role line. The Core Keepers kit does this in `TOWERS` and in the combat stats of `settings.js`.
- **Give each one a job**, not just bigger numbers. Core Keepers has Bolt (fast single target, hits flyers), Mortar (splash, ground only), Frost (slows), and Arc (chain, ignores armor). Counter-relationships ("brutes shrug off Bolt, Arc handles them") make a roster worth having.
- **A new weapon must be worse at something.** Ask the AI: "What is this weapon bad at?" If the answer is "nothing", cut a stat.
- **Color = damage type**, and its projectiles use the same color (THEME.md): cyan bolt, blue frost, purple arc, gold splash.
- **Upgrades beat more towers.** Tiers plus a fork choice (the kit's `UPGRADES` table) add depth with no new art.
- **Every number in `settings.js`**, nothing hard-coded in the tower code. Otherwise balancing means hunting through files.

## 7. Items, pickups, and upgrades

- **Pickups** (platformer, runner): one new sprite plus one row. Reuse the starter's pattern: a physics group, an overlap callback, and a burst of `PARTICLES` in the pickup color. Guard one-time effects (overlaps fire every frame; see `isOver` in `GameScene`).
- **Upgrade cards** (roguelite, endless modes): keep them as a list of `{ name, text, apply }`-style entries, or plain data the game reads. Show three at random, one pick. The kit's Roguelite P7 and Tower Defense endless cards both work this way.
- **Colors by rarity:** common cards on `slateDark` panels, rare cards with a purple border (THEME.md: purple = magic/rare).
- **Every item shows its name and effect** ("Rapid Fire: +20% fire rate"). That is a rule in `AGENTS.md` (`INFO`); don't let the AI skip it.
- **Persistence:** if a run's upgrades should survive between rooms, put them in one object and pass it through the scene data. Anything saved across sessions uses a key from `STORAGE_KEYS`.
- **Avoid stacking explosions.** Percent bonuses that multiply each other get silly fast. Ask the AI to cap each stat in `config.js` (`MAX_FIRE_RATE`, and so on) and say so out loud in the prompt.

## 8. New modes

A mode is a scene plus a rule change, not a new game. Examples, in order of effort:

| Mode | How to add it | Effort |
|---|---|---|
| **Endless / survival** | Reuse the content tables, keep generating after the last level or wave, track best in `STORAGE_KEYS` | Low |
| **Time attack** | Add a timer to the HUD (`addText`, labeled "Time: ..."), best time via `storage` (src/storage.js) | Low |
| **Daily challenge** | Seed your random picks with the date, so everyone gets the same run that day | Medium |
| **Hard mode** | A multiplier object in `config.js` (enemy speed, hp, fewer pickups) read by the same scenes | Low |
| **Level select** | A new `LevelSelectScene.js`: panels from `addPanel`, saved "unlocked up to" via `storage` (src/storage.js) | Medium |
| **Local 2-player** | Only if you planned it in the GDD; it touches input, camera, and win rules | High |

Rules for adding a scene: one scene per file, class name = file name = scene key, register it in `src/main.js`, start it with explicit data, and add a way back to the menu. Test the full loop menu -> mode -> game over -> menu every time.

## 9. Keep the "Chunky Flat Toy" look as you grow

The fastest way for a game to look cheap is mixed art. Bake these into your prompts (or just say "follow THEME.md"):

- **Colors only from `PALETTE`** (16 names, no new hex values). New thing, new job? Use the role color: red danger, gold money/reward, cyan/blue player/friendly/slow, green heal/poison, purple magic/rare.
- **3 px `ink` outline** (`OUTLINE`) on every actor, pickup, and panel; one white highlight at 40-60% alpha; big eyes on characters.
- **Text via `addText()`**, panels via `addPanel()`. Don't let the AI create raw `this.add.text`.
- **New backgrounds stay muted**; actors stay bright. A new world theme = a new pair of `bg-far` / `bg-near` draw functions with muted palette colors.
- **Status effects are colored rings**: blue slow, green poison, purple magic.
- **One more review check:** screenshot the game. If a new thing doesn't pop against the background, make the background quieter, not the thing louder.

## 10. Balance, without math degrees

Most of this is playtesting. These are rules of thumb, not measured results:

- **Change one number at a time.** Then play. If you change three, you'll never know which one fixed it.
- **Keep all numbers in one place** (`config.js`, `settings.js`, `economy.js`). Balance sessions are then "edit values, reload".
- **Find the lever that scales everything.** In Core Keepers it is `WAVES.hpGrowth`, then `ECONOMY.startGold`. Every genre has one: enemy speed ramp (runner), cost growth (idle), enemies per room (roguelite). Tune that first.
- **Make a throwaway cheat to reach late content fast**: a debug key that jumps to level N or wave N. Ask the AI for it, and remove it before shipping.
- **Compare against a baseline.** Before adding content, note how far a typical run goes (rooms, waves, distance). After, check it hasn't jumped or collapsed.
- **Ask the AI for a balance table, not a verdict.** The kit's optional Tower Defense P15 writes `scripts/balance.mjs`, which prints DPS, DPS per gold, and wave totals. You can ask for the same for any genre: "write a script that prints each item's numbers side by side. Don't change game code."
- **Watch for dominant strategies.** If every winning run uses the same weapon, nerf that one or give the others a niche.
- **Reference points from the kit.** Core Keepers' ship check (in `PROMPTS.md`) records what its automated bot runs produced with the shipped numbers (weak player loses at wave 10, average at 18-19, good player wins). If your additions move those results a lot, retune `WAVES.hpGrowth` first. Your own game needs its own reference runs; write yours down.

## 11. The playtest loop for every addition

1. **Isolate.** Create a tiny test level, room, or wave with just the new content.
2. **Play it for two minutes.** Does it read? Is it clear what it is and what to do? Is it fair?
3. **Check the console (F12).** Red errors mean stop and fix.
4. **Play the normal game once** to make sure nothing else changed.
5. **Watch someone else.** Silence and don't explain. Where they die or get confused is your next prompt.
6. **Commit** with a message naming the addition. Remove the test level only after committing.

A short list to keep in your notes: *Is the new thing named on screen? Does it use the theme colors? Does restart reset it? Do old objects get destroyed? Does `npm run build` still pass?*

## 12. Example prompts by genre

Paste Prompt 0 from `PROMPTS.md` first so the AI knows your project. Then use these. Text in `<angle brackets>` is yours. Do them one at a time, testing between.

### Platformer (starter as-is)

**Add a level**
```
Add one new level to src/levels.js (create it from the arrays at the top of GameScene.js first if it doesn't exist; keep level 1 identical). Level 2 uses the same fields as level 1, has at least one gap I can still clear with the current jump, and ends at the flag. Do not add new enemy kinds. Only change src/levels.js, GameScene.js, MenuScene.js and GameOverScene.js, and start every new run with explicit data { levelIndex: 0, score: 0 }. Tell me how to test the full path menu -> level 1 -> level 2 -> win.
```

**Add an enemy kind**
```
Add a "jumper" enemy. Draw function in textures.js (a red triangle with big eyes, outline and highlight per THEME.md, 2 frames), registered with save() and an animation in BootScene. Add it to an ENEMY_TYPES table in config.js (patrol distance, duration) and let a level row choose its kind. Add an INFO name: "Jumper: stomp or dodge". Use it in level 2 only, once. Don't change other enemies.
```

**Add a pickup**
```
Add a purple "Spring Shoes" pickup that doubles jump height for 8 seconds. One draw function (purple, THEME.md), one entry in config.js for the duration and multiplier, INFO name "Spring Shoes: high jump (8 s)", a tag on the first one on screen, a purple burst when collected, and a HUD label while it's active. Reset the effect in create().
```

### Top-down roguelite

**Add an enemy**
```
Add a "dasher" enemy: a red triangle that pauses for 0.6 s, then dashes toward where the player was, then recovers. Put its hp, speed, pause, and dash numbers in an ENEMY_TYPES table in config.js. Wave size and position logic stay as they are; the room spawner picks a type from a list of {type, minRoom} so the dasher appears from room 3. INFO name: "Dasher: dodge the rush". Only change textures.js, config.js, the enemy file, and the room spawner.
```

**Add upgrade cards**
```
Add two new cards to the upgrade pool (data only, no new systems): "Piercing Shots" (bullets pass through one enemy) and "Quick Feet" (+10% move speed, max +30% total). Each card shows its name and one-line effect, rare cards have a purple border. Put the cap in config.js. Don't change how cards are offered.
```

**Add a room type**
```
Add a "treasure room" type: no enemies, three gold coins worth <N> score each, and a door that is already open. Every 4th room is a treasure room after room 3. Label it with a banner: "Treasure room: grab the coins". Keep the boss-room rule from earlier unchanged.
```

### Idle / clicker

**Add a generator**
```
Add one more generator to the data table in src/economy.js: "<Name>", <coins/s> per second, base cost <cost>, same 1.15x cost scaling as the others. Do not change any other row or any formula. The shop shows it automatically with its one-line description built from its numbers, and the tooltip works. Use only data, no new code paths.
```

**Add prestige**
```
Add a prestige button that appears once total coins earned reaches <threshold>. Pressing it resets coins and generators, and gives permanent "stars" (purple, magic/rare) that add +<N>% to all income each. Save stars with the `storage` helper (src/storage.js) using a key in STORAGE_KEYS. Show stars in the HUD with a label. Put every number in economy.js.
```

**Add an achievement**
```
Add 3 achievements as a data list in economy.js ({ name, text, check }) shown in a small panel: "First Helper", "100 clicks", "1,000 coins". When one unlocks, show a banner and save it in localStorage. Don't change income math.
```

### Endless runner

**Add an obstacle**
```
Add a "flyer" obstacle: a red diamond that moves left at the world speed at jump-over-or-duck height. Draw it in textures.js (THEME.md: diamond = flying), add it to an obstacle table in config.js (create one if there isn't one yet) with its spawn weight, and make it unlock after <N> meters. INFO tag on the first one: "Flyer: duck!". Keep the spacing rule that guarantees a clear jump between obstacles.
```

**Add a pickup**
```
Add a purple "Shield" pickup that absorbs one hit (the obstacle disappears instead of ending the run). It appears at most once every <N> meters. Show a blue ring around the player while active and a HUD label "Shield: ready". Put the spawn gap in config.js.
```

**Add a biome**
```
Add a second background theme after <N> meters: new bg-far and bg-near draw functions in textures.js using muted palette colors only, cross-faded over 2 seconds. Obstacles and the player must stay clearly brighter than the background.
```

### Puzzle (Sokoban-style)

**Add levels**
```
Add 3 levels to src/levels.js using the same characters as the existing levels ('#', '.', 'P', 'B', 'T'). Each must be solvable, smaller than 10x8, and teach one idea: <idea 1>, <idea 2>, <idea 3>. Also add a dev-only check that logs an error if a level has a different number of boxes and targets, or no player. Don't touch rendering.
```

**Add a tile type**
```
Add a "one-way floor" tile (character '>'): the player and boxes can enter it only moving right. Draw it in textures.js (slate with a gold arrow, THEME.md), parse it in levels.js, add it to INFO, and make undo still work with it. Add one level that uses it.
```

### Tower defense (Core Keepers)

**Add an enemy**
```
Add one enemy "<name>" to ENEMIES in settings.js: hp <n>, speed <n>, size <n>, shape '<shape not yet used for this role>', gold <n>, and its name + one-line text (8 words or fewer). No new code unless the behavior needs it; if it does, list the exact change first. Add its unlock wave to WAVES.unlock and a one-line tip on its first appearance. Run scripts/balance.mjs before and after and show me the difference.
```

**Add a tower**
```
Add one tower "<name>" to TOWERS in settings.js (cost, color by damage type from THEME.md, shape, role, desc, damage, rate, range, hitsFlyers) and one case in drawTowerIcon(). It must have a clear weakness: <weakness>. Do not change other towers. Test: it appears in the radial menu with its info card, and fires correctly.
```

**Add waves or a map**
```
Raise WAVES.total from 20 to <N>, and add one boss wave to bossWaves. Do not change hpGrowth. Then write down (don't apply) three number changes in settings.js you'd try if the extra waves are too easy. Add a second map as a new file with its own PATH and PADS in the same format as map.js, and a way to pick it from the menu.
```

## 13. Content checklist (copy this)

For every new thing you add:

- [ ] One prompt, one addition, committed before and after
- [ ] A row in a table (levels, enemies, towers, items, cards), not new code in five places
- [ ] A draw function in the Chunky Flat Toy style, palette colors only
- [ ] A name and one-line description on screen (`INFO`)
- [ ] Played alone first, then in the normal game
- [ ] Console clean, restart works, `npm run build` passes
- [ ] Balance changed one number at a time, noted in your commit message

And finally: **content is easy to add and hard to finish.** Pick a number (three levels, two new enemies, one mode), hit it, publish with `PUBLISH.md`, and ask your players what they want next.
