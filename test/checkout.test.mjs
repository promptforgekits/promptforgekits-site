import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { unzipSync } from 'fflate';
import { PDFDocument } from 'pdf-lib';
process.env.RESEND_API_KEY = 're_test'; process.env.UNSUBSCRIBE_SECRET = 'secret';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'; process.env.STRIPE_PRICE_ID = 'price_test';
delete process.env.STRIPE_SECRET_KEY; delete process.env.STRIPE_PAYMENT_LINK_URL;

const calls = [];
let respond = () => ({ ok: true, status: 200, data: { id: 'x' } });
globalThis.fetch = async (url, opt = {}) => {
  calls.push({ url, method: opt.method, headers: opt.headers, body: opt.body });
  const r = respond(url, opt);
  return { ok: r.ok, status: r.status, json: async () => r.data };
};
const lib = await import('../api/_lib.js');
const { default: checkout } = await import('../api/checkout.js');
const { default: webhook } = await import('../api/stripe-webhook.js');
const { default: download } = await import('../api/download.js');
const { buildWatermarkedZip } = await import('../api/_kit.js');

const mkRes = () => { const r = { code: 200, headers: {}, body: undefined, status(c) { r.code = c; return r; }, setHeader(k, v) { r.headers[k] = v; return r; }, json(b) { r.body = b; return r; }, send(b) { r.body = b; return r; }, end() { return r; } }; return r; };
const sign = (raw, secret = 'whsec_test', t = Math.floor(Date.now() / 1000)) => `t=${t},v1=${crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex')}`;
const mkReq = (raw, sig) => ({ method: 'POST', headers: { 'stripe-signature': sig }, body: Buffer.from(raw) });
const ev = (type = 'checkout.session.completed', o = {}) => JSON.stringify({ id: 'evt_1', type, livemode: false, data: { object: { id: 'cs_test_abc123', payment_status: 'paid', customer_details: { email: 'gregvirag@gmail.com' }, amount_total: 2900, currency: 'usd', created: Math.floor(Date.now() / 1000), payment_intent: 'pi_1', ...o } } });

test('download token: roundtrip, tamper, expiry, not interchangeable', () => {
  const t = lib.downloadToken('A@b.co', 'cs_1');
  const d = lib.verifyDownloadToken(t);
  assert.equal(d.e, 'a@b.co'); assert.equal(d.o, 'cs_1'); assert.equal(d.x - d.i, 14 * 86400);
  assert.equal(lib.verifyDownloadToken(t.slice(0, -2) + 'xx'), null);
  const [p, s] = t.split('.'); const forged = Buffer.from(JSON.stringify({ ...d, e: 'z@z.co' })).toString('base64url');
  assert.equal(lib.verifyDownloadToken(`${forged}.${s}`), null); assert.ok(p);
  assert.equal(lib.verifyDownloadToken(t, { now: Date.now() + 15 * 86400e3 }), null);
  assert.equal(lib.verifyDownloadToken(''), null);
  assert.equal(lib.verifyDownloadToken(lib.demoToken('a@b.co')), null);
});

test('stripe signature: valid, wrong secret, tampered body, stale, missing', () => {
  const raw = '{"a":1}';
  assert.equal(lib.verifyStripeSignature(raw, sign(raw), 'whsec_test'), true);
  assert.equal(lib.verifyStripeSignature(raw, sign(raw, 'other'), 'whsec_test'), false);
  assert.equal(lib.verifyStripeSignature('{"a":2}', sign(raw), 'whsec_test'), false);
  assert.equal(lib.verifyStripeSignature(raw, sign(raw, 'whsec_test', 1000), 'whsec_test'), false);
  assert.equal(lib.verifyStripeSignature(raw, '', 'whsec_test'), false);
});

test('webhook: bad signature -> 400, nothing sent; wrong method -> 405', async () => {
  calls.length = 0; const raw = ev();
  let r = mkRes(); await webhook(mkReq(raw, sign(raw, 'nope')), r); assert.equal(r.code, 400); assert.equal(calls.length, 0);
  r = mkRes(); await webhook({ method: 'GET', headers: {} }, r); assert.equal(r.code, 405);
});

test('webhook: completed -> Customers segment + delivery email with signed link, refund wording, idempotency key', async () => {
  calls.length = 0;
  respond = (url, opt) => {
    if (url.endsWith('/segments') && opt.method === 'GET') return { ok: true, status: 200, data: { data: [{ id: 'seg_c', name: 'Customers' }] } };
    return { ok: true, status: 200, data: { id: 'em_1' } };
  };
  const raw = ev(); const r = mkRes(); await webhook(mkReq(raw, sign(raw)), r);
  assert.equal(r.code, 200); assert.equal(r.body.delivered, true);
  const contact = calls.find((c) => c.url.endsWith('/contacts')); assert.deepEqual(JSON.parse(contact.body).segments, [{ id: 'seg_c' }]);
  const mail = calls.find((c) => c.url.endsWith('/emails')); const b = JSON.parse(mail.body);
  assert.deepEqual(b.to, ['gregvirag@gmail.com']); assert.equal(b.from, 'Prompt Forge Kits <hello@promptforgekits.com>');
  assert.equal(mail.headers['Idempotency-Key'], 'kit-delivery-cs_test_abc123');
  assert.match(b.text, /a 7-day refund if the kit didn't work for you; may be declined if clearly copied or reused/);
  assert.match(b.text, /29\.00 USD/);
  const url = b.text.match(/https:\/\/promptforgekits\.com\/api\/download\/\?token=([\w.-]+)/); assert.ok(url);
  assert.equal(lib.verifyDownloadToken(url[1]).e, 'gregvirag@gmail.com');
});

test('webhook: retries send an identical body (deterministic token); Resend 409 counts as already delivered', async () => {
  calls.length = 0; respond = () => ({ ok: true, status: 200, data: { id: 'em', data: [{ id: 's', name: 'Customers' }] } });
  const raw = ev(); await webhook(mkReq(raw, sign(raw)), mkRes()); await new Promise((r) => setTimeout(r, 1100)); await webhook(mkReq(raw, sign(raw)), mkRes());
  const bodies = calls.filter((c) => c.url.endsWith('/emails')).map((c) => c.body); assert.equal(bodies.length, 2); assert.equal(bodies[0], bodies[1]);
  respond = (url) => url.endsWith('/emails') ? { ok: false, status: 409, data: { message: 'idempotency' } } : { ok: true, status: 200, data: { data: [] } };
  const r = mkRes(); await webhook(mkReq(raw, sign(raw)), r); assert.equal(r.code, 200);
});

test('webhook: creates Customers segment when missing; test-mode non-allowlisted email is not mailed; unpaid skipped; other events ignored', async () => {
  calls.length = 0;
  respond = (url, opt) => url.endsWith('/segments') && opt.method === 'GET' ? { ok: true, status: 200, data: { data: [] } } : { ok: true, status: 200, data: { id: 'seg_new' } };
  let raw = ev(); await webhook(mkReq(raw, sign(raw)), mkRes());
  const created = calls.find((c) => c.url.endsWith('/segments') && c.method === 'POST'); assert.equal(JSON.parse(created.body).name, 'Customers');
  calls.length = 0;
  raw = ev('checkout.session.completed', { customer_details: { email: 'stranger@example.com' } }); let r = mkRes(); await webhook(mkReq(raw, sign(raw)), r);
  assert.equal(r.body.skipped, 'test-email-not-allowed'); assert.equal(calls.length, 0);
  raw = ev('checkout.session.completed', { payment_status: 'unpaid' }); r = mkRes(); await webhook(mkReq(raw, sign(raw)), r); assert.equal(r.body.skipped, 'unpaid');
  raw = ev('charge.refunded'); r = mkRes(); await webhook(mkReq(raw, sign(raw)), r); assert.equal(r.body.ignored, 'charge.refunded'); assert.equal(calls.length, 0);
});

test('webhook: email failure -> 500 so Stripe retries; already-fulfilled marker -> no resend', async () => {
  respond = (url) => url.endsWith('/emails') ? { ok: false, status: 500, data: { message: 'boom' } } : { ok: true, status: 200, data: { id: 'seg', data: [{ id: 'seg', name: 'Customers' }] } };
  let raw = ev(); let r = mkRes(); await webhook(mkReq(raw, sign(raw)), r); assert.equal(r.code, 500);
  process.env.STRIPE_SECRET_KEY = 'sk_test_x'; calls.length = 0;
  respond = (url) => url.includes('stripe.com') ? { ok: true, status: 200, data: { metadata: { pfk_fulfilled: 'em_1' } } } : { ok: true, status: 200, data: {} };
  raw = ev(); r = mkRes(); await webhook(mkReq(raw, sign(raw)), r);
  assert.equal(r.body.skipped, 'already-fulfilled'); assert.equal(calls.some((c) => c.url.includes('resend.com')), false);
  // after a successful send the marker is written
  calls.length = 0;
  respond = (url) => url.includes('stripe.com') ? { ok: true, status: 200, data: { metadata: {} } } : { ok: true, status: 200, data: { id: 'em_2', data: [{ id: 's', name: 'Customers' }] } };
  raw = ev(); r = mkRes(); await webhook(mkReq(raw, sign(raw)), r);
  const mark = calls.find((c) => c.method === 'POST' && c.url.includes('/v1/payment_intents/pi_1')); assert.match(mark.body, /pfk_fulfilled%5D=em_2/);
  delete process.env.STRIPE_SECRET_KEY;
});

test('checkout: creates hosted session with $29 price, success /thanks/, cancel /#pricing; JSON + redirect modes; errors', async () => {
  let r = mkRes(); await checkout({ method: 'GET', headers: {} }, r); assert.equal(r.code, 405);
  r = mkRes(); await checkout({ method: 'POST', headers: {} }, r); assert.equal(r.code, 503);
  process.env.STRIPE_PAYMENT_LINK_URL = 'https://buy.stripe.com/test_link';
  r = mkRes(); await checkout({ method: 'POST', headers: {} }, r); assert.equal(r.code, 303); assert.equal(r.headers.Location, 'https://buy.stripe.com/test_link');
  delete process.env.STRIPE_PAYMENT_LINK_URL;
  process.env.STRIPE_SECRET_KEY = 'sk_test_x'; calls.length = 0;
  respond = () => ({ ok: true, status: 200, data: { url: 'https://checkout.stripe.com/c/pay/cs_test_1' } });
  r = mkRes(); await checkout({ method: 'POST', headers: {} }, r);
  assert.equal(r.code, 303); assert.equal(r.headers.Location, 'https://checkout.stripe.com/c/pay/cs_test_1');
  const body = decodeURIComponent(calls[0].body.replace(/\+/g, ' '));
  assert.match(body, /mode=payment/); assert.match(body, /line_items\[0\]\[price\]=price_test/);
  assert.match(body, /success_url=https:\/\/promptforgekits\.com\/thanks\//); assert.match(body, /cancel_url=https:\/\/promptforgekits\.com\/#pricing/);
  assert.doesNotMatch(body, /automatic_tax/);
  process.env.STRIPE_AUTOMATIC_TAX = '1'; calls.length = 0;
  r = mkRes(); await checkout({ method: 'POST', headers: { accept: 'application/json' } }, r);
  assert.equal(r.body.url, 'https://checkout.stripe.com/c/pay/cs_test_1'); assert.match(calls[0].body, /automatic_tax%5Benabled%5D=true/);
  delete process.env.STRIPE_AUTOMATIC_TAX;
  respond = () => ({ ok: false, status: 400, data: { error: { message: 'x' } } });
  r = mkRes(); await checkout({ method: 'POST', headers: {} }, r); assert.equal(r.code, 502);
  delete process.env.STRIPE_SECRET_KEY;
});

test('watermark: zip is stamped with buyer email, excludes seller files', async () => {
  const { zip, count } = await buildWatermarkedZip('Buyer@Example.com', { order: 'cs_test_abc', date: '2026-10-15' });
  const files = unzipSync(new Uint8Array(zip));
  assert.ok(count >= 20);
  const lic = Buffer.from(files['browser-game-starter-kit/LICENSE.md']).toString();
  assert.match(lic, /Licensed to: buyer@example\.com/);
  assert.match(Buffer.from(files['browser-game-starter-kit/README.md']).toString(), /Licensed to: buyer@example\.com/);
  const pdf = await PDFDocument.load(files['browser-game-starter-kit/GUIDE.pdf']); assert.match(pdf.getSubject(), /buyer@example\.com/); assert.match(pdf.getKeywords(), /licensee:buyer@example\.com/);
  assert.equal(Object.keys(files).some((f) => /\/scripts\/|node_modules/.test(f)), false);
  await assert.rejects(buildWatermarkedZip('nope'));
});

test('download: bad/expired token -> 403 noindex; valid -> watermarked zip', async () => {
  let r = mkRes(); await download({ method: 'GET', query: { token: 'bad' } }, r); assert.equal(r.code, 403); assert.match(r.headers['X-Robots-Tag'], /noindex/);
  const old = lib.downloadToken('a@b.co', 'cs_1', { now: Date.now() - 20 * 86400e3 });
  r = mkRes(); await download({ method: 'GET', query: { token: old } }, r); assert.equal(r.code, 403);
  r = mkRes(); await download({ method: 'GET', query: { token: lib.downloadToken('a@b.co', 'cs_test_abc123') } }, r);
  assert.equal(r.code, 200); assert.equal(r.headers['Content-Type'], 'application/zip'); assert.match(r.headers['Content-Disposition'], /a-b-co\.zip/);
  const files = unzipSync(new Uint8Array(r.body)); assert.match(Buffer.from(files['browser-game-starter-kit/LICENSE.md']).toString(), /a@b\.co/);
});

test('site: Buy now button shown when stores.direct.live is true; hidden pages are noindex', async () => {
  const cfg = (await import('../site.config.mjs')).default;
  assert.equal(cfg.stores.direct.live, true);
  if (fs.existsSync(new URL('../dist/index.html', import.meta.url))) {
    assert.match(fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8'), /api\/checkout[\s\S]*Buy now · \$29/);
    for (const p of ['buy-test', 'thanks']) assert.match(fs.readFileSync(new URL(`../dist/${p}/index.html`, import.meta.url), 'utf8'), /name="robots" content="noindex"/);
    assert.doesNotMatch(fs.readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8'), /buy-test|thanks/);
  }
});

test('site: no gumroad/itch purchase links; single big Buy now; JSON-LD offer is own URL', () => {
  const dist = new URL('../dist/', import.meta.url);
  if (!fs.existsSync(new URL('index.html', dist))) return;
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (e.name === 'play' ? [] : walk(new URL(e.name + '/', d))) : /\.(html|txt|xml)$/.test(e.name) ? [new URL(e.name, d)] : []);
  for (const f of walk(dist)) {
    const t = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(t, /gumroad\.com|itch\.io\/|Also on (Gumroad|itch)|Buy on (Gumroad|itch)|launching soon/i, f.pathname);
  }
  const idx = fs.readFileSync(new URL('index.html', dist), 'utf8');
  assert.match(idx, /buy-big/);
  assert.match(idx, /"url":"https:\/\/promptforgekits\.com\/#pricing"/);
});
