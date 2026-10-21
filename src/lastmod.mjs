// Real "last changed" dates for sitemap.xml (added 2026-10-21).
// Each sitemap URL's content (title, description, body, JSON-LD; or the game file for /play/<demo>/) is hashed.
// src/lastmod.json keeps { path: { hash, date } }. Same hash -> keep the stored date. New or changed hash -> today.
// A page that has never been recorded gets the date of the last git commit touching its sources (fallback: today).
// Commit src/lastmod.json together with the content change so production builds keep the same dates.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

export function createLastmod(root, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const file = path.join(root, 'src/lastmod.json');
  let db = {};
  try { db = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { db = {}; }
  const gitDate = (sources) => {
    try {
      const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...sources], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
    } catch { return null; }
  };
  const seen = new Set();
  return {
    date(p, content, sources = []) {
      seen.add(p);
      const hash = crypto.createHash('sha256').update(String(content)).digest('hex').slice(0, 16);
      const prev = db[p];
      if (prev && prev.hash === hash) return prev.date;
      const date = prev ? today : (gitDate(sources) || today);
      db[p] = { hash, date };
      return date;
    },
    save() {
      const out = Object.fromEntries(Object.keys(db).filter((k) => seen.has(k)).sort().map((k) => [k, db[k]]));
      fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    },
  };
}
