import { EMAIL_RE, FROM, REPLY_TO, SITE, resend, unsubUrl } from './_lib.js';
import { ARCADE_SEGMENT_ID } from './_arcade.js';

// Arcade weekly newsletter signup (added 2026-10-21). POST JSON { email, source, website }.
// Adds the contact to the Resend segment "Arcade weekly" (RESEND_ARCADE_SEGMENT_ID overrides the default id) and sends
// one confirmation email. It does NOT start the game-kit email sequence and does NOT send the Core Keepers demo.
// Issues are sent by hand as Resend broadcasts, only after the owner approves each one.
const json = (res, code, body) => res.status(code).setHeader('Cache-Control', 'no-store').json(body);

export function arcadeWelcome(email) {
  const unsub = unsubUrl(email);
  const subject = "You're on the Arcade weekly list";
  const text = `Thanks for signing up for Arcade weekly from Prompt Forge Kits.

Once a week (at most) we send a short email: free browser games worth playing, link only, plus one tip for building your own game with AI.

Until the first issue, the arcade is here: ${SITE}/arcade/

Made a free browser game? You can suggest it on that page. We list games only with the maker's OK and remove a listing on request.

Prompt Forge Kits
${SITE}

You're getting this because you signed up for Arcade weekly at promptforgekits.com.
Unsubscribe: ${unsub}`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#e9edf5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#e9edf5"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td bgcolor="#1b1f2e" style="background-color:#1b1f2e;padding:22px 26px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:30px;color:#ffc93c;font-weight:bold;">Prompt Forge Kits Arcade</td></tr>
<tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding:28px 26px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#1b1f2e;">
<p style="margin:0 0 14px;font-size:22px;line-height:28px;font-weight:bold;">You're on the Arcade weekly list</p>
<p style="margin:0 0 14px;">Once a week (at most) we send a short email: free browser games worth playing, link only, plus one tip for building your own game with AI.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#ffc93c" style="background-color:#ffc93c;border:3px solid #1b1f2e;border-radius:10px;"><a href="${SITE}/arcade/" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;color:#1b1f2e;text-decoration:none;">Open the arcade</a></td></tr></table>
<p style="margin:14px 0 0;font-size:15px;line-height:22px;">Made a free browser game? You can suggest it on the arcade page. We list games only with the maker's OK and remove a listing on request.</p>
</td></tr>
<tr><td style="padding:16px 26px 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#4a5373;">You're getting this because you signed up for Arcade weekly at promptforgekits.com. <a href="${unsub}" style="color:#4a5373;">Unsubscribe</a> anytime.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://promptforgekits.com');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const segment = process.env.RESEND_ARCADE_SEGMENT_ID || ARCADE_SEGMENT_ID;
  if (!process.env.RESEND_API_KEY || !process.env.UNSUBSCRIBE_SECRET) return json(res, 500, { error: 'Signups are not configured yet.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return json(res, 400, { error: 'Invalid request.' });
  if (body.website) return json(res, 200, { ok: true }); // honeypot

  const email = String(body.email || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return json(res, 400, { error: 'Please enter a valid email address.' });

  let c = await resend('POST', '/contacts', { email, unsubscribed: false, segments: [{ id: segment }] });
  if (!c.ok) {
    const enc = encodeURIComponent(email);
    const p = await resend('PATCH', `/contacts/${enc}`, { unsubscribed: false });
    const s = await resend('POST', `/contacts/${enc}/segments/${segment}`);
    if (!p.ok && !s.ok) { console.error('arcade contact failed', c.status, p.status, s.status); return json(res, 502, { error: 'Could not sign you up. Please try again later.' }); }
  }
  const m = arcadeWelcome(email);
  const day = new Date().toISOString().slice(0, 10);
  const sent = await resend('POST', '/emails', {
    from: FROM, to: [email], reply_to: REPLY_TO, subject: m.subject, html: m.html, text: m.text,
    headers: { 'List-Unsubscribe': `<${unsubUrl(email)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    tags: [{ name: 'type', value: 'arcade-welcome' }],
  }, { 'Idempotency-Key': `arcade-welcome-${email}-${day}` });
  if (!sent.ok) console.error('arcade welcome failed', sent.status, sent.data?.message); // still subscribed; not fatal
  return json(res, 200, { ok: true });
}
