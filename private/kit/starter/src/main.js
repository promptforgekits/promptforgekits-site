import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, WORLD } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import HowToScene from './scenes/HowToScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import OptionsScene from './scenes/OptionsScene.js';
import { registerMusic, playMusic, fileMusic } from './audio.js';

// Background music: "PFK Theme (boss loop)", an original track by Prompt Forge Kits (see LICENSE-MUSIC.txt).
// It loops, starts after the first click / tap / key, and follows the OPTIONS Music switch.
registerMusic('theme', fileMusic(['assets/audio/pfk-theme-v1-alt.ogg', 'assets/audio/pfk-theme-v1-alt.m4a', 'assets/audio/pfk-theme-v1-alt.mp3'], { loopEnd: 37.5 }));
playMusic('theme');

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: PALETTE.cloud,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: WORLD.gravity }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // First scene in the list starts automatically.
  scene: [BootScene, MenuScene, HowToScene, GameScene, GameOverScene, OptionsScene]
};

const game = new Phaser.Game(config);
window.game = game; // handy for debugging in the browser console
export default game;
