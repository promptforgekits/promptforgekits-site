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
  return `${SITE}/api/unsubscribe/?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;
}
export function tokenOk(email, t) {
  try {
    const a = Buffer.from(unsubToken(email)), b = Buffer.from(String(t || ''));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
}

// Demo access token: HMAC over "demo:<email>" (domain-separated from the unsubscribe token,
// so an unsubscribe link can never unlock the demo). Secret: DEMO_SECRET, falling back to UNSUBSCRIBE_SECRET.
function demoSecret() {
  const secret = process.env.DEMO_SECRET || process.env.UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error('DEMO_SECRET / UNSUBSCRIBE_SECRET not set');
  return secret;
}
export function demoToken(email) {
  return crypto.createHmac('sha256', demoSecret()).update('demo:' + String(email).toLowerCase()).digest('hex');
}
export function demoUrl(email) {
  return `${SITE}/demo/core-keepers/?e=${encodeURIComponent(email)}&t=${demoToken(email)}`;
}
export function demoTokenOk(email, t) {
  try {
    if (!email || !t) return false;
    const a = Buffer.from(demoToken(email)), b = Buffer.from(String(t));
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
  const demo = demoUrl(email);
  const guide = `${SITE}/free-pack/`;
  const pdf = `${SITE}/downloads/prompt-forge-free-prompt-pack.pdf`;
  const unsub = unsubUrl(email);
  const subject = 'Your free Core Keepers demo is here';
  const text = `Thanks for signing up. Here's your free Core Keepers demo, a playable tower defense game built with the Browser Game Starter Kit:

Play it here: ${demo}

This link is personal to you, so please don't share it. Best on desktop with a mouse and keyboard.

Also included: a short teaser guide to the approach, with a 30-minute walkthrough for getting your first Phaser 3 game running with an AI coding tool.
Read it online: ${guide}
Download the PDF: ${pdf}

What's coming: in a few days I'll send one practical tip, and around day 7 a short note about the full Browser Game Starter Kit ($29, 7-day refund if it didn't work for you, free updates). That's the whole sequence. No spam.

Prompt Forge Kits
https://promptforgekits.com

You're getting this because you asked for the free Core Keepers demo at promptforgekits.com.
Unsubscribe: ${unsub}`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#e9edf5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#e9edf5"><tr><td align="center" style="padding-top:24px;padding-bottom:24px;padding-left:12px;padding-right:12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td bgcolor="#1b1f2e" style="background-color:#1b1f2e;padding-top:22px;padding-bottom:22px;padding-left:26px;padding-right:26px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:30px;color:#ffc93c;font-weight:bold;">Prompt Forge Kits</td></tr>
<tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding-top:28px;padding-bottom:28px;padding-left:26px;padding-right:26px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#1b1f2e;">
<p style="margin-top:0;margin-bottom:14px;font-size:22px;line-height:28px;font-weight:bold;color:#1b1f2e;">Your free Core Keepers demo is here</p>
<p style="margin-top:0;margin-bottom:14px;font-size:16px;line-height:24px;color:#1b1f2e;">Thanks for signing up. Core Keepers is a playable tower defense game built with the Browser Game Starter Kit. This link is personal to you, so please don't share it. Best on desktop with a mouse and keyboard.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#ffc93c" style="background-color:#ffc93c;border:3px solid #1b1f2e;border-radius:10px;"><a href="${demo}" style="display:inline-block;padding-top:12px;padding-bottom:12px;padding-left:22px;padding-right:22px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;color:#1b1f2e;text-decoration:none;">Play Core Keepers</a></td></tr></table>
<p style="margin-top:14px;margin-bottom:14px;font-size:15px;line-height:22px;color:#1b1f2e;">Also included: a short <a href="${guide}" style="color:#2a5bd7;">teaser guide</a> (or <a href="${pdf}" style="color:#2a5bd7;">download the PDF</a>) with a 30-minute walkthrough for getting your first Phaser 3 game running with an AI coding tool.</p>
<p style="margin-top:0;margin-bottom:0;font-size:16px;line-height:24px;color:#1b1f2e;">What's coming: in a few days one practical tip, and around day 7 a short note about the full Browser Game Starter Kit ($29, 7-day refund if it didn't work for you, free updates). That's the whole sequence. No spam.</p>
</td></tr>
<tr><td style="padding-top:16px;padding-bottom:8px;padding-left:26px;padding-right:26px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#4a5373;">You're getting this because you asked for the free Core Keepers demo at promptforgekits.com. <a href="${unsub}" style="color:#4a5373;">Unsubscribe</a> anytime.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}
