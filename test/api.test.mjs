import test from 'node:test';
import assert from 'node:assert/strict';
process.env.RESEND_API_KEY = 're_test'; process.env.RESEND_SEGMENT_ID = 'seg1'; process.env.UNSUBSCRIBE_SECRET = 'secret';
const calls = [];
globalThis.fetch = async (url, opt) => { calls.push({ url, method: opt.method, body: opt.body && JSON.parse(opt.body) }); return { ok: true, status: 200, json: async () => ({ id: 'x' }) }; };
const { default: subscribe } = await import('../api/subscribe.js');
const { default: unsub } = await import('../api/unsubscribe.js');
const { unsubToken } = await import('../api/_lib.js');
const mkRes = () => { const r = { code: 200, headers: {}, status(c) { r.code = c; return r; }, setHeader(k, v) { r.headers[k] = v; return r; }, json(b) { r.body = b; return r; }, send(b) { r.body = b; return r; }, end() { return r; } }; return r; };

test('rejects bad email', async () => { const r = mkRes(); await subscribe({ method: 'POST', body: { email: 'nope' } }, r); assert.equal(r.code, 400); assert.equal(calls.length, 0); });
test('rejects GET', async () => { const r = mkRes(); await subscribe({ method: 'GET' }, r); assert.equal(r.code, 405); });
test('honeypot silently ignored', async () => { const r = mkRes(); await subscribe({ method: 'POST', body: { email: 'a@b.co', website: 'x' } }, r); assert.equal(r.code, 200); assert.equal(calls.length, 0); });
test('valid signup: contact, welcome email, event', async () => {
  const r = mkRes(); await subscribe({ method: 'POST', body: { email: 'A@B.co', source: 'site' } }, r);
  assert.equal(r.code, 200);
  assert.equal(calls[0].url, 'https://api.resend.com/contacts'); assert.equal(calls[0].body.email, 'a@b.co'); assert.deepEqual(calls[0].body.segments, [{ id: 'seg1' }]);
  assert.equal(calls[1].url, 'https://api.resend.com/emails'); assert.match(calls[1].body.from, /hello@promptforgekits\.com/);
  assert.match(calls[1].body.html, /promptforgekits\.com\/free-pack\//); assert.match(calls[1].body.html, /api\/unsubscribe/);
  assert.equal(calls[2].url, 'https://api.resend.com/events/send');
});
test('unsubscribe token enforced', async () => {
  calls.length = 0; let r = mkRes(); await unsub({ method: 'POST', query: { e: 'a@b.co', t: 'bad' } }, r); assert.equal(r.code, 400); assert.equal(calls.length, 0);
  r = mkRes(); await unsub({ method: 'POST', query: { e: 'a@b.co', t: unsubToken('a@b.co') } }, r); assert.equal(r.code, 200);
  assert.equal(calls[0].method, 'PATCH'); assert.equal(calls[0].body.unsubscribed, true);
});
