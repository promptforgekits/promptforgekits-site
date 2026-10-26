import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
// 2026-10-26: machine-readable freshness. /whats-new/ carries a WebPage JSON-LD (datePublished/dateModified from
// the dated entries, about both kit Products, ItemList of the entries with #d-<date> anchors) and llms.txt /
// llms-full.txt state the last kit update date. Everything must agree with src/whatsnew.mjs and the visible page.
const DIST = new URL('../dist/', import.meta.url).pathname;
const d = (f) => fs.readFileSync(path.join(DIST, f), 'utf8');
const { whatsNew } = await import('../src/whatsnew.mjs');
const ld = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => { const j = JSON.parse(m[1]); return j['@graph'] || [j]; });
const ids = (f) => new Set(ld(d(f)).map((x) => x['@id']).filter(Boolean));

test("What's new: WebPage JSON-LD with real dates, linked to both kits, one ListItem per visible entry", () => {
  const h = d('whats-new/index.html');
  const pages = ld(h).filter((x) => x['@type'] === 'WebPage');
  assert.equal(pages.length, 1, 'one WebPage block');
  const w = pages[0];
  assert.equal(w.url, 'https://promptforgekits.com/whats-new/');
  const visible = [...h.matchAll(/<article class="wn" id="d-(\d{4}-\d{2}-\d{2})"><h2[^>]*><time datetime="\1">/g)].map((m) => m[1]);
  assert.deepEqual(visible, whatsNew.map((e) => e.date), 'visible entries = whatsNew');
  assert.equal(w.dateModified, visible[0], 'dateModified = newest visible entry');
  assert.equal(w.datePublished, visible[visible.length - 1], 'datePublished = oldest visible entry');
  assert.ok(w.dateModified >= w.datePublished);
  assert.ok(ids('index.html').has('https://promptforgekits.com/#product'));
  assert.ok(ids('assistant-kit/index.html').has('https://promptforgekits.com/assistant-kit/#product'));
  assert.deepEqual(w.about.map((x) => x['@id']).sort(), ['https://promptforgekits.com/#product', 'https://promptforgekits.com/assistant-kit/#product'].sort());
  assert.ok(ids('whats-new/index.html').has(w.publisher['@id']), 'publisher is the Organization on the page');
  const L = w.mainEntity;
  assert.equal(L['@type'], 'ItemList'); assert.equal(L.numberOfItems, visible.length); assert.equal(L.itemListElement.length, visible.length);
  L.itemListElement.forEach((it, i) => {
    assert.equal(it.position, i + 1);
    assert.equal(it.url, `https://promptforgekits.com/whats-new/#d-${visible[i]}`);
    const e = whatsNew[i], n = e.groups.reduce((s, g) => s + g.items.length, 0);
    assert.match(it.name, new RegExp(`\\(${n} changes\\)$`), it.name);
    for (const g of e.groups) assert.match(it.name, g.kit === 'bgsk' ? /Browser Game Starter Kit/ : /Assistant Team Starter Kit/, it.name);
  });
  assert.doesNotMatch(JSON.stringify(w), /\$\d|"price"|gumroad|itch\.io/i, 'no prices or store links');
});

test('llms.txt + llms-full.txt: Updates fact states the last kit update date and links the dated list', () => {
  for (const f of ['llms.txt', 'llms-full.txt']) {
    const line = d(f).split('\n').find((l) => l.startsWith('- Updates:'));
    assert.equal(line, `- Updates: free for life; last kit update ${whatsNew[0].date}, every change dated at https://promptforgekits.com/whats-new/`, f);
  }
});
