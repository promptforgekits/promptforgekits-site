// Home page WebSite JSON-LD (2026-11-03): Google picks the site name shown in results from WebSite markup on the
// home page (name + alternateName + url), and AI tools join the site to its publisher by @id. Before this it was
// a bare { name, url } with no @id, alternateName, language or publisher.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const lds = (file) => [...fs.readFileSync(file, 'utf8').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
test('home page: one complete WebSite block (name, alternateName, url, @id, inLanguage, publisher = #org)', () => {
  const home = lds('dist/index.html');
  const ws = home.filter((j) => j['@type'] === 'WebSite');
  assert.equal(ws.length, 1, 'exactly one WebSite block');
  const w = ws[0];
  assert.equal(w.name, 'Prompt Forge Kits');
  assert.equal(w.url, 'https://promptforgekits.com/');
  assert.equal(w['@id'], 'https://promptforgekits.com/#website');
  assert.equal(w.inLanguage, 'en');
  assert.ok(Array.isArray(w.alternateName) && w.alternateName.length >= 1);
  for (const a of w.alternateName) { assert.equal(typeof a, 'string'); assert.notEqual(a, w.name); assert.match(a.replace(/\s/g, '').toLowerCase(), /promptforgekits/); }
  const org = home.find((j) => j['@type'] === 'Organization');
  assert.ok(org && w.publisher && w.publisher['@id'] === org['@id'], 'publisher points at the Organization @id');
  assert.equal(fs.readFileSync('dist/index.html', 'utf8').match(/<html lang="([^"]+)"/)[1].slice(0, 2), w.inLanguage, 'same language as <html lang>');
  assert.ok(!('potentialAction' in w), 'no SearchAction: the site has no search');
  // only the home page carries it
  for (const f of ['dist/faq/index.html', 'dist/assistant-kit/index.html', 'dist/play/index.html']) assert.ok(!lds(f).some((j) => j['@type'] === 'WebSite'), f);
});
