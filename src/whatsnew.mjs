// "What's new in the kit" page (/whats-new/), added 2026-10-24.
// Sources: ONLY /workspace/ops/CHANGELOG.md and git log (site private/kit + private/assistant-kit commits).
// Each date is the day the change reached the download buyers get (the production deploy), newest first.
// Keep it factual and friendly: no prices, no sales numbers, no store links. Add new entries at the top.
export const WN = {
  title: "What's new in the kit",
  intro: 'Every change we make to the Browser Game Starter Kit and the Assistant Team Starter Kit, newest first. Updates are free for life: if you bought a kit, your download link always gets you the latest version.',
};

// kit: 'bgsk' = Browser Game Starter Kit, 'atsk' = Assistant Team Starter Kit
export const whatsNew = [
  {
    date: '2026-11-04',
    groups: [
      { kit: 'bgsk', items: [
        "Endless Runner: the juice prompt now keeps jump and coin sounds on the Sound FX switch (and M), and makes the death slow-motion actually slow (not 3x faster) and short.",
      ] },
    ],
  },
  {
    date: '2026-11-03',
    groups: [
      { kit: 'bgsk', items: [
        "Platformer: checkpoints are sturdier. A checkpoint only ever moves your respawn forward, you respawn standing on the ground at the flag, and each new level or new run starts at the level start. In the demo's Level 2 a walker no longer patrols over the checkpoint.",
      ] },
    ],
  },
  {
    date: '2026-11-02',
    groups: [
      { kit: 'bgsk', items: [
        '**Tower Defense:** the result screen now waits a moment, so the click you were making when the run ended no longer skips it; a win needs the wave 20 boss beaten, and losing your last core on the final wave is never shown as a win.',
        'GUIDE.pdf rebuilt with the new prompt: now 51 pages.',
      ] },
    ],
  },
  {
    date: '2026-10-30',
    groups: [
      { kit: 'bgsk', items: [
        '**Platformer, P5 Lives and respawn:** one hit now costs exactly one life, with a short blink after you respawn. Touching two hazards at once no longer costs two lives, and your score and coins are kept.',
        '**Endless Runner, P3 Score and distance:** the game over screen now waits a moment before a click or key restarts, so the jump you were pressing when you crashed no longer skips your score. The score counts distance frame by frame, and the game over screen shows NEW BEST! when you beat your best.',
        '**Top-Down Roguelite, P6 Enemy shooters:** dead shooters stop shooting, missed shots vanish on the walls, and clearing a room removes shots still in the air, so nothing hits you right after you pick an upgrade.',
        '**Puzzle, P6 Move counter:** clearer prompt. Your best move count now means the fewest moves, and a slower replay never overwrites it. Bumping a wall no longer counts as a move, and a level you haven\u2019t solved yet shows "Best: -" instead of "Best: 0". The Test line now checks all three.',
        'GUIDE.pdf rebuilt with the new prompts: now 50 pages.',
        'The Platformer, Runner and Roguelite demos on this site got the same fixes.',
      ] },
    ],
  },
  {
    date: '2026-10-26',
    groups: [
      { kit: 'bgsk', items: [
        '**Tower Defense (Core Keepers), P8 Wave manager:** clearer prompt. A wave now only ends when all of its enemies have arrived and been beaten, so a wave can\u2019t end early and the boss waves can\u2019t be skipped. The next-wave button can\u2019t start two waves at once or pay the wave bonus twice, and no countdown starts after the final wave.',
        'GUIDE.pdf rebuilt with the new prompt (now 49 pages).',
      ] },
    ],
  },
  {
    date: '2026-10-23',
    groups: [
      { kit: 'atsk', items: [
        '**New kit: the Assistant Team Starter Kit is out.** It has 4 assistant job descriptions (Lead, Content, Community & Launch, Shop Ops), 7 ready-made workflows, one page of approval rules, a true-claims check for anything that goes public, a fill-in business profile, 6 shared notebooks, lessons from running our own shop, and a printable GUIDE.pdf.',
        'You can also get it together with the Browser Game Starter Kit in one bundle: two downloads, emailed right after payment.',
      ] },
      { kit: 'bgsk', items: [
        '**Endless Runner, P7 Coins and pickups:** clearer prompt. Each coin adds 1 to its own counter, every 10th coin gives you a short shield, and a shielded hit removes the obstacle so it can\u2019t hit you again on the next frame. The Test line now checks all three.',
        '**Top-Down Roguelite, P8 Run summary:** the summary now counts rooms cleared (not the room you died in), groups your upgrades ("Rapid Fire x3"), only raises your best score and says "NEW BEST!" when you beat it. It also ignores clicks for 0.8 seconds, so the click you were shooting with when you died can\u2019t skip it.',
        '**Puzzle, P5 Undo and restart:** pressing Z at the start no longer causes an error, undo works even in the middle of a move, crates change back to the right color, Z and R are ignored once a level is solved, R clears the undo history, and the How to play screen now lists Z and R.',
        'GUIDE.pdf rebuilt with all of the above (now 48 pages).',
        'The Roguelite demo on this site got the new run summary too.',
      ] },
    ],
  },
  {
    date: '2026-10-20',
    groups: [
      { kit: 'bgsk', items: [
        '**Platformer, P8 Level indicator and transitions:** the prompt now makes sure the level change happens once, the player is frozen during the fade (no lost life in a pit), score and lives carry over, and you land on level 2, not level 3.',
        '**Platformer, P4 Stomp enemies:** clearer wording. Only walkers can be stomped; spikes still hurt from any side.',
        'The How to play screen code is sturdier: the KEYBOARD / MOUSE / TOUCH labels stay easy to read even if you change the text style in ui.js.',
        'GUIDE.pdf rebuilt (47 pages).',
      ] },
    ],
  },
  {
    date: '2026-10-19',
    groups: [
      { kit: 'bgsk', items: [
        '**Original music:** the kit now includes PFK Theme, our own synthwave / retro-arcade track: a 37.5-second seamless loop in .ogg, .m4a and .mp3. You can use it in your own games, including ones you sell (see LICENSE-MUSIC.txt).',
        '**Options menu** in the starter game and every demo, with separate Music and Sound FX switches. Sound and music start after your first click, tap or key press.',
        '**How to play screen** in the starter game: a short panel with the keyboard, mouse and touch controls, shown before your first game.',
        'Menus and saved best scores now work even when the browser blocks storage (for example in private browsing).',
        'Prompt fixes: Puzzle P9 Touch controls (the prompt now makes sure tapping UNDO or RESTART doesn\u2019t also move the player) and Core Keepers P11 Overcharge (clear rules for which click does what).',
        'Fixed a formatting bug in GUIDE.pdf: a missing code block end after Roguelite P5 made the rest of the prompts show up as plain text.',
      ] },
    ],
  },
];
