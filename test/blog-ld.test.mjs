import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
// 2026-10-27: the /blog/ index was the only content hub with no machine-readable list of its posts
// (just a BreadcrumbList). It now has a Blog JSON-LD whose blogPost entries point (by @id) at the
// post pages (url = the post's mainEntityOfPage), with the same headline and dates as the visible list, the
// post page's own BlogPosting and src/posts.mjs. Post pages themselves are unchanged (their lastmod stays).
const DIST = new URL('../dist/', import.meta.url).pathname;
const d = (f) => fs.readFileSync(path.join(DIST, f), 'utf8');
const { posts } = await import('../src/posts.mjs');
const ld = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => { const j = JSON.parse(m[1]); return j['@graph'] || [j]; });
const U = 'https://promptforgekits.com';

test('/blog/ has one Blog JSON-LD listing every post, matching the visible list', () => {
  const h = d('blog/index.html');
  const blogs = ld(h).filter((x) => x['@type'] === 'Blog');
  assert.equal(blogs.length, 1, 'one Blog block on /blog/');
  const b = blogs[0];
  assert.equal(b['@id'], `${U}/blog/#blog`);
  assert.equal(b.url, `${U}/blog/`);
  assert.ok(ld(h).some((x) => x['@id'] === b.publisher['@id'] && x['@type'] === 'Organization'), 'publisher = Organization on the page');
  const visible = [...h.matchAll(/<h2[^>]*><a href="\/blog\/([^/]+)\/"/g)].map((m) => m[1]);
  assert.deepEqual(visible, posts.map((p) => p.slug), 'visible list = posts.mjs');
  assert.equal(b.blogPost.length, posts.length);
  posts.forEach((po, i) => {
    const e = b.blogPost[i];
    assert.equal(e['@type'], 'BlogPosting');
    assert.equal(e.url, `${U}/blog/${po.slug}/`);
    assert.equal(e.headline, po.title);
    assert.equal(e.datePublished, po.date);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(e.dateModified));
  });
  assert.ok(!/\$\d|price|stripe|gumroad|itch\.io/i.test(JSON.stringify(b)), 'no prices or store links');
});

test('each listed post matches the BlogPosting on its own page (headline, dates, mainEntityOfPage)', () => {
  const list = ld(d('blog/index.html')).find((x) => x['@type'] === 'Blog').blogPost;
  for (const po of posts) {
    const bp = ld(d(`blog/${po.slug}/index.html`)).filter((x) => x['@type'] === 'BlogPosting');
    assert.equal(bp.length, 1, po.slug);
    const p = bp[0];
    const e = list.find((x) => x.url === `${U}/blog/${po.slug}/`);
    assert.ok(e, 'listed: ' + po.slug);
    assert.equal(p.mainEntityOfPage, e.url);
    assert.equal(e.mainEntityOfPage, e.url);
    for (const k of ['headline', 'datePublished', 'dateModified', 'description']) assert.equal(e[k], p[k], `${po.slug} ${k}`);
  }
});
