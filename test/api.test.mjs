import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
process.env.RESEND_API_KEY = 're_test'; process.env.RESEND_SEGMENT_ID = 'seg1'; process.env.UNSUBSCRIBE_SECRET = 'secret';
const calls = [];
globalThis.fetch = async (url, opt) => { calls.push({ url, method: opt.method, body: opt.body && JSON.parse(opt.body) }); return { ok: true, status: 200, json: async () => ({ id: 'x' }) }; };
const { default: subscribe } = await import('../api/subscribe.js');
const { default: unsub } = await import('../api/unsubscribe.js');
const { default: demo, readCookie } = await import('../api/demo.js');
const { unsubToken, demoToken, demoTokenOk } = await import('../api/_lib.js');
const mkRes = () => { const r = { code: 200, headers: {}, status(c) { r.code = c; return r; }, setHeader(k, v) { r.headers[k] = v; return r; }, json(b) { r.body = b; return r; }, send(b) { r.body = b; return r; }, end() { return r; } }; return r; };

test('rejects bad email', async () => { const r = mkRes(); await subscribe({ method: 'POST', body: { email: 'nope' } }, r); assert.equal(r.code, 400); assert.equal(calls.length, 0); });
test('rejects GET', async () => { const r = mkRes(); await subscribe({ method: 'GET' }, r); assert.equal(r.code, 405); });
test('honeypot silently ignored', async () => { const r = mkRes(); await subscribe({ method: 'POST', body: { email: 'a@b.co', website: 'x' } }, r); assert.equal(r.code, 200); assert.equal(calls.length, 0); });
test('valid signup: contact, welcome email, event', async () => {
  const r = mkRes(); await subscribe({ method: 'POST', body: { email: 'A@B.co', source: 'site' } }, r);
  assert.equal(r.code, 200);
  assert.equal(calls[0].url, 'https://api.resend.com/contacts'); assert.equal(calls[0].body.email, 'a@b.co'); assert.deepEqual(calls[0].body.segments, [{ id: 'seg1' }]);
  assert.equal(calls[1].url, 'https://api.resend.com/emails'); assert.match(calls[1].body.from, /hello@promptforgekits\.com/);
  assert.match(calls[1].body.html, /promptforgekits\.com\/demo\/core-keepers\/\?e=a%40b\.co&t=[0-9a-f]{64}/); assert.match(calls[1].body.html, /promptforgekits\.com\/free-pack\//); assert.match(calls[1].body.html, /api\/unsubscribe/);
  assert.equal(calls[2].url, 'https://api.resend.com/events/send');
});
test('unsubscribe token enforced', async () => {
  calls.length = 0; let r = mkRes(); await unsub({ method: 'POST', query: { e: 'a@b.co', t: 'bad' } }, r); assert.equal(r.code, 400); assert.equal(calls.length, 0);
  r = mkRes(); await unsub({ method: 'POST', query: { e: 'a@b.co', t: unsubToken('a@b.co') } }, r); assert.equal(r.code, 200);
  assert.equal(calls[0].method, 'PATCH'); assert.equal(calls[0].body.unsubscribed, true);
});

test('demo token: valid, case-insensitive email, tampered, empty, and not interchangeable with unsubscribe token', () => {
  const t = demoToken('a@b.co');
  assert.match(t, /^[0-9a-f]{64}$/);
  assert.equal(demoTokenOk('a@b.co', t), true);
  assert.equal(demoTokenOk('A@B.co', t), true);
  assert.equal(demoTokenOk('x@b.co', t), false);
  assert.equal(demoTokenOk('a@b.co', t.slice(0, -1) + (t.endsWith('0') ? '1' : '0')), false);
  assert.equal(demoTokenOk('a@b.co', ''), false);
  assert.equal(demoTokenOk('', t), false);
  assert.equal(demoTokenOk('a@b.co', unsubToken('a@b.co')), false);
});
test('demo endpoint: no token -> 403 noindex, bad token -> 403, good token -> game + cookie, cookie serves assets', () => {
  let r = mkRes(); demo({ method: 'GET', query: {}, headers: {} }, r); assert.equal(r.code, 403); assert.match(r.headers['X-Robots-Tag'], /noindex/);
  r = mkRes(); demo({ method: 'GET', query: { e: 'a@b.co', t: 'bad' }, headers: {} }, r); assert.equal(r.code, 403);
  r = mkRes(); demo({ method: 'GET', query: { e: 'a@b.co', t: demoToken('a@b.co') }, headers: {} }, r);
  assert.equal(r.code, 200); assert.match(String(r.body), /<div id="game">/); assert.match(r.headers['Set-Cookie'], /HttpOnly/); assert.match(r.headers['X-Robots-Tag'], /noindex/);
  const cookie = r.headers['Set-Cookie'].split(';')[0];
  assert.ok(readCookie({ headers: { cookie } }));
  const asset = fs.readdirSync(new URL('../private/core-keepers/assets/', import.meta.url)).find((f) => f.endsWith('.js'));
  r = mkRes(); demo({ method: 'GET', query: { f: 'assets/' + asset }, headers: { cookie } }, r); assert.equal(r.code, 200); assert.match(r.headers['Content-Type'], /javascript/);
  r = mkRes(); demo({ method: 'GET', query: { f: 'assets/' + asset }, headers: {} }, r); assert.equal(r.code, 403);
  r = mkRes(); demo({ method: 'GET', query: { f: '../../package.json' }, headers: { cookie } }, r); assert.equal(r.code, 404);
});
test('built site: demo not public, not in sitemap, teaser trimmed', () => {
  const d = new URL('../dist/', import.meta.url);
  assert.equal(fs.existsSync(new URL('play/towerdefense/index.html', d)), false);
  assert.doesNotMatch(fs.readFileSync(new URL('sitemap.xml', d), 'utf8'), /demo|free-pack/);
  assert.match(fs.readFileSync(new URL('robots.txt', d), 'utf8'), /Disallow: \/demo\//);
  const fp = fs.readFileSync(new URL('free-pack/index.html', d), 'utf8');
  assert.match(fp, /noindex/);
  for (const bad of [/Better jump feel/, /git clean/, /Try 1:/, /Chunky Flat Toy/, /coyote/i, /Thick dark outline/]) assert.doesNotMatch(fp, bad);
  assert.doesNotMatch(fs.readFileSync(new URL('index.html', d), 'utf8'), /Prompt Pack/);
});
