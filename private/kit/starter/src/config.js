// All tunable numbers live here. Change values, not code, when tuning feel.
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;

// Size of one level tile in pixels. Level data in GameScene is in tiles.
export const TILE = 36;

// The kit's 16-color "Chunky Flat Toy" palette (see THEME.md in the kit).
// Color roles: red = danger, gold = money/reward, cyan/blue = player/friendly/slowed,
// green = heal/poison, purple = magic/rare. Terrain stays olive and slate.
export const PALETTE = {
  ink: 0x1b1f2e, // outlines, dark text
  slateDark: 0x2e3550,
  slate: 0x4a5373,
  slateLight: 0x8a93ad,
  skyMuted: 0xa9c4d4,
  cloud: 0xe9edf5,
  white: 0xffffff,
  oliveDark: 0x55613a,
  olive: 0x7d8a52,
  oliveLight: 0xa9b47a,
  red: 0xef4f4f, // danger, enemies
  gold: 0xffc93c, // money, rewards
  cyan: 0x3ec9e6, // the player
  blue: 0x4d7cff, // friendly, slowed
  green: 0x5bd16b, // heal, poison
  purple: 0xa45ee5 // magic, rare
};

// Text colors (CSS strings) built from the palette.
export const COLORS = {
  text: '#ffffff',
  outline: '#1b1f2e',
  accent: '#ffc93c', // gold: score, highlights
  good: '#5bd16b',
  bad: '#ef4f4f',
  player: '#3ec9e6'
};

// Same colors as CSS strings for helpers that take a TEXT.<name> (see ui.js addTag / addBanner).
export const TEXT = { white: '#ffffff', ink: '#1b1f2e', gold: '#ffc93c', red: '#ef4f4f', green: '#5bd16b', cyan: '#3ec9e6', purple: '#a45ee5' };

export const OUTLINE = 3; // thickness of the dark outline on every shape, in px

// Bundled font (SIL Open Font License, see public/assets/fonts/OFL.txt).
export const FONT = 'Lilita One';

export const PLAYER = {
  speed: 220,
  jumpVelocity: -460,
  startX: 2 * TILE,
  startY: 8 * TILE
};

export const ENEMY = {
  patrolDistance: 2 * TILE, // how far a walker moves before turning around
  patrolDuration: 1400 // ms for one leg of the patrol
};

export const WORLD = {
  gravity: 900,
  width: 68 * TILE // level is wider than the screen; the camera follows the player
};

// Background layers: 0 = stuck to the screen, 1 = moves with the level.
export const PARALLAX = { far: 0.15, near: 0.4, menuSpeed: 0.5 };

export const ANIM = { idleFps: 3, runFps: 10, coinFps: 8, flagFps: 4 };

export const PARTICLES = { coinBurst: 10, deathBurst: 24, winBurst: 40 };

export const SCORE = { coin: 10 };

export const STORAGE_KEYS = { highScore: 'bgsk-high-score' };

// Every on-screen name and one-line description lives here (new item/enemy/upgrade = new entry).
export const INFO = {
  controls: 'Arrows / WASD to move   Space / Up to jump',
  goal: 'Reach the flag. Grab coins. Avoid enemies and spikes.',
  banner: 'Reach the flag!\nCoins +10. Enemies, spikes and pits: avoid.',
  bannerSeconds: 7,
  score: 'Score',
  // Short names, shown on the menu (legend) and above the first of each kind in the level.
  legend: [
    { icon: 'coin-0', label: 'Coin +10', color: TEXT.gold },
    { icon: 'enemy-0', label: 'Walker: avoid', color: TEXT.red },
    { icon: 'spikes', label: 'Spikes: avoid', color: TEXT.red },
    { icon: 'flag-0', label: 'Flag: reach it to win', color: TEXT.green }
  ],
  tags: { coin: 'Coin +10', enemy: 'Walker: avoid', spikes: 'Spikes: avoid', goal: 'Goal: reach the flag' },
  tagSeconds: 6
};
