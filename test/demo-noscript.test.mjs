// Public demo pages (/play/<demo>/) carry a <noscript> text block (h1, description, links) for crawlers and
// AI chatbots that don't run JS (2026-10-30). No prices, no store links; the gated Core Keepers demo has no public page.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const DEMOS = ['platformer', 'roguelite', 'idle', 'runner', 'puzzle'];
test('each public demo page has one noscript block with an h1 and links to its genre page and /play/', () => {
  for (const d of DEMOS) {
    const h = fs.readFileSync(`dist/play/${d}/index.html`, 'utf8');
    const ns = h.match(/<noscript>([\s\S]*?)<\/noscript>/g) || [];
    assert.equal(ns.length, 1, d);
    assert.match(ns[0], /<h1>[^<]+ demo<\/h1>/, d);
    assert.match(ns[0], /href="\/genres\/[a-z-]+\/"/, d);
    assert.match(ns[0], /href="\/play\/"/, d);
    assert.doesNotMatch(ns[0], /\$\d|gumroad|itch\.io/i, d);
    assert.ok(h.indexOf('<noscript>') > h.indexOf('<body>'), d + ': noscript is in the body');
    assert.ok(h.includes('<div id="game"></div>'), d + ': game container untouched');
  }
  assert.ok(!fs.existsSync('dist/play/towerdefense/index.html'));
});
