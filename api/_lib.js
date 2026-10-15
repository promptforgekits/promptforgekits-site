import crypto from 'node:crypto';

export const SITE = 'https://promptforgekits.com';
export const FROM = 'Prompt Forge Kits <hello@promptforgekits.com>';
export const REPLY_TO = 'hello@promptforgekits.com';
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function unsubToken(email) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error('UNSUBSCRIBE_SECRET not set');
  return crypto.createHmac('sha256', secret).update(email.toLowerCase()).digest('hex');
}
export function unsubUrl(email) {
  return `${SITE}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;
}
export function tokenOk(email, t) {
  try {
    const a = Buffer.from(unsubToken(email)), b = Buffer.from(String(t || ''));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
}

export async function resend(method, path, body, extraHeaders = {}) {
  const r = await fetch('https://api.resend.com' + path, {
    method,
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await r.json(); } catch { /* empty */ }
  return { ok: r.ok, status: r.status, data };
}

export function welcomeEmail(email) {
  const pack = `${SITE}/free-pack/`;
  const pdf = `${SITE}/downloads/prompt-forge-free-prompt-pack.pdf`;
  const unsub = unsubUrl(email);
  const subject = 'Your Free Prompt Pack is here';
  const text = `Thanks for signing up. Here's your Free Prompt Pack:

Read it online: ${pack}
Download the PDF: ${pdf}

Inside: one real genre prompt from the Browser Game Starter Kit (Platformer: "Better jump feel") and a step-by-step guide to get your first Phaser 3 game running with an AI coding tool in about 30 minutes.

Start with the 4 rules: one prompt = one feature, test after every change, commit every working step, and after three failed fixes roll back.

What's coming: in a few days I'll send one practical tip, and around day 7 a short note about the full Browser Game Starter Kit ($29, 7-day refund, free updates). That's the whole sequence. No spam.

Prompt Forge Kits
https://promptforgekits.com

You're getting this because you asked for the Free Prompt Pack at promptforgekits.com.
Unsubscribe: ${unsub}`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#e9edf5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#e9edf5"><tr><td align="center" style="padding-top:24px;padding-bottom:24px;padding-left:12px;padding-right:12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td bgcolor="#1b1f2e" style="background-color:#1b1f2e;padding-top:22px;padding-bottom:22px;padding-left:26px;padding-right:26px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:30px;color:#ffc93c;font-weight:bold;">Prompt Forge Kits</td></tr>
<tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding-top:28px;padding-bottom:28px;padding-left:26px;padding-right:26px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#1b1f2e;">
<p style="margin-top:0;margin-bottom:14px;font-size:22px;line-height:28px;font-weight:bold;color:#1b1f2e;">Your Free Prompt Pack is here</p>
<p style="margin-top:0;margin-bottom:14px;font-size:16px;line-height:24px;color:#1b1f2e;">Thanks for signing up. Inside: one real genre prompt from the Browser Game Starter Kit (Platformer: "Better jump feel") and a step-by-step guide to get your first Phaser 3 game running with an AI coding tool in about 30 minutes.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#ffc93c" style="background-color:#ffc93c;border:3px solid #1b1f2e;border-radius:10px;"><a href="${pack}" style="display:inline-block;padding-top:12px;padding-bottom:12px;padding-left:22px;padding-right:22px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;color:#1b1f2e;text-decoration:none;">Open the Free Prompt Pack</a></td></tr></table>
<p style="margin-top:14px;margin-bottom:14px;font-size:15px;line-height:22px;color:#1b1f2e;">Prefer a file? <a href="${pdf}" style="color:#2a5bd7;">Download the PDF</a>.</p>
<p style="margin-top:0;margin-bottom:14px;font-size:16px;line-height:24px;color:#1b1f2e;">Start with the 4 rules: one prompt = one feature, test after every change, commit every working step, and after three failed fixes roll back.</p>
<p style="margin-top:0;margin-bottom:0;font-size:16px;line-height:24px;color:#1b1f2e;">What's coming: in a few days one practical tip, and around day 7 a short note about the full Browser Game Starter Kit ($29, 7-day refund, free updates). That's the whole sequence. No spam.</p>
</td></tr>
<tr><td style="padding-top:16px;padding-bottom:8px;padding-left:26px;padding-right:26px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#4a5373;">You're getting this because you asked for the Free Prompt Pack at promptforgekits.com. <a href="${unsub}" style="color:#4a5373;">Unsubscribe</a> anytime.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}
