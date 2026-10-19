import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// Background music (PFK Theme, our own track) ships with every demo, the Core Keepers demo and the buyer kit (added 2026-10-19).
const FILES = ['pfk-theme-v1-alt.ogg', 'pfk-theme-v1-alt.m4a', 'pfk-theme-v1-alt.mp3'];
const has = (dir) => { for (const f of FILES) assert.ok(fs.statSync(new URL(f, dir)).size > 100000, dir + f); };
test('built demos ship the theme and reference it from the game code', () => {
  for (const demo of ['platformer', 'roguelite', 'idle', 'runner', 'puzzle']) {
    const d = new URL(`../dist/play/${demo}/`, import.meta.url);
    has(new URL('assets/audio/', d));
    const js = fs.readdirSync(new URL('assets/', d)).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(new URL('assets/' + f, d), 'utf8')).join('');
    assert.match(js, /assets\/audio\/pfk-theme-v1-alt\.ogg/, demo);
  }
});
test('private Core Keepers demo and buyer kit include the theme + music license', () => {
  has(new URL('../private/core-keepers/assets/audio/', import.meta.url));
  has(new URL('../private/kit/starter/public/assets/audio/', import.meta.url));
  assert.match(fs.readFileSync(new URL('../private/kit/LICENSE-MUSIC.txt', import.meta.url), 'utf8'), /may use this music in any number of your own games/);
  assert.match(fs.readFileSync(new URL('../private/kit/starter/src/main.js', import.meta.url), 'utf8'), /playMusic\('theme'\)/);
});
