import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, OUTLINE, HOWTO } from '../config.js';
import { addText, addPanel } from '../ui.js';

// "How to play" panel shown once, right after the player first presses Play (before any gameplay).
// Text comes from HOWTO in config.js ({ keyboard, mouse, touch }). Start button, SPACE / ENTER, or a tap anywhere starts the game.
const css = (n) => '#' + n.toString(16).padStart(6, '0'); // PALETTE number -> text color
const S = GAME_WIDTH / 800; // layout is drawn for 800x450 and scaled for bigger games

// Use this instead of scene.start('GameScene', data) in the menu: shows the panel first time, then goes straight in.
export function startWithHowTo(scene, next, data) {
  if (scene.registry.get('howtoSeen')) scene.scene.start(next, data);
  else scene.scene.start('HowToScene', { next, data });
}

export default class HowToScene extends Phaser.Scene {
  constructor() { super('HowToScene'); }

  init(data) { this.nextKey = data.next ?? 'GameScene'; this.nextData = data.data; this.started = false; }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, PALETTE.ink);
    for (let y = 0; y < GAME_HEIGHT; y += 50 * S) for (let x = 0; x < GAME_WIDTH; x += 50 * S) {
      if (((x + y) / (50 * S)) % 2 === 0) this.add.rectangle(x + 25 * S, y + 25 * S, 44 * S, 44 * S, PALETTE.slateDark, 0.5);
    }
    const pw = 680 * S, ph = 392 * S;
    addPanel(this, pw, ph, (GAME_WIDTH - pw) / 2, 28 * S);
    addText(this, GAME_WIDTH / 2, 68 * S, 'HOW TO PLAY', 38 * S, css(PALETTE.gold));

    const rows = [['KEYBOARD', HOWTO.keyboard, PALETTE.cyan], ['MOUSE', HOWTO.mouse, PALETTE.green], ['TOUCH', HOWTO.touch, PALETTE.purple ?? PALETTE.gold]];
    rows.forEach(([label, text, color], i) => {
      const y = (140 + i * 72) * S;
      const chip = this.add.rectangle(130 * S, y, 130 * S, 34 * S, color).setStrokeStyle(OUTLINE, PALETTE.ink);
      // Plain dark label on the colored chip: no outline or shadow (set after addText, since some ui.js versions ignore extra style)
      addText(this, chip.x, y, label, 17 * S, css(PALETTE.ink)).setStroke(css(color), 0).setShadow(0, 0, css(color), 0, false, false);
      addText(this, 215 * S, y, text, 17 * S, '#ffffff', { align: 'left', wordWrap: { width: 480 * S } }).setOrigin(0, 0.5);
    });

    // Start button: big hit area (touch friendly)
    const bx = GAME_WIDTH / 2, by = 358 * S, bw = 230 * S, bh = 56 * S;
    const g = this.add.graphics();
    g.fillStyle(PALETTE.ink).fillRoundedRect(bx - bw / 2, by - bh / 2 + 5, bw, bh, 14);
    g.fillStyle(PALETTE.green).fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 14);
    g.fillStyle(PALETTE.white, 0.35).fillRoundedRect(bx - bw / 2 + 8, by - bh / 2 + 6, bw - 16, 8, 4);
    g.lineStyle(OUTLINE + 1, PALETTE.ink).strokeRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 14);
    this.btnLabel = addText(this, bx, by, 'START', 30 * S, '#ffffff');
    this.tweens.add({ targets: this.btnLabel, scale: 1.08, duration: 500, yoyo: true, repeat: -1 });
    const hit = this.add.rectangle(bx, by, bw, bh, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => this.go());
    addText(this, GAME_WIDTH / 2, 402 * S, 'or press SPACE / ENTER, or tap anywhere', 14 * S, css(PALETTE.skyMuted ?? PALETTE.white));

    // Ignore input for a moment so the click / key that opened this screen cannot also dismiss it
    this.time.delayedCall(300, () => {
      this.input.keyboard.once('keydown-SPACE', () => this.go());
      this.input.keyboard.once('keydown-ENTER', () => this.go());
      this.input.on('pointerdown', () => this.go());
    });
  }

  go() {
    if (this.started) return;
    this.started = true;
    this.registry.set('howtoSeen', true);
    this.scene.start(this.nextKey, this.nextData);
  }
}
