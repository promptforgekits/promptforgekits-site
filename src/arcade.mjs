// Prompt Forge Kits Arcade (added 2026-10-21): a free, link-only list of browser games.
// Rules: link only (we never host, embed or copy someone else's game), descriptions are our own words,
// no third-party images (only our own screenshots of our own games), removal on request within 48 hours,
// nothing is listed without the owner's approval. Seeded only with our own public demos for now.
export { ARCADE_SEGMENT_ID } from '../api/_arcade.js';

export const listings = [
  { id: 'pfk-platformer', title: 'Platformer', maker: 'Prompt Forge Kits', makerUrl: '/', url: '/play/platformer/', genre: 'Platformer', ownImage: 'g-platformer', madeWithKit: true, added: '2026-10-21',
    blurb: 'Run, jump and stomp the walkers, but keep clear of the spikes. Three levels with coyote time and jump buffering, so the jumps feel fair.' },
  { id: 'pfk-roguelite', title: 'Roguelite', maker: 'Prompt Forge Kits', makerUrl: '/', url: '/play/roguelite/', genre: 'Top-down roguelite', ownImage: 'g-roguelite', madeWithKit: true, added: '2026-10-21',
    blurb: 'Clear a top-down arena room by room, pick an upgrade card between rooms, and face the boss room at the end of the run.' },
  { id: 'pfk-idle', title: 'Idle clicker', maker: 'Prompt Forge Kits', makerUrl: '/', url: '/play/idle/', genre: 'Idle / clicker', ownImage: 'g-idle', madeWithKit: true, added: '2026-10-21',
    blurb: 'Click to earn, buy upgrades, and let passive income run. It saves your progress, counts offline earnings, and has a prestige reset.' },
  { id: 'pfk-runner', title: 'Runner', maker: 'Prompt Forge Kits', makerUrl: '/', url: '/play/runner/', genre: 'Endless runner', ownImage: 'g-runner', madeWithKit: true, added: '2026-10-21',
    blurb: 'An auto-running dash where the speed keeps climbing. Double jump over varied obstacles, grab coins, and beat your distance.' },
  { id: 'pfk-puzzle', title: 'Puzzle', maker: 'Prompt Forge Kits', makerUrl: '/', url: '/play/puzzle/', genre: 'Sokoban-style puzzle', ownImage: 'g-puzzle', madeWithKit: true, added: '2026-10-21',
    blurb: 'Push the boxes onto their targets in handmade grid levels. Undo, restart and a move counter help you find the cleanest solution.' },
];
