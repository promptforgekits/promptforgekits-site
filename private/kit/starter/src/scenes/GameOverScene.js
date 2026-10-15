import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, STORAGE_KEYS, INFO } from '../config.js';
import { addText, addPanel, createParallax } from '../ui.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score ?? 0;
    this.won = data.won ?? false;
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const oldBest = Number(localStorage.getItem(STORAGE_KEYS.highScore) || 0);
    const best = Math.max(this.finalScore, oldBest);
    localStorage.setItem(STORAGE_KEYS.highScore, String(best));

    createParallax(this);
    addPanel(this, 480, 270);

    const title = addText(this, cx, cy - 80, this.won ? 'YOU WIN!' : 'GAME OVER', 56,
      this.won ? COLORS.good : COLORS.bad);
    title.setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 400, ease: 'Back.out' });

    addText(this, cx, cy - 10, `${INFO.score}: ${this.finalScore}     Best: ${best}`, 24);
    if (this.finalScore > oldBest) addText(this, cx, cy + 22, 'NEW BEST!', 18, COLORS.accent);

    const again = addText(this, cx, cy + 70, 'SPACE / click: play again', 20, COLORS.accent);
    this.tweens.add({ targets: again, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });
    addText(this, cx, cy + 100, 'M: menu', 16);

    const restart = () => this.scene.start('GameScene');
    this.input.keyboard.once('keydown-SPACE', restart);
    this.input.keyboard.once('keydown-M', () => this.scene.start('MenuScene'));
    this.input.once('pointerdown', restart);
  }
}
