import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// llms.txt is the index AI assistants read first (added 2026-10-23): every page we ask search engines to index
// (every sitemap URL) must be linked from it, incl. the 5 public demo pages and each blog post, each with a factual
// one-line description. The gated Core Keepers demo (/play/towerdefense/, /demo/) must never appear.
const d = new URL('../dist/', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, d), 'utf8');
test('llms.txt links every sitemap URL, demos + blog posts described, nothing gated', () => {
  const llms = read('llms.txt');
  const locs = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length >= 14, `sitemap parsed (${locs.length})`);
  const links = new Map([...llms.matchAll(/^- \[([^\]]+)\]\(([^)]+)\)(?::\s*(.*))?$/gm)].map((m) => [m[2], { name: m[1], desc: m[3] || '' }]));
  const missing = locs.filter((u) => !links.has(u));
  assert.deepEqual(missing, [], 'sitemap URLs missing from llms.txt');
  for (const u of locs.filter((x) => /\/play\/[^/]+\/$/.test(x))) {
    const l = links.get(u);
    assert.match(l.name, / demo$/, u);
    assert.match(l.desc, /Free to play in the browser, no signup; built by following the .+ prompt sequence \(kickoff \+ \d+ prompts\)\./, u);
    assert.doesNotMatch(l.desc, /\$\d/, `${u}: no price on demo lines`);
  }
  for (const u of locs.filter((x) => /\/blog\/[^/]+\/$/.test(x))) assert.ok(links.get(u).desc.length > 40, `${u}: blog post described`);
  assert.equal(locs.filter((x) => /\/play\/[^/]+\/$/.test(x)).length, 5, 'five public demo pages in the sitemap');
  for (const f of ['llms.txt', 'llms-full.txt']) {
    assert.doesNotMatch(read(f), /\/play\/towerdefense\/|promptforgekits\.com\/demo\//, `${f}: gated demo never linked`);
  }
  const full = read('llms-full.txt');
  for (const u of locs.filter((x) => /\/play\/[^/]+\/$/.test(x))) assert.ok(full.includes(u), `llms-full.txt lists ${u}`);
});
