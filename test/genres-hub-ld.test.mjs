import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
// 2026-10-28: /genres/ (the hub for the six prompt sequences) had only a BreadcrumbList, while each genre page
// has its own step ItemList (#steps). The hub now has an ItemList of the six sequences in the visible card order,
// each entry pointing at its genre page and that page's #steps list, so crawlers / AI assistants can answer
// "which genres does the kit cover, and how many prompts each?" from one page. No prices here.
const DIST = new URL('../dist/', import.meta.url).pathname;
const d = (f) => fs.readFileSync(path.join(DIST, f), 'utf8');
const { genres } = await import('../src/content.mjs');
const ld = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => { const j = JSON.parse(m[1]); return j['@graph'] || [j]; });
const U = 'https://promptforgekits.com';

test('/genres/ lists the six sequences as an ItemList matching the visible cards and each genre page', () => {
  const h = d('genres/index.html');
  const lists = ld(h).filter((x) => x['@type'] === 'ItemList');
  assert.equal(lists.length, 1, 'one ItemList on /genres/');
  const L = lists[0];
  assert.equal(L['@id'], `${U}/genres/#sequences`);
  assert.equal(L.url, `${U}/genres/`);
  assert.equal(L.isPartOf?.['@id'], `${U}/#product`);
  const visible = [...h.matchAll(/<h3><a class="stretch" href="\/genres\/([^/]+)\/">([^<]+)<\/a>/g)].map((m) => m[1]);
  assert.equal(visible.length, 6);
  assert.deepEqual(visible, genres.map((g) => g.slug), 'visible cards = content.mjs order');
  assert.equal(L.numberOfItems, 6);
  assert.equal(L.itemListElement.length, 6);
  L.itemListElement.forEach((e, i) => {
    const g = genres[i];
    assert.equal(e.position, i + 1);
    assert.equal(e.url, `${U}/genres/${g.slug}/`);
    // must match the genre page's own #steps ItemList (name and step count)
    const steps = ld(d(`genres/${g.slug}/index.html`)).find((x) => x['@id'] === `${U}/genres/${g.slug}/#steps`);
    assert.ok(steps, `#steps on ${g.slug}`);
    assert.equal(e.item?.['@id'], steps['@id']);
    assert.equal(e.name, steps.name);
    assert.equal(e.item.numberOfItems, steps.numberOfItems);
  });
  const json = JSON.stringify(L);
  assert.ok(!/\$\d|price|gumroad|itch\.io/i.test(json), 'no prices or store links');
  assert.ok(!/towerdefense\//.test(json.replace(/genres\/tower-defense/g, '')), 'no /play/towerdefense/ link');
});
