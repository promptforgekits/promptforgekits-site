import { verifyDownloadToken } from './_lib.js';
import { buildWatermarkedZip, slug } from './_kit.js';
import { PRODUCTS, KIT_SKUS } from './_products.js';

// /api/download/?token=...  Streams the buyer's watermarked kit zip, built on demand from the private kit
// bundled in the function. Signed + expiring token (HMAC, 14 days). The token's sku picks the kit
// (no sku = the original Browser Game Starter Kit, exactly as before).
export const config = { maxDuration: 30 };

const page = (res, code, msg) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(code).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Download link</title></head><body style="font-family:Arial,sans-serif;background:#1b1f2e;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0"><main style="max-width:480px;padding:24px;text-align:center"><h1 style="color:#ffc93c">${msg}</h1><p>Reply to your purchase email and we'll send a fresh link.</p><p><a style="color:#3ec9e6" href="https://promptforgekits.com">promptforgekits.com</a></p></main></body></html>`);
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  let t;
  try { t = verifyDownloadToken(req.query?.token); } catch { t = null; }
  if (!t) return page(res, 403, 'This download link is invalid or has expired');
  const sku = t.s || 'bgsk';
  if (!KIT_SKUS.includes(sku)) return page(res, 403, 'This download link is invalid or has expired');
  try {
    const { zip } = await buildWatermarkedZip(t.e, { sku, order: String(t.o || '').slice(-12), date: new Date(t.i * 1000).toISOString().slice(0, 10) });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${PRODUCTS[sku].zipRoot}-${slug(t.e)}.zip"`);
    res.setHeader('Content-Length', String(zip.length));
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(200).send(zip);
  } catch (e) {
    console.error('download build failed', sku, e.message);
    return page(res, 500, 'Something went wrong preparing your download');
  }
}
