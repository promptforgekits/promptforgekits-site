import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// 2026-11-06: /play/ ItemList of the five free demos had no @id (unlike /genres/#sequences), so nothing could
// name "the free demos list" as one object or link it to the kit. Now @id /play/#demos, inLanguage en, isPartOf #product.
const dist = new URL('../dist/', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, dist), 'utf8');
const lds = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).flatMap((j) => j['@graph'] || [j]);
const B = 'https://promptforgekits.com';
const DEMOS = ['platformer', 'roguelite', 'idle', 'runner', 'puzzle'];

test('/play/ ItemList has @id /play/#demos, inLanguage, isPartOf kit product, and lists the five demo @ids', () => {
  const homeIds = lds(read('index.html')).map((x) => x['@id']);
  assert.ok(homeIds.includes(`${B}/#product`), 'home defines #product');
  const lists = lds(read('play/index.html')).filter((x) => x['@type'] === 'ItemList');
  assert.equal(lists.length, 1, 'one ItemList on /play/');
  const L = lists[0];
  assert.equal(L['@id'], `${B}/play/#demos`);
  assert.equal(L.url, `${B}/play/`);
  assert.equal(L.inLanguage, 'en');
  assert.equal(L.isPartOf?.['@id'], `${B}/#product`);
  assert.equal(L.numberOfItems, 5);
  assert.equal(L.itemListElement.length, 5);
  L.itemListElement.forEach((e, i) => {
    assert.equal(e.position, i + 1);
    assert.equal(e.item?.['@id'], `${B}/play/${DEMOS[i]}/#game`);
    assert.equal(e.item?.offers?.price, '0');
  });
  const json = JSON.stringify(L);
  assert.ok(!/\$29|\$39|\$55|gumroad|itch\.io/i.test(json), 'no paid prices or store links');
  assert.ok(!fs.existsSync(new URL('play/towerdefense/index.html', dist)), 'no public towerdefense demo');
});
