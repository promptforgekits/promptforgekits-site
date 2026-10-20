# Prompt Playbook

Copy-paste prompt sequences for six genres. Each genre has a kickoff prompt (Prompt 0) plus 10 numbered prompts (Tower Defense has 13, plus 2 optional). Each sequence turns the starter into a different game, one small, testable step at a time.

## How to use this playbook

1. Open the `starter/` folder in your AI tool (Cursor, Claude Code, Windsurf, Copilot). Most tools pick up the matching rules file (`.cursorrules`, `CLAUDE.md`, or `AGENTS.md`) automatically; if yours doesn't, paste `AGENTS.md` as your first message.
   *Lovable / Bolt users:* see the note in the Quick Start, and paste `AGENTS.md` as your first message.
2. Run `npm run dev` and keep the game open in a browser tab.
3. Paste **one prompt at a time**. Do not combine prompts.
4. After each prompt, do the **Test** checkpoint. If it passes, commit:
   `git add -A && git commit -m "step N works"`
5. If it fails, use `FIX-LOOP.md`. Three tries, then roll back.

Text in `<angle brackets>` is yours to customize. Prompt 0 is the same for every genre:

> **Prompt 0 (kickoff):**
> ```
> Read AGENTS.md and the files in src/. Summarize the architecture in 5 bullets. Then here is my game design doc:
> <paste your filled-in GDD.md>
> Don't write code yet. Tell me which existing files we'll keep, change, or replace for this game.
> ```
> **Test:** The summary mentions the 3 scenes and config.js. The plan sounds right to you.

> **Prompt 0b (controls screen, optional check):** the starter already shows a **HOW TO PLAY** panel the first time you press Play (keyboard, mouse and touch rows, a big START button, Space / Enter / tap also work). The first prompt of each genre below tells the AI to rewrite its text. If you ever lose it, paste this:
> ```
> Add a HowToScene (src/scenes/HowToScene.js) shown right after the player first presses Play in MenuScene, before any gameplay. Toy look (addPanel, addText, PALETTE only), title "HOW TO PLAY", three rows KEYBOARD / MOUSE / TOUCH read from a HOWTO object in config.js ({ keyboard, mouse, touch }; say "Not used" or "Needs a keyboard" honestly), a large green START button (at least 44 px tall), and Space, Enter or a tap anywhere also start the game (ignore input for the first 300 ms so the Play press does not skip it). Register it in main.js. Use a helper startWithHowTo(scene, 'GameScene', data) in the menu; once seen this session (registry flag) it goes straight into the game. The game over screen restarts directly, without the panel.
> ```
> **Test:** Press Play: the panel shows first, START begins the game, and a second run in the same session skips it.

> **Prompt 0c (Options menu + sound switches, optional check):** the starter already has an **OPTIONS** panel: an OPTIONS button on the menu and a small gear during play (or press O) open it, with two separate switches, **MUSIC ON/OFF** and **SOUND FX ON/OFF**, both ON by default and saved. All sound goes through `src/audio.js`, which also waits for the player's first click / tap / key before making any sound (browsers, especially iPhone Safari, block audio until then). If you ever lose it, paste this:
> ```
> Add an OptionsScene (src/scenes/OptionsScene.js) that opens on top of the current scene and pauses it: from an OPTIONS button on the MenuScene and from a small gear button in a free corner of GameScene (the O key opens it too). Chunky toy look (PALETTE only, OUTLINE ink outlines, big readable labels): title "OPTIONS", two rows MUSIC and SOUND FX, each with a big green ON / red OFF toggle button (at least 44 px tall), and a BACK button (Esc / Enter also close it and resume the scene below). Clicks on these buttons must not reach the scene below (event.stopPropagation()). Register it in main.js. Keep the settings in src/audio.js: isMusicOn / isSfxOn / toggleMusic / toggleSfx, both default ON, saved ONLY through src/storage.js. audio.js creates ONE Web Audio context inside the player's first pointerdown / pointerup / touchend / keydown / click (and resumes it there), never earlier; beep(freq, seconds, { type, vol, slideTo, delay }) plays a sound effect only when Sound FX is ON; playMusic(key) plays music only when Music is ON and, if asked before the first click/tap/key, starts right after it. Every sound in the game must go through audio.js (no other new AudioContext). M in GameScene toggles Sound FX.
> ```
> **Test:** On the menu click OPTIONS: the panel opens and the game does not start. Switch SOUND FX to OFF, close, play: no sound effects. Refresh the page: OPTIONS still shows OFF. Turn it ON from the gear during play: sounds come back, and play resumes where it was.

---

## 1. Platformer

Builds on the starter as-is. Goal: a 3-level platformer with good jump feel.

**P1. Better jump feel**
```
Improve jump feel in GameScene: add coyote time (100 ms after leaving a ledge you can still jump) and jump buffering (pressing jump up to 100 ms before landing still jumps). Put both values in config.js.
Also rewrite HOWTO in config.js (the keyboard / mouse / touch lines) so they describe this game's real controls. The HOW TO PLAY panel (src/scenes/HowToScene.js, shown after the first Play press) must stay and still appear before play.
```
Test: Run off a ledge and press jump slightly late. You still jump. After you press Play, the HOW TO PLAY panel lists this game's keyboard, mouse and touch controls, and START (or Space/Enter/tap) begins play.

**P2. Variable jump height**
```
Make jump height depend on how long jump is held: if the jump key is released while moving upward, cut upward velocity in half. Add the multiplier to config.js.
```
Test: Tap = small hop, hold = full jump.

**P3. Moving platforms**
```
Add moving platforms that slide horizontally between two points. The player must ride along when standing on one. Add two of them to the current level, defined in a MOVING_PLATFORMS array at the top of GameScene.js. Show a name above the first one the first time it is on screen ("Moving platform: ride it"). Keep the strings in an INFO object in config.js and draw them with the addTag / addBanner / addLegend / addTooltip helpers from ui.js.
```
Test: Stand on a moving platform. You move with it and don't slide off. The first one is labeled.

**P4. Stomp enemies**
```
Let the player defeat an enemy by landing on it from above (player falling and above the enemy). The enemy disappears, the player bounces up, and score increases by 25. Touching it from the side still ends the game. The starter keeps walkers and spikes in one hazards group: only walkers can be stomped, spikes still end the run from every side (also when landing on them). Name the first enemy on screen ("Enemy: stomp it +25", text in INFO in config.js).
```
Test: Jump on an enemy from above = it vanishes and you bounce. Walk into one = game over. Spikes still hurt from any side. The enemy has a name above it.

**P5. Lives and respawn**
```
Give the player 3 lives. Losing a life respawns them at the level start (or last checkpoint later) instead of ending the game. Show lives in the HUD with a label ("Lives: 3"). Game over only at 0 lives.
```
Test: Die twice: you respawn and the HUD shows 1 life left. Die a third time: game over screen.

**P6. Checkpoints**
```
Add a checkpoint object (a small flag drawn in textures.js). Touching it saves it as the respawn point and tints it green. Add one to the middle of the level and name it the first time it is on screen ("Checkpoint: respawn here").
```
Test: Touch the checkpoint, die, respawn there.

**P7. Multiple levels**
```
Move level data (platforms, coins, enemies, goal, checkpoints) out of GameScene into src/levels.js as an array of level objects. Reaching the goal loads the next level, keeping score and lives. After the last level, go to GameOverScene with won: true. Create 3 levels of increasing difficulty. Show a one-line goal banner ("Reach the flag!", text in INFO in config.js) when each level starts. Restarting from GameOverScene or the menu must start a fresh run at level 1 with score 0 and full lives: always pass that data explicitly, e.g. `this.scene.start('GameScene', { levelIndex: 0, score: 0, lives: 3 })`, because scene.start() without data reuses the previous run's data.
```
Test: Beat level 1, level 2 loads with your score kept. Beating level 3 shows YOU WIN. Press Space there: you restart at level 1 with score 0.

**P8. Level indicator and transitions**
```
Show "Level N" in the HUD, and a short fade-out/fade-in camera transition between levels (about 300 ms each).
The goal overlap fires every frame while the player touches the flag, so start the transition only once: in the goal handler return early if a transitioning flag (e.g. this.isOver) is already set, then set it, call this.physics.pause(), and make update() return early while it is set. During the fade the player must not move, collect coins, lose a life (no pit or enemy deaths) or trigger the goal again. Register the fade-complete listener with this.cameras.main.once('camerafadeoutcomplete', ...) and load the next level only from there, passing levelIndex + 1, score and lives explicitly. The new level starts with this.cameras.main.fadeIn().
```
Test: Reach the flag: the screen fades out and back in, and the HUD goes from Level 1 to Level 2 (not Level 3), with your score and lives kept. Hold an arrow key while it fades: the player does not move and no life is lost.

**P9. Juice**
```
Add juice: small squash-and-stretch tween when the player lands, particle burst when collecting a coin, and a short camera shake when losing a life. Keep each effect subtle.
```
Test: All three effects visible; game still runs smoothly.

**P10. Sound**
```
Add simple sound effects for jump, coin, stomp, and death as short beeps (no audio files). Put them in src/sfx.js and make every sound with beep() from src/audio.js (never a new AudioContext), so the OPTIONS Sound FX switch and the first-click audio unlock work. The M key toggles Sound FX during gameplay (toggleSfx() from audio.js; GameScene only, GameOverScene keeps M for "menu").
```
Test: You hear each sound (also on a phone). M or the OPTIONS Sound FX switch turns them off, and that survives a page refresh.

**Ship check:** Play all levels start to finish. Then follow PUBLISH.md.

---

## 2. Top-Down Roguelite

Replaces the platformer with a top-down arena: rooms, enemies, upgrades between rooms.

**P1. Top-down movement**
```
Convert GameScene to top-down: turn gravity off for this scene, remove platforms, coins, enemies and goal. The player moves in 8 directions with WASD/arrows at constant speed (normalize diagonals). Add a rectangular room with walls around the screen edges the player collides with. Keep the menu and game over scenes, but change MenuScene's title to my game name: <name> (not "TINY PLATFORMER") and its controls line to the new controls.
Also rewrite HOWTO in config.js (the keyboard / mouse / touch lines) so they describe this game's real controls. The HOW TO PLAY panel (src/scenes/HowToScene.js, shown after the first Play press) must stay and still appear before play.
```
Test: You move in all 8 directions, diagonals aren't faster, walls block you. After you press Play, the HOW TO PLAY panel lists this game's keyboard, mouse and touch controls, and START (or Space/Enter/tap) begins play.

**P2. Shooting**
```
Let the player shoot bullets toward the mouse pointer on click (hold to auto-fire at a fire rate from config.js). Bullets are small circles that are destroyed on hitting walls or after 1 second.
```
Test: Click shoots toward the cursor; holding fires repeatedly; bullets don't pile up forever.

**P3. Chaser enemy**
```
Add one enemy (spawned at a fixed spot away from the player for now) that walks toward the player. Bullets damage it (3 HP); it flashes white when hit and dies at 0 HP. Touching the player deals 1 damage. Player has 5 HP shown in the HUD; at 0, go to GameOverScene. Give the player 1 second of invulnerability (blinking) after being hit. Show HP as "HP: 5/5" and name the first enemy on screen ("Chaser: touch = -1 HP"). Keep the strings in an INFO object in config.js and draw them with the addTag / addBanner / addLegend / addTooltip helpers from ui.js.
```
Test: Shoot an enemy 3 times to kill it. Getting touched lowers HP once, not every frame. The enemy is named and the HUD says "HP: 5/5".

**P4. Waves in a room**
```
Each room spawns a wave of 4 enemies (the next prompt makes this grow) at random positions at least 200px away from the player. When all are dead, show "Room cleared!" and open a door (a gap in the right wall). In room 1 show a one-line goal banner ("Kill every enemy, then walk through the gold door") and label the door ("Door: opens when room is clear").
```
Test: Kill all enemies, door opens; the door is closed while enemies are alive.

**P5. Room progression**
```
Walking through the open door loads a new room with a bigger wave (room number * 2 + 2 enemies, but never more than 14 on screen; the spare budget turns into elites in P6). The player's current HP carries over to the next room; pass it in the scene data. Show the room number in the HUD with labels ("Room: 2   Cleared: 1"). Score = rooms cleared. Starting a new run from GameOverScene or the menu must pass fresh data explicitly (room 1, full HP), because scene.start() without data reuses the old data.

Put all difficulty scaling in one pure file src/balance.js (no Phaser imports) with functions of the room number: hpMult(room) = 1 + 0.14 * (room - 3) + 0.003 * (room - 3)^2 for rooms after 3 (1.0 up to room 3, so rooms 1-3 stay as friendly as now), speedMult(room) = min(1.4, 1 + 0.02 * (room - 1)), and wavePlan(room) returning one spec {type, elite, hp, speed, dmg} per enemy. Read the numbers from a BALANCE object in config.js. Every enemy you spawn from now on takes its HP and speed from wavePlan(), never from a hard-coded number.```
```
Test: Room 2 has more enemies than room 1; the HUD counter goes up. In the console `wavePlan(1)` is 4 chasers with 3 HP; `wavePlan(12)` has 14 entries with HP above 10.

**P6. Second enemy type**
```
Add a shooter enemy that keeps its distance and fires slow bullets at the player every 2 seconds. Mix it into waves starting from room 3 (every 3rd slot of wavePlan). Name the first shooter on screen ("Shooter: dodge its shots"). Keep up with the player: its fire interval shrinks by 60 ms per room after room 3 (never below 1100 ms) and its bullet speed grows 4 per room (max 240). Also add two more enemy types to wavePlan so late rooms are not just more chasers: a Dasher (red triangle, 2 HP; walks, pauses 0.6 s flashing white, dashes at where you were, recovers; from room 4; name "Dasher: dodge the rush") and a Brute (red square, scaled 1.7x, 9 HP, slow, touch = -2 HP; from room 8; name "Brute: slow, tough, -2 HP"). From room 7, spare enemy budget (room*2+2 minus the 14 cap) makes Elites: a normal enemy with 2.5x HP, 1.15x speed, 1.3x size, purple tint, touch = -2 HP, name "Elite: purple = tougher, -2 HP"; from room 10 there is always at least one more elite every 3rd room.
```
Test: From room 3, some enemies shoot at you; their bullets damage you.

**P7. Upgrade choice**
```
After clearing a room, pause and show 3 random upgrade cards (e.g. +20% fire rate, +1 max HP and heal, +15% move speed, bullets pierce one enemy, +1 damage). Each card shows a short name and a one-line description ("Rapid Fire: Shoot 20% faster"), both kept in an UPGRADE_TEXT object in config.js. Clicking a card only SELECTS it (thick gold frame, a green "SELECTED" tag, the others dim); click another card to change your mind. A Confirm button below the cards (greyed out and saying "Select a card first" until a card is selected, then "Confirm: <card name>") applies the selected card and resumes. Keyboard: 1/2/3 or Left/Right arrows select, Enter or Space confirms; Confirm does nothing while nothing is selected. While the cards are open, set a `choosing` flag and skip player shooting so the card click does not also fire a bullet. Put upgrade definitions in src/upgrades.js. Power must not run away: every card has a pick limit in BALANCE.caps (Rapid Fire 6, Quick Feet 3, Piercing Shots 2, Heavy Rounds 3, Tough Heart 4) and a card at its limit is no longer offered; Rapid Fire has diminishing returns (pick n multiplies the fire rate by 1 + 0.2 * 0.9^n) and never goes below 100 ms between shots; Quick Feet adds 15% of the BASE speed per pick (additive, max +45%, never multiplicative); Tough Heart gives +1 max HP and heals only 2 (never a full heal); add a sixth card "Patch Up: Heal 3 HP" that is only offered while you are hurt. Count picks in stats.counts. Show "Upgrades: N" in the HUD, with a hover tooltip listing the upgrades taken. Keep the player's stats (max HP, fire rate, speed, damage, pierce, upgrades taken) in one `stats` object that is passed to the next room in the scene data, so upgrades persist between rooms; a new run starts from the default stats.
```
Test: Every card has a name and a one-line description. Clicking a card highlights it but "Upgrades: 0" stays 0 until you press Confirm; clicking another card moves the highlight; Enter confirms too. Pick "+fire rate" and you visibly shoot faster; hovering "Upgrades: 1" lists it. After 3 Heavy Rounds picks that card no longer appears.

**P8. Run summary**
```
Pass rooms cleared and upgrades taken to GameOverScene and display them. Save best rooms cleared as the high score.
```
Test: Die; the summary lists your upgrades and rooms reached.

**P9. Boss room**
```
Every 5th room is a boss room: one large enemy and a health bar at the top of the screen, which alternates between chasing and firing a ring of bullets. Label the health bar "BOSS" and name the boss the first time it is on screen ("BOSS: dodge the rings, it changes at half HP"). Bosses get tougher every time: boss number N (room 5 = 1, room 10 = 2, ...) has 40 * (1 + 3.5 * (N - 1)) HP (40, 180, 320, 460), ring size 8 + 2 * (N - 1) bullets (max 16) and 8% more speed per boss, from bossStats(room) in balance.js. Give it three phases from bossPhase(hpRatio): above 66% HP chase + ring; 33-66% it also fires a 3-bullet aimed fan, moves 10% faster and summons 2 chasers once; below 33% it is ENRAGED (45% faster, shorter phases, a second ring offset by half a gap, a 5-bullet fan). Show "PHASE 2: it summons helpers!" / "ENRAGED!" text when a phase starts, draw two tick marks on the health bar at 33% and 66%, kill any helpers when the boss dies, and heal the player 3 HP for beating a boss.
```
Test: Room 5 has the boss with a health bar; beating it opens the door. In the console set `boss.hp` to half its max: the phase text appears and two helpers spawn. Room 10's boss has 180 HP and a ring of 10.

**P10. Juice**
```
Add juice: screen shake when the player is hit, small knockback on enemies when shot (read the bullet's velocity before destroying the bullet), particle burst on enemy death, and a brief hit-stop (50 ms pause) on boss hits.
```
Test: Combat feels punchier; no slowdowns over a few rooms.

**Ship check:** Do a full run to room 6+ without errors. Then check the difficulty curve: write a small headless script (plain Node, imports balance.js and upgrades.js, no Phaser) that simulates a bot clearing rooms 1-20 and prints, per room, the clear time and the damage taken. Rooms 1-4 should cost about 0 HP, damage taken should climb from room 6, and the room 5/10/15/20 bosses should each last longer than the one before. If late rooms stay as easy as early ones, raise BALANCE.hpPerRoom first.

---

## 3. Idle / Clicker

Replaces gameplay with a clicker economy. No physics needed.

**P1. Click to earn**
```
Replace GameScene with an idle clicker: a big circle in the center that gives +1 coin when clicked, with a small scale "bounce" tween on click. Show the coin total at the top, labeled ("Coins: 0"), and a bobbing "Click the coin!" hint above the circle until the first click. Remove the platformer code and the game over trigger for now.
Also rewrite HOWTO in config.js (the keyboard / mouse / touch lines) so they describe this game's real controls. The HOW TO PLAY panel (src/scenes/HowToScene.js, shown after the first Play press) must stay and still appear before play.
```
Test: Each click adds exactly 1 and the circle bounces. After you press Play, the HOW TO PLAY panel lists this game's keyboard, mouse and touch controls, and START (or Space/Enter/tap) begins play.

**P2. Floating numbers**
```
When the circle is clicked, spawn a "+1" text at the pointer that floats up and fades out over 600 ms, then is destroyed.
```
Test: Spam-click: the numbers float and vanish; the game doesn't slow down.

**P3. First upgrade**
```
Add a shop panel on the right with one upgrade: "Better Click" (+1 coin per click). Cost starts at 10 and multiplies by 1.15 per purchase. Button is greyed out when unaffordable. Put upgrade data in src/economy.js. Each shop row shows the name, a one-line description built from its numbers ("+1 coin per click"), the cost and how many you own; hovering a row shows a tooltip (what you own, what it gives now). Keep the strings in an INFO object in config.js and draw them with the addTag / addBanner / addLegend / addTooltip helpers from ui.js.
```
Test: Buy it at 10 coins; clicks now give 2; next cost is 11 or 12.

**P4. Passive income**
```
Add generator upgrades that produce coins per second automatically: "Helper" (0.5/s, cost 25), "Machine" (4/s, cost 250), "Factory" (30/s, cost 3000), each with 1.15x cost scaling. Show coins per second in the HUD. Update income with delta time, not per frame. Label the HUD number ("2.0 coins/s") and give each generator a one-line description ("+0.5 coins/s each").
```
Test: Buy a Helper; coins rise ~0.5/s even without clicking.

**P5. Number formatting**
```
Format large numbers: plain with commas below 10,000 (1,234), then 12.3K, 4.56M, 7.89B, etc. Use it everywhere numbers are shown. Put the formatter in src/format.js.
```
Test: Ask the AI for a temporary debug key that adds 5,000,000 coins; press it and the display shows "5.00M".

**P6. Save and load**
```
Save the full game state every 5 seconds and on page close. Load it on startup. Use only the `storage` helper from src/storage.js (it wraps localStorage in try/catch with an in-memory fallback, so the game still runs in private browsing and sandboxed iframes like Poki/CrazyGames); never call localStorage directly, and parse saved JSON inside try/catch with defaults. Add a "Reset save" button in the menu with a confirm step. The starter menu starts the game on a click anywhere, so make only the start text (and the reset button) clickable, or clicking Reset will also start the game.
```
Test: Earn coins, refresh the page; your progress is still there.

**P7. Offline earnings**
```
When the game loads, calculate time since the last save (cap at 8 hours) and grant coins per second * seconds away * 0.5. Show a popup "While you were away you earned X".
```
Test: Note your coins, close the tab for 1 minute, reopen; you get a popup with ~30x your /s.

**P8. Milestones**
```
Add milestones: owning 10, 25, 50 of a generator doubles its output. Show the next milestone on each shop button ("next x2 at 10") and explain it in that row's tooltip ("Owning 10 doubles its output").
```
Test: Reach 10 Helpers and your /s jumps for Helpers.

**P9. Prestige**
```
Track total coins earned (every coin gained from clicks, generators and offline earnings; spending does not lower it) and save it. Add a Prestige button that unlocks at 1M total coins earned. Prestiging resets coins and upgrades but grants "Stars" = floor(sqrt(totalEarned / 1M)); each Star gives +10% to all income (clicks and generators) permanently. Explain it in a confirm popup. Also show the goal in the shop footer ("Prestige: 120K / 1M earned", then "Prestige is ready!") with a tooltip that explains Stars, and label the HUD "Stars: N".
```
Test: Use the debug key to pass 1M total earned, then prestige; you keep Stars and income is boosted.

**P10. Polish**
```
Add polish: generators pulse when they produce, the shop button flashes when a new upgrade becomes affordable, and a soft click sound (beep() from src/audio.js, so the OPTIONS Sound FX switch mutes it). Change MenuScene's title to my game name: <name>. Make the menu say what to do: a one-line goal plus an icon + name legend for the big coin, coins and Stars.
```
Test: It feels alive while idle. Remove any debug keys before publishing.

**Ship check:** Leave it running 5 minutes; refresh; offline popup and save both work.

---

## 4. Endless Runner

Auto-running, jump-to-survive, score = distance.

**P1. Auto-run setup**
```
Convert GameScene to an endless runner: the player stays at x=150 and the ground scrolls left (use a long TileSprite floor with tilePositionX increasing). Remove the level arrays. Space/Up/click jumps. Keep gravity. Change MenuScene's title and controls line, and add a one-line goal ("Run as far as you can. Hit nothing!").
Also rewrite HOWTO in config.js (the keyboard / mouse / touch lines) so they describe this game's real controls. The HOW TO PLAY panel (src/scenes/HowToScene.js, shown after the first Play press) must stay and still appear before play.
```
Test: The ground scrolls, the player runs in place and can jump. After you press Play, the HOW TO PLAY panel lists this game's keyboard, mouse and touch controls, and START (or Space/Enter/tap) begins play.

**P2. Obstacles**
```
Spawn obstacles (spikes from textures.js) off the right edge at random intervals of 1-2.2 seconds; they move left at the world speed and are destroyed off-screen. Touching one ends the game. Name the first spike on screen ("Spike: jump!") with an addTag label. Keep the strings in an INFO object in config.js and draw them with the addTag / addBanner / addLegend / addTooltip helpers from ui.js.
```
Test: Obstacles come steadily; hitting one goes to game over. Check with console that old obstacles get destroyed.

**P3. Distance score**
```
Score = distance in meters (world speed * time / 50). Show it in the HUD as "Distance: N m"; pass it to GameOverScene and keep the high score logic.
```
Test: Score climbs smoothly; game over shows it and Best updates.

**P4. Speed ramp**
```
Increase world speed by 5% every 5 seconds up to a max in config.js. Spawn intervals shrink slightly as speed rises so spacing stays fair.
```
Test: After 30 seconds it's noticeably faster but still jumpable.

**P5. Double jump**
```
Allow one extra jump in the air, triggered on key press (a new press, e.g. Phaser.Input.Keyboard.JustDown or a keydown event), not while the key is held with isDown, or holding jump uses up the double jump instantly. Reset when landing. Show a small puff of particles on the second jump. Add "Jump again in the air to double jump" as a second line under the menu controls.
```
Test: You can jump twice, not three times.

**P6. Varied obstacles**
```
Add two more obstacle types: a tall wall (about 120 px: just taller than a single jump, which reaches about 117 px with the starter's values, so it needs a double jump; check the numbers in config.js) and a flying block at head height (must stay low / not jump). Pick randomly with weights, introducing the flying block after 200 m. Name each type the first time it appears ("Wall: double jump!", "Flyer: stay low!") and list all obstacles in an icon + name legend on the menu.
```
Test: All three types appear and each is passable.

**P7. Coins and pickups**
```
Spawn coin lines (3-5 coins in an arc) between obstacles. Coins add +5 to a separate coin counter. Every 10 coins grants a 3-second shield that absorbs one hit (shown as a circle around the player). Show the counter as "Coins: 3   (shield in 7)" and "SHIELD ON" while it lasts, and name the first coin arc ("Coin: 10 = shield").
```
Test: Collect 10 coins, get a shield, hit an obstacle and survive once.

**P8. Parallax background**
```
Add 2 parallax background layers (distant hills and clouds made from shapes) that scroll at 20% and 50% of world speed.
```
Test: Layers move at different speeds, giving depth.

**P9. Mobile controls**
```
Make it mobile-friendly: tap anywhere to jump, and make sure the canvas scales to fit portrait and landscape phones. Show "Tap to jump" on the menu when on a touch device.
```
Test: Open dev tools device mode (Ctrl+Shift+M) and play with clicks as taps.

**P10. Juice**
```
Add juice: dust particles while running, screen shake on death, a slow-motion (timeScale 0.3 for 400 ms) moment before the game over screen, and Web Audio beeps for jump and coin.
```
Test: Death feels dramatic, not abrupt.

**Ship check:** Play 5 runs; the difficulty curve feels fair.

---

## 5. Puzzle (Grid / Sokoban-style)

Grid-based, turn-based, with handcrafted levels.

**P1. Grid and player**
```
Convert GameScene to a grid puzzle: don't use physics bodies in this scene (set its gravity to 0). Draw a 10x8 grid of 48px tiles centered on screen. The player occupies one tile and moves one tile per key press (arrows/WASD) with a 100 ms tween. No diagonal moves.
Also rewrite HOWTO in config.js (the keyboard / mouse / touch lines) so they describe this game's real controls. The HOW TO PLAY panel (src/scenes/HowToScene.js, shown after the first Play press) must stay and still appear before play.
```
Test: One key press = exactly one tile, even if you hold the key. After you press Play, the HOW TO PLAY panel lists this game's keyboard, mouse and touch controls, and START (or Space/Enter/tap) begins play.

**P2. Levels as text**
```
Define levels as arrays of strings in src/levels.js using: '#' wall, '.' floor, 'P' player, 'B' box, 'T' target. Parse and render level 1, centered on screen (levels can be smaller than 10x8). The player can't walk into walls. On level 1 show a name above the player, a crate and a target ("You", "Crate: push it", "Target: crate goes here").
```
Test: Level 1 renders matching the strings; walls block movement.

**P3. Pushing boxes**
```
The player pushes a box when walking into it if the tile behind the box is floor or target. Boxes can't push other boxes or go into walls.
```
Test: Push a box; try pushing it into a wall and into another box: both blocked.

**P4. Win condition**
```
When every target has a box on it, show "Solved!" and load the next level after 1 second. Boxes on targets turn green. After the last level, go to GameOverScene with won: true. Add a small second level so this can be tested. Update the menu with a one-line goal ("Push every crate onto a target") and an icon + name legend: crate, target, green crate = done, you. Pass the level in the scene data (`{ levelIndex }`), and make the restart from GameOverScene and the menu pass `{ levelIndex: 0 }` explicitly, because scene.start() without data reuses the previous data.
```
Test: Solve level 1 and level 2 loads. After the last level, play again starts at level 1.

**P5. Undo and restart**
```
Add Undo (Z) that reverses the last move including box pushes, using a history stack of states. Add Restart (R) to reset the current level.
```
Test: Push a box, press Z: both player and box go back. R resets.

**P6. Move counter**
```
Count moves per level and show them in the HUD with labels ("Moves: 12   Best: 9"; Undo takes one move back). Save the best move count per level with the `storage` helper from src/storage.js (never raw localStorage) and show it.
```
Test: Solve a level; the best moves saves and shows on replay.

**P7. Level select**
```
Add a LevelSelectScene reachable from the menu with a button and the L key (the starter menu starts the game on any click, so make only the start text and this button clickable): a grid of level buttons, locked until the previous level is solved (progress saved with the `storage` helper). Show the best moves on solved levels. Locked buttons say "LOCKED" and a hint line says how to unlock the next one.
```
Test: Only level 1 is unlocked at first; solving it unlocks level 2 after a refresh.

**P8. More levels**
```
Design 8 more levels that teach one idea each, from very easy to tricky: corners trap boxes, two boxes, pushing order matters, etc. Make sure every level is solvable; list the solution move sequence for each in a comment. Write a small Node script (scripts/check-levels.mjs, not part of the game) that replays each listed solution against the level and reports any that don't end solved. Give every level a one-line hint shown under the HUD (a levelHints array in INFO in config.js), e.g. "Corners trap crates".
```
Test: Run `node scripts/check-levels.mjs`, then play every level yourself. Remove any that are impossible or boring.

**P9. Touch controls**
```
Add swipe controls for mobile (swipe direction = move; ignore short taps under ~24 px so a tap is not a move) and on-screen Undo/Restart buttons labeled with their keys ("UNDO (Z)", "RESTART (R)"). On each button's pointerdown, call event.stopPropagation() and clear any in-progress swipe so the button tap does not also register as a swipe move.
```
Test: In dev tools device mode, drag to move; tapping UNDO/RESTART undoes or resets without moving the player.

**P10. Juice**
```
Add juice: boxes squash slightly when pushed, a sparkle burst when a box lands on a target, a camera shake + "bonk" sound when bumping a wall, and a happy arpeggio on level solved (beep() from src/audio.js, so the OPTIONS Sound FX switch mutes them).
```
Test: Feedback for every action; nothing slows down undo.

**Ship check:** Solve all levels from a fresh save (clear site data).

---

## 6. Tower Defense: "Core Keepers"

Four towers with distinct roles, six shape-coded enemies, 20 waves, and two signature mechanics: **Recoverable Cores** (an enemy that reaches your vault steals one of your 8 cores and walks it back to the spawn gate; kill it and the core floats home) and **Overcharge** (3x fire rate on one tower, hotkey Q). 13 prompts, plus 2 optional ones. Every gameplay number lives in **one file, `src/settings.js`**, so you balance the game by editing numbers, not code. Each prompt quotes the numbers it needs; the values shown are the ones our bot-tested build shipped with.

**P1. Setup and the settings file**
```
Turn this starter into a tower defense game called "Core Keepers".
- config.js: GAME_WIDTH 960, GAME_HEIGHT 540, gravity 0. Keep PALETTE, OUTLINE, FONT.
- Remove the platformer level, player, coins, and parallax from GameScene (keep BootScene, MenuScene, GameOverScene, ui.js, textures.js). GameScene shows an empty olive screen for now.
- Create src/settings.js. It is the ONE place for every gameplay number from now on (towers, enemies, waves, economy, abilities); other files import from it and never hard-code a stat. Start it with: export const ECONOMY = { startGold: 100, startCores: 8 };
- textures.js: add and export drawShape(g, shape, x, y, size, fill) that draws a 'circle', 'triangle', 'square', 'diamond' or 'hexagon' of radius size in color fill, with the 3 px ink OUTLINE and one small white highlight at 45% alpha near the top-left (see THEME.md).
- MenuScene: title "CORE KEEPERS", instruction line "Click pads to build   Q: Overcharge". Replace the platformer sprites with three drawShape icons (cyan triangle, red circle, gold hexagon).
Do not change unrelated code; list what you changed.
Also rewrite HOWTO in config.js (the keyboard / mouse / touch lines) so they describe this game's real controls. The HOW TO PLAY panel (src/scenes/HowToScene.js, shown after the first Play press) must stay and still appear before play.
```
Test: the menu says CORE KEEPERS at 960x540; clicking starts an olive screen; the console has no errors. After you press Play, the HOW TO PLAY panel lists this game's keyboard, mouse and touch controls, and START (or Space/Enter/tap) begins play.

**P2. Path, vault, and build pads**
```
Create src/map.js exporting:
- PATH: waypoints from a spawn gate on the left edge to a core vault near the right edge, with 6-8 turns. Keep the road 40 px from the screen edges and out of the top 56 px (HUD).
- PADS: 10 build-pad centers, each 50-70 px from the road center and at least 60 px from each other, never on the road.
- SPAWN and VAULT (the first and last waypoint).
Draw in GameScene, below everything else: olive ground with a few muted oliveLight grass tufts; the road as a 48 px slateLight band with a 40 px cloud band on top (so it has a soft edge); each pad as a dashed slateLight circle (radius 24) on a slightly darker olive disc; the spawn as an ink/red gate; the vault as a big gold hexagon (drawShape) with a ring of small gold core dots (one per core, ECONOMY.startCores) that we will update later.
Do not change unrelated code; list what you changed.
```
Test: one clear road snakes from the gate to the vault; 10 dashed pads sit beside it; no pad touches the road.

**P3. First enemy and the game clock**
```
Add an Enemy class in src/enemy.js and ENEMIES in settings.js, starting with:
grunt: { hp: 40, speed: 55, size: 14, shape: 'circle' }
- Enemies move by distance along PATH (no physics bodies). Store dist and compute x,y from it.
- All gameplay logic runs in one method GameScene.tick(dt) where dt is milliseconds. update(time, delta) calls this.tick(delta * this.speed) unless this.paused (this.speed = 1 for now). Keep a scaled clock this.gameTime += dt and use it for every cooldown and spawn timer. Do NOT use this.time.now, this.time.delayedCall, or tweens for gameplay (they ignore our speed and pause); tweens are fine for pure visuals.
- Draw enemies with drawShape in red, size from settings, with two white eyes and ink pupils. Each enemy has a health bar that stays hidden until it first takes damage.
- For testing only: spawn a grunt every 1.5 s of game time. An enemy that reaches the vault is removed.
Do not change unrelated code; list what you changed.
```
Test: grunts walk the road smoothly from the gate to the vault and disappear there.

**P4. Radial build menu**
```
Add TOWERS to settings.js (more stats come later):
bolt: { name: 'Bolt', cost: 50, color: 'cyan', shape: 'triangle' }
mortar: { name: 'Mortar', cost: 100, color: 'gold', shape: 'circle' }
frost: { name: 'Frost', cost: 75, color: 'blue', shape: 'diamond' }
arc: { name: 'Arc', cost: 125, color: 'purple', shape: 'hexagon' }
and ECONOMY.costGrowth: 0.10. Also give every tower two text strings in settings.js (UI text lives there, not in code): role (one short line) and desc (one line), e.g. bolt role 'Fast single-target, hits flyers'; mortar 'Splash damage, ground only'; frost 'Slows enemies in range'; arc 'Chain damage, pierces armor'. Keep every line under 8 words where you can.
- In textures.js add drawTowerIcon(g, type, x, y, size, aim) so every tower reads at a glance in the Chunky Flat Toy style (same 3 px ink outline, one flat color per tower, drawn in code): Bolt = cyan square base, round turret dome with a gold lightning mark and a long barrel (aim turns the barrel); Mortar = gold squat wheeled body, fat slate tube pointing up, round dark shell on top; Frost = blue six-armed snowflake with white tips inside a blue ring; Arc = purple tesla coil (stacked tapered mast, glowing ball on top, two gold spark zigzags). Use this one function for the menu, the map, and the info card.
- Clicking an empty pad opens a radial menu: 4 round icons (radius 26, slateDark with ink outline, drawTowerIcon size 15) placed around the pad, with the tower name and price under each ("Bolt 50") in gold (affordable) or slate (not).
- Hovering or selecting an icon shows an info card (panel in a free screen corner, away from the pad) with: name and price, the role line, the desc line, and stats read from settings.js (the tower icon again, Damage, Rate in shots/s, Range, plus Splash or Chains where they exist; Frost shows Aura and Slow). The selected icon's card stays open. Put the hint "Click again to build" at the bottom of the card (UI_TEXT in settings.js).
- First click on an icon selects it (gold ring + the text "Click again"); a second click on the same icon builds the tower on that pad, takes the gold, and closes the menu. Clicking anywhere else closes the menu.
- Price = base cost x (1 + costGrowth x towersBuilt), rounded to the nearest 5. towersBuilt counts every tower ever built this run.
- Tower look: drawTowerIcon, size 18, on the pad.
- HUD top-left: a gold coin icon and the gold number (size 26). Clicks on UI objects must not also count as map clicks (check the objects under the pointer before handling a map click).
Do not change unrelated code; list what you changed.
```
Test: hover each icon: the card shows its name, role and stats; the four icons look different even when small. With 100 gold, build a Bolt (50). The next Bolt shows 55. Click empty grass: the menu closes and nothing is built.

**P5. Bolt and Mortar shoot**
```
Add combat stats to settings.js:
bolt: damage 8, rate 0.4 (seconds between shots), range 130, projectileSpeed 520, hitsFlyers true
mortar: damage 20, rate 1.5, range 150, splash 40, projectileSpeed 260, hitsFlyers false
- Each tower has targetMode 'first' (the enemy furthest along the path, default) or 'nearest'. It only looks at enemies inside its range.
- Bolt fires a small cyan dart that homes on its target and vanishes if the target dies. Mortar lobs a gold shell to where the target was when it fired; on landing it damages every ground enemy within splash.
- Cooldowns use this.gameTime. Projectiles move in tick(dt).
- Killing an enemy gives its gold: add gold: 2 to grunt for now.
- Projectiles use their tower's color. The Bolt tower turns its barrel toward its target (redraw the icon with aim; do not rotate the whole graphics object, tier pips must stay put).
Do not change unrelated code; list what you changed.
```
Test: two Bolts kill grunts and the gold number rises. A Mortar hits a group of grunts with one shell.

**P6. Frost and Arc, status rings**
```
Add to settings.js:
frost: aura 2 (damage per second to every enemy in range), slow 0.4, range 90, hitsFlyers true
arc: damage 15, rate 1.0, range 120, chains 3, chainRange 80, ignoresArmor true, hitsFlyers true
- Frost has no projectile: enemies inside its range move 40% slower (several Frost towers do not stack; use the strongest slow) and show a blue ring around them while slowed. Draw a faint blue aura circle under the Frost tower plus a pulsing blue ring (a visual tween: scale up to 1.7 while fading out, repeating every 1.1 s).
- Arc instantly hits its target with a purple jagged lightning line, then jumps to the nearest enemy within chainRange that it has not hit yet, up to chains enemies in total. The line fades in 120 ms (visual tween is fine).
Do not change unrelated code; list what you changed.
```
Test: grunts visibly slow near Frost and get a blue ring; Arc's lightning hits 3 grunts in a row.

**P7. The enemy roster**
```
Complete ENEMIES in settings.js. Every enemy is red (red = danger) and reads by SHAPE and SIZE:
grunt  { hp: 40, speed: 55, size: 14, shape: 'circle', gold: 2 }
dasher { hp: 14, speed: 110, size: 10, shape: 'triangle', gold: 2 }
brute  { hp: 90, speed: 36, size: 19, shape: 'square', armor: 8, gold: 4 }
swarm  { hp: 7, speed: 70, size: 6, shape: 'circle', group: 8, gold: 1 }
glider { hp: 26, speed: 62, size: 13, shape: 'diamond', flying: true, gold: 3 }
boss   { hp: 600, shield: 300, speed: 28, size: 28, shape: 'hexagon', spawnOnHalf: { type: 'swarm', count: 8 }, gold: 40 }
- armor: every hit loses armor damage (minimum 1 per hit) unless the tower ignoresArmor. Frost aura ignores armor.
- shield: absorbs damage before hp; show it as a white ring that shrinks as the shield drops.
- group: one spawn creates that many, spaced 12 px apart along the path.
- flying: the glider ignores the road and flies in a straight line from SPAWN to VAULT, drawn 10 px higher with an ink shadow ellipse under it. Towers with hitsFlyers false never target it.
- spawnOnHalf: when the boss first drops below 50% hp it releases those enemies at its position.
- Every enemy gets name and text (one line, 8 words or fewer, e.g. Brute: 'Armored. Use Arc.'). Hovering an enemy shows "Name: text" above it. Keep the eyes on every enemy.
- Add a debug key 1-6 that spawns one of each type in order (we remove it in P13).
Do not change unrelated code; list what you changed.
```
Test: press 1-6: six different silhouettes; Bolt hits gliders, Mortar ignores them; brutes shrug off Bolt (8 - 8, so the 1-damage minimum per hit) but not Arc.

**P8. Wave manager**
```
Remove the test spawner. Create src/waves.js that builds all 20 waves from WAVES in settings.js:
WAVES = { total: 20, countBase: 6, countPerWave: 2, countCap: 40, hpGrowth: 1.17, spawnGap: 0.8,
  unlock: { dasher: 4, swarm: 6, brute: 7, glider: 12 }, weights: { grunt: 4, dasher: 2, swarm: 1, brute: 1, glider: 1 },
  bossWaves: [10, 20], breatherEvery: 5, breatherCount: 0.6, breatherGold: 1.5, countdown: 12, clearBonus: 10, killGoldEvery: 3 }
- buildWave(n) returns a list of spawns. count = min(countCap, countBase + countPerWave x n), times breatherCount on breather waves (5, 15; not boss waves). Split the count between unlocked types by weight (round, grunts take the remainder), interleave them evenly, and multiply hp by hpGrowth^(n-1). On a type's unlock wave its first spawn is that type alone with a 3 s gap after it, and the screen shows a one-line tip of 8 words or fewer near the gate (e.g. "Dashers are fast. Frost slows them."). Boss waves add one boss at the end.
- Kill gold = the enemy's gold + floor(n / killGoldEvery), times breatherGold on breather waves. Clearing a wave pays clearBonus.
- Before wave 1 nothing spawns until the player clicks the "Next wave" chip. After a wave is cleared, a countdown of countdown seconds starts; at 0 the next wave starts by itself.
- The "Next wave" chip sits next to the spawn gate: a small panel with the wave number and one mini icon + count per enemy type in that wave. Hovering it lists the wave's enemies by name ("6 Grunt, 2 Dasher"). Clicking it during the countdown sends the wave early and pays +1 gold per whole second left (show "+N" in gold).
- HUD top-left: add "Wave X/20" in white after the gold.
Do not change unrelated code; list what you changed.
```
Test: wave 1 is 8 grunts and starts only on click. The chip previews wave 2 and its countdown; sending early adds gold. Wave 4 shows the Dasher tip.

**P9. Recoverable Cores**
```
Replace "removed at the vault" with Recoverable Cores (CORES in settings.js: { floatSpeed: 30, pickupRadius: 18 }; startCores stays in ECONOMY).
- The vault holds startCores cores. An enemy that reaches the vault takes one (if any are left), turns around, and walks the path back to the spawn gate at the same speed (a glider flies straight back). It carries a small gold core dot on top. If the vault is empty it just turns around. For 'first' targeting, an enemy walking back counts as further along than any enemy walking in (so carriers are shot first).
- If an enemy carrying a core dies, the core drops there and floats back toward the vault along the path at floatSpeed (gold dot with a soft pulse). Any enemy that is not carrying a core and touches a floating core (pickupRadius) picks it up and carries it back to the gate.
- A core that reaches the spawn gate on an enemy is lost for good (flash the gate red). A floating core that reaches the vault is returned.
- HUD top-left: the first item is "cores at home / cores not lost" with a gold hexagon icon, e.g. "6/8". Update the vault's ring of dots to show how many are home.
- Game over (GameOverScene, won: false) when every core is lost for good. A wave only counts as cleared when no enemies are left alive (floating cores may still be on their way home).
Do not change unrelated code; list what you changed.
```
Test: let a grunt through: the HUD shows 7/8 and it walks back with a core. Kill it on the way back: the core floats home and the HUD shows 8/8 again. Let one escape: 7/7.

**P10. Upgrades, the fork, selling, targeting**
```
Add UPGRADES to settings.js:
UPGRADES = { tierCost: 0.7, forkCost: 1.5, sellRefund: 0.7, tier1: { damage: 1.3 }, tier2: { range: 1.2 },
  forks: {
    bolt:   { A: { name: 'Railgun', text: 'Pierces a line', pierce: true, damage: 2.0, rate: 1.8 }, B: { name: 'Twin', text: 'Shoots 2 targets', targets: 2 } },
    mortar: { A: { name: 'Cluster', text: '3 mini blasts', cluster: 3 }, B: { name: 'Napalm', text: 'Burning ground', burn: { dps: 12, time: 3 } } },
    frost:  { A: { name: 'Shatter', text: 'Slowed take +25%', vulnerable: 0.25 }, B: { name: 'Freeze', text: 'Chance to stun', stun: { chance: 0.1, time: 1 } } },
    arc:    { A: { name: 'Overload', text: 'Breaks shields', shieldBreak: 3 }, B: { name: 'Storm', text: 'Chains to 6', chains: 6 } } } }
- Clicking a built tower selects it: show its range circle and a small panel beside it (addPanel + addText) with: the tower name and tier, its role line, a "Next:" line saying what the next upgrade does (strings in UI_TEXT in settings.js: 'Next: +30% damage', 'Next: +20% range', 'Next: choose A or B', 'Fully upgraded'), an Upgrade button (tier 1 and 2 cost tierCost x base cost; tier 1 = +30% damage, tier 2 = +20% range), then at tier 3 two fork buttons A / B with their name, 3-word text and price (forkCost x base cost; choosing one locks the other), a target-mode button (First / Nearest), and Sell (sellRefund x everything spent on it, Math.round). Buttons the player can't afford show the price in slate. Clicking elsewhere deselects.
- Fork rules: pierce = the dart flies on in a straight line and hits every enemy it crosses; damage/rate multiply the base stat (rate 1.8 = 1.8x slower); targets 2 = fires at the 2 first enemies; cluster 3 = 3 extra half-damage blasts around the landing point; burn = a fire patch at the landing point dealing dps to ground enemies for time seconds; vulnerable = enemies slowed by this tower take +25% damage from everything; stun = each enemy entering the aura has the chance to stop for time seconds (once per enemy per tower); shieldBreak 3 = Arc does 3x damage to shields; chains 6 replaces chains.
- Selling frees the pad (and the build price does not go back down).
Do not change unrelated code; list what you changed.
```
Test: upgrade a Bolt twice (damage then range circle grows), pick Twin: it shoots two enemies; Railgun is now locked. Sell it: the refund is 70% of the total spent and the pad is empty again.

**P11. Overcharge**
```
Add OVERCHARGE to settings.js: { rateMult: 3, duration: 5, cooldown: 30, key: 'Q' }.
- A round ability button at the bottom-right (purple, lightning icon, label "Q"). Pressing Q or clicking it arms Overcharge: the cursor shows a purple ring and the hint "Click a tower". Clicking a tower then gives it rateMult x fire rate (Frost: rateMult x aura damage) for duration seconds of game time; clicking anything else or pressing Q again cancels.
- While overcharged the tower glows (pulsing purple ring) and its shots are a bit bigger. Play a short rising beep (Web Audio, no files).
- Then the button shows a cooldown sweep (a dark pie that shrinks) for cooldown seconds of game time and ignores input.
- Click conflicts (the common bug here): the click on the Overcharge button must only arm it; it must not also reach the map click handler (check the objects under the pointer, as in P4), or it arms and cancels in the same click. While armed, the map click handler does the Overcharge step and then stops: a click on a tower must NOT also select it or open its tower panel, and a click on an empty pad cancels Overcharge without opening the build menu.
Do not change unrelated code; list what you changed.
```
Test: press Q, click a Bolt: it fires about 3x as fast for 5 s (count its shots over 2 s: about 3 times as many) and no tower panel opens; the button sweeps for 30 s; Q does nothing until it is ready. When it is ready, click the Q button with the mouse: the purple ring and "Click a tower" stay on. Arm it again and click an empty pad: it cancels and no build menu opens; click the pad again and the build menu opens as normal.

**P12. Juice and sound**
```
Add juice, keeping the road and range circles readable (effects under 300 ms, never covering the road for long):
- Enemies flash white for 60 ms when hit (setTintFill white, then clear).
- Small white damage numbers float up 12 px and fade (only for hits of 5+ damage, max 30 on screen).
- Gold "+N" pops at each kill, drifting toward the gold counter.
- Mortar landings: a gold ring burst and a light camera shake (60 ms, 0.003). No other tower shakes the camera.
- Core stolen: red flash on the vault; core lost: a red camera flash 150 ms; core returned: green sparkle.
- src/sfx.js with tiny blips made with beep() from src/audio.js (never a new AudioContext): bolt shot, mortar boom, arc zap, kill, core stolen, core returned, wave start, build/sell. Limit each sound to 1 per 50 ms. M toggles Sound FX (toggleSfx(), the same switch as the OPTIONS panel) in GameScene only.
Do not change unrelated code; list what you changed.
```
Test: a busy wave 10 still runs at about 60 fps; every event has a sound; M (or OPTIONS > Sound FX) mutes and survives a refresh.

**P13. HUD polish, speed, pause, win and lose**
```
- HUD top-left: cores, gold, wave (as before). Top-right: a 1x/2x speed button (sets this.speed, which already scales tick) and a pause button (P also toggles; dims the screen and shows PAUSED). Esc first closes whatever is open (build menu, tower panel, armed Overcharge) and only toggles pause when nothing is open. Pausing must stop enemies, cooldowns, countdown and Overcharge, because they all run on tick.
- Surviving wave 20 (all enemies gone) goes to GameOverScene with won: true. Losing all cores goes there with won: false. Pass { won, wave, cores } explicitly. GameOverScene shows "YOU WIN!" or "GAME OVER", "Wave N", "Cores saved: N" and the best wave from the `storage` helper (key 'core-keepers-best-wave', saved when higher).
- Restart from GameOverScene and the menu must start a fresh run: this.scene.start('GameScene', { fresh: true }) and reset every field in create() (gold, cores, wave, towers, speed 1, paused false, Overcharge ready).
- Menu shows "Best wave: N".
- Remove the 1-6 debug spawn keys.
Do not change unrelated code; list what you changed.
```
Test: 2x makes everything twice as fast, including fire rate; pause freezes everything; win, lose, and restart all work and the best wave is kept after a refresh.

**Optional P14. Endless mode with upgrade cards**
```
After winning, offer "Endless" on the win screen. Endless continues from wave 21 with the same buildWave rules (count stays at the cap, hp keeps growing). After every 5th endless wave, pause and offer 3 random cards from a CARDS list in settings.js (e.g. "+15% Bolt damage", "Frost slows 10% more", "+1 core", "Overcharge cooldown -5 s", "+60 gold", "Mortar splash +20%"), with 1 free reroll per offer. Taking a card applies it for the rest of the run. Endless runs save their best wave separately (key 'core-keepers-best-endless').
Do not change unrelated code; list what you changed.
```
Test: win, choose Endless, clear wave 25: 3 cards appear; Reroll works once; the chosen card's effect shows up.

**Optional P15. Balance pass**
```
Write scripts/balance.mjs (plain Node, imports src/settings.js) that prints a table: for each tower and each upgrade path, damage per second, DPS per gold spent, and range; and for waves 1, 5, 10, 15, 20 the total enemy hp (shields included) and the total kill gold. Do not change game code. Then tell me which tower is the best and worst value and suggest 3 number changes in settings.js (only suggest; do not apply them). Do not change unrelated code; list what you changed.
```
Test: `node scripts/balance.mjs` prints the tables; nothing in src/ changed.

**Ship check:** Play one full run at 1x. With the numbers above, our three automated bots (5 seeds each, 1x) gave: a *weak* player (only Bolts, no upgrades) loses all cores at wave 10; an *average* player (all four towers, tiers 1-2, no forks or Overcharge) loses at wave 18-19; a *good* player (counters, forks, Overcharge) wins with 3-5 of 8 cores left. If your changes make the game much easier or harder, retune WAVES.hpGrowth first, then ECONOMY.startGold.

## Universal prompts (any genre)

**Add a pause menu**
```
Add a pause menu toggled with Esc or P: dim the screen, show Resume / Restart / Menu buttons. Physics and timers must stop while paused.
```

**Add background music**
The starter already plays our own original loop, **PFK Theme (boss loop)** (128 BPM, 37.5 s, in `starter/public/assets/audio/`). You may use it in your games, including commercial ones (see `LICENSE-MUSIC.txt`), or make / buy your own. Turn it off any time with OPTIONS > MUSIC. To use your own song, export it as .ogg and .mp3 (free tools like Audacity do both; add an .m4a too if you can, it loops more cleanly than .mp3 on older iPhones) and paste:
```
Change the background music: <keep the included theme / I put my own song in public/assets/audio/ as mysong.ogg + mysong.mp3 (+ mysong.m4a if I have it) / describe music to make in code>. The music is set up in src/main.js with registerMusic('theme', fileMusic([...ogg, ...m4a, ...mp3], { loopEnd: <song length in seconds> })) and playMusic('theme') from src/audio.js: point the file list at my files (best format first; .ogg loops with no gap, .m4a is for older iPhones, .mp3 last). For music made in code, use registerMusic('theme', (ctx, out) => { ...connect nodes to out...; return () => { stop them } }) instead. For a different song per scene, registerMusic each one and call playMusic('<key>') in that scene's create(). Never play music any other way: playMusic respects the OPTIONS Music switch, waits for the first click / tap / key, and plays at MUSIC_VOLUME (in audio.js) under the sound effects. Update CREDITS.md with where the music came from.
```

**Tune the feel**
```
List every gameplay number in config.js with one line explaining what it does, and suggest which 3 to tweak to make the game feel <faster / heavier / easier>.
```

**Clean up before shipping**
```
Remove all console.log and debug keys. Check for objects that are created but never destroyed. Do not change gameplay. Then confirm npm run build passes.
```

**Swap placeholder art**
```
I put these files in public/: <hero.png 32x32, coin.png 16x16>. Load them in a preload() method and use them instead of the generated textures with the same keys. Keep the generated textures as fallback for anything without a file.
```
