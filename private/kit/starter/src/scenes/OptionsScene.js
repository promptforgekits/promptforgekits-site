import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, OUTLINE, FONT } from '../config.js';
import { isMusicOn, isSfxOn, toggleMusic, toggleSfx, beep } from '../audio.js';

// OPTIONS panel: Music ON/OFF and Sound FX ON/OFF (saved, both ON by default; see audio.js).
// It opens ON TOP of the scene that asked for it (menu or game), pauses that scene, and resumes it on Back.
//   Menu:  addOptionsButton(this, { label: 'OPTIONS' })   -> bottom-right corner
//   Play:  addOptionsButton(this, { x, y })               -> small gear; the O key opens it too
const S = GAME_WIDTH / 800; // layout is drawn for 800x450 and scaled for bigger games
const css = (n) => '#' + n.toString(16).padStart(6, '0');
const txt = (scene, x, y, s, size, color = '#ffffff') => scene.add.text(x, y, s, {
  fontFamily: FONT, fontSize: Math.round(size) + 'px', color, fontStyle: 'bold',
  stroke: css(PALETTE.ink), strokeThickness: Math.max(3, Math.round(size / 6)),
}).setOrigin(0.5);

export function openOptions(scene) {
  if (scene.scene.isActive('OptionsScene')) return;
  scene.scene.launch('OptionsScene', { from: scene.scene.key });
  scene.scene.pause();
}

// Chunky button that opens Options. Clicks on it never reach the scene below (no accidental Start / jump).
export function addOptionsButton(scene, { label = '', x, y, depth = 1000 } = {}) {
  const h = 40 * S, w = label ? h + (label.length * 13 + 22) * S : h;
  x = x ?? GAME_WIDTH - w / 2 - 14 * S; y = y ?? (label ? GAME_HEIGHT - h / 2 - 16 * S : h / 2 + 12 * S); // labelled: bottom-right, gear: top-right
  const c = scene.add.container(x, y).setDepth(depth).setScrollFactor(0);
  const g = scene.add.graphics();
  g.fillStyle(PALETTE.ink).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 12 * S);
  g.fillStyle(PALETTE.slate).fillRoundedRect(-w / 2, -h / 2, w, h, 12 * S);
  g.lineStyle(OUTLINE, PALETTE.ink).strokeRoundedRect(-w / 2, -h / 2, w, h, 12 * S);
  // gear icon: 8 teeth + ring
  const gx = -w / 2 + h / 2, r = 11 * S;
  g.fillStyle(PALETTE.white);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.fillCircle(gx + Math.cos(a) * r, Math.sin(a) * r, 4 * S);
  }
  g.fillCircle(gx, 0, r).fillStyle(PALETTE.slate).fillCircle(gx, 0, 4.5 * S);
  c.add(g);
  if (label) c.add(txt(scene, gx + h / 2 - 4 * S + (w - h) / 2, 0, label, 18 * S));
  const hit = scene.add.rectangle(0, 0, w + 8, h + 8, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
  c.add(hit);
  hit.on('pointerdown', (p, lx, ly, event) => { event.stopPropagation(); openOptions(scene); });
  hit.on('pointerover', () => c.setScale(1.06));
  hit.on('pointerout', () => c.setScale(1));
  if (scene.input.keyboard) scene.input.keyboard.on('keydown-O', () => openOptions(scene));
  return c;
}

export default class OptionsScene extends Phaser.Scene {
  constructor() { super('OptionsScene'); }

  init(data) { this.from = data.from; }

  create() {
    // dim the paused scene; the big invisible rectangle also swallows clicks
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, PALETTE.ink, 0.72).setInteractive();
    const pw = 440 * S, ph = 300 * S, px = (GAME_WIDTH - pw) / 2, py = (GAME_HEIGHT - ph) / 2;
    const g = this.add.graphics();
    g.fillStyle(PALETTE.ink).fillRoundedRect(px, py + 6, pw, ph, 18 * S);
    g.fillStyle(PALETTE.slateDark).fillRoundedRect(px, py, pw, ph, 18 * S);
    g.lineStyle(OUTLINE + 1, PALETTE.ink).strokeRoundedRect(px, py, pw, ph, 18 * S);
    g.lineStyle(2, PALETTE.slate).strokeRoundedRect(px + 6, py + 6, pw - 12, ph - 12, 14 * S);
    txt(this, GAME_WIDTH / 2, py + 40 * S, 'OPTIONS', 36 * S, css(PALETTE.gold));

    this.rows = [
      this.toggleRow(py + 108 * S, 'MUSIC', isMusicOn, toggleMusic),
      this.toggleRow(py + 172 * S, 'SOUND FX', isSfxOn, () => { const on = toggleSfx(); if (on) beep(660, 0.08, { slideTo: 990 }); return on; }),
    ];
    this.button(GAME_WIDTH / 2, py + ph - 42 * S, 170 * S, 50 * S, 'BACK', PALETTE.gold, () => this.close());
    txt(this, GAME_WIDTH / 2, py + ph + 24 * S, 'Esc / Enter: back', 14 * S, css(PALETTE.white));

    // short delay so the click / key that opened the panel cannot also close it
    this.time.delayedCall(250, () => {
      ['keydown-ESC', 'keydown-ENTER', 'keydown-SPACE', 'keydown-O'].forEach((k) => this.input.keyboard.on(k, () => this.close()));
    });
  }

  toggleRow(y, label, get, toggle) {
    const lx = GAME_WIDTH / 2 - 190 * S;
    this.add.text(lx, y, label, { fontFamily: FONT, fontSize: Math.round(24 * S) + 'px', color: '#ffffff', fontStyle: 'bold',
      stroke: css(PALETTE.ink), strokeThickness: 4 }).setOrigin(0, 0.5);
    const btn = this.button(GAME_WIDTH / 2 + 120 * S, y, 130 * S, 48 * S, '', PALETTE.green, () => { toggle(); paint(); });
    const paint = () => { const on = get(); btn.paint(on ? PALETTE.green : PALETTE.red, on ? 'ON' : 'OFF'); };
    paint();
    return btn;
  }

  button(x, y, w, h, label, color, onClick) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const t = txt(this, 0, 0, label, 26 * S);
    c.add([g, t]);
    c.paint = (col, text) => {
      g.clear();
      g.fillStyle(PALETTE.ink).fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 14 * S);
      g.fillStyle(col).fillRoundedRect(-w / 2, -h / 2, w, h, 14 * S);
      g.fillStyle(PALETTE.white, 0.35).fillRoundedRect(-w / 2 + 8, -h / 2 + 6, w - 16, 7 * S, 4);
      g.lineStyle(OUTLINE + 1, PALETTE.ink).strokeRoundedRect(-w / 2, -h / 2, w, h, 14 * S);
      if (text !== undefined) t.setText(text);
      c.state = text;
    };
    c.paint(color, label);
    const hit = this.add.rectangle(0, 0, w, h, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    c.add(hit);
    hit.on('pointerdown', (p, lx, ly, event) => { event.stopPropagation(); onClick(); });
    hit.on('pointerover', () => c.setScale(1.05));
    hit.on('pointerout', () => c.setScale(1));
    return c;
  }

  close() {
    if (this.closing) return;
    this.closing = true;
    const from = this.from;
    this.scene.stop();
    if (from) this.scene.resume(from);
  }
}
