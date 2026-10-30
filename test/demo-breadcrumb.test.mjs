import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// Each public demo page (/play/<demo>/) has a BreadcrumbList Home > Play > <game> demo that matches the /play/ hub's own
// trail and the page's VideoGame + canonical (added 2026-10-29). The gated Core Keepers demo is never built into /play/.
const dist = new URL('../dist/', import.meta.url);
const lds = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).flatMap((j) => j['@graph'] || [j]);
test('demo pages: BreadcrumbList Home > Play > demo, matching the /play/ hub, VideoGame and canonical', () => {
  const hub = lds(fs.readFileSync(new URL('play/index.html', dist), 'utf8')).find((x) => x['@type'] === 'BreadcrumbList');
  assert.ok(hub, '/play/ breadcrumb');
  const hubTrail = hub.itemListElement.map((x) => [x.name, x.item]);
  for (const demo of ['platformer', 'roguelite', 'idle', 'runner', 'puzzle']) {
    const h = fs.readFileSync(new URL(`play/${demo}/index.html`, dist), 'utf8');
    const ld = lds(h);
    const crumbs = ld.filter((x) => x['@type'] === 'BreadcrumbList');
    assert.equal(crumbs.length, 1, `${demo}: one BreadcrumbList`);
    const items = crumbs[0].itemListElement;
    assert.equal(items.length, 3, demo);
    items.forEach((x, i) => { assert.equal(x['@type'], 'ListItem'); assert.equal(x.position, i + 1); });
    assert.deepEqual(items.slice(0, 2).map((x) => [x.name, x.item]), hubTrail, `${demo}: same trail as /play/`);
    const game = ld.find((x) => x['@type'] === 'VideoGame');
    const canon = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    assert.equal(items[2].item, canon, `${demo}: last crumb = canonical`);
    assert.equal(items[2].item, game.url, demo);
    assert.equal(items[2].name, game.name, `${demo}: last crumb name = VideoGame name`);
    assert.doesNotMatch(JSON.stringify(crumbs[0]), /\$\d|price|gumroad|itch\.io/i, demo);
  }
  assert.ok(!fs.existsSync(new URL('play/towerdefense/index.html', dist)), 'no public towerdefense demo');
});
