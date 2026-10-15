import fs from 'node:fs';
import path from 'node:path';
import { demoTokenOk } from './_lib.js';

// Serves the private Core Keepers demo (private/core-keepers/) to holders of a signed link.
// /demo/core-keepers/?e=<email>&t=<token> -> sets an HttpOnly cookie, then serves the game.
// /demo/core-keepers/assets/... -> served only with that cookie. (vercel.json rewrites /demo/core-keepers/* here.)
const ROOT = path.join(process.cwd(), 'private', 'core-keepers');
const COOKIE = 'pfk_demo';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };

const gate = (res, code = 403) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(code).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Link needed</title></head><body style="font-family:Arial,sans-serif;background:#1b1f2e;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0"><main style="max-width:480px;padding:24px;text-align:center"><h1 style="color:#ffc93c">This demo needs your link</h1><p>The Core Keepers demo is free: sign up with your email and we send you a private link.</p><p><a style="color:#3ec9e6" href="https://promptforgekits.com/#newsletter">Get the free Core Keepers demo</a></p></main></body></html>`);
};

export function readCookie(req) {
  const m = String(req.headers?.cookie || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  if (!m) return null;
  try { const [e, t] = decodeURIComponent(m[1]).split('|'); return { e, t }; } catch { return null; }
}

export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  const q = req.query || {};
  const email = String(q.e || '').trim().toLowerCase();
  let auth = email && demoTokenOk(email, q.t) ? { e: email, t: String(q.t) } : null;
  const fromLink = !!auth;
  if (!auth) { const c = readCookie(req); if (c && demoTokenOk(String(c.e || '').toLowerCase(), c.t)) auth = c; }
  if (!auth) return gate(res);

  // resolve the requested file inside ROOT only
  let rel = String(q.f || '').replace(/^\/+/, '');
  if (!rel || rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.status(404).send('Not found');

  if (fromLink) res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(auth.e + '|' + auth.t)}; Path=/demo/core-keepers/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`);
  res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(200).send(fs.readFileSync(file));
}
