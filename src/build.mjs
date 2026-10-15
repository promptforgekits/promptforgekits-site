// Zero-dependency static site builder: node src/build.mjs -> dist/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cfg from '../site.config.mjs';
import * as C from './content.mjs';
import { posts } from './posts.mjs';
import * as FP from './freepack.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist');
const PUB = path.join(ROOT, 'public');
const CSS = fs.readFileSync(path.join(ROOT, 'src/styles.css'), 'utf8').replace(/\n/g, '');
const JS = fs.readFileSync(path.join(ROOT, 'src/client.js'), 'utf8');
const P = cfg.product;
const PRICE = `$${P.price}`;
const today = new Date().toISOString().slice(0, 10);

// ── helpers ────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const plain = (s) => String(s).replace(/`/g, '');
const url = (p) => cfg.siteUrl + p;
const storeLive = !!(cfg.stores.gumroad || cfg.stores.itch);
const support = cfg.supportEmail
  ? `<a href="mailto:${esc(cfg.supportEmail)}">${esc(cfg.supportEmail)}</a>`
  : 'support email coming soon';
const xLink = `<a href="https://x.com/${cfg.xHandle}">@${cfg.xHandle} on X</a>`;
const demoAvailable = (d) => fs.existsSync(path.join(PUB, 'play', d, 'index.html'));
const img = (name, alt, { eager = false, sizes = '(max-width: 900px) 100vw, 560px', cls = '' } = {}) =>
  `<img src="/img/${name}-1280.webp" srcset="/img/${name}-640.webp 640w, /img/${name}-1280.webp 1280w" sizes="${sizes}" width="1280" height="720" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${cls ? ` class="${cls}"` : ''}>`;

function heroButtons() {
  if (storeLive) return buyButtons({ compact: true }) + `<p class="note" style="margin-top:14px">Or <a href="/play/">play the free demos</a> built with the kit, and <a href="#newsletter">get the free Core Keepers demo</a>.</p>`;
  return `<div class="btns"><a class="btn" href="#newsletter">Get the free Core Keepers demo</a><a class="btn alt" href="/play/">Play the previews</a></div><p class="note" style="margin-top:14px">Store pages on Gumroad and itch.io are launching soon.</p>`;
}
function buyButtons({ compact = false } = {}) {
  const b = [];
  for (const [key, label] of [['gumroad', 'Gumroad'], ['itch', 'itch.io']]) {
    const href = cfg.stores[key];
    b.push(href
      ? `<a class="btn${key === 'itch' ? ' alt' : ''}" href="${esc(href)}" rel="noopener">Buy on ${label} · ${PRICE}</a>`
      : `<span class="btn soon" role="note" aria-label="${label} store page launching soon">${label}: launching soon</span>`);
  }
  if (!storeLive && !compact) b.push(`<a class="btn ghost" href="#newsletter">Get the free Core Keepers demo</a>`);
  return `<div class="btns">${b.join('')}</div>`;
}

const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const orgLd = {
  '@context': 'https://schema.org', '@type': 'Organization', '@id': url('/#org'), name: cfg.brand, url: url('/'),
  logo: url('/img/mark-512.png'), description: cfg.description, slogan: cfg.tagline,
  sameAs: [`https://x.com/${cfg.xHandle}`, cfg.githubUrl],
  ...(cfg.supportEmail ? { email: cfg.supportEmail } : {}),
};
const productLd = {
  '@context': 'https://schema.org', '@type': 'Product', '@id': url('/#product'), name: P.name,
  description: 'A working Phaser 3 + Vite starter game, rules files for your AI coding tool, and 60+ copy-paste prompts across 6 genres to take you from idea to a published browser game.',
  image: [url('/img/og-cover.jpg')], brand: { '@type': 'Brand', name: cfg.brand }, sku: 'bgsk-v1',
  offers: {
    '@type': 'Offer', price: String(P.price), priceCurrency: P.currency, url: cfg.stores.gumroad || cfg.stores.itch || url('/#pricing'),
    availability: storeLive ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
    seller: { '@id': url('/#org') },
    hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 7, refundType: 'https://schema.org/FullRefund', merchantReturnLink: url('/license/') },
  },
};
const faqLd = (items) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: plain(a) } })) });
const crumbLd = (trail) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail.map(([n, p], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: url(p) })) });

const NAV = [['/play/', 'Play demos'], ['/genres/', 'Genres'], ['/faq/', 'FAQ'], ['/license/', 'License'], ['/blog/', 'Blog']];

function layout({ path: p, title, description, body, jsonld = [], ogType = 'website', noindex = false }) {
  const nav = NAV.map(([h, l]) => `<a href="${h}"${p === h || (h !== '/' && p.startsWith(h)) ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url(p)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta name="theme-color" content="#1b1f2e">
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/lilita-one.woff2" as="font" type="font/woff2" crossorigin>
<link rel="alternate" type="text/plain" title="LLM summary" href="/llms.txt">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.brand)} blog" href="/blog/rss.xml">
<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="${esc(cfg.brand)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url(p)}"><meta property="og:image" content="${url('/img/og-cover.jpg')}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Browser Game Starter Kit by Prompt Forge Kits cover: a cyan blob hero in a flat, outlined platformer">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@${cfg.xHandle}">
<meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${url('/img/og-cover.jpg')}">
<style>${CSS}</style>
${[orgLd, ...jsonld].map(ld).join('\n')}
${cfg.analytics.enabled && cfg.analytics.headSnippet ? cfg.analytics.headSnippet : '<!-- analytics: off (enable in site.config.mjs) -->'}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="hdr"><div class="wrap">
<a class="logo" href="/" aria-label="${esc(cfg.brand)} home"><img src="/img/logo-horizontal.svg" alt="${esc(cfg.brand)}" width="150" height="44"></a>
<nav class="nav" aria-label="Main">${nav}<a class="btn" href="/#pricing">Get the kit</a></nav>
</div></header>
<main id="main">
${body}
</main>
<footer class="ftr"><div class="wrap">
<div><h2>${esc(cfg.brand)}</h2><p>${esc(cfg.description)}</p><p><strong class="gold">${esc(cfg.tagline)}</strong></p></div>
<nav aria-label="Footer"><h2>Site</h2><ul><li><a href="/">Home</a></li><li><a href="/play/">Play demos</a></li><li><a href="/genres/">Genres</a></li><li><a href="/faq/">FAQ</a></li><li><a href="/license/">License</a></li><li><a href="/blog/">Blog</a></li></ul></nav>
<div><h2>Contact</h2><ul><li><a href="https://x.com/${cfg.xHandle}">X: @${cfg.xHandle}</a></li><li><a href="${cfg.githubUrl}">GitHub</a></li><li>${cfg.supportEmail ? support : 'Support email: coming soon'}</li><li><a href="/llms.txt">llms.txt</a></li></ul></div>
<p class="legal">© 2026 ${esc(cfg.brand)}. Demos and screenshots are built with the kit. Phaser is MIT-licensed; Lilita One is SIL OFL 1.1 (<a href="/fonts/OFL.txt">license</a>).</p>
</div></footer>
<script>window.PFK=${JSON.stringify({ newsletter: cfg.newsletter })};${JS}</script>
</body>
</html>`;
}

// ── shared blocks ──────────────────────────────────────────────────────────
const factsBlock = () => `<section id="facts" aria-labelledby="facts-h"><div class="wrap">
<div class="facts"><h2 id="facts-h">Facts</h2><dl>
<dt>Product</dt><dd>${esc(P.name)} (v${P.version})</dd>
<dt>Price</dt><dd>${PRICE} USD, one-time purchase</dd>
<dt>What's included</dt><dd>Phaser 3 + Vite starter game, AI rules files (<code>AGENTS.md</code>, <code>CLAUDE.md</code>, <code>.cursorrules</code>), 6 genre prompt sequences (60+ prompts), Fix Loop debugging guide, publishing guide, visual theme, one-page GDD template, GUIDE.pdf</dd>
<dt>Genres</dt><dd>Platformer, top-down roguelite, idle/clicker, endless runner, puzzle, tower defense</dd>
<dt>License</dt><dd>Use the starter code in your own games, including commercial ones. Don't resell or redistribute the kit. <a href="/license/">Full terms</a></dd>
<dt>Refund</dt><dd>7-day refund if the kit didn't work for you (may be declined if the kit has clearly been copied or reused)</dd>
<dt>Updates</dt><dd>Free for life</dd>
<dt>Requirements</dt><dd>Mac, Windows, or Linux; Node.js 18+; Git; an AI coding tool (Cursor, Claude Code, Windsurf, or Copilot work best)</dd>
<dt>Where to buy</dt><dd>Gumroad and itch.io${storeLive ? '' : ' (store pages launching soon)'}</dd>
<dt>Seller</dt><dd>${esc(cfg.brand)}, ${esc(cfg.siteUrl.replace('https://', ''))}, ${xLink}</dd>
</dl></div></div></section>`;

const faqBlock = (items) => `<div class="faq">${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a"><p>${md(a)}</p></div></details>`).join('')}</div>`;

const newsletterBlock = () => `<section id="newsletter" class="band" aria-labelledby="news-h"><div class="wrap news">
<div><h2 id="news-h">Get the free <span class="gold">Core Keepers demo</span></h2><p class="sub">Enter your email and we send you a private link to play the full Core Keepers tower defense demo, plus a short "first game in 30 minutes" teaser guide. After that, two short emails over the next week (a practical tip, then a note about the full kit). Unsubscribe anytime with one click.</p></div>
<form action="${esc(cfg.newsletter.endpoint)}" method="post" data-newsletter novalidate>
<label for="nl-email">Email address</label>
<input id="nl-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com">
<input type="hidden" name="source" value="site"><input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0">
<button class="btn" type="submit">Send me the free demo</button>
<p class="msg" role="status" aria-live="polite"></p>
</form></div></section>

`;
const genreCards = () => `<div class="grid g3">${C.genres.map((g) => `<article class="card genre">${img('g-' + g.demo, `${g.name} demo built with the kit`, { sizes: '(max-width: 640px) 100vw, (max-width: 900px) 50vw, 370px' })}<div class="body"><h3><a class="stretch" href="/genres/${g.slug}/">${esc(g.name)}</a></h3><p>${md(g.summary)}</p><span class="more cyan">${g.prompts.length}${g.optional ? ` + ${g.optional.length} optional` : ''} prompts →</span></div></article>`).join('')}</div>`;

const GATED = 'towerdefense'; // Core Keepers: served privately via /api/demo/ with a signed link from the welcome email
const demoEmbed = (g, { eager = false } = {}) => {
  if (g.demo === GATED) return `<div class="demo">${img('g-' + g.demo, `${g.game} screenshot`, { eager, sizes: '(max-width: 1160px) 100vw, 1116px' })}<a class="btn play" href="#newsletter">Get the free ${esc(g.game)} demo</a></div>`;
  const ok = demoAvailable(g.demo);
  return `<div class="demo">${img('g-' + g.demo, `${g.game} screenshot`, { eager, sizes: '(max-width: 1160px) 100vw, 1116px' })}${ok
    ? `<button class="btn play" type="button" data-demo="/play/${g.demo}/" data-title="${esc(g.game)} demo">▶ Play ${esc(g.game)}</button>`
    : '<p class="unavail">Demo coming soon</p>'}</div>`;
};

// ── pages ──────────────────────────────────────────────────────────────────
const pages = [];
const add = (p, o) => pages.push({ path: p, ...o });

const landingFaq = C.faq.filter(([q]) => /code\?|AI tools|sell games|art or sound|work for me|updated|cost/.test(q));
const td = C.genres[0];

add('/', {
  title: `${P.shortName}: ship a browser game with AI | ${cfg.brand}`,
  description: `A Phaser 3 starter game, AI rules files, and 60+ tested prompts across 6 genres to build and publish your first browser game with Cursor or Claude Code. ${PRICE}.`,
  jsonld: [productLd, faqLd(landingFaq), { '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.brand, url: url('/') }],
  body: `<section class="hero" aria-labelledby="hero-h"><div class="wrap">
<div>
<p class="eyebrow">Phaser 3 + Vite · AI-ready</p>
<h1 id="hero-h"><span>Browser Game</span><span class="gold">Starter Kit</span></h1>
<p class="lead">Build and ship your first browser game with Cursor, Claude Code, and more. A working starter game, rules for your AI, and a step-by-step prompt sequence for 6 genres.</p>
<ul class="chips" aria-label="Highlights"><li class="chip cyan">Playable platformer</li><li class="chip gold">60+ prompts · 6 genres</li><li class="chip">AI rules files</li><li class="chip slate">Fix Loop</li><li class="chip slate">Publish guide</li></ul>
<p class="price-tag">${PRICE} <small>one-time · free lifetime updates · 7-day refund</small></p>
${heroButtons()}
</div>
<div class="hero-art">
<div class="frame tilt">${img('g-platformer', 'The starter platformer: a cyan blob hero, gold coins, red walkers, and a parallax sky, all drawn in code', { eager: true })}</div>
<div class="frame tilt2">${img('g-towerdefense', 'Core Keepers, the tower defense demo built with the kit: towers on build pads along a winding path', { sizes: '(max-width: 900px) 60vw, 300px' })}</div>
<p class="sticker" aria-hidden="true">${PRICE}</p>
</div>
</div></section>

<section class="band" aria-labelledby="why-h"><div class="wrap">
<h2 id="why-h">Why AI-built games <span class="gold">stall</span></h2>
<p class="lead">You've seen people build games with Cursor and Claude in an afternoon. Then you try it, and 40 prompts later the game is a black screen and the AI keeps "fixing" things that weren't broken.</p>
<p class="sub">The problem isn't you. It's starting from a blank folder with no structure, no rules for the AI, and no way back when things break. This kit gives you all three: a starter that already runs, rules your AI reads automatically, and a fix-or-roll-back system.</p>
<ul class="rules" aria-label="The 4 rules">${C.rules.map(([a, b]) => `<li><strong>${esc(a)}</strong>${esc(b)}</li>`).join('')}</ul>
</div></section>

<section id="inside" aria-labelledby="inside-h"><div class="wrap">
<p class="eyebrow">What's inside</p>
<h2 id="inside-h">Everything you need to <span class="gold">finish</span> a game</h2>
<div class="grid g2" style="align-items:center;gap:40px;margin-bottom:34px">
<div class="frame">${img('inside', 'Kit contents: GUIDE.pdf pages and the starter folder tree with src, scenes, AGENTS.md, CLAUDE.md, and the guide files')}</div>
<div><p class="lead">A working Phaser 3 + Vite starter game, rules files for your AI coding tool, and 60+ copy-paste prompts to take you from idea to a published browser game.</p>
<ul class="checks"><li>Starter runs with two commands: <code>npm install</code>, then <code>npm run dev</code></li><li>Built for Cursor, Claude Code, Windsurf, and Copilot; tips for Lovable and Bolt</li><li>Builds to static files: host free on itch.io, GitHub Pages, or Netlify</li><li>Plain JavaScript, no TypeScript or framework overhead</li></ul></div>
</div>
<div class="grid g4">${C.included.map(([t, d], i) => `<article class="card"><div class="ico ${['bg-cyan', 'bg-gold', 'bg-purple', 'bg-red', 'bg-green', 'bg-blue', 'bg-gold', 'bg-cyan'][i]}" aria-hidden="true">${i + 1}</div><h3>${esc(t)}</h3><p>${md(d)}</p></article>`).join('')}</div>
</div></div></section>

<section class="band" aria-labelledby="genres-h"><div class="wrap">
<p class="eyebrow">6 genres, one art style</p>
<h2 id="genres-h">Pick a genre. Follow the <span class="gold">sequence</span>.</h2>
<p class="sub">Each genre starts with the same kickoff prompt, then ordered prompts that each add one feature, with a test checkpoint after every step. Every demo below was built by following its sequence.</p>
${genreCards()}
</div></section>

<section aria-labelledby="play-h"><div class="wrap">
<p class="eyebrow">Free demo</p>
<h2 id="play-h">Play <span class="gold">Core Keepers</span> right now</h2>
<p class="sub">${md(td.summary)} It's the tower defense game the kit's 13-prompt sequence builds.</p>
${demoEmbed(td)}
<div class="demo-meta"><p class="note" style="margin:0">Best with a mouse and keyboard. Click the game to give it focus.</p><a class="btn ghost" href="/play/">All 6 demos →</a></div>
</div></section>

<section class="band" aria-labelledby="who-h"><div class="wrap">
<div class="grid g2" style="gap:40px">
<div><p class="eyebrow">Who it's for</p><h2 id="who-h">Makers who want to <span class="gold">ship</span></h2>
<ul class="checks">${C.audience.map(([a, b]) => `<li><strong>${esc(a)}</strong> ${esc(b)}</li>`).join('')}</ul>
<p class="sub">No game dev experience needed. You'll install Node.js, run a couple of commands, and paste prompts one at a time.</p></div>
<div><p class="eyebrow">How it works</p><h2 id="how-h">Five steps to a <span class="gold">published</span> game</h2>
<ol class="steps">${C.steps.map(([t, d]) => `<li><div><h3>${esc(t)}</h3><p>${md(d)}</p></div></li>`).join('')}</ol></div>
</div></div></section>

<section id="pricing" aria-labelledby="price-h"><div class="wrap pricing">
<div><p class="eyebrow">Pricing</p><h2 id="price-h">One kit. One price. <span class="gold">Yours to keep.</span></h2>
<p class="lead">Pay once and get every future update free. If the kit didn't work for you, ask for a refund within 7 days (refunds may be declined if the kit has clearly been copied or reused).</p>
<h3>License in one minute</h3>
<ul class="checks"><li>Use the starter code in any number of your own games, including commercial ones.</li><li>Publish your finished game's source code, as long as it's a game and not a kit or template.</li></ul>
<ul class="checks no"><li>Don't resell, share, or redistribute the kit, the prompts, or the guides, even for free.</li></ul>
<p><a href="/license/">Read the full license →</a></p></div>
<div class="price-card"><p class="eyebrow" style="margin:0 0 8px">${esc(P.name)}</p><p class="amt">${PRICE}</p><p class="note">USD, one-time</p>
<ul class="checks"><li>Phaser 3 + Vite starter game</li><li>AI rules files for Cursor, Claude Code, Windsurf, Copilot</li><li>6 genre sequences, 60+ prompts</li><li>Fix Loop, publishing guide, THEME.md, GDD template</li><li>GUIDE.pdf (20+ pages)</li><li><strong>Free lifetime updates</strong></li><li><strong>7-day refund if the kit didn't work for you (may be declined if clearly copied or reused)</strong>, no questions asked</li></ul>
${buyButtons({ compact: true })}
${storeLive ? '' : '<p class="note" style="margin:14px 0 0">Store pages are launching soon. <a href="#newsletter">Get the free Core Keepers demo</a>.</p>'}
</div></div></section>

${factsBlock()}

<section class="band" aria-labelledby="faq-h"><div class="wrap prose" style="max-width:860px">
<h2 id="faq-h">FAQ</h2>
${faqBlock(landingFaq)}
<p><a href="/faq/">All questions →</a></p>
</div></section>

${newsletterBlock()}`,
});

add('/play/', {
  title: `Play free browser game demos built with AI prompts | ${cfg.brand}`,
  description: 'Six free, playable browser games built by following the Browser Game Starter Kit prompt sequences: tower defense, platformer, roguelite, idle, runner, and puzzle.',
  jsonld: [crumbLd([['Home', '/'], ['Play', '/play/']])],
  body: `<section class="page-hero"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Play</nav>
<h1>Play the <span class="gold">demos</span></h1>
<p class="lead">Each game below was built by following one genre's prompt sequence from the kit, one step at a time, with an automated browser test after each step. Five are free to play right here; the Core Keepers demo is free by email.</p>
<p class="note">Best on desktop with a mouse and keyboard. Click a game to load it, then click inside it to give it keyboard focus. Each demo loads about 1.5 MB.</p>
</div></section>
${C.genres.map((g, i) => `<section aria-labelledby="d-${g.demo}"${i % 2 ? '' : ' class="band"'} style="padding:48px 0"><div class="wrap">
<h2 id="d-${g.demo}">${esc(g.game)} <span class="note" style="font-family:var(--body);font-size:1rem;text-shadow:none">${esc(g.name)}</span></h2>
<p class="sub">${md(g.summary)}</p>
${demoEmbed(g, { eager: i === 0 })}
<div class="demo-meta"><a href="/genres/${g.slug}/">See the ${esc(g.name.toLowerCase())} prompt sequence →</a>${demoAvailable(g.demo) ? `<a class="note" href="/play/${g.demo}/" rel="nofollow">Open full window ↗</a>` : ''}</div>
</div></section>`).join('')}
${newsletterBlock()}`,
});

add('/genres/', {
  title: `6 genre prompt sequences for AI game dev | ${cfg.brand}`,
  description: 'Overview of the six genre prompt sequences in the Browser Game Starter Kit: tower defense, platformer, top-down roguelite, idle/clicker, endless runner, and Sokoban-style puzzle.',
  jsonld: [crumbLd([['Home', '/'], ['Genres', '/genres/']])],
  body: `<section class="page-hero"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Genres</nav>
<h1>Six genres, <span class="gold">one workflow</span></h1>
<p class="lead">Every sequence starts with the same kickoff prompt (Prompt 0): your AI reads <code>AGENTS.md</code> and your design doc, and plans before it writes code. Then you paste one prompt at a time and test after each.</p>
</div></section>
<section style="padding-top:24px"><div class="wrap">${genreCards()}</div></section>`,
});

for (const g of C.genres) {
  const n = g.prompts.length;
  add(`/genres/${g.slug}/`, {
    title: `${g.name} game prompt sequence (${n} prompts) | ${cfg.brand}`,
    description: `The ${g.name.replace(/ \(.*\)/, '').toLowerCase()} prompt sequence in the Browser Game Starter Kit: ${n} step-by-step prompts with a test after each, plus a free playable demo.`,
    jsonld: [crumbLd([['Home', '/'], ['Genres', '/genres/'], [g.name, `/genres/${g.slug}/`]])],
    body: `<section class="page-hero"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/genres/">Genres</a> / ${esc(g.name)}</nav>
<p class="eyebrow">Prompt sequence overview</p>
<h1>${esc(g.name)}${g.game !== g.name ? `: <span class="gold">${esc(g.game)}</span>` : ''}</h1>
<p class="lead">${md(g.summary)}</p>
</div></section>
<section style="padding-top:20px"><div class="wrap">
${demoEmbed(g, { eager: true })}
<div class="demo-meta"><p class="note" style="margin:0">This demo was built by following the sequence below.</p>${demoAvailable(g.demo) ? `<a class="note" href="/play/${g.demo}/" rel="nofollow">Open full window ↗</a>` : ''}</div>
</div></section>
<section class="band"><div class="wrap grid g2" style="gap:40px;align-items:start">
<div><h2>What the sequence builds</h2><ul class="checks">${g.details.map((d) => `<li>${md(d)}</li>`).join('')}</ul>
<h3>How each step works</h3><p class="sub">Paste one prompt. Do its <strong>Test</strong> checkpoint in the browser. If it passes, commit. If it fails, use the Fix Loop: three tries, then roll back.</p>
<p class="note">This page lists the step titles only. The full prompt text, test checkpoints, and tuning numbers are in the kit's <code>PROMPTS.md</code> and <code>GUIDE.pdf</code>.</p></div>
<div><h2>The ${n + 1 + (g.optional?.length || 0)} steps</h2>
<ol class="prompts" aria-label="Prompt titles"><li><b>P0</b>Kickoff: plan with your AI, no code yet</li>${g.prompts.map((t, i) => `<li><b>P${i + 1}</b>${esc(t)}</li>`).join('')}${(g.optional || []).map((t, i) => `<li class="opt"><b>P${n + i + 1}</b>Optional: ${esc(t)}</li>`).join('')}</ol></div>
</div></section>
<section><div class="wrap pricing">
<div><h2>Get all 6 sequences</h2><p class="lead">The kit includes this sequence plus five more, the starter game, AI rules files, the Fix Loop, and the publishing guide. ${PRICE}, free lifetime updates, 7-day refund.</p>${buyButtons()}</div>
<div><h3>Other genres</h3><ul class="checks">${C.genres.filter((x) => x !== g).map((x) => `<li><a href="/genres/${x.slug}/">${esc(x.name)}</a></li>`).join('')}</ul></div>
</div></section>
${newsletterBlock()}`,
  });
}

add('/faq/', {
  title: `FAQ: Browser Game Starter Kit | ${cfg.brand}`,
  description: 'Answers about the Browser Game Starter Kit: price, AI tools it works with, coding experience, commercial use, art and sound, requirements, refunds, and updates.',
  jsonld: [faqLd(C.faq), crumbLd([['Home', '/'], ['FAQ', '/faq/']])],
  body: `<section class="page-hero"><div class="wrap prose">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / FAQ</nav>
<h1>Frequently asked <span class="gold">questions</span></h1>
<p class="lead">Short answers about the ${esc(P.name)}. Still stuck? Reach us at ${xLink} (${support}).</p>
</div></section>
<section style="padding-top:12px"><div class="wrap prose">${C.faq.map(([q, a]) => `<h2 style="font-size:1.4rem">${esc(q)}</h2><p>${md(a)}</p>`).join('')}</div></section>
${factsBlock()}
${newsletterBlock()}`,
});

add('/license/', {
  title: `License: what you can do with the kit | ${cfg.brand}`,
  description: 'License summary for the Browser Game Starter Kit: use the starter code in your own commercial games; do not resell or redistribute the kit, prompts, or guides.',
  jsonld: [crumbLd([['Home', '/'], ['License', '/license/']])],
  body: `<section class="page-hero"><div class="wrap prose">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / License</nav>
<h1>License</h1>
<p class="lead"><strong>${esc(P.shortName)} v${P.version} by ${esc(cfg.brand)}</strong>: license for buyers. Licensor: ${esc(cfg.brand)} (promptforgekits.com). "You" means the person who bought the kit.</p>
<p class="note">This page mirrors <code>LICENSE.md</code> in the kit. If they ever differ, the <code>LICENSE.md</code> in your download applies.</p>
</div></section>
<section style="padding-top:12px"><div class="wrap prose">
<h2>In short</h2><p>Make and sell your own games with the starter code. Don't sell or share the kit itself.</p>
<h2>You may</h2><ul class="checks">${C.licenseMay.map((x) => `<li>${md(x)}</li>`).join('')}</ul>
<h2>You may not</h2><ul class="checks no">${C.licenseMayNot.map((x) => `<li>${md(x)}</li>`).join('')}</ul>
<h2>Refunds</h2><p>If the kit didn't work for you, you can request a refund within 7 days of purchase. Refunds may be declined if the kit has clearly been copied or reused. Updates are free for life.</p>
<h2>No warranty</h2><p>${md(C.licenseWarranty)}</p>
<h2>Questions</h2><p>Questions about a use not covered here? Contact ${esc(cfg.brand)} at promptforgekits.com, ${support}, or the store product page.</p>
<p>© 2026 ${esc(cfg.brand)}. All rights reserved, except as granted above.</p>
</div></section>`,
});

add('/blog/', {
  title: `Blog: shipping games with AI coding tools | ${cfg.brand}`,
  description: 'Notes from Prompt Forge Kits on building and shipping real projects with AI coding tools, starting with browser games.',
  jsonld: [crumbLd([['Home', '/'], ['Blog', '/blog/']])],
  body: `<section class="page-hero"><div class="wrap prose">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Blog</nav>
<h1>Blog</h1><p class="lead">Practical notes on building and shipping with AI coding tools.</p>
</div></section>
<section style="padding-top:12px"><div class="wrap prose"><ul class="post-list">${posts.map((po) => `<li class="card" style="margin-bottom:18px"><article><h2 style="font-size:1.6rem;margin-top:8px"><a href="/blog/${po.slug}/" style="color:var(--white);text-decoration:none">${esc(po.title)}</a></h2><p class="note"><time datetime="${po.date}">${po.date}</time></p><p>${esc(po.description)}</p><a href="/blog/${po.slug}/">Read post →</a></article></li>`).join('')}</ul></div></section>
${newsletterBlock()}`,
});

for (const po of posts) {
  add(`/blog/${po.slug}/`, {
    title: `${po.title} | ${cfg.brand}`,
    description: po.description,
    ogType: 'article',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: po.title, description: po.description, datePublished: po.date, dateModified: po.date, image: url('/img/og-cover.jpg'), author: { '@id': url('/#org') }, publisher: { '@id': url('/#org') }, mainEntityOfPage: url(`/blog/${po.slug}/`) },
      crumbLd([['Home', '/'], ['Blog', '/blog/'], [po.title, `/blog/${po.slug}/`]])],
    body: `<article><section class="page-hero"><div class="wrap prose">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog/">Blog</a></nav>
<h1>${esc(po.title)}</h1><p class="note"><time datetime="${po.date}">${po.date}</time> · ${esc(cfg.brand)}</p>
</div></section>
<section style="padding-top:12px"><div class="wrap prose">${po.html}</div></section></article>
${newsletterBlock()}`,
  });
}

add('/free-pack/', {
  title: `${FP.title} | ${cfg.brand}`, description: FP.intro, noindex: true, noSitemap: true,
  body: `<section class="page-hero"><div class="wrap prose">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Free teaser guide</nav>
<h1>Free <span class="gold">teaser guide</span></h1><p class="lead">${esc(FP.intro)}</p>
<p><a class="btn" href="/downloads/prompt-forge-free-prompt-pack.pdf">Download the PDF</a></p>
</div></section>
<section style="padding-top:12px"><div class="wrap prose">${FP.sections.map((x) => `<h2>${esc(x.h)}</h2>${x.html}`).join('\n')}</div></section>`,
});

add('/404.html', {
  title: `Page not found | ${cfg.brand}`, description: 'This page does not exist.', noSitemap: true,
  body: `<section class="page-hero"><div class="wrap prose"><h1>Game <span class="gold">over</span> (404)</h1><p class="lead">That page doesn't exist. Respawn at the <a href="/">home page</a> or <a href="/play/">play a demo</a>.</p></div></section>`,
});

// printable version for the PDF (light theme), written to dist/_print (removed before deploy output is final)
const PRINT = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(FP.title)}</title><style>
@page{size:A4;margin:18mm 16mm}body{font:11pt/1.5 Helvetica,Arial,sans-serif;color:#1b1f2e}
h1{font-size:26pt;margin:0 0 4pt;color:#1b1f2e}h1 span{color:#c98f00}h2{font-size:15pt;margin:20pt 0 6pt;border-bottom:3px solid #1b1f2e;padding-bottom:3pt;break-after:avoid}
.hd{background:#1b1f2e;color:#fff;padding:16pt 18pt;border-radius:10pt;margin-bottom:10pt}.hd h1{color:#fff}.hd h1 span{color:#ffc93c}.hd p{margin:4pt 0 0;color:#e9edf5}
pre{background:#e9edf5;border:2px solid #1b1f2e;border-radius:6pt;padding:8pt 10pt;white-space:pre-wrap;word-wrap:break-word;font-size:9pt;break-inside:avoid}
code{font-family:Menlo,Consolas,monospace;font-size:9.5pt}a{color:#2a5bd7}.note{font-size:9pt;color:#4a5373}
</style></head><body><div class="hd"><h1>Free <span>teaser guide</span></h1><p>${esc(FP.intro)}</p></div>
${FP.sections.map((x) => `<h2>${esc(x.h)}</h2>${x.html}`).join('\n')}</body></html>`;
fs.mkdirSync(path.join(ROOT, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'scripts/freepack-print.html'), PRINT);

// ── write ──────────────────────────────────────────────────────────────────
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(PUB, OUT, { recursive: true });
for (const pg of pages) {
  const file = pg.path.endsWith('.html') ? path.join(OUT, pg.path) : path.join(OUT, pg.path, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, layout(pg));
}
const sm = pages.filter((p) => !p.noSitemap);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm.map((p) => `  <url><loc>${url(p.path)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /demo/\nDisallow: /api/\n\nSitemap: ${url('/sitemap.xml')}\n`);
fs.writeFileSync(path.join(OUT, 'blog/rss.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(cfg.brand)} blog</title><link>${url('/blog/')}</link><description>${esc(cfg.description)}</description>\n${posts.map((po) => `<item><title>${esc(po.title)}</title><link>${url(`/blog/${po.slug}/`)}</link><guid>${url(`/blog/${po.slug}/`)}</guid><pubDate>${new Date(po.date + 'T12:00:00Z').toUTCString()}</pubDate><description>${esc(po.description)}</description></item>`).join('\n')}\n</channel></rss>\n`);

// llms.txt + llms-full.txt
const factsTxt = `## Facts
- Product: ${P.name} (v${P.version})
- Seller: ${cfg.brand} (${cfg.siteUrl}, X @${cfg.xHandle})
- Price: ${PRICE} USD, one-time purchase
- Included: Phaser 3 + Vite starter game; AI rules files (AGENTS.md, CLAUDE.md, .cursorrules); Prompt Playbook with 6 genre sequences (60+ prompts); Fix Loop debugging guide; publishing guide (itch.io, GitHub Pages, Netlify); THEME.md visual theme; one-page GDD template; GUIDE.pdf (20+ pages)
- Genres: platformer, top-down roguelite, idle/clicker, endless runner, Sokoban-style puzzle, tower defense ("Core Keepers")
- License: use the starter code in your own games, including commercial games; do not resell, share, or redistribute the kit, prompts, or guides, or repackage them into another kit, template, course, or prompt pack
- Refund: 7-day refund if the kit didn't work for you; may be declined if the kit has clearly been copied or reused; free updates
- Updates: free for life
- Requirements: Mac, Windows, or Linux; Node.js 18+; Git; an AI coding tool that opens a local folder (Cursor, Claude Code, Windsurf, or VS Code + Copilot). Lovable and Bolt are supported with caveats.
- Assets: no image or sound files; art is drawn in code; bundled Lilita One font (SIL OFL 1.1)
- Where to buy: Gumroad and itch.io${storeLive ? ` (${[cfg.stores.gumroad, cfg.stores.itch].filter(Boolean).join(', ')})` : ' (store pages launching soon)'}
- Support: ${cfg.supportEmail || 'X @' + cfg.xHandle + ' (support email coming soon)'}
`;
const llms = `# ${cfg.brand}

> ${cfg.description} Tagline: "${cfg.tagline}" First product: the ${P.name}, ${PRICE}.

${factsTxt}
## Pages
- [Home](${url('/')}): what the kit is, what's inside, who it's for, how it works, pricing
- [Play demos](${url('/play/')}): six free browser games built by following the kit's prompt sequences
- [Genres](${url('/genres/')}): overview of the six prompt sequences
${C.genres.map((g) => `- [${g.name}](${url(`/genres/${g.slug}/`)}): ${plain(g.summary)}`).join('\n')}
- [FAQ](${url('/faq/')})
- [License](${url('/license/')})
- [Blog](${url('/blog/')})
- [Free Core Keepers demo](${url('/#newsletter')}): email signup; the demo link is sent by email (not public)

## Optional
- [Full text for LLMs](${url('/llms-full.txt')})
`;
const full = `# ${cfg.brand}: ${P.name}

> ${cfg.description} Tagline: "${cfg.tagline}"

${factsTxt}
## What's inside
${C.included.map(([t, d]) => `- **${t}**: ${plain(d)}`).join('\n')}

## Who it's for
${C.audience.map(([a, b]) => `- ${a} ${b}`).join('\n')}

## How it works
${C.steps.map(([t, d], i) => `${i + 1}. **${t}.** ${plain(d)}`).join('\n')}

## The 4 rules
${C.rules.map(([a, b], i) => `${i + 1}. ${a} ${b}`).join('\n')}

## Genre prompt sequences (titles only; full prompts are in the paid kit)
Every sequence starts with Prompt 0 (kickoff: the AI reads AGENTS.md and your design doc and plans before writing code). Each prompt has a test checkpoint.
${C.genres.map((g) => `
### ${g.name}${g.game !== g.name ? ` ("${g.game}")` : ''}
${plain(g.summary)}
${g.details.map((d) => `- ${plain(d)}`).join('\n')}
Prompts: ${g.prompts.map((t, i) => `P${i + 1} ${t}`).join('; ')}${g.optional ? `; optional: ${g.optional.map((t, i) => `P${g.prompts.length + i + 1} ${t}`).join('; ')}` : ''}
Page: ${url(`/genres/${g.slug}/`)} · Demo: ${url(`/play/${g.demo}/`)}`).join('\n')}

## Demos
Each demo on ${url('/play/')} was built by following that genre's prompt sequence one step at a time, with an automated browser test after each step.

## FAQ
${C.faq.map(([q, a]) => `**${q}**\n${plain(a)}`).join('\n\n')}

## License summary
You may:
${C.licenseMay.map((x) => `- ${plain(x)}`).join('\n')}
You may not:
${C.licenseMayNot.map((x) => `- ${plain(x)}`).join('\n')}
No warranty: ${plain(C.licenseWarranty)}
`;
fs.writeFileSync(path.join(OUT, 'llms.txt'), llms);
fs.writeFileSync(path.join(OUT, 'llms-full.txt'), full);

const missing = C.genres.filter((g) => !demoAvailable(g.demo)).map((g) => g.demo);
console.log(`Built ${pages.length} pages to dist/.${missing.length ? ` Missing demos (show "coming soon"): ${missing.join(', ')}` : ' All 6 demos present.'}`);
