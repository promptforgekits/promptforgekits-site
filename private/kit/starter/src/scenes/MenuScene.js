import Phaser from 'phaser';
import { startWithHowTo } from './HowToScene.js';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, STORAGE_KEYS, PARALLAX, INFO } from '../config.js';
import { addText, addPanel, addLegend, createParallax, updateParallax } from '../ui.js';
import { storage } from '../storage.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    this.scrollX = 0;

    createParallax(this);
    addPanel(this, 600, 350);

    const title = addText(this, cx, cy - 118, 'TINY PLATFORMER', 56, COLORS.accent);
    this.tweens.add({ targets: title, y: title.y - 6, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    addText(this, cx, cy - 72, INFO.goal, 18, COLORS.accent);
    addLegend(this, INFO.legend, cx, cy - 34, { cols: 2, colW: 290, rowH: 36 });

    addText(this, cx, cy + 50, INFO.controls, 18);
    const best = Number(storage.get(STORAGE_KEYS.highScore) || 0);
    addText(this, cx, cy + 80, `Best: ${best}`, 20, COLORS.accent);

    const start = addText(this, cx, cy + 124, 'PRESS SPACE OR CLICK TO START', 22);
    this.tweens.add({ targets: start, alpha: 0.35, duration: 600, yoyo: true, repeat: -1 });

    const go = () => startWithHowTo(this, 'GameScene');
    this.input.keyboard.once('keydown-SPACE', go);
    this.input.once('pointerdown', go);
  }

  update(time, delta) {
    // Slowly scroll the background so the menu feels alive
    this.scrollX += delta * PARALLAX.menuSpeed;
    updateParallax(this, this.scrollX, PARALLAX.far, PARALLAX.near);
  }
}
