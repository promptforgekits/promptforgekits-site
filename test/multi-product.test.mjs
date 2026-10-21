// Multi-product checkout / delivery / download / claim + new pages + arcade + gated demo (added 2026-10-21).
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { unzipSync } from 'fflate';
import { PDFDocument } from 'pdf-lib';
process.env.RESEND_API_KEY = 're_test'; process.env.UNSUBSCRIBE_SECRET = 'secret';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'; process.env.STRIPE_PRICE_ID = 'price_test';
delete process.env.STRIPE_SECRET_KEY; delete process.env.STRIPE_PAYMENT_LINK_URL; delete process.env.STRIPE_PRICE_ID_ATSK; delete process.env.STRIPE_PRICE_ID_BUNDLE;
delete process.env.RESEND_ARCADE_SEGMENT_ID; delete process.env.RESEND_CUSTOMERS_SEGMENT_ID;

const calls = [];
let respond = () => ({ ok: true, status: 200, data: { id: 'x' } });
globalThis.fetch = async (url, opt = {}) => { calls.push({ url, method: opt.method, headers: opt.headers, body: opt.body }); const r = respond(url, opt); return { ok: r.ok, status: r.status, json: async () => r.data }; };
const lib = await import('../api/_lib.js');
const P = await import('../api/_products.js');
const { default: checkout } = await import('../api/checkout.js');
const { default: webhook } = await import('../api/stripe-webhook.js');
const { default: download } = await import('../api/download.js');
const { default: claim } = await import('../api/claim.js');
const { default: arcadeSub } = await import('../api/arcade-subscribe.js');
const { buildWatermarkedZip } = await import('../api/_kit.js');

const mkRes = () => { const r = { code: 200, headers: {}, body: undefined, status(c) { r.code = c; return r; }, setHeader(k, v) { r.headers[k] = v; return r; }, json(b) { r.body = b; return r; }, send(b) { r.body = b; return r; }, end() { return r; } }; return r; };
const sign = (raw, t = Math.floor(Date.now() / 1000)) => `t=${t},v1=${crypto.createHmac('sha256', 'whsec_test').update(`${t}.${raw}`).digest('hex')}`;
const mkReq = (raw) => ({ method: 'POST', headers: { 'stripe-signature': sign(raw) }, body: Buffer.from(raw) });
const ev = (o = {}) => JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed', livemode: false, data: { object: { id: 'cs_test_multi123456', payment_status: 'paid', customer_details: { email: 'gregvirag@gmail.com' }, amount_total: 2900, currency: 'usd', created: 1792600000, payment_intent: 'pi_1', ...o } } });
const decode = (b) => decodeURIComponent(b.replace(/\+/g, ' '));
const okSeg = () => ({ ok: true, status: 200, data: { id: 'em_1', data: [{ id: 'seg_c', name: 'Customers' }] } });
const links = (text) => [...text.matchAll(/https:\/\/promptforgekits\.com\/api\/download\/\?token=([\w.-]+)/g)].map((m) => lib.verifyDownloadToken(m[1]));

test('catalog: three skus, live price ids for the new ones, bundle delivers both kits', () => {
  assert.deepEqual(Object.keys(P.PRODUCTS), ['bgsk', 'atsk', 'bundle']);
  assert.equal(P.priceIdFor('bgsk'), 'price_test'); // still from STRIPE_PRICE_ID
  assert.equal(P.priceIdFor('atsk'), 'price_1USyqBLgIACCBJCoe2ol9YLp');
  assert.equal(P.priceIdFor('bundle'), 'price_1USyqBLgIACCBJCoFoebOJdc');
  process.env.STRIPE_PRICE_ID_ATSK = 'price_override'; assert.equal(P.priceIdFor('atsk'), 'price_override'); delete process.env.STRIPE_PRICE_ID_ATSK;
  assert.deepEqual(P.deliverables('bundle'), ['bgsk', 'atsk']); assert.deepEqual(P.deliverables('atsk'), ['atsk']); assert.deepEqual(P.deliverables('nope'), []);
  assert.doesNotMatch(JSON.stringify(P.PRODUCTS), /grok/i);
});

test('checkout: per-sku price, metadata and cancel url; bgsk params identical to before; unknown sku 400', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  respond = () => ({ ok: true, status: 200, data: { url: 'https://checkout.stripe.com/c/pay/cs_test_1' } });
  const run = async (req) => { calls.length = 0; const r = mkRes(); await checkout({ method: 'POST', headers: {}, ...req }, r); return { r, body: calls[0] && decode(calls[0].body) }; };
  const base = await run({}); const viaQuery = await run({ query: { sku: 'bgsk' } }); const viaBody = await run({ body: { sku: 'bgsk' } });
  assert.equal(base.body, viaQuery.body); assert.equal(base.body, viaBody.body);
  assert.match(base.body, /line_items\[0\]\[price\]=price_test/); assert.match(base.body, /metadata\[sku\]=bgsk/); assert.match(base.body, /cancel_url=https:\/\/promptforgekits\.com\/#pricing/);
  assert.match(base.body, /payment_intent_data\[description\]=Browser Game Starter Kit&/);
  const a = await run({ query: { sku: 'atsk' } });
  assert.equal(a.r.code, 303); assert.match(a.body, /line_items\[0\]\[price\]=price_1USyqBLgIACCBJCoe2ol9YLp/); assert.match(a.body, /metadata\[sku\]=atsk/);
  assert.match(a.body, /cancel_url=https:\/\/promptforgekits\.com\/assistant-kit\/#pricing/); assert.match(a.body, /success_url=https:\/\/promptforgekits\.com\/thanks\/\?session_id=\{CHECKOUT_SESSION_ID\}/);
  const b2 = await run({ body: 'sku=bundle' }); // unparsed urlencoded body from the no-JS form
  assert.equal((await run({ query: { sku: 'bundle' } })).body, b2.body);
  assert.match(b2.body, /price\]=price_1USyqBLgIACCBJCoFoebOJdc/); assert.match(b2.body, /metadata\[sku\]=bundle/); assert.match(b2.body, /both kits/); assert.match(b2.body, /cancel_url=https:\/\/promptforgekits\.com\/assistant-kit\/#bundle/);
  const u = await run({ query: { sku: 'evil' } }); assert.equal(u.r.code, 400); assert.equal(calls.length, 0);
  // the payment-link fallback stays bgsk-only
  delete process.env.STRIPE_SECRET_KEY; process.env.STRIPE_PAYMENT_LINK_URL = 'https://buy.stripe.com/test_link';
  let r = mkRes(); await checkout({ method: 'POST', headers: {}, query: { sku: 'atsk' } }, r); assert.equal(r.code, 503);
  r = mkRes(); await checkout({ method: 'POST', headers: {} }, r); assert.equal(r.headers.Location, 'https://buy.stripe.com/test_link');
  delete process.env.STRIPE_PAYMENT_LINK_URL;
});

test('webhook: missing/unknown sku -> original bgsk email, token without sku; atsk -> one atsk link', async () => {
  respond = okSeg;
  for (const meta of [undefined, {}, { sku: 'bgsk' }, { sku: 'weird' }]) {
    calls.length = 0; const raw = ev(meta ? { metadata: meta } : {}); const r = mkRes(); await webhook(mkReq(raw), r);
    assert.equal(r.code, 200); assert.equal(r.body.sku, undefined);
    const mail = JSON.parse(calls.find((c) => c.url.endsWith('/emails')).body);
    assert.deepEqual(mail.tags, [{ name: 'type', value: 'purchase' }]);
    const l = links(mail.text); assert.equal(l.length, 1); assert.equal(l[0].s, undefined);
  }
  calls.length = 0; const raw = ev({ metadata: { sku: 'atsk' }, amount_total: 3900 }); const r = mkRes(); await webhook(mkReq(raw), r);
  assert.equal(r.body.sku, 'atsk');
  const c = calls.find((x) => x.url.endsWith('/emails')); const mail = JSON.parse(c.body);
  assert.equal(c.headers['Idempotency-Key'], 'kit-delivery-cs_test_multi123456');
  assert.match(mail.text, /Assistant Team Starter Kit/); assert.match(mail.text, /39\.00 USD/); assert.match(mail.text, /START-HERE\.md/);
  const l = links(mail.text); assert.equal(l.length, 1); assert.equal(l[0].s, 'atsk'); assert.equal(l[0].e, 'gregvirag@gmail.com');
  assert.deepEqual(mail.tags, [{ name: 'type', value: 'purchase' }, { name: 'sku', value: 'atsk' }]);
});

test('webhook: bundle -> ONE email with both download links', async () => {
  respond = okSeg; calls.length = 0;
  const raw = ev({ metadata: { sku: 'bundle' }, amount_total: 5500 }); const r = mkRes(); await webhook(mkReq(raw), r);
  assert.equal(r.code, 200); assert.equal(r.body.sku, 'bundle');
  const mails = calls.filter((x) => x.url.endsWith('/emails')); assert.equal(mails.length, 1);
  const m = JSON.parse(mails[0].body); assert.match(m.subject, /2 kits/); assert.match(m.text, /55\.00 USD/);
  const l = links(m.text); assert.deepEqual(l.map((x) => x.s || 'bgsk'), ['bgsk', 'atsk']);
  assert.equal(links(m.html.replace(/&amp;/g, '&')).length >= 2, true);
  assert.doesNotMatch(m.text + m.html, /xAI|SpaceX|Cursor/);
});

test('download: atsk token -> stamped assistant-team-starter-kit zip; bgsk token unchanged; bundle/unknown sku token -> 403', async () => {
  let r = mkRes(); await download({ method: 'GET', query: { token: lib.downloadToken('a@b.co', 'cs_test_x', { sku: 'atsk' }) } }, r);
  assert.equal(r.code, 200); assert.match(r.headers['Content-Disposition'], /assistant-team-starter-kit-a-b-co\.zip/);
  const files = unzipSync(new Uint8Array(r.body)); const names = Object.keys(files);
  assert.ok(names.every((n) => n.startsWith('assistant-team-starter-kit/')));
  for (const f of ['README.md', 'START-HERE.md', 'LICENSE.md', 'GUIDE.pdf', 'safety/APPROVAL-RULES.md']) assert.ok(names.includes(`assistant-team-starter-kit/${f}`), f);
  assert.match(Buffer.from(files['assistant-team-starter-kit/LICENSE.md']).toString(), /Licensed to: a@b\.co/);
  const pdf = await PDFDocument.load(files['assistant-team-starter-kit/GUIDE.pdf']); assert.match(pdf.getKeywords(), /licensee:a@b\.co/);
  assert.equal(names.some((n) => /\/scripts\/|node_modules|\.DS_Store/.test(n)), false);
  const all = names.filter((n) => /\.(md|txt)$/.test(n)).map((n) => Buffer.from(files[n]).toString()).join('\n');
  assert.doesNotMatch(all, /xAI|SpaceX|Cursor/); assert.match(all, /Not affiliated with or endorsed by the makers of Grok Bot/);
  assert.equal(lib.downloadToken('a@b.co', 'cs_1', { now: 1e12 }), lib.downloadToken('a@b.co', 'cs_1', { now: 1e12, sku: 'bgsk' }));
  for (const s of ['bundle', 'nope']) { r = mkRes(); await download({ method: 'GET', query: { token: lib.downloadToken('a@b.co', 'cs_1', { sku: s }) } }, r); assert.equal(r.code, 403); }
  await assert.rejects(buildWatermarkedZip('a@b.co', { sku: 'bundle' }));
});

test('claim: bgsk/atsk 302 to their own link; bundle -> page with two download buttons; unpaid 402', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  const sess = (o) => () => ({ ok: true, status: 200, data: { id: 'cs_test_claim123456', payment_status: 'paid', customer_details: { email: 'x@y.co' }, created: 1792600000, ...o } });
  const go = async () => { const r = mkRes(); await claim({ method: 'GET', query: { session_id: 'cs_test_claim123456' } }, r); return r; };
  respond = sess({ metadata: { sku: 'bgsk' } }); let r = await go(); assert.equal(r.code, 302); assert.equal(lib.verifyDownloadToken(r.headers.Location.split('token=')[1]).s, undefined);
  respond = sess({ metadata: { sku: 'atsk' } }); r = await go(); assert.equal(r.code, 302); assert.equal(lib.verifyDownloadToken(r.headers.Location.split('token=')[1]).s, 'atsk');
  respond = sess({ metadata: { sku: 'bundle' } }); r = await go(); assert.equal(r.code, 200);
  const toks = [...r.body.matchAll(/token=([\w.-]+)/g)].map((m) => lib.verifyDownloadToken(m[1]));
  assert.deepEqual(toks.map((t) => t.s || 'bgsk'), ['bgsk', 'atsk']); assert.match(r.headers['X-Robots-Tag'], /noindex/);
  respond = sess({ metadata: { sku: 'bundle' }, payment_status: 'unpaid' }); r = await go(); assert.equal(r.code, 402);
  respond = sess({ metadata: {} }); r = await go(); assert.equal(r.code, 402); // unchanged: no sku, no claim
  delete process.env.STRIPE_SECRET_KEY;
});

test('arcade signup: adds to Arcade weekly segment, sends one confirmation, no Core Keepers / automation event', async () => {
  calls.length = 0; respond = () => ({ ok: true, status: 200, data: { id: 'c1' } });
  let r = mkRes(); await arcadeSub({ method: 'POST', headers: {}, body: { email: 'Fan@Example.com', source: 'arcade', website: '' } }, r);
  assert.equal(r.code, 200);
  const contact = calls.find((c) => c.url.endsWith('/contacts')); assert.deepEqual(JSON.parse(contact.body).segments, [{ id: '98cd288f-b000-4394-ac50-605595345cba' }]);
  const mails = calls.filter((c) => c.url.endsWith('/emails')); assert.equal(mails.length, 1);
  const m = JSON.parse(mails[0].body); assert.deepEqual(m.to, ['fan@example.com']); assert.match(m.text, /Unsubscribe: https:\/\/promptforgekits\.com/); assert.doesNotMatch(m.text, /Core Keepers|demo link/);
  assert.equal(calls.some((c) => /\/events|automation/.test(c.url)), false);
  calls.length = 0; r = mkRes(); await arcadeSub({ method: 'POST', headers: {}, body: { email: 'bot@x.co', website: 'spam' } }, r); assert.equal(r.code, 200); assert.equal(calls.length, 0);
  r = mkRes(); await arcadeSub({ method: 'POST', headers: {}, body: { email: 'nope' } }, r); assert.equal(r.code, 400);
  r = mkRes(); await arcadeSub({ method: 'GET', headers: {} }, r); assert.equal(r.code, 405);
  // existing contact: falls back to adding the segment
  calls.length = 0; respond = (url, opt) => url.endsWith('/contacts') && opt.method === 'POST' ? { ok: false, status: 409, data: {} } : { ok: true, status: 200, data: {} };
  r = mkRes(); await arcadeSub({ method: 'POST', headers: {}, body: '{"email":"old@x.co"}' }, r); assert.equal(r.code, 200);
  assert.ok(calls.some((c) => c.url.endsWith('/contacts/old%40x.co/segments/98cd288f-b000-4394-ac50-605595345cba')));
});

const dist = new URL('../dist/', import.meta.url);
const page = (p) => fs.readFileSync(new URL(p, dist), 'utf8');
const built = fs.existsSync(new URL('index.html', dist));

test('pages: product page + homepage have exactly one Buy per new product, disclaimer, no Grok in product title', { skip: !built }, () => {
  const ak = page('assistant-kit/index.html'), home = page('index.html');
  const count = (h, sku) => (h.match(new RegExp(`action="/api/checkout/\\?sku=${sku}"`, 'g')) || []).length;
  assert.equal(count(ak, 'atsk'), 1); assert.equal(count(ak, 'bundle'), 1);
  assert.equal(count(home, 'atsk'), 1); assert.equal(count(home, 'bundle'), 1);
  assert.match(ak, /Written for Grok Bot\. Not affiliated with or endorsed by the makers of Grok Bot\./);
  assert.match(home, /Not affiliated with or endorsed by the makers of Grok Bot/);
  const h1 = ak.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]; assert.doesNotMatch(h1, /grok/i);
  for (const ld of [...ak.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))) {
    for (const n of [ld].flat()) if (n['@type'] === 'Product') { assert.doesNotMatch(n.name, /grok/i); assert.match(n.offers.url, /^https:\/\/promptforgekits\.com\/assistant-kit\/#/); }
  }
  assert.doesNotMatch(ak + home, /xAI|SpaceX|cursor\.com|gumroad\.com|href="[^"]*itch\.io/i);
  assert.match(page('sitemap.xml'), /\/assistant-kit\/</);
});

test('arcade page: own demos only, own images, submit by email, removal note, signup, in sitemap + nav', { skip: !built }, () => {
  const a = page('arcade/index.html');
  const main = a.slice(a.indexOf('<main'), a.indexOf('</main>'));
  const hrefs = [...main.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const h of hrefs) assert.ok(h.startsWith('/') || h.startsWith('#') || h.startsWith('mailto:support@promptforgekits.com'), `external link in arcade: ${h}`);
  for (const s of [...main.matchAll(/<(?:img|source)[^>]+(?:src|srcset)="([^"]+)"/g)].map((m) => m[1])) assert.match(s, /^\/img\//);
  for (const d of ['platformer', 'roguelite', 'idle', 'runner', 'puzzle']) assert.match(main, new RegExp(`href="/play/${d}/"`));
  assert.doesNotMatch(main, /\/play\/towerdefense\//);
  assert.match(a, /data-mailto="support@promptforgekits\.com"/); assert.match(a, /Nothing is listed automatically/);
  assert.match(a, /id="removal"/); assert.match(a, /data-endpoint="\/api\/arcade-subscribe\/"/);
  assert.match(page('sitemap.xml'), /\/arcade\/<\/loc>/); assert.match(page('index.html'), /href="\/arcade\/"/);
  assert.match(page('llms.txt'), /\/arcade\//);
});

test('gated demo: Core Keepers page is not built, not in the sitemap, not linked; vercel rewrites do not expose it', { skip: !built }, () => {
  assert.equal(fs.existsSync(new URL('play/towerdefense/index.html', dist)), false);
  assert.equal(fs.existsSync(new URL('play/towerdefense/', dist)), false);
  assert.doesNotMatch(page('sitemap.xml'), /towerdefense/);
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (e.name === 'play' && d.href === dist.href ? [] : walk(new URL(e.name + '/', d))) : /\.(html|txt|xml)$/.test(e.name) ? [new URL(e.name, d)] : []);
  for (const f of walk(dist)) assert.doesNotMatch(fs.readFileSync(f, 'utf8'), /href="[^"]*\/play\/towerdefense\//, f.pathname);
  const vj = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.doesNotMatch(JSON.stringify(vj.rewrites || []), /towerdefense/);
});
