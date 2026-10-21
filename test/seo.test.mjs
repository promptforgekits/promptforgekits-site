import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// SEO fixes 2026-10-21: honest step counts, indexable public demos, gated Core Keepers, real lastmod, Play page meta + ItemList, GSC slot.
const D = new URL('../dist/', import.meta.url);
const d = (f) => fs.readFileSync(new URL(f, D), 'utf8');
const C = await import('../src/content.mjs');
const PUBLIC = ['platformer', 'roguelite', 'idle', 'runner', 'puzzle'];
const lds = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

test('genre pages: title, description, heading and list all use the real step count', () => {
  for (const g of C.genres) {
    const h = d(`genres/${g.slug}/index.html`);
    const n = g.prompts.length, o = g.optional?.length || 0, total = 1 + n + o;
    const label = `kickoff + ${n} prompts${o ? ` + ${o} optional` : ''}`;
    assert.match(h.match(/<title>([^<]*)/)[1], new RegExp(label.replace(/\+/g, '\\+')), g.slug);
    const desc = h.match(/name="description" content="([^"]*)"/)[1];
    assert.match(desc, new RegExp(`${total} steps \\(${label.replace(/\+/g, '\\+')}\\)`), g.slug);
    assert.ok(desc.length <= 175, `${g.slug} description ${desc.length}`);
    assert.match(h, new RegExp(`The ${total} steps`), g.slug);
    assert.equal((h.match(/<li(?: class="opt")?><b>P\d+<\/b>/g) || []).length, total, g.slug);
    assert.doesNotMatch(h, /\(\d+ prompts\) \|/, g.slug); // old "(10 prompts)" title
    if (g.demo === 'towerdefense') assert.match(desc, /free by email/); else assert.match(desc, /free demo on this page/);
  }
});

test('public demo pages are indexable and in the sitemap; Core Keepers stays gated', () => {
  const vj = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const h of vj.headers.filter((x) => x.headers.some((k) => k.key === 'X-Robots-Tag' && /noindex/.test(k.value)))) {
    // no noindex rule may match /play/<demo>/ itself
    const re = new RegExp('^' + h.source.replace(/:genre/g, '[^/]+').replace(/\(\.\*\)/g, '.*') + '$');
    for (const p of PUBLIC) assert.equal(re.test(`/play/${p}/`), false, `${h.source} matches /play/${p}/`);
  }
  const sm = d('sitemap.xml');
  for (const p of PUBLIC) {
    assert.match(sm, new RegExp(`<loc>https://promptforgekits.com/play/${p}/</loc>`), p);
    const h = d(`play/${p}/index.html`);
    assert.doesNotMatch(h, /name="robots"[^>]*noindex/, p);
  }
  assert.doesNotMatch(sm, /towerdefense|core-keepers|\/demo\//);
  assert.equal(fs.existsSync(new URL('play/towerdefense/index.html', D)), false);
  assert.equal(fs.existsSync(new URL('play/towerdefense', D)), false);
  assert.equal(vj.rewrites.some((r) => /play\/towerdefense/.test(r.source)), false);
  assert.doesNotMatch(d('llms-full.txt'), /\/play\/towerdefense\//);
  assert.doesNotMatch(d('play/index.html'), /href="\/play\/towerdefense\/"|data-demo="\/play\/towerdefense\/"/);
});

test('sitemap lastmod comes from src/lastmod.json (real change dates), not all the build date', () => {
  const sm = d('sitemap.xml');
  const db = JSON.parse(fs.readFileSync(new URL('../src/lastmod.json', import.meta.url), 'utf8'));
  const urls = [...sm.matchAll(/<loc>https:\/\/promptforgekits\.com([^<]*)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)];
  assert.ok(urls.length >= 19);
  for (const [, p, date] of urls) assert.equal(db[p]?.date, date, p);
  assert.ok(new Set(urls.map((u) => u[2])).size > 1, 'all lastmod dates identical');
  // blog posts keep their own date
  assert.equal(db['/blog/four-rules-vibe-coded-games-ship/'].date <= '2026-10-15', true);
});

test('lastmod helper: unchanged content keeps its date, changed content gets today, new page seeds from git', async () => {
  const { createLastmod } = await import('../src/lastmod.mjs');
  const os = await import('node:os'); const path = await import('node:path');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-')); fs.mkdirSync(path.join(root, 'src'));
  fs.writeFileSync(path.join(root, 'src/lastmod.json'), JSON.stringify({ '/a/': { hash: 'x', date: '2026-01-01' } }));
  let lm = createLastmod(root, { today: '2026-02-02' });
  assert.equal(lm.date('/a/', 'new content'), '2026-02-02'); // changed
  assert.equal(lm.date('/b/', 'b'), '2026-02-02'); // no git there -> today
  lm.save();
  lm = createLastmod(root, { today: '2026-03-03' });
  assert.equal(lm.date('/a/', 'new content'), '2026-02-02'); // unchanged -> stored date
});

test('play page: meta description 150-160 chars, valid ItemList of the 5 public VideoGame demos', () => {
  const h = d('play/index.html');
  const desc = h.match(/name="description" content="([^"]*)"/)[1];
  assert.ok(desc.length >= 150 && desc.length <= 160, `len ${desc.length}`);
  const list = lds(h).find((x) => x['@type'] === 'ItemList');
  assert.ok(list); assert.equal(list.numberOfItems, 5); assert.equal(list.itemListElement.length, 5);
  list.itemListElement.forEach((li, i) => {
    assert.equal(li['@type'], 'ListItem'); assert.equal(li.position, i + 1);
    assert.equal(li.item['@type'], 'VideoGame'); assert.match(li.item.url, /^https:\/\/promptforgekits\.com\/play\/(platformer|roguelite|idle|runner|puzzle)\/$/);
    assert.equal(li.item.isAccessibleForFree, true); assert.equal(li.item.gamePlatform, 'Web browser');
    assert.equal(li.item.aggregateRating, undefined); assert.equal(li.item.review, undefined);
    assert.ok(fs.existsSync(new URL(li.item.image.replace('https://promptforgekits.com/', ''), D)), li.item.image);
  });
  assert.doesNotMatch(JSON.stringify(list), /towerdefense|Core Keepers/);
});

test('Search Console verification slot: empty -> no meta tag; set -> tag on every page', async () => {
  const cfg = (await import('../site.config.mjs')).default;
  assert.ok('googleVerification' in cfg.searchConsole);
  const h = d('index.html');
  if (!cfg.searchConsole.googleVerification) assert.doesNotMatch(h, /<meta name="google-site-verification"/);
  else assert.match(h, new RegExp(`<meta name="google-site-verification" content="${cfg.searchConsole.googleVerification}">`));
  assert.match(h, /google-site-verification/); // the slot comment or the tag
});
