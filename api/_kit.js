// Per-buyer watermarking, adapted for serverless from the seller-only kit script
// (browser-game-starter-kit/scripts/watermark.mjs). The unmarked kit lives in private/kit/
// (bundled into the function, never served statically); the zip is built on demand.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { zipSync } from 'fflate';
import { PDFDocument, StandardFonts, rgb, PDFName, PDFString } from 'pdf-lib';

export const KIT_DIR = path.join(process.cwd(), 'private', 'kit');
const EXCLUDE = new Set(['scripts', 'node_modules', '.git', '.DS_Store', 'dist', 'out']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const buyerId = (email) => crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 10);
export const slug = (email) => email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function stampText(text, email, id, date) {
  return text.replace(/\s*$/, '') + `\n\n---\nLicensed to: ${email} (id ${id}, ${date}). Personal license, do not share.\n`;
}

export async function stampPdf(bytes, email, id, date) {
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const label = `Licensed to ${email} | ${id} | Prompt Forge Kits`;
  for (const page of pdf.getPages()) {
    const { width } = page.getSize();
    const size = 7, w = font.widthOfTextAtSize(label, size);
    page.drawText(label, { x: Math.max(10, (width - w) / 2), y: 12, size, font, color: rgb(0.45, 0.47, 0.55) });
  }
  pdf.setSubject(`Licensed to ${email} (${id})`);
  pdf.setKeywords([`licensee:${email}`, `id:${id}`]);
  pdf.setProducer('Prompt Forge Kits');
  pdf.getInfoDict().set(PDFName.of('PFKLicensee'), PDFString.of(`${email};${id};${date}`));
  return pdf.save();
}

function walk(dir, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name) || e.name.endsWith('.zip')) continue;
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel));
    else if (e.isFile()) out.push(rel);
  }
  return out;
}

// date: YYYY-MM-DD stamped into the files (the purchase date, so re-downloads are identical)
export async function buildWatermarkedZip(email, { kit = KIT_DIR, order = '', date = new Date().toISOString().slice(0, 10) } = {}) {
  email = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw new Error('Invalid buyer email');
  const id = buyerId(email) + (order ? '-' + order.replace(/[^\w-]/g, '').slice(0, 20) : '');
  const files = {};
  for (const rel of walk(kit)) {
    let data = fs.readFileSync(path.join(kit, rel));
    if (rel === 'GUIDE.pdf') data = await stampPdf(data, email, id, date);
    else if (rel === 'LICENSE.md' || rel === 'README.md') data = Buffer.from(stampText(data.toString('utf8'), email, id, date));
    files[`browser-game-starter-kit/${rel}`] = [new Uint8Array(data), { level: 6 }];
  }
  return { zip: Buffer.from(zipSync(files)), id, count: Object.keys(files).length };
}
