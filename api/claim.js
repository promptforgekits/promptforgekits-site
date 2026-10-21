import { EMAIL_RE, stripe, downloadUrl } from './_lib.js';
import { PRODUCTS, deliverables } from './_products.js';

// /api/claim/?session_id=cs_...  Post-checkout hand-off from /thanks/: looks the Checkout Session up in Stripe,
// and if it is a paid kit purchase, 302s to the same signed /api/download/ link that the email contains
// (token is deterministic per session, so both routes give the identical file).
// bgsk and atsk: 302 to the one download. bundle: a small page with both download buttons.
export const config = { maxDuration: 15 };

const shell = (title, inner) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title></head><body style="font-family:Arial,sans-serif;background:#1b1f2e;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0"><main style="max-width:480px;padding:24px;text-align:center">${inner}</main></body></html>`;
const headers = (res) => { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Robots-Tag', 'noindex, nofollow'); };
const msg = (res, code, text) => {
  headers(res);
  return res.status(code).send(shell('Your download', `<h1 style="color:#ffc93c">${text}</h1><p>Your personal download link is also in your purchase email. Reply to it if you need help.</p><p><a style="color:#3ec9e6" href="https://promptforgekits.com">promptforgekits.com</a></p>`));
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  const sid = String(req.query?.session_id || '');
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(sid) || !process.env.STRIPE_SECRET_KEY) return msg(res, 400, 'We could not find that purchase');
  try {
    const r = await stripe('GET', `/v1/checkout/sessions/${sid}`);
    const s = r.data;
    if (!r.ok || !s) return msg(res, 404, 'We could not find that purchase');
    const email = String(s.customer_details?.email || s.customer_email || '').trim().toLowerCase();
    const sku = String(s.metadata?.sku || '');
    const kits = PRODUCTS[sku] ? deliverables(sku) : [];
    if (s.payment_status !== 'paid' || !kits.length || !EMAIL_RE.test(email)) return msg(res, 402, 'Payment not confirmed yet. Refresh in a moment');
    const now = (s.created || Math.floor(Date.now() / 1000)) * 1000;
    const link = (k) => downloadUrl(email, s.id, k === 'bgsk' ? { now } : { now, sku: k });
    if (kits.length === 1) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.setHeader('Location', link(kits[0]));
      return res.status(302).end();
    }
    headers(res);
    return res.status(200).send(shell('Your downloads', `<h1 style="color:#ffc93c">Your downloads</h1><p>Your bundle has two kits. Download each one:</p>${kits.map((k) => `<p><a style="display:inline-block;background:#ffc93c;color:#1b1f2e;font-weight:bold;padding:12px 20px;border:3px solid #0a1022;border-radius:10px;text-decoration:none" href="${link(k)}">Download the ${PRODUCTS[k].name} (.zip)</a></p>`).join('')}<p>Both links are also in your purchase email. Reply to it if you need help.</p><p><a style="color:#3ec9e6" href="https://promptforgekits.com">promptforgekits.com</a></p>`));
  } catch (e) {
    console.error('claim failed', e.message);
    return msg(res, 500, 'Something went wrong preparing your download');
  }
}
