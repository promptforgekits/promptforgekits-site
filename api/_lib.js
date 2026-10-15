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

// ── Direct checkout (Stripe) helpers ────────────────────────────────────────────
// Signed, expiring download token: base64url(JSON{e,o,i,x}).HMAC. e=email, o=order (Checkout Session id),
// i=issued-at (s), x=expiry (s). Domain-separated ("dl:") from the unsubscribe and demo tokens.
export const DOWNLOAD_TTL_DAYS = 14;
const b64u = (b) => Buffer.from(b).toString('base64url');
function dlSecret() {
  const secret = process.env.DOWNLOAD_SECRET || process.env.UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error('DOWNLOAD_SECRET / UNSUBSCRIBE_SECRET not set');
  return secret;
}
const dlSig = (payload) => crypto.createHmac('sha256', dlSecret()).update('dl:' + payload).digest('base64url');
export function downloadToken(email, order, { now = Date.now(), days = DOWNLOAD_TTL_DAYS } = {}) {
  const i = Math.floor(now / 1000);
  const payload = b64u(JSON.stringify({ e: String(email).toLowerCase(), o: String(order || ''), i, x: i + Math.round(days * 86400) }));
  return `${payload}.${dlSig(payload)}`;
}
export function verifyDownloadToken(token, { now = Date.now() } = {}) {
  try {
    const [payload, sig] = String(token || '').split('.');
    if (!payload || !sig) return null;
    const a = Buffer.from(dlSig(payload)), b = Buffer.from(sig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const d = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!d.e || !d.x || Math.floor(now / 1000) > d.x) return null;
    return d;
  } catch { return null; }
}
export const downloadUrl = (email, order, opt) => `${SITE}/api/download/?token=${downloadToken(email, order, opt)}`;

// Stripe webhook signature check (Stripe-Signature: t=...,v1=...), over the RAW body.
export function verifyStripeSignature(raw, header, secret, { tolerance = 300, now = Date.now() } = {}) {
  try {
    if (!secret || !header) return false;
    const parts = String(header).split(',').map((s) => s.trim().split('='));
    const t = parts.find(([k]) => k === 't')?.[1];
    const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
    if (!t || !sigs.length || Math.abs(now / 1000 - Number(t)) > tolerance) return false;
    const exp = Buffer.from(crypto.createHmac('sha256', secret).update(`${t}.`).update(raw).digest('hex'));
    return sigs.some((s) => { const b = Buffer.from(s); return b.length === exp.length && crypto.timingSafeEqual(exp, b); });
  } catch { return false; }
}

export async function stripe(method, path, params, { key = process.env.STRIPE_SECRET_KEY, idem } = {}) {
  const enc = (o, p = '', out = []) => {
    for (const [k, v] of Object.entries(o || {})) {
      if (v === undefined || v === null) continue;
      const name = p ? `${p}[${k}]` : k;
      if (typeof v === 'object') enc(v, name, out); else out.push(`${encodeURIComponent(name)}=${encodeURIComponent(v)}`);
    }
    return out;
  };
  const qs = enc(params).join('&');
  const get = method === 'GET';
  const r = await fetch('https://api.stripe.com' + path + (get && qs ? '?' + qs : ''), {
    method,
    headers: { Authorization: `Bearer ${key}`, ...(get ? {} : { 'Content-Type': 'application/x-www-form-urlencoded' }), ...(idem ? { 'Idempotency-Key': idem } : {}) },
    body: get ? undefined : qs,
  });
  let data = null;
  try { data = await r.json(); } catch { /* empty */ }
  return { ok: r.ok, status: r.status, data };
}

export function purchaseEmail({ email, order, amount, currency, date, url }) {
  const days = DOWNLOAD_TTL_DAYS;
  const paid = amount != null ? `${(amount / 100).toFixed(2)} ${String(currency || 'usd').toUpperCase()}` : '29.00 USD';
  const refund = "a 7-day refund if the kit didn't work for you; may be declined if clearly copied or reused";
  const subject = 'Your Browser Game Starter Kit download';
  const text = `Thanks for buying the Browser Game Starter Kit.

Download your kit: ${url}

This link is personal to you and expires in ${days} days. Your copy is stamped with your email, so please don't share it. If it expires, just reply to this email and I'll send a fresh one.

Start here: unzip it and open README.md, then QUICKSTART.md.

Receipt note (keep this email)
Item: Browser Game Starter Kit by Prompt Forge Kits (v1.0, free updates)
Amount: ${paid}, one-time
Order: ${order}
Date: ${date}
Billed to: ${email}
Payment by Stripe. Any sales tax or VAT shown at checkout is included in your total.

Refunds: you have ${refund}. Just reply to this email.

Prompt Forge Kits
https://promptforgekits.com`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#e9edf5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#e9edf5"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td bgcolor="#1b1f2e" style="background-color:#1b1f2e;padding:22px 26px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:30px;color:#ffc93c;font-weight:bold;">Prompt Forge Kits</td></tr>
<tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding:28px 26px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#1b1f2e;">
<p style="margin:0 0 14px;font-size:22px;line-height:28px;font-weight:bold;">Thanks for buying the Browser Game Starter Kit</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#ffc93c" style="background-color:#ffc93c;border:3px solid #1b1f2e;border-radius:10px;"><a href="${url}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;color:#1b1f2e;text-decoration:none;">Download your kit</a></td></tr></table>
<p style="margin:14px 0;font-size:15px;line-height:22px;">This link is personal to you and expires in ${days} days. Your copy is stamped with your email, so please don't share it. If it expires, reply to this email and I'll send a fresh one. To start: unzip it and open README.md, then QUICKSTART.md.</p>
<p style="margin:18px 0 6px;font-size:15px;line-height:22px;font-weight:bold;">Receipt note (keep this email)</p>
<p style="margin:0 0 14px;font-size:14px;line-height:21px;">Item: Browser Game Starter Kit by Prompt Forge Kits (v1.0, free updates)<br>Amount: ${paid}, one-time<br>Order: ${order}<br>Date: ${date}<br>Billed to: ${email}<br>Payment by Stripe. Any sales tax or VAT shown at checkout is included in your total.</p>
<p style="margin:0;font-size:15px;line-height:22px;"><strong>Refunds:</strong> you have ${refund}. Just reply to this email.</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}
