import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, WORLD } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import HowToScene from './scenes/HowToScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

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
  scene: [BootScene, MenuScene, HowToScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);
window.game = game; // handy for debugging in the browser console
export default game;
