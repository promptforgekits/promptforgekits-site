// All game art is drawn here with Phaser Graphics: flat shapes, a thick dark
// outline, one highlight per shape (the "Chunky Flat Toy" style, see THEME.md).
// Each drawing is saved as a texture key that scenes use like an image.
// To change a look, edit its draw function. To add art, copy a function.
// (The draw functions are exported so other code can redraw them, e.g. bigger.)
import { PALETTE as P, OUTLINE, TILE, GAME_WIDTH } from './config.js';

export function createTextures(scene) {
  if (scene.textures.exists('spark')) return; // only build once
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  // save(key, w, h, draw): run draw(g), turn the result into a texture, clear
  const save = (key, w, h, draw) => { draw(g); g.generateTexture(key, w, h); g.clear(); };

  // Player: 2 idle frames (body bobs), 2 run frames (legs swap), 1 jump frame
  save('player-idle-0', 44, 48, () => drawPlayer(g, 0, 'stand'));
  save('player-idle-1', 44, 48, () => drawPlayer(g, 2, 'stand'));
  save('player-run-0', 44, 48, () => drawPlayer(g, 0, 'runA'));
  save('player-run-1', 44, 48, () => drawPlayer(g, 1, 'runB'));
  save('player-jump-0', 44, 48, () => drawPlayer(g, -1, 'jump'));

  save('enemy-0', 40, 38, () => drawEnemy(g, 0));
  save('enemy-1', 40, 38, () => drawEnemy(g, 1));

  // Coin spin: the circle gets thinner and wider again
  [1, 0.6, 0.2, 0.6].forEach((w, i) => save(`coin-${i}`, 30, 30, () => drawCoin(g, w)));

  save('flag-0', 44, 76, () => drawFlag(g, 0));
  save('flag-1', 44, 76, () => drawFlag(g, 1));
  save('spikes', TILE, 22, () => drawSpikes(g));

  // Platform tiles: left end, middle, right end, and plain fill (under the ground)
  save('tile-left', TILE, TILE, () => drawTile(g, true, false));
  save('tile-mid', TILE, TILE, () => drawTile(g, false, false));
  save('tile-right', TILE, TILE, () => drawTile(g, false, true));
  save('tile-fill', TILE, TILE, () => drawFill(g));

  save('bg-far', GAME_WIDTH, 240, () => drawFarHills(g));
  save('bg-near', GAME_WIDTH, 170, () => drawNearHills(g));

  save('spark', 8, 8, () => g.fillStyle(P.white).fillCircle(4, 4, 4));
  g.destroy();
}

export function drawPlayer(g, bob, pose) {
  // Legs (drawn first so the body overlaps them)
  const legs = { stand: [12, 26], runA: [8, 30], runB: [16, 22], jump: [12, 26] }[pose];
  const legY = pose === 'jump' ? 34 : 38;
  g.fillStyle(P.ink);
  for (const x of legs) g.fillRoundedRect(x, legY, 8, 9, 3);
  // Body: big rounded "head-body" in the player color
  const y = 4 + bob;
  g.fillStyle(P.cyan).fillRoundedRect(4, y, 36, 34, 12);
  g.lineStyle(OUTLINE, P.ink).strokeRoundedRect(4, y, 36, 34, 12);
  g.fillStyle(P.white, 0.45).fillRoundedRect(10, y + 4, 12, 5, 2.5); // highlight
  // Eyes look in the walking direction (sprite is flipped for left)
  g.fillStyle(P.white).fillCircle(20, y + 17, 6).fillCircle(32, y + 17, 6);
  g.fillStyle(P.ink).fillCircle(22, y + 18, 3).fillCircle(34, y + 18, 3);
}

export function drawEnemy(g, step) {
  // Red circle "grunt" with angry brows; feet alternate per frame
  g.fillStyle(P.ink);
  g.fillRoundedRect(step ? 8 : 11, 29, 9, 8, 3).fillRoundedRect(step ? 24 : 21, 29, 9, 8, 3);
  g.fillStyle(P.red).fillCircle(20, 18, 15);
  g.lineStyle(OUTLINE, P.ink).strokeCircle(20, 18, 15);
  g.fillStyle(P.white, 0.4).fillCircle(13, 10, 3.5); // highlight
  g.fillStyle(P.white).fillCircle(14, 19, 4.5).fillCircle(26, 19, 4.5);
  g.fillStyle(P.ink).fillCircle(15, 20, 2.2).fillCircle(25, 20, 2.2);
  g.lineStyle(3, P.ink).lineBetween(9, 12, 18, 15).lineBetween(31, 12, 22, 15); // brows
}

export function drawCoin(g, widthScale) {
  const rx = Math.max(2, 12 * widthScale);
  g.fillStyle(P.gold).fillEllipse(15, 15, rx * 2, 24);
  g.lineStyle(OUTLINE, P.ink).strokeEllipse(15, 15, rx * 2, 24);
  if (widthScale > 0.5) g.fillStyle(P.white, 0.6).fillEllipse(15 - rx * 0.35, 9, rx * 0.5, 5);
}

export function drawFlag(g, wave) {
  g.fillStyle(P.slateDark).fillRoundedRect(4, 66, 22, 8, 3); // base
  g.fillStyle(P.slateLight).fillRect(13, 6, 5, 62);
  g.lineStyle(OUTLINE, P.ink).strokeRect(13, 6, 5, 62).strokeRoundedRect(4, 66, 22, 8, 3);
  // Gold flag (gold = reward). Two frames: the tip moves up and down
  const tip = wave ? 14 : 20;
  g.fillStyle(P.gold).fillTriangle(18, 6, 42, tip, 18, 30);
  g.lineStyle(OUTLINE, P.ink).strokeTriangle(18, 6, 42, tip, 18, 30);
  g.fillStyle(P.gold).fillCircle(15, 6, 5);
  g.lineStyle(OUTLINE, P.ink).strokeCircle(15, 6, 5);
}

export function drawSpikes(g) {
  for (let i = 0; i < 3; i++) {
    const x = 2 + i * 11;
    g.fillStyle(P.red).fillTriangle(x, 21, x + 5.5, 3, x + 11, 21);
    g.lineStyle(OUTLINE, P.ink).strokeTriangle(x, 21, x + 5.5, 3, x + 11, 21);
  }
}

export function drawTile(g, leftEnd, rightEnd) {
  const T = TILE, o = OUTLINE / 2;
  g.fillStyle(P.slate).fillRect(0, 0, T, T);
  g.fillStyle(P.slateDark).fillRect(0, T - 8, T, 8); // shade at the bottom
  g.fillStyle(P.olive).fillRect(0, 0, T, 11); // grass top
  g.fillStyle(P.oliveLight).fillRect(0, 2, T, 3); // highlight
  g.fillStyle(P.oliveDark).fillRect(0, 11, T, 3);
  g.lineStyle(OUTLINE, P.ink);
  g.lineBetween(0, o, T, o).lineBetween(0, T - o, T, T - o);
  if (leftEnd) g.lineBetween(o, 0, o, T);
  if (rightEnd) g.lineBetween(T - o, 0, T - o, T);
}

export function drawFill(g) {
  g.fillStyle(P.slateDark).fillRect(0, 0, TILE, TILE);
  g.fillStyle(P.slate).fillRect(6, 8, 8, 5).fillRect(22, 22, 8, 5); // pebbles
}

// Backgrounds are muted and have no thick outline, so the actors stand out.
// Hill shapes repeat every GAME_WIDTH pixels so the layers tile seamlessly.
function hills(g, color, base, amp, waves, height) {
  const pts = [{ x: 0, y: height }];
  for (let x = 0; x <= GAME_WIDTH; x += 8) {
    const t = (x / GAME_WIDTH) * Math.PI * 2;
    pts.push({ x, y: base - amp * Math.sin(t * waves[0]) - amp * 0.5 * Math.sin(t * waves[1] + 1) });
  }
  pts.push({ x: GAME_WIDTH, y: height });
  g.fillStyle(color).fillPoints(pts, true);
}

function drawFarHills(g) {
  g.fillStyle(P.cloud, 0.9);
  for (const [x, y] of [[90, 40], [330, 70], [560, 30], [720, 80]]) {
    g.fillCircle(x, y, 18).fillCircle(x + 20, y - 8, 22).fillCircle(x + 42, y, 16).fillRect(x, y, 42, 16);
  }
  hills(g, P.skyMuted, 150, 30, [2, 5], 240);
  hills(g, P.slateLight, 190, 18, [3, 7], 240);
}

function drawNearHills(g) {
  hills(g, P.oliveLight, 95, 22, [2, 4], 170);
  for (const x of [60, 250, 420, 610, 740]) { // simple round trees
    g.fillStyle(P.olive).fillRect(x - 3, 70, 6, 30).fillCircle(x, 64, 18);
  }
  hills(g, P.olive, 130, 12, [3, 6], 170);
}
