import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// Built /play/<demo>/ pages must not ship the starter's placeholder title (added 2026-10-19).
test('built demo pages: real title, description, self canonical', () => {
  const d = new URL('../dist/play/', import.meta.url);
  for (const demo of ['platformer', 'roguelite', 'idle', 'runner', 'puzzle']) {
    const h = fs.readFileSync(new URL(`${demo}/index.html`, d), 'utf8');
    assert.doesNotMatch(h, /<title>My Browser Game<\/title>/, demo);
    assert.match(h, /<title>[^<]+demo: free browser game built with AI prompts \| Prompt Forge Kits<\/title>/, demo);
    assert.match(h, /<meta name="description" content="Play the free [^"]+Browser Game Starter Kit\." \/>/, demo);
    assert.match(h, new RegExp(`<link rel="canonical" href="https://promptforgekits.com/play/${demo}/" />`), demo);
    assert.doesNotMatch(h, /\$\d/, demo); // no price on demo pages
  }
});
