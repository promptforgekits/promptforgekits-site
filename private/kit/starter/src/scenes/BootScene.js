import Phaser from 'phaser';
import { ANIM, FONT } from '../config.js';
import { createTextures } from '../textures.js';

// Draws every texture once (no image files), builds the animations,
// loads the bundled font, then opens the menu.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    createTextures(this);
    this.createAnimations();
    // Load the bundled font before showing any text. Relative path (no leading /)
    // so it works on itch.io. If it fails, start anyway with a fallback font.
    const font = new FontFace(FONT, 'url(assets/fonts/LilitaOne-Regular.ttf)');
    font.load()
      .then(() => document.fonts.add(font))
      .catch(() => console.warn('Font failed to load, using fallback'))
      .then(() => this.scene.start('MenuScene'));
  }

  createAnimations() {
    // Each frame is its own texture key, e.g. 'player-run-0', 'player-run-1'
    const anim = (key, frameKeys, frameRate) => this.anims.create({
      key, frameRate, repeat: -1, frames: frameKeys.map((k) => ({ key: k }))
    });
    anim('player-idle', ['player-idle-0', 'player-idle-1'], ANIM.idleFps);
    anim('player-run', ['player-run-0', 'player-run-1'], ANIM.runFps);
    anim('player-jump', ['player-jump-0'], 1);
    anim('enemy-walk', ['enemy-0', 'enemy-1'], ANIM.runFps / 2);
    anim('coin-spin', ['coin-0', 'coin-1', 'coin-2', 'coin-3'], ANIM.coinFps);
    anim('flag-wave', ['flag-0', 'flag-1'], ANIM.flagFps);
  }
}
