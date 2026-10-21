import { SITE, stripe } from './_lib.js';
import { PRODUCTS, DEFAULT_SKU, priceIdFor } from './_products.js';

// Creates a hosted Stripe Checkout Session for one product and sends the buyer there.
//  - HTML form POST (a "Buy now" button)    -> 303 redirect to Stripe
//  - fetch with Accept: application/json    -> { url }
// Product: ?sku= (or a "sku" form field): bgsk (default, the $29 kit), atsk ($39 Assistant Team Starter Kit), bundle ($55, both).
// bgsk is unchanged: STRIPE_PRICE_ID, metadata.sku 'bgsk', cancel /#pricing. If there is no secret key but
// STRIPE_PAYMENT_LINK_URL is set (test-mode fallback, bgsk only), it redirects to that hosted Payment Link instead.
// Email is collected by Checkout itself. Automatic tax only when STRIPE_AUTOMATIC_TAX=1.
const bad = (res, code, error) => res.status(code).setHeader('Cache-Control', 'no-store').json({ error });

const skuOf = (req) => {
  let b = req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : {};
  if (typeof req.body === 'string') b = Object.fromEntries(new URLSearchParams(req.body)); // unparsed form body
  const s = String(req.query?.sku ?? b.sku ?? '').trim().toLowerCase();
  return s || DEFAULT_SKU;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return bad(res, 405, 'Method not allowed'); }
  const sku = skuOf(req), product = PRODUCTS[sku];
  if (!product) return bad(res, 400, 'Unknown product.');
  const wantsJson = /application\/json/.test(String(req.headers?.accept || ''));
  const go = (url) => {
    res.setHeader('Cache-Control', 'no-store');
    if (wantsJson) return res.status(200).json({ url });
    res.setHeader('Location', url);
    return res.status(303).end();
  };

  const key = process.env.STRIPE_SECRET_KEY, price = priceIdFor(sku);
  if (!key) {
    if (sku === 'bgsk' && process.env.STRIPE_PAYMENT_LINK_URL) return go(process.env.STRIPE_PAYMENT_LINK_URL);
    return bad(res, 503, 'Checkout is not configured yet.');
  }
  if (!price) return bad(res, 503, 'Checkout is not configured yet.');

  const params = {
    mode: 'payment',
    line_items: [{ price, quantity: 1 }],
    success_url: `${SITE}/thanks/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE}${product.cancelPath}`,
    billing_address_collection: 'auto',
    customer_creation: 'always',
    allow_promotion_codes: false,
    custom_text: { submit: { message: sku === 'bundle'
      ? "Digital downloads (both kits), emailed right after payment. 7-day refund if the kits didn't work for you (may be declined if clearly copied or reused)."
      : "Digital download, emailed right after payment. 7-day refund if the kit didn't work for you (may be declined if clearly copied or reused)." } },
    payment_intent_data: { description: product.name },
    metadata: { sku, source: 'site' },
  };
  if (process.env.STRIPE_AUTOMATIC_TAX === '1') params.automatic_tax = { enabled: true };

  const r = await stripe('POST', '/v1/checkout/sessions', params, { key });
  if (!r.ok || !r.data?.url) { console.error('checkout session failed', sku, r.status, r.data?.error?.message); return bad(res, 502, 'Could not start checkout. Please try again later.'); }
  return go(r.data.url);
}
