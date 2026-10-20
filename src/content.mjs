// All copy is sourced from the kit docs (README.md, LISTING.md, LICENSE.md,
// THEME.md, PROMPTS.md, FIX-LOOP.md, PUBLISH.md). Keep it factual.

export const included = [
  ['A working Phaser 3 + Vite starter game', 'A playable platformer with menu, gameplay, and game-over scenes, plus a high score. Clean, commented code built to be extended by AI. Art is drawn in code, so there are no image files to license. Every game opens with a How to play screen and has an Options menu with separate Music and Sound FX switches, plus an original background music loop you may use in your own games.'],
  ['AI rules files', '`.cursorrules`, `CLAUDE.md`, and `AGENTS.md`. Your AI tool reads the architecture and the "small steps, test after each change" rules, so it makes focused changes instead of rewriting your game.'],
  ['Prompt Playbook: 6 genres, 60+ prompts', 'Platformer, top-down roguelite, idle/clicker, endless runner, puzzle, and tower defense. Each genre has a kickoff prompt plus ordered prompts, with a test checkpoint after every step.'],
  ['Grow Your Game chapter', 'What to do after v1: data tables so adding a level, enemy, weapon, or item is adding a row, the one-prompt-per-feature rule, theme and balance tips, a playtest loop, and example prompts for every genre.'],
  ['The Fix Loop', 'The 3-tries-then-rollback rule, beginner-friendly git commands, 7 debug prompt templates, and a table of common Phaser bugs.'],
  ['Publishing guide', 'Step by step to itch.io, GitHub Pages (with a ready-made deploy workflow), and Netlify drag-and-drop.'],
  ['A visual theme (THEME.md)', 'One 16-color palette, the Lilita One font, and a UI style with fixed color meanings, plus how to draw each of the 6 genres in it with code.'],
  ['One-page Game Design Doc template', 'So you scope a game you can actually finish.'],
  ['GUIDE.pdf', 'A 40+ page guide with everything in one place, including the Grow Your Game chapter, plus a quick start.'],
];

export const audience = [
  ['Vibe coders', 'who want to build something fun, not another SaaS dashboard.'],
  ['Beginners', 'who want a first game shipped, not a 40-hour course.'],
  ['Devs using AI editors', 'Cursor, Claude Code, Windsurf, Lovable, or Bolt, who want a repeatable workflow.'],
];

export const steps = [
  ['Open the starter', 'Unzip the kit and open the `starter/` folder in your AI tool. Run `npm install`, then `npm run dev`. A tiny platformer opens in your browser.'],
  ['Plan a small game', 'Fill in the one-page `GDD.md`. Keep v1 tiny.'],
  ['Paste one prompt at a time', 'Pick your genre in `PROMPTS.md`. Paste Prompt 0, then P1. Test. Commit. Repeat.'],
  ['Fix without spiraling', 'When something breaks, open `FIX-LOOP.md`. Three tries, then roll back to your last commit.'],
  ['Ship it', 'Build to static files and publish with `PUBLISH.md`: itch.io, GitHub Pages, or Netlify.'],
];

export const rules = [
  ['One prompt = one feature.', 'Never ask for five things at once.'],
  ['Test after every change.', 'Play it. Look at the console (F12).'],
  ['Commit every working step.', 'Git is your save game.'],
  ['Three failed fixes = roll back.', 'Then ask for a smaller step.'],
];

// demo: folder name under public/play/<demo>/ (copy a game's dist/ there)
export const genres = [
  {
    slug: 'tower-defense', demo: 'towerdefense', name: 'Tower Defense', game: 'Core Keepers', color: 'gold',
    summary: 'Four towers with distinct roles, six shape-coded enemies, 20 waves, and two signature mechanics: Recoverable Cores and Overcharge.',
    details: [
      'Recoverable Cores: an enemy that reaches your vault steals one of your 8 cores and walks it back to the spawn gate. Kill it and the core floats home.',
      'Overcharge: 3x fire rate on one tower, on hotkey Q.',
      'Every gameplay number lives in one file, `src/settings.js`, so you balance the game by editing numbers, not code.',
      'Each prompt quotes the numbers it needs. The values are the ones the bot-tested build shipped with.',
    ],
    prompts: ['Setup and the settings file', 'Path, vault, and build pads', 'First enemy and the game clock', 'Radial build menu', 'Bolt and Mortar shoot', 'Frost and Arc, status rings', 'The enemy roster', 'Wave manager', 'Recoverable Cores', 'Upgrades, the fork, selling, targeting', 'Overcharge', 'Juice and sound', 'HUD polish, speed, pause, win and lose'],
    optional: ['Endless mode with upgrade cards', 'Balance pass'],
  },
  {
    slug: 'platformer', demo: 'platformer', name: 'Platformer', game: 'Platformer', color: 'cyan',
    summary: 'Builds on the starter as-is. Goal: a 3-level platformer with good jump feel.',
    details: ['Starts from the playable platformer that ships in `starter/`.', 'Adds coyote time, jump buffering, and variable jump height, with every value in `config.js`.'],
    prompts: ['Better jump feel', 'Variable jump height', 'Moving platforms', 'Stomp enemies', 'Lives and respawn', 'Checkpoints', 'Multiple levels', 'Level indicator and transitions', 'Juice', 'Sound'],
  },
  {
    slug: 'roguelite', demo: 'roguelite', name: 'Top-Down Roguelite', game: 'Roguelite', color: 'red',
    summary: 'Replaces the platformer with a top-down arena: rooms, enemies, and upgrades between rooms.',
    details: ['Ends with a boss room and a run summary.', 'Upgrade choices appear as cards between rooms.'],
    prompts: ['Top-down movement', 'Shooting', 'Chaser enemy', 'Waves in a room', 'Room progression', 'Second enemy type', 'Upgrade choice', 'Run summary', 'Boss room', 'Juice'],
  },
  {
    slug: 'idle-clicker', demo: 'idle', name: 'Idle / Clicker', game: 'Idle clicker', color: 'purple',
    summary: 'Replaces gameplay with a clicker economy. No physics needed.',
    details: ['Covers save and load, offline earnings, milestones, and prestige.', 'Prices show in gold; prestige uses purple, per THEME.md.'],
    prompts: ['Click to earn', 'Floating numbers', 'First upgrade', 'Passive income', 'Number formatting', 'Save and load', 'Offline earnings', 'Milestones', 'Prestige', 'Polish'],
  },
  {
    slug: 'endless-runner', demo: 'runner', name: 'Endless Runner', game: 'Runner', color: 'green',
    summary: 'Auto-running, jump-to-survive, score = distance.',
    details: ['Adds a speed ramp, double jump, varied obstacles, coins, and a parallax background.', 'Includes a step for mobile controls.'],
    prompts: ['Auto-run setup', 'Obstacles', 'Distance score', 'Speed ramp', 'Double jump', 'Varied obstacles', 'Coins and pickups', 'Parallax background', 'Mobile controls', 'Juice'],
  },
  {
    slug: 'puzzle', demo: 'puzzle', name: 'Puzzle (Sokoban-style)', game: 'Puzzle', color: 'blue',
    summary: 'Grid-based, turn-based, with handcrafted levels.',
    details: ['Levels are arrays of strings in one file, so designing a new level means typing a few lines of text.', 'Includes undo, restart, a move counter, level select, and touch controls.'],
    prompts: ['Grid and player', 'Levels as text', 'Pushing boxes', 'Win condition', 'Undo and restart', 'Move counter', 'Level select', 'More levels', 'Touch controls', 'Juice'],
  },
];

export const faq = [
  ['What is the Browser Game Starter Kit?', 'A downloadable kit from Prompt Forge Kits: a working Phaser 3 + Vite starter game, rules files for your AI coding tool, and 60+ copy-paste prompts across 6 genres that take you from idea to a published browser game.'],
  ['How much does it cost?', 'It costs $29 (USD), a one-time purchase. Updates are free for life.'],
  ['Do I need to know how to code?', 'No. You need to install Node.js, run two commands, and paste prompts. The guide explains every step. Knowing some JavaScript helps but isn\u2019t required.'],
  ['Which AI tools does it work with?', 'It\u2019s designed for tools that open a local project folder: Cursor, Claude Code, Windsurf, and GitHub Copilot. Lovable and Bolt run in the browser and work differently; the guide explains how to use the rules with them, but an editor-based tool gives the best results.'],
  ['Why Phaser?', 'It\u2019s a mature, free, browser-first 2D engine with lots of training data, so AI tools write good Phaser code. Games run on any device with a browser.'],
  ['Can I sell games I make with it?', 'Yes. You can use the starter code in your own games, including commercial ones. You can\u2019t resell or redistribute the kit itself (the starter as a template, the prompts, or the guides). Full terms are on the license page.'],
  ['Is there art or sound included?', 'Yes, one original music track, and no image files. The starter\u2019s art is drawn in code, so it\u2019s part of the starter code you can use in your games. The kit includes PFK Theme, a looping background music track made by Prompt Forge Kits (.ogg, .m4a and .mp3). You may use it in your own games, including commercial ones, but not sell or share it on its own (see LICENSE-MUSIC.txt in the kit). Sound effects are generated in code, and an Options menu has separate Music and Sound FX on/off switches. The one bundled font is Lilita One, under the SIL Open Font License, which allows use in commercial games. The guide shows how to swap in your own music or CC0 art.'],
  ['Mac, Windows, or Linux?', 'All three. You need Node.js 18 or newer, plus Git and an AI coding tool.'],
  ['What if it doesn\u2019t work for me?', 'If the kit didn\u2019t work for you, request a refund within 7 days of purchase and you get your money back. Refunds may be declined if the kit has clearly been copied or reused. Updates stay free either way.'],
  ['Will it be updated?', 'Yes. Updates are free for life. When a new version ships, we email you the new download link.'],
  ['How do I get the free Core Keepers demo?', 'Enter your email in the signup form. We email you a private link to play the full Core Keepers tower defense demo, plus a short teaser guide. The link is personal; please don\u2019t share it.'],
  ['Where can I buy it?', 'Right here on this site: click Buy now, pay $29 one-time through secure Stripe checkout, and the download arrives by email. You can also get the free Core Keepers demo by email first.'],
  ['Are the demos on this site made with the kit?', 'Yes. Each demo was built by following that genre\u2019s prompt sequence one step at a time, with an automated browser test after each step. They show what the sequences produce; your game will be your own.'],
];

export const licenseMay = [
  'Use, modify, and build on the starter code (everything in `starter/`) in any number of your own games, including commercial games you sell, publish, or monetize (itch.io, Steam, web portals, ads, etc.).',
  'Publish the source code of your finished game, even if it contains parts of the starter code, as long as it is a game and not a kit, template, or tutorial.',
  'Use the prompts, templates, and guides to make your own games.',
  'Use the included background music (PFK Theme, original work by Prompt Forge Kits) in your own games, including commercial ones, and edit or loop it; just don\u2019t sell or share it on its own as music or as part of an asset pack (see `LICENSE-MUSIC.txt`).',
];
export const licenseMayNot = [
  'Resell, share, or redistribute the kit itself, or any part of it as a kit: the starter project as a template, the prompt playbook, the guides, or `GUIDE.pdf`. This includes uploading it for free.',
  'Repackage it, in whole or in part, into another starter kit, template, course, or prompt pack.',
];
export const licenseWarranty = 'The kit is provided "as is", without warranty of any kind. Third-party tools and services it mentions (Phaser, Vite, itch.io, GitHub, Netlify, AI tools) are covered by their own licenses and terms. Phaser and Vite are MIT-licensed open-source projects and are not part of this license. The Lilita One font in `starter/public/assets/fonts/` is under the SIL Open Font License 1.1, which lets you bundle it with your games, including commercial ones (see `starter/CREDITS.md`). The starter\u2019s art is drawn in code and is part of the starter code.';
