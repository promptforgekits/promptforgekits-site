import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
// 2026-10-26 (Gibs): we do NOT send update emails. The buyer's download link always serves the latest kit.
// No page, llms file or JSON-LD may promise an update email; the FAQ answer points to /whats-new/.
const DIST = new URL('../dist/', import.meta.url).pathname;
const d = (f) => fs.readFileSync(path.join(DIST, f), 'utf8');
const NO_EMAIL = /we(?:\u2019|'|&#39;)?(?:ll)? email you the new|new download link|email you (?:when|the new)|update email/i;
const htmlFiles = (dir = DIST, out = []) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) { if (!p.includes(`${path.sep}play${path.sep}`)) htmlFiles(p, out); } else if (/\.(html|txt|xml)$/.test(e.name)) out.push(p); } return out; };

test('FAQ: no promise of update emails anywhere on the built site', () => {
  for (const f of htmlFiles()) assert.doesNotMatch(fs.readFileSync(f, 'utf8'), NO_EMAIL, path.relative(DIST, f));
});

test('FAQ: "Will it be updated?" says the download link gives the latest version and links /whats-new/', () => {
  const want = 'Yes. Updates are free for life. Your download link always gives you the latest version, so just download again to get it. New changes are listed on our';
  for (const f of ['faq/index.html', 'index.html']) {
    const h = d(f);
    const i = h.indexOf('Will it be updated?</');
    assert.ok(i > 0, f);
    const a = h.slice(i, i + 800);
    assert.ok(a.includes(want), f);
    assert.match(a, /<a href="\/whats-new\/">What\u2019s new page<\/a>/, f);
    const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).find((x) => x['@type'] === 'FAQPage');
    const q = ld.mainEntity.find((x) => x.name === 'Will it be updated?');
    assert.ok(q.acceptedAnswer.text.includes('https://promptforgekits.com/whats-new/'), `${f} JSON-LD`);
    assert.doesNotMatch(q.acceptedAnswer.text, /\[|\]\(/, 'no raw markdown in JSON-LD');
  }
  assert.ok(d('llms-full.txt').includes(`${want} What\u2019s new page (https://promptforgekits.com/whats-new/).`));
});

test('Core Keepers stays private: no towerdefense demo, not in sitemap, sync-demos.sh never maps it', () => {
  assert.ok(!fs.existsSync(path.join(DIST, 'play/towerdefense/index.html')));
  assert.doesNotMatch(d('sitemap.xml'), /towerdefense/);
  const sh = fs.readFileSync(new URL('../scripts/sync-demos.sh', import.meta.url), 'utf8');
  const map = sh.match(/^MAP="([^"]*)"/m)[1];
  assert.doesNotMatch(map, /towerdefense|\bck\b|core/i);
});
