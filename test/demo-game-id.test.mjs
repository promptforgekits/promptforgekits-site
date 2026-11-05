import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// Each public demo's VideoGame has one @id (<demo url>#game) used both on its own page and in the /play/ ItemList, so a
// list entry joins its page, plus inLanguage and isBasedOn = the genre's prompt sequence (/genres/<slug>/#steps, an @id
// that the genre page really defines) and the kit Product (/#product, defined on the home page). Added 2026-11-05.
const dist = new URL('../dist/', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, dist), 'utf8');
const lds = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).flatMap((j) => j['@graph'] || [j]);
const SLUG = { platformer: 'platformer', roguelite: 'roguelite', idle: 'idle-clicker', runner: 'endless-runner', puzzle: 'puzzle' };
const B = 'https://promptforgekits.com';
test('demo VideoGame: same @id on its page and in the /play/ list, inLanguage, isBasedOn genre steps + kit product', () => {
  const hubList = lds(read('play/index.html')).find((x) => x['@type'] === 'ItemList');
  const homeIds = lds(read('index.html')).map((x) => x['@id']);
  assert.ok(homeIds.includes(`${B}/#product`), 'home defines #product');
  assert.equal(hubList.itemListElement.length, 5);
  for (const [demo, slug] of Object.entries(SLUG)) {
    const game = lds(read(`play/${demo}/index.html`)).find((x) => x['@type'] === 'VideoGame');
    assert.equal(game['@id'], `${B}/play/${demo}/#game`, demo);
    assert.equal(game.url, `${B}/play/${demo}/`, demo);
    assert.equal(game.inLanguage, 'en', demo);
    const based = game.isBasedOn.map((x) => x['@id']);
    assert.deepEqual(based, [`${B}/genres/${slug}/#steps`, `${B}/#product`], demo);
    const steps = lds(read(`genres/${slug}/index.html`)).find((x) => x['@id'] === based[0]);
    assert.ok(steps && steps['@type'] === 'ItemList', `${demo}: /genres/${slug}/ defines ${based[0]}`);
    const entry = hubList.itemListElement.find((x) => x.item.url === game.url);
    assert.ok(entry, `${demo} in /play/ list`);
    assert.equal(entry.item['@id'], game['@id'], `${demo}: list entry @id = page @id`);
    assert.equal(game.offers.price, '0', `${demo}: still free`);
  }
  assert.ok(!fs.existsSync(new URL('play/towerdefense/index.html', dist)), 'no public towerdefense demo');
});
