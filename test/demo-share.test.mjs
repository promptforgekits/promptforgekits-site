import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// Public /play/<demo>/ pages are indexable and linked from X posts: each needs a share card with its own screenshot
// (Open Graph + X card) and its own VideoGame JSON-LD (added 2026-10-21). The gated Core Keepers demo never gets one.
const d = new URL('../dist/', import.meta.url);
const meta = (h, attr, key) => (h.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`)) || [])[1];
test('public demo pages: OG + X card with the game screenshot, VideoGame JSON-LD', () => {
  for (const demo of ['platformer', 'roguelite', 'idle', 'runner', 'puzzle']) {
    const h = fs.readFileSync(new URL(`play/${demo}/index.html`, d), 'utf8');
    const page = `https://promptforgekits.com/play/${demo}/`;
    const img = `https://promptforgekits.com/img/g-${demo}-1280.webp`;
    assert.equal(meta(h, 'property', 'og:url'), page, demo);
    assert.equal(meta(h, 'property', 'og:image'), img, demo);
    assert.ok(fs.existsSync(new URL(`img/g-${demo}-1280.webp`, d)), `${demo} screenshot shipped`);
    assert.equal(meta(h, 'property', 'og:title'), (h.match(/<title>([^<]+)<\/title>/) || [])[1], demo);
    assert.match(meta(h, 'property', 'og:description') || '', /^Play the free /, demo);
    assert.equal(meta(h, 'name', 'twitter:card'), 'summary_large_image', demo);
    assert.equal(meta(h, 'name', 'twitter:image'), img, demo);
    const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const g = blocks.find((b) => b['@type'] === 'VideoGame');
    assert.ok(g, `${demo} VideoGame JSON-LD`);
    assert.equal(g.url, page); assert.equal(g.image, img); assert.equal(g.isAccessibleForFree, true);
    assert.equal(g.offers.price, '0'); assert.equal(g.publisher.name, 'Prompt Forge Kits');
    assert.doesNotMatch(h, /\$\d/, demo); // still no price on demo pages
    // the game itself still boots from the same bundle
    assert.match(h, /<script type="module" crossorigin src="\.\/assets\/index-[^"]+\.js"><\/script>/, demo);
  }
  assert.ok(!fs.existsSync(new URL('play/towerdefense/index.html', d)), 'gated Core Keepers has no public page');
});
