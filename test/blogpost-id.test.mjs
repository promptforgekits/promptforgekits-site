// 2026-11-04: each blog post's BlogPosting had no @id, url, language or link back to the Blog, and the /blog/
// list entries had no @id either, so search engines and AI tools could not join a post page to the blog it belongs
// to (or to its entry in the /blog/ list). Now: @id <post>/#post on both, isPartOf = /blog/#blog, inLanguage en.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { posts } = await import('../src/posts.mjs');
const U = 'https://promptforgekits.com';
const lds = (f) => [...fs.readFileSync(f, 'utf8').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => { const j = JSON.parse(m[1]); return j['@graph'] || [j]; });
test('blog posts: same @id on the post page and in the /blog/ list; post isPartOf the Blog; inLanguage = <html lang>', () => {
  const blog = lds('dist/blog/index.html').find((x) => x['@type'] === 'Blog');
  assert.ok(blog && blog['@id'] === `${U}/blog/#blog`);
  assert.ok(posts.length >= 1);
  for (const po of posts) {
    const id = `${U}/blog/${po.slug}/#post`;
    const html = fs.readFileSync(`dist/blog/${po.slug}/index.html`, 'utf8');
    const p = lds(`dist/blog/${po.slug}/index.html`).find((x) => x['@type'] === 'BlogPosting');
    assert.equal(p['@id'], id, po.slug);
    assert.equal(p.url, `${U}/blog/${po.slug}/`);
    assert.equal(p.url, p.mainEntityOfPage);
    assert.deepEqual(p.isPartOf, { '@id': blog['@id'] });
    assert.equal(p.inLanguage, html.match(/<html lang="([^"]+)"/)[1].slice(0, 2));
    const e = blog.blogPost.find((x) => x.url === p.url);
    assert.ok(e, 'listed: ' + po.slug);
    assert.equal(e['@id'], id, 'list entry joins the post by @id');
  }
  const ids = blog.blogPost.map((x) => x['@id']);
  assert.equal(new Set(ids).size, ids.length, 'unique ids');
});
