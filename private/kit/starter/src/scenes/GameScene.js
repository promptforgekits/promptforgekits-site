import Phaser from 'phaser';
import {
  GAME_HEIGHT, TILE, PLAYER, ENEMY, WORLD, SCORE, COLORS, PALETTE, PARALLAX, PARTICLES, INFO, TEXT
} from '../config.js';
import { addText, addTag, addBanner, createParallax, updateParallax } from '../ui.js';

// Level layout, measured in tiles (1 tile = TILE pixels). Edit these to design your level.
// Platforms: [tileX, tileY, widthInTiles]. Row 11 is the ground; smaller y = higher up.
const PLATFORMS = [
  [0, 11, 14], [17, 11, 12], [32, 11, 14], [49, 11, 19], // ground (gaps are pits)
  [7, 9, 3], [12, 7, 3], [19, 9, 3], [25, 8, 3], [29, 6, 4],
  [37, 9, 3], [42, 7, 4], [51, 9, 3], [56, 7, 3]
];
const COINS = [[8, 8], [9, 8], [13, 6], [14, 6], [20, 8], [26, 7], [30, 5], [31, 5],
  [38, 8], [43, 6], [44, 6], [52, 8], [57, 6], [61, 10]];
const ENEMIES = [[9, 11], [21, 11], [35, 11], [53, 11]]; // walkers: [tileX, groundRow]
const SPIKES = [[27, 11], [41, 11], [46, 11], [59, 11]]; // [tileX, groundRow]
const GOAL = [65, 11]; // flag: [tileX, groundRow]


export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.score = 0;
    this.isOver = false;

    this.physics.world.setBounds(0, 0, WORLD.width, GAME_HEIGHT + 100);
    this.cameras.main.setBounds(0, 0, WORLD.width, GAME_HEIGHT);
    this.cameras.main.fadeIn(300);

    createParallax(this);
    this.createLevel();
    this.createPlayer();
    this.createEffects();
    this.createHud();
    this.createInput();
    this.createCollisions();
    this.createHints();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  createLevel() {
    this.firstCoin = this.firstEnemy = this.firstSpike = null; // first of each kind gets a name tag
    this.platforms = this.physics.add.staticGroup();
    for (const [tx, ty, width] of PLATFORMS) {
      for (let i = 0; i < width; i++) {
        let key = 'tile-mid';
        if (i === 0) key = 'tile-left';
        if (i === width - 1) key = 'tile-right';
        this.platforms.create((tx + i) * TILE + TILE / 2, ty * TILE + TILE / 2, key);
        // Ground gets a filler row underneath (decoration only, no physics)
        if (ty === 11) this.add.image((tx + i) * TILE + TILE / 2, 12 * TILE + TILE / 2, 'tile-fill');
      }
    }

    this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const [tx, ty] of COINS) {
      const coin = this.coins.create(tx * TILE + TILE / 2, ty * TILE + TILE / 2, 'coin-0');
      coin.play('coin-spin');
      if (!this.firstCoin) this.firstCoin = coin;
      coin.body.setSize(20, 20);
      this.tweens.add({ targets: coin, y: coin.y - 5, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // Enemies and spikes share one group: touching either ends the game.
    this.hazards = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const [tx, row] of ENEMIES) {
      const enemy = this.hazards.create(tx * TILE, row * TILE - 19, 'enemy-0');
      enemy.play('enemy-walk');
      if (!this.firstEnemy) this.firstEnemy = enemy;
      enemy.body.setSize(26, 26).setOffset(7, 8);
      // Simple patrol: walk right, turn, walk back
      this.tweens.add({
        targets: enemy, x: enemy.x + ENEMY.patrolDistance, duration: ENEMY.patrolDuration,
        yoyo: true, repeat: -1, ease: 'Sine.inOut',
        onYoyo: () => enemy.setFlipX(true), onRepeat: () => enemy.setFlipX(false)
      });
    }
    for (const [tx, row] of SPIKES) {
      const spike = this.hazards.create(tx * TILE + TILE / 2, row * TILE - 11, 'spikes');
      spike.body.setSize(28, 12).setOffset(4, 10);
      if (!this.firstSpike) this.firstSpike = spike;
    }

    this.goal = this.physics.add.staticSprite(GOAL[0] * TILE + TILE / 2, GOAL[1] * TILE - 38, 'flag-0');
    this.goal.play('flag-wave');
  }

  createPlayer() {
    this.player = this.physics.add.sprite(PLAYER.startX, PLAYER.startY, 'player-idle-0');
    this.player.body.setSize(30, 40).setOffset(7, 7); // hitbox smaller than the picture
    this.player.setCollideWorldBounds(true);
    this.player.play('player-idle');
    this.physics.world.setBoundsCollision(true, true, true, false); // can fall out the bottom
  }

  createEffects() {
    // One particle emitter, reused for every burst with emitter.explode().
    this.sparks = this.add.particles(0, 0, 'spark', {
      speed: { min: 80, max: 220 }, lifespan: 600, gravityY: 300,
      scale: { start: 1, end: 0 }, emitting: false
    }).setDepth(5);
  }

  burst(x, y, count, tint) {
    this.sparks.setParticleTint(tint);
    this.sparks.explode(count, x, y);
  }

  // Goal line + a name above the first coin, walker, spikes and the flag (first time each is seen).
  createHints() {
    const ms = INFO.tagSeconds * 1000;
    addBanner(this, INFO.banner, { y: 96, ms: INFO.bannerSeconds * 1000 });
    addTag(this, this.firstCoin, INFO.tags.coin, { color: TEXT.gold, ms });
    addTag(this, this.firstEnemy, INFO.tags.enemy, { color: TEXT.red, ms });
    addTag(this, this.firstSpike, INFO.tags.spikes, { color: TEXT.red, ms });
    addTag(this, this.goal, INFO.tags.goal, { color: TEXT.green, ms });
  }

  scoreLabel() {
    return `${INFO.score}: ${this.score}`;
  }

  createHud() {
    this.add.image(28, 28, 'coin-0').setScrollFactor(0).setDepth(10);
    this.scoreText = addText(this, 52, 28, this.scoreLabel(), 26, COLORS.accent)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(10);
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,D');
  }

  createCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.hazards, () => this.endGame(false), null, this);
    this.physics.add.overlap(this.player, this.goal, () => this.endGame(true), null, this);
  }

  collectCoin(player, coin) {
    this.burst(coin.x, coin.y, PARTICLES.coinBurst, PALETTE.gold);
    coin.destroy();
    this.score += SCORE.coin;
    this.scoreText.setText(this.scoreLabel());
    this.tweens.add({ targets: this.scoreText, scale: 1.3, duration: 80, yoyo: true });
  }

  endGame(won) {
    if (this.isOver) return; // guard: overlaps fire every frame
    this.isOver = true;
    this.physics.pause();
    this.player.anims.stop();
    if (won) {
      this.burst(this.goal.x, this.goal.y - 30, PARTICLES.winBurst, PALETTE.gold);
    } else {
      this.player.setTintFill(PALETTE.white); // white flash = hit
      this.time.delayedCall(80, () => this.player.setTint(PALETTE.red));
      this.burst(this.player.x, this.player.y, PARTICLES.deathBurst, PALETTE.red);
      this.cameras.main.shake(200, 0.01);
    }
    this.time.delayedCall(700, () => {
      this.scene.start('GameOverScene', { score: this.score, won });
    });
  }

  update() {
    updateParallax(this, this.cameras.main.scrollX, PARALLAX.far, PARALLAX.near);
    if (this.isOver) return;

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const jump = this.cursors.up.isDown || this.cursors.space.isDown || this.keys.W.isDown;
    const onGround = this.player.body.blocked.down;

    if (left) this.player.setVelocityX(-PLAYER.speed).setFlipX(true);
    else if (right) this.player.setVelocityX(PLAYER.speed).setFlipX(false);
    else this.player.setVelocityX(0);

    if (jump && onGround) this.player.setVelocityY(PLAYER.jumpVelocity);

    this.updateAnimation(onGround, left || right);

    if (this.player.y > GAME_HEIGHT + 40) this.endGame(false); // fell in a pit
  }

  updateAnimation(onGround, moving) {
    if (!onGround) this.player.play('player-jump', true);
    else if (moving) this.player.play('player-run', true);
    else this.player.play('player-idle', true);
  }
}
