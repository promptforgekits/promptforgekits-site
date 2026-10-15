import { FROM, REPLY_TO, EMAIL_RE, resend, stripe, verifyStripeSignature, downloadUrl, purchaseEmail } from './_lib.js';

// Stripe webhook: on checkout.session.completed (paid), email the buyer a signed, expiring link to
// /api/download (which builds their watermarked kit on demand) and add them to the Resend "Customers" segment.
// Idempotent: Resend Idempotency-Key per session (24h) + a durable fulfilled marker on the PaymentIntent metadata.
export const config = { api: { bodyParser: false }, maxDuration: 30 };

// Test-mode safety: in Stripe test mode only these addresses ever get a real email.
const testAllow = () => String(process.env.STRIPE_TEST_EMAIL_ALLOW || 'gregvirag@gmail.com').toLowerCase().split(',').map((s) => s.trim());

async function rawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  return Buffer.concat(chunks);
}

async function customersSegment() {
  if (process.env.RESEND_CUSTOMERS_SEGMENT_ID) return process.env.RESEND_CUSTOMERS_SEGMENT_ID;
  const l = await resend('GET', '/segments');
  const found = (l.data?.data || []).find((s) => s.name === 'Customers');
  if (found) return found.id;
  const c = await resend('POST', '/segments', { name: 'Customers' });
  return c.ok ? c.data?.id : null;
}

export async function fulfill(session, { livemode }) {
  const email = String(session.customer_details?.email || session.customer_email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) { console.error('no buyer email on', session.id); return { status: 200, body: { ok: true, skipped: 'no-email' } }; }
  if (session.payment_status !== 'paid') return { status: 200, body: { ok: true, skipped: 'unpaid' } };
  if (!livemode && !testAllow().includes(email)) { console.log('test-mode event for non-allowlisted email, not sending', session.id); return { status: 200, body: { ok: true, skipped: 'test-email-not-allowed' } }; }

  // durable idempotency marker (needs STRIPE_SECRET_KEY; otherwise rely on the Resend idempotency key)
  const pi = session.payment_intent, haveKey = !!process.env.STRIPE_SECRET_KEY && typeof pi === 'string';
  if (haveKey) {
    const g = await stripe('GET', `/v1/payment_intents/${pi}`);
    if (g.ok && g.data?.metadata?.pfk_fulfilled) return { status: 200, body: { ok: true, skipped: 'already-fulfilled' } };
  }

  // 1) Customers segment (best effort; a contact failure must not block delivery)
  try {
    const seg = await customersSegment();
    if (seg) {
      const c = await resend('POST', '/contacts', { email, unsubscribed: false, segments: [{ id: seg }] });
      if (!c.ok) await resend('POST', `/contacts/${encodeURIComponent(email)}/segments/${seg}`);
    } else console.error('could not resolve Customers segment');
  } catch (e) { console.error('segment add failed', e.message); }

  // 2) delivery email (must succeed, otherwise 500 so Stripe retries)
  const date = new Date((session.created || Date.now() / 1000) * 1000).toISOString().slice(0, 10);
  const m = purchaseEmail({ email, order: session.id, amount: session.amount_total, currency: session.currency, date, url: downloadUrl(email, session.id) });
  const sent = await resend('POST', '/emails', {
    from: FROM, to: [email], reply_to: REPLY_TO, subject: m.subject, html: m.html, text: m.text,
    tags: [{ name: 'type', value: 'purchase' }],
  }, { 'Idempotency-Key': `kit-delivery-${session.id}` });
  if (!sent.ok) { console.error('delivery email failed', sent.status, sent.data?.message); return { status: 500, body: { error: 'email failed' } }; }

  if (haveKey) await stripe('POST', `/v1/payment_intents/${pi}`, { metadata: { pfk_fulfilled: sent.data?.id || '1' } });
  return { status: 200, body: { ok: true, delivered: true } };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.RESEND_API_KEY || !(process.env.DOWNLOAD_SECRET || process.env.UNSUBSCRIBE_SECRET)) return res.status(500).json({ error: 'not configured' });

  const raw = await rawBody(req);
  if (!verifyStripeSignature(raw, req.headers['stripe-signature'], secret)) return res.status(400).json({ error: 'bad signature' });
  let event;
  try { event = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).json({ error: 'bad json' }); }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const out = await fulfill(event.data.object, { livemode: !!event.livemode });
    return res.status(out.status).json(out.body);
  }
  return res.status(200).json({ ok: true, ignored: event.type });
}
