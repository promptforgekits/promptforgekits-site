import { resend, tokenOk, SITE } from './_lib.js';

const page = (title, msg, form = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head><body style="font-family:Arial,sans-serif;background:#1b1f2e;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0"><main style="max-width:480px;padding:24px;text-align:center"><h1 style="color:#ffc93c">${title}</h1><p>${msg}</p>${form}<p><a style="color:#3ec9e6" href="${SITE}">promptforgekits.com</a></p></main></body></html>`;

export default async function handler(req, res) {
  const q = req.query || {};
  const email = String(q.e || '').trim().toLowerCase();
  const ok = email && tokenOk(email, q.t);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (!ok) return res.status(400).send(page('Link not valid', 'This unsubscribe link is invalid or incomplete. Reply to any of our emails and we will remove you by hand.'));
  if (req.method === 'POST') {
    const r = await resend('PATCH', `/contacts/${encodeURIComponent(email)}`, { unsubscribed: true });
    if (!r.ok && r.status !== 404) return res.status(502).send(page('Something went wrong', 'We could not process that. Please try again, or reply to any of our emails.'));
    // List-Unsubscribe one-click POSTs expect a 2xx
    return res.status(200).send(page('You are unsubscribed', 'You will not get any more emails from us.'));
  }
  // GET: confirm button (prevents mail scanners from unsubscribing people by prefetching the link)
  const action = `/api/unsubscribe/?e=${encodeURIComponent(email)}&amp;t=${encodeURIComponent(String(q.t))}`;
  return res.status(200).send(page('Unsubscribe?', 'Click to stop receiving emails from Prompt Forge Kits.', `<form method="post" action="${action}"><button style="background:#ffc93c;border:3px solid #000;border-radius:10px;padding:12px 22px;font-weight:bold;font-size:16px;cursor:pointer" type="submit">Unsubscribe</button></form>`));
}
