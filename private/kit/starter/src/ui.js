// Shared look for text and backgrounds, so every scene matches.
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT, PALETTE, OUTLINE, TEXT } from './config.js';

// Text with the bundled font and a dark outline. Usage: addText(this, x, y, 'Hi', 24)
export function addText(scene, x, y, text, size = 20, color = COLORS.text, extra = {}) {
  return scene.add.text(x, y, text, {
    fontFamily: `"${FONT}", monospace`,
    fontSize: `${size}px`,
    color,
    stroke: COLORS.outline,
    strokeThickness: Math.max(4, Math.round(size / 5)),
    shadow: { offsetX: 0, offsetY: 3, color: COLORS.outline, fill: true, stroke: true },
    ...extra
  }).setOrigin(0.5);
}

// Two background layers that scroll slower than the level (parallax).
// Call updateParallax(scene, scrollX) every frame to move them.
export function createParallax(scene) {
  // Sky: soft muted gradient (backgrounds stay low-contrast so actors pop)
  scene.add.graphics().setScrollFactor(0).setDepth(-30)
    .fillGradientStyle(PALETTE.skyMuted, PALETTE.skyMuted, PALETTE.cloud, PALETTE.cloud, 1)
    .fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  scene.bgFar = scene.add.tileSprite(0, GAME_HEIGHT - 240 - 40, GAME_WIDTH, 240, 'bg-far')
    .setOrigin(0).setScrollFactor(0).setDepth(-20);
  scene.bgNear = scene.add.tileSprite(0, GAME_HEIGHT - 170, GAME_WIDTH, 170, 'bg-near')
    .setOrigin(0).setScrollFactor(0).setDepth(-10);
}

export function updateParallax(scene, scrollX, far, near) {
  scene.bgFar.tilePositionX = scrollX * far;
  scene.bgNear.tilePositionX = scrollX * near;
}

// Chunky panel: flat slate card, thick ink outline, solid drop shadow.
// Centered on screen by default; pass x, y to place it elsewhere (top-left corner).
export function addPanel(scene, width, height, x = (GAME_WIDTH - width) / 2, y = (GAME_HEIGHT - height) / 2) {
  const g = scene.add.graphics();
  g.fillStyle(PALETTE.ink).fillRoundedRect(x, y + 6, width, height, 18); // shadow
  g.fillStyle(PALETTE.slateDark).fillRoundedRect(x, y, width, height, 18);
  g.fillStyle(PALETTE.slate).fillRoundedRect(x + 8, y + 8, width - 16, 10, 5); // highlight
  g.lineStyle(OUTLINE + 1, PALETTE.ink).strokeRoundedRect(x, y, width, height, 18);
  return g;
}

// ---------------------------------------------------------------------------
// Clarity helpers: show names and one-line descriptions on screen.
// All wording lives in config.js (INFO / *_TEXT); these only draw it.
// ---------------------------------------------------------------------------

// Small outlined name label that follows `target` (a sprite, enemy, coin ...).
// It appears the first time the target is on screen, then fades after `ms`.
// Usage: addTag(this, enemy, INFO.tags.enemy, { color: TEXT.red })
export function addTag(scene, target, label, { color = TEXT.white, ms = 6000, size = 15, dy, ox = 0 } = {}) {
  const offset = dy ?? -(target.displayHeight / 2) - 14;
  const t = addText(scene, target.x + ox, target.y + offset, label, size, color).setDepth(9).setVisible(false);
  let until = 0;
  const finish = () => { scene.events.off('update', follow); t.destroy(); };
  const follow = () => {
    if (!target.active || !t.active) return finish();
    t.setPosition(target.x + ox, target.y + offset);
    if (!until && scene.cameras.main.worldView.contains(target.x, target.y)) {
      until = scene.time.now + ms;
      t.setVisible(true);
    }
    if (until && scene.time.now > until) finish();
  };
  scene.events.on('update', follow);
  scene.events.once('shutdown', () => scene.events.off('update', follow));
  return t;
}

// Panel with one or two lines of text (goal / controls reminder) that fades out.
// Stays fixed on the screen. Usage: addBanner(this, INFO.goalBanner, { y: 70 })
export function addBanner(scene, text, { y = 84, ms = 7000, size = 18, color = TEXT.white } = {}) {
  const label = addText(scene, 0, 0, text, size, color, { align: 'center' });
  const w = label.width + 44, h = label.height + 22;
  const panel = addPanel(scene, w, h, -w / 2, -h / 2);
  const box = scene.add.container(GAME_WIDTH / 2, y, [panel, label]).setDepth(40).setScrollFactor(0);
  box.setAlpha(0);
  scene.tweens.add({ targets: box, alpha: 1, duration: 250 });
  scene.tweens.add({ targets: box, alpha: 0, delay: ms, duration: 500, onComplete: () => box.destroy() });
  return box;
}

// A grid of "icon + short name" entries, e.g. [{ icon: 'coin', label: 'Coin +10' }].
// Centered on x, first row at y. icon = texture key (or null for no icon).
export function addLegend(scene, items, x, y, { cols = 2, colW = 230, rowH = 38, size = 17 } = {}) {
  const rows = Math.ceil(items.length / cols);
  const objs = [];
  items.forEach((it, i) => {
    const cx = x + ((i % cols) - (cols - 1) / 2) * colW - colW / 2 + 22;
    const cy = y + Math.floor(i / cols) * rowH;
    if (it.icon) {
      const img = scene.add.image(cx, cy, it.icon);
      img.setScale(Math.min(30 / img.width, 30 / img.height, 1.6));
      objs.push(img);
    }
    objs.push(addText(scene, cx + 26, cy, it.label, size, it.color ?? TEXT.white).setOrigin(0, 0.5));
  });
  return { objs, height: rows * rowH };
}

// Hover (or touch-hold) info box for any interactive object.
// `content` is a string or a function that returns a string (so it can show live numbers).
export function addTooltip(scene, target, content) {
  const tip = () => {
    if (!scene.clarityTip || !scene.clarityTip.active) {
      const g = scene.add.graphics();
      const text = addText(scene, 0, 0, '', 15, TEXT.white, { align: 'left', wordWrap: { width: 230 } }).setOrigin(0, 0);
      scene.clarityTip = scene.add.container(0, 0, [g, text]).setDepth(100).setVisible(false).setScrollFactor(0);
      scene.clarityTip.g = g;
      scene.clarityTip.text = text;
    }
    return scene.clarityTip;
  };
  const place = (pointer) => {
    const t = tip();
    const w = t.text.width + 24, h = t.text.height + 18;
    const px = Math.min(Math.max(pointer.x - w - 14, 6), GAME_WIDTH - w - 6);
    const py = Math.min(Math.max(pointer.y - h / 2, 6), GAME_HEIGHT - h - 6);
    t.setPosition(px, py);
    t.text.setPosition(12, 9);
    t.g.clear().fillStyle(PALETTE.ink).fillRoundedRect(0, 4, w, h, 10)
      .fillStyle(PALETTE.slateDark).fillRoundedRect(0, 0, w, h, 10)
      .lineStyle(OUTLINE, PALETTE.gold).strokeRoundedRect(0, 0, w, h, 10);
  };
  target.on('pointerover', (pointer) => {
    const t = tip();
    t.text.setText(typeof content === 'function' ? content() : content);
    place(pointer);
    t.setVisible(true);
  });
  target.on('pointermove', (pointer) => {
    const t = tip();
    if (!t.visible) return;
    if (typeof content === 'function') t.text.setText(content());
    place(pointer);
  });
  target.on('pointerout', () => tip().setVisible(false));
  return target;
}
