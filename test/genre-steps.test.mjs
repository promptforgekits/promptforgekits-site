import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// Genre pages carry the visible step list as ItemList JSON-LD, linked to the kit Product (added 2026-10-22).
// It must match the on-page <ol class="prompts"> exactly (Google: structured data = visible content), give the honest
// count (kickoff + N prompts [+ optional]) and never carry a price or the prompt text itself.
const d = new URL('../dist/', import.meta.url);
const slugs = ['platformer', 'roguelite', 'idle-clicker', 'endless-runner', 'puzzle', 'tower-defense'];
test('genre pages: ItemList JSON-LD of the step titles, same as the visible list', () => {
  for (const slug of slugs) {
    const h = fs.readFileSync(new URL(`genres/${slug}/index.html`, d), 'utf8');
    const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const L = blocks.find((b) => b['@type'] === 'ItemList');
    assert.ok(L, `${slug}: ItemList JSON-LD`);
    assert.equal(L.url, `https://promptforgekits.com/genres/${slug}/`, slug);
    assert.equal(L.isPartOf['@id'], 'https://promptforgekits.com/#product', slug);
    assert.equal(L.isPartOf.name, 'Browser Game Starter Kit by Prompt Forge Kits', slug);
    const ol = (h.match(/<ol class="prompts"[^>]*>([\s\S]*?)<\/ol>/) || [])[1] || '';
    const visible = [...ol.matchAll(/<li[^>]*><b>(P\d+)<\/b>([^<]*)<\/li>/g)].map((m) => `${m[1]}. ${m[2].replace(/&amp;/g, '&')}`);
    assert.ok(visible.length >= 11, `${slug}: visible list parsed (${visible.length})`);
    assert.deepEqual(L.itemListElement.map((x) => x.name), visible, `${slug}: JSON-LD = visible step titles`);
    assert.deepEqual(L.itemListElement.map((x) => x.position), visible.map((_, i) => i + 1), slug);
    assert.equal(L.numberOfItems, visible.length, slug);
    const title = (h.match(/<title>([^<]+)<\/title>/) || [])[1];
    const count = title.match(/kickoff \+ \d+ prompts( \+ \d+ optional)?/)[0];
    assert.ok(L.name.includes(count), `${slug}: name gives the same count as the title (${count})`);
    assert.doesNotMatch(JSON.stringify(L), /\$\d|price|```/i, `${slug}: no price, no prompt text`);
  }
});
