import { EMAIL_RE, FROM, REPLY_TO, resend, welcomeEmail, unsubUrl } from './_lib.js';

const json = (res, code, body) => res.status(code).setHeader('Cache-Control', 'no-store').json(body);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://promptforgekits.com');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const key = process.env.RESEND_API_KEY, segment = process.env.RESEND_SEGMENT_ID;
  if (!key || !segment || !process.env.UNSUBSCRIBE_SECRET) return json(res, 500, { error: 'Signups are not configured yet.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return json(res, 400, { error: 'Invalid request.' });

  // honeypot: bots fill hidden fields; pretend success
  if (body.website) return json(res, 200, { ok: true });

  const email = String(body.email || '').trim().toLowerCase();
  const source = String(body.source || 'site').slice(0, 40).replace(/[^\w.-]/g, '') || 'site';
  if (email.length > 254 || !EMAIL_RE.test(email)) return json(res, 400, { error: 'Please enter a valid email address.' });

  // 1) contact + segment (explicit opt-in: also re-subscribes a past unsubscriber)
  let c = await resend('POST', '/contacts', { email, unsubscribed: false, segments: [{ id: segment }] });
  if (!c.ok) {
    // likely already exists: make sure it's subscribed and in the segment
    const enc = encodeURIComponent(email);
    const p = await resend('PATCH', `/contacts/${enc}`, { unsubscribed: false });
    const s = await resend('POST', `/contacts/${enc}/segments/${segment}`);
    if (!p.ok && !s.ok) { console.error('contact failed', c.status, c.data?.message, p.status, s.status); return json(res, 502, { error: 'Could not sign you up. Please try again later.' }); }
  }

  // 2) welcome email with the free pack link
  const m = welcomeEmail(email);
  const day = new Date().toISOString().slice(0, 10);
  const sent = await resend('POST', '/emails', {
    from: FROM, to: [email], reply_to: REPLY_TO, subject: m.subject, html: m.html, text: m.text,
    headers: { 'List-Unsubscribe': `<${unsubUrl(email)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    tags: [{ name: 'type', value: 'welcome' }, { name: 'source', value: source }],
  }, { 'Idempotency-Key': `welcome-${email}-${day}` });
  if (!sent.ok) { console.error('welcome send failed', sent.status, sent.data?.message); return json(res, 502, { error: 'You were added, but the email could not be sent. Please try again later.' }); }

  // 3) start the day-3 / day-7 automation (best effort; automation may be disabled)
  const ev = await resend('POST', '/events/send', { event: 'pfk.signup', email, payload: { source } });
  if (!ev.ok) console.error('event send failed', ev.status, ev.data?.message);

  return json(res, 200, { ok: true });
}
