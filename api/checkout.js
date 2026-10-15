import { SITE, stripe } from './_lib.js';

// Creates a hosted Stripe Checkout Session for the $29 kit and sends the buyer there.
//  - HTML form POST (the "Buy now" button)  -> 303 redirect to Stripe
//  - fetch with Accept: application/json    -> { url }
// Needs STRIPE_SECRET_KEY + STRIPE_PRICE_ID. If there is no secret key but STRIPE_PAYMENT_LINK_URL is set
// (test-mode fallback), it redirects to that hosted Payment Link instead.
// Email is collected by Checkout itself. Automatic tax only when STRIPE_AUTOMATIC_TAX=1.
const bad = (res, code, error) => res.status(code).setHeader('Cache-Control', 'no-store').json({ error });

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return bad(res, 405, 'Method not allowed'); }
  const wantsJson = /application\/json/.test(String(req.headers?.accept || ''));
  const go = (url) => {
    res.setHeader('Cache-Control', 'no-store');
    if (wantsJson) return res.status(200).json({ url });
    res.setHeader('Location', url);
    return res.status(303).end();
  };

  const key = process.env.STRIPE_SECRET_KEY, price = process.env.STRIPE_PRICE_ID;
  if (!key) {
    if (process.env.STRIPE_PAYMENT_LINK_URL) return go(process.env.STRIPE_PAYMENT_LINK_URL);
    return bad(res, 503, 'Checkout is not configured yet.');
  }
  if (!price) return bad(res, 503, 'Checkout is not configured yet.');

  const params = {
    mode: 'payment',
    line_items: [{ price, quantity: 1 }],
    success_url: `${SITE}/thanks/`,
    cancel_url: `${SITE}/#pricing`,
    billing_address_collection: 'auto',
    customer_creation: 'always',
    allow_promotion_codes: false,
    custom_text: { submit: { message: "Digital download, emailed right after payment. 7-day refund if the kit didn't work for you (may be declined if clearly copied or reused)." } },
    payment_intent_data: { description: 'Browser Game Starter Kit' },
    metadata: { sku: 'bgsk', source: 'site' },
  };
  if (process.env.STRIPE_AUTOMATIC_TAX === '1') params.automatic_tax = { enabled: true };

  const r = await stripe('POST', '/v1/checkout/sessions', params, { key });
  if (!r.ok || !r.data?.url) { console.error('checkout session failed', r.status, r.data?.error?.message); return bad(res, 502, 'Could not start checkout. Please try again later.'); }
  return go(r.data.url);
}
