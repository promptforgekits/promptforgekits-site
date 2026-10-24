import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
// 2026-10-24: What's new page, Vercel Web Analytics snippet, "Made with" link on the public demos' game-over screen.
const DIST = new URL('../dist/', import.meta.url).pathname;
const d = (f) => fs.readFileSync(path.join(DIST, f), 'utf8');
const PUBLIC = ['platformer', 'roguelite', 'idle', 'runner', 'puzzle'];
const htmlFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? htmlFiles(path.join(dir, e.name)) : e.name.endsWith('.html') ? [path.join(dir, e.name)] : []);
const { whatsNew } = await import('../src/whatsnew.mjs');

test("What's new: page built with every dated entry, both kits, no prices or store links", () => {
  const h = d('whats-new/index.html');
  assert.match(h, /<title>What's new in the kit \| Prompt Forge Kits<\/title>/);
  assert.match(h, /rel="canonical" href="https:\/\/promptforgekits\.com\/whats-new\/"/);
  assert.ok(whatsNew.length >= 3);
  for (const e of whatsNew) assert.match(h, new RegExp(`<time datetime="${e.date}">`), e.date);
  const dates = whatsNew.map((e) => e.date);
  assert.deepEqual(dates, [...dates].sort().reverse(), 'newest first');
  assert.match(h, /Browser Game Starter Kit/); assert.match(h, /Assistant Team Starter Kit/);
  const main = h.slice(h.indexOf('<main'), h.indexOf('</main>'));
  assert.doesNotMatch(main, /\$\d/, 'no prices');
  assert.doesNotMatch(main, /gumroad|itch\.io/i, 'no Gumroad/itch links');
  assert.doesNotMatch(main, /\*\*/, 'markdown bold rendered');
  assert.doesNotMatch(h, /<form/i, 'no buy button on this page');
});

test("What's new: in the sitemap with a real lastmod, linked from the footer of every page and from llms.txt", () => {
  const sm = d('sitemap.xml');
  const m = sm.match(/<loc>https:\/\/promptforgekits\.com\/whats-new\/<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/);
  assert.ok(m, 'in sitemap');
  const lm = JSON.parse(fs.readFileSync(new URL('../src/lastmod.json', import.meta.url), 'utf8'));
  assert.equal(m[1], lm['/whats-new/'].date);
  assert.ok(m[1] >= whatsNew[0].date, 'lastmod not older than the newest entry');
  assert.doesNotMatch(sm, /towerdefense/);
  for (const f of htmlFiles(DIST).filter((f) => !f.includes(`${path.sep}play${path.sep}`))) {
    assert.match(fs.readFileSync(f, 'utf8'), /<nav aria-label="Footer">[\s\S]*href="\/whats-new\/"/, f);
  }
  assert.match(d('index.html'), /<dt>Updates<\/dt><dd>Free for life \(<a href="\/whats-new\/">/);
  assert.match(d('assistant-kit/index.html'), /href="\/whats-new\/">see what's new/);
  assert.match(d('llms.txt'), /\[What's new\]\(https:\/\/promptforgekits\.com\/whats-new\/\)/);
});

test('Analytics: Vercel Web Analytics snippet on every HTML page (incl. the 5 demos), no Speed Insights', () => {
  const files = htmlFiles(DIST);
  assert.ok(files.length >= 20);
  for (const f of files) {
    const h = fs.readFileSync(f, 'utf8');
    assert.equal((h.match(/\/_vercel\/insights\/script\.js/g) || []).length, 1, f);
    assert.match(h, /window\.va\('beforeSend'/, `${f}: strips ?query/#hash`);
    assert.doesNotMatch(h, /speed-insights/i, f);
    assert.doesNotMatch(h, /analytics: off/, f);
  }
  for (const g of PUBLIC) assert.match(d(`play/${g}/index.html`), /if\(window\.top===window\)/, `${g}: only counted when not framed by /play/`);
  assert.ok(!fs.existsSync(path.join(DIST, '_vercel')), 'no local stand-in for the Vercel script in dist');
});

test('Made with link: in each public demo bundle, points at the kit site in a new tab; Core Keepers stays private', () => {
  for (const g of PUBLIC) {
    const dir = path.join(DIST, 'play', g, 'assets');
    const js = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('');
    assert.match(js, /Made with the Browser Game Starter Kit/, g);
    assert.match(js, /https:\/\/promptforgekits\.com\//, g);
    assert.match(js, /pfk-made-with/, g);
    assert.match(js, /_blank/, g);
    assert.match(js, /noopener/, g);
  }
  assert.ok(!fs.existsSync(path.join(DIST, 'play', 'towerdefense')), 'towerdefense not public');
  assert.ok(!fs.existsSync(new URL('../public/play/towerdefense', import.meta.url)), 'towerdefense not in public/');
});
