// Zero-dependency static site builder: node src/build.mjs -> dist/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cfg from '../site.config.mjs';
import * as C from './content.mjs';
import { posts } from './posts.mjs';
import * as FP from './freepack.mjs';
import { createLastmod } from './lastmod.mjs';
import { AK, akTeam, akIncluded, akSteps, akFaq } from './assistant-kit.mjs';
import { listings as ARCADE } from './arcade.mjs';

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
const storeLive = !!cfg.stores.direct?.live;
const support = cfg.supportEmail
  ? `<a href="mailto:${esc(cfg.supportEmail)}">${esc(cfg.supportEmail)}</a>`
  : 'support email coming soon';
const xLink = `<a href="https://x.com/${cfg.xHandle}">@${cfg.xHandle} on X</a>`;
const demoAvailable = (d) => fs.existsSync(path.join(PUB, 'play', d, 'index.html'));
const img = (name, alt, { eager = false, sizes = '(max-width: 900px) 100vw, 560px', cls = '' } = {}) =>
  `<img src="/img/${name}-1280.webp" srcset="/img/${name}-640.webp 640w, /img/${name}-1280.webp 1280w" sizes="${sizes}" width="1280" height="720" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${cls ? ` class="${cls}"` : ''}>`;

function heroButtons() {
  if (storeLive) return buyButtons() + `<p class="note" style="margin-top:14px">Or <a href="/play/">play the free demos</a> built with the kit, and <a href="#newsletter">get the free Core Keepers demo</a>.</p>`;
  return `<div class="btns"><a class="btn" href="#newsletter">Get the free Core Keepers demo</a><a class="btn alt" href="/play/">Play the previews</a></div><p class="note" style="margin-top:14px">Store pages on Gumroad and itch.io are launching soon.</p>`;
}
const directLive = !!cfg.stores.direct?.live;
const directEndpoint = cfg.stores.direct?.endpoint || '/api/checkout/';
const buyNowForm = (label = `Buy now · ${PRICE}`) => `<form class="buy-direct" method="post" action="${esc(directEndpoint)}"><button class="btn buy-big" type="submit">${esc(label)}</button> <span class="note" style="display:block;margin-top:8px">Secure checkout by Stripe. Instant email download. 7-day refund if the kit didn't work for you.</span></form>`;
// Newer products: same direct Stripe checkout, product picked by ?sku= (api/_products.js). One big button per product.
const buyFormFor = (sku, label, note) => `<form class="buy-direct" method="post" action="${esc(directEndpoint)}?sku=${esc(sku)}"><input type="hidden" name="sku" value="${esc(sku)}"><button class="btn buy-big" type="submit">${esc(label)}</button> <span class="note" style="display:block;margin-top:8px">${esc(note)}</span></form>`;
const AK_NOTE = "Secure checkout by Stripe. Instant email download. 7-day refund if the kit didn't work for you.";
const BUNDLE_NOTE = "Secure checkout by Stripe. Both downloads by email. 7-day refund if the kits didn't work for you.";
const akBuy = () => buyFormFor('atsk', `Buy now · $${AK.price}`, AK_NOTE);
const bundleBuy = () => buyFormFor('bundle', `Buy both · $${AK.bundle.price}`, BUNDLE_NOTE);
function buyButtons() {
  return `<div class="btns buy-wrap">${buyNowForm()}</div>`;
}

const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const orgLd = {
  '@context': 'https://schema.org', '@type': 'Organization', '@id': url('/#org'), name: cfg.brand, url: url('/'),
  logo: url('/img/mark-512.png'), description: cfg.description, slogan: cfg.tagline,
  sameAs: [`https://x.com/${cfg.xHandle}`, cfg.githubUrl],
  ...(cfg.supportEmail ? { email: cfg.supportEmail, contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: cfg.supportEmail, url: url('/faq/') } } : {}),
};
const productLd = {
  '@context': 'https://schema.org', '@type': 'Product', '@id': url('/#product'), name: P.name,
  description: 'A working Phaser 3 + Vite starter game, rules files for your AI coding tool, and 60+ copy-paste prompts across 6 genres to take you from idea to a published browser game.',
  image: [url('/img/og-cover.jpg')], brand: { '@type': 'Brand', name: cfg.brand }, sku: 'bgsk-v1',
  offers: {
    '@type': 'Offer', price: String(P.price), priceCurrency: P.currency, url: cfg.siteUrl + '/#pricing',
    availability: storeLive ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
    seller: { '@id': url('/#org') },
    hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 7, refundType: 'https://schema.org/FullRefund', merchantReturnLink: url('/license/') },
  },
};
const returnLd = (link) => ({ '@type': 'MerchantReturnPolicy', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 7, refundType: 'https://schema.org/FullRefund', merchantReturnLink: link });
const akProductLd = {
  '@context': 'https://schema.org', '@type': 'Product', '@id': url('/assistant-kit/#product'), name: AK.name,
  description: 'Four AI assistant job descriptions, seven workflows (skills and routines), approval and true-claims rules, a business profile and six shared notebooks for running a small online product business with a team of AI assistants. Written for Grok Bot.',
  image: [url('/img/og-cover.jpg')], brand: { '@type': 'Brand', name: cfg.brand }, sku: 'atsk-v1',
  offers: { '@type': 'Offer', price: String(AK.price), priceCurrency: 'USD', url: url('/assistant-kit/#pricing'), availability: 'https://schema.org/InStock', seller: { '@id': url('/#org') }, hasMerchantReturnPolicy: returnLd(url('/assistant-kit/#license')) },
};
const bundleProductLd = {
  '@context': 'https://schema.org', '@type': 'Product', '@id': url('/assistant-kit/#bundle'), name: `Bundle: ${AK.bundle.name}`,
  description: 'Both kits by Prompt Forge Kits: the Browser Game Starter Kit and the Assistant Team Starter Kit, two separate downloads.',
  image: [url('/img/og-cover.jpg')], brand: { '@type': 'Brand', name: cfg.brand }, sku: 'bundle-bgsk-atsk-v1',
  offers: { '@type': 'Offer', price: String(AK.bundle.price), priceCurrency: 'USD', url: url('/assistant-kit/#bundle'), availability: 'https://schema.org/InStock', seller: { '@id': url('/#org') }, hasMerchantReturnPolicy: returnLd(url('/assistant-kit/#license')) },
};
const faqLd = (items) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: plain(a) } })) });
const crumbLd = (trail) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail.map(([n, p], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: url(p) })) });

const NAV = [['/play/', 'Play demos'], ['/arcade/', 'Arcade'], ['/genres/', 'Genres'], ['/faq/', 'FAQ'], ['/license/', 'License'], ['/blog/', 'Blog']];

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
${cfg.searchConsole?.googleVerification ? `<meta name="google-site-verification" content="${esc(cfg.searchConsole.googleVerification)}">` : '<!-- google-site-verification: empty (set searchConsole.googleVerification in site.config.mjs) -->'}
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
<nav aria-label="Footer"><h2>Site</h2><ul><li><a href="/">Home</a></li><li><a href="/play/">Play demos</a></li><li><a href="/genres/">Genres</a></li><li><a href="/faq/">FAQ</a></li><li><a href="/license/">License</a></li><li><a href="/blog/">Blog</a></li><li><a href="/assistant-kit/">Assistant Team Starter Kit</a></li><li><a href="/arcade/">Arcade</a></li></ul></nav>
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
<dt>What's included</dt><dd>Phaser 3 + Vite starter game, AI rules files (<code>AGENTS.md</code>, <code>CLAUDE.md</code>, <code>.cursorrules</code>), 6 genre prompt sequences (60+ prompts), Grow Your Game chapter (add levels, enemies, weapons, items, modes), Fix Loop debugging guide, publishing guide, visual theme, one-page GDD template, GUIDE.pdf</dd>
<dt>Genres</dt><dd>Platformer, top-down roguelite, idle/clicker, endless runner, puzzle, tower defense</dd>
<dt>License</dt><dd>Use the starter code in your own games, including commercial ones. Don't resell or redistribute the kit. <a href="/license/">Full terms</a></dd>
<dt>Refund</dt><dd>7-day refund if the kit didn't work for you (may be declined if the kit has clearly been copied or reused)</dd>
<dt>Updates</dt><dd>Free for life</dd>
<dt>Requirements</dt><dd>Mac, Windows, or Linux; Node.js 18+; Git; an AI coding tool (Cursor, Claude Code, Windsurf, or Copilot work best)</dd>
<dt>Where to buy</dt><dd>Direct from this site (secure checkout by Stripe)</dd>
<dt>Seller</dt><dd>${esc(cfg.brand)}, ${esc(cfg.siteUrl.replace('https://', ''))}, ${xLink}</dd>
</dl></div></div></section>`;

const faqBlock = (items) => `<div class="faq">${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a"><p>${md(a)}</p></div></details>`).join('')}</div>`;

const newsletterBlock = () => `<section id="newsletter" class="band" aria-labelledby="news-h"><div class="wrap news">
<div><h2 id="news-h">Get the free <span class="gold">Core Keepers demo</span></h2><p class="sub">Enter your email and we send you a private link to play the full Core Keepers tower defense demo, plus a short "first game in 30 minutes" teaser guide. After that, two short emails over the next week (a practical tip, then a note about the full kit). Unsubscribe anytime with one click.</p></div>
<form action="${esc(cfg.newsletter.endpoint)}" method="post" data-newsletter novalidate>
<label for="nl-email">Email address</label>
<input id="nl-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com">
<input type="hidden" name="source" value="site"><input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0">
<button class="btn buy-big" type="submit">Send me the free demo</button>
<p class="msg" role="status" aria-live="polite"></p>
</form></div></section>

`;
const genreCards = () => `<div class="grid g3">${C.genres.map((g) => `<article class="card genre">${img('g-' + g.demo, `${g.name} demo built with the kit`, { sizes: '(max-width: 640px) 100vw, (max-width: 900px) 50vw, 370px' })}<div class="body"><h3><a class="stretch" href="/genres/${g.slug}/">${esc(g.name)}</a></h3><p>${md(g.summary)}</p><span class="more cyan">${esc(countLabel(g)[0].toUpperCase() + countLabel(g).slice(1))} →</span></div></article>`).join('')}</div>`;

// Honest step counts (kit PROMPTS.md): Prompt 0 kickoff + N numbered prompts (+ optional ones).
const countLabel = (g) => `kickoff + ${g.prompts.length} prompts${g.optional ? ` + ${g.optional.length} optional` : ''}`;
const stepTotal = (g) => 1 + g.prompts.length + (g.optional?.length || 0);
const GATED = 'towerdefense'; // Core Keepers: served privately via /api/demo/ with a signed link from the welcome email
const demoEmbed = (g, { eager = false } = {}) => {
  if (g.demo === GATED) return `<div class="demo">${img('g-' + g.demo, `${g.game} screenshot`, { eager, sizes: '(max-width: 1160px) 100vw, 1116px' })}<a class="btn play" href="#newsletter">Get the free ${esc(g.game)} demo</a></div>`;
  const ok = demoAvailable(g.demo);
  return `<div class="demo">${img('g-' + g.demo, `${g.game} screenshot`, { eager, sizes: '(max-width: 1160px) 100vw, 1116px' })}${ok
    ? `<button class="btn play" type="button" data-demo="/play/${g.demo}/" data-title="${esc(g.game)} demo">▶ Play ${esc(g.game)}</button>`
    : '<p class="unavail">Demo coming soon</p>'}</div>`;
};

// /play/: 150-160 chars, and an ItemList of VideoGame entries for the five public demos (no ratings: we have none)
const PLAY_DESC = 'Play five free browser games made with AI prompts: platformer, roguelite, idle clicker, runner and puzzle. Plus Core Keepers tower defense, free by email.';
const publicDemos = () => C.genres.filter((g) => g.demo !== GATED && demoAvailable(g.demo));
const GENRE_LD = { platformer: 'Platformer', roguelite: 'Roguelite', idle: 'Idle game', runner: 'Endless runner', puzzle: 'Puzzle' };
const playListLd = () => ({
  '@context': 'https://schema.org', '@type': 'ItemList', name: 'Free browser game demos built with the Browser Game Starter Kit', url: url('/play/'),
  numberOfItems: publicDemos().length,
  itemListElement: publicDemos().map((g, i) => ({ '@type': 'ListItem', position: i + 1, item: demoGameLd(g) })),
});
// One VideoGame object per public demo: used in the /play/ ItemList and on the demo page itself (/play/<demo>/)
function demoGameLd(g) {
  return {
    '@type': 'VideoGame', name: `${g.game} demo`, url: url(`/play/${g.demo}/`), description: plain(g.summary), genre: GENRE_LD[g.demo] || g.name,
    gamePlatform: 'Web browser', applicationCategory: 'Game', operatingSystem: 'Any (web browser)', playMode: 'SinglePlayer', isAccessibleForFree: true,
    image: url(`/img/g-${g.demo}-1280.webp`), publisher: { '@id': url('/#org') },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: url(`/play/${g.demo}/`) },
  };
}

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
<div class="grid g4">${C.included.map(([t, d], i) => `<article class="card"><div class="ico ${['bg-cyan', 'bg-gold', 'bg-purple', 'bg-green', 'bg-red', 'bg-green', 'bg-blue', 'bg-gold', 'bg-cyan'][i]}" aria-hidden="true">${i + 1}</div><h3>${esc(t)}</h3><p>${md(d)}</p></article>`).join('')}</div>
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
<p class="sub">${md(td.summary)} It's the game the kit's tower defense sequence builds (kickoff + ${td.prompts.length} prompts; the 2 optional prompts are not in the demo).</p>
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
<ul class="checks"><li>Phaser 3 + Vite starter game</li><li>AI rules files for Cursor, Claude Code, Windsurf, Copilot</li><li>6 genre sequences, 60+ prompts</li><li>Grow Your Game chapter: add levels, enemies, weapons, and items</li><li>Fix Loop, publishing guide, THEME.md, GDD template</li><li>GUIDE.pdf (40+ pages)</li><li><strong>Free lifetime updates</strong></li><li><strong>7-day refund if the kit didn't work for you (may be declined if clearly copied or reused)</strong></li></ul>
${buyButtons()}
${storeLive ? '' : '<p class="note" style="margin:14px 0 0">Store pages are launching soon. <a href="#newsletter">Get the free Core Keepers demo</a>.</p>'}
</div></div></section>

<section id="assistant-kit" class="band" aria-labelledby="ak-h"><div class="wrap">
<p class="eyebrow">New from ${esc(cfg.brand)}</p>
<h2 id="ak-h">Run your shop with an <span class="gold">AI assistant team</span></h2>
<p class="lead">The ${esc(AK.shortName)}: ${esc(AK.tagline.charAt(0).toLowerCase() + AK.tagline.slice(1))} You approve anything public, anything sent, and anything that costs money.</p>
<p class="note">${esc(AK.writtenFor)} A Grok Bot account is a separate subscription.</p>
<ul class="chips" aria-label="The team">${akTeam.map(([n, c]) => `<li class="chip ${c === 'gold' || c === 'cyan' ? c : 'slate'}">${esc(n)}</li>`).join('')}</ul>
<div class="grid g2" style="gap:28px;align-items:stretch">
<div class="price-card"><p class="eyebrow" style="margin:0 0 8px">${esc(AK.shortName)}</p><p class="amt">$${AK.price}</p><p class="note">USD, one-time · free lifetime updates</p>
<ul class="checks"><li>4 Bot job descriptions, 7 workflows</li><li>Approval rules + true-claims check</li><li>Business profile + 6 shared notebooks</li><li>GUIDE.pdf</li></ul>
${akBuy()}
<p class="note" style="margin:12px 0 0"><a href="/assistant-kit/">See what's inside →</a></p></div>
<div class="price-card"><p class="eyebrow" style="margin:0 0 8px">Bundle: both kits</p><p class="amt">$${AK.bundle.price}</p><p class="note">USD, one-time · instead of $${AK.bundle.separate} separately</p>
<ul class="checks"><li>${esc(P.shortName)}</li><li>${esc(AK.shortName)}</li><li>Two downloads, emailed right after payment</li><li>Free lifetime updates for both</li></ul>
${bundleBuy()}</div>
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
  description: PLAY_DESC,
  jsonld: [crumbLd([['Home', '/'], ['Play', '/play/']]), playListLd()],
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
<div class="demo-meta"><a href="/genres/${g.slug}/">See the ${esc(g.name.toLowerCase())} prompt sequence →</a>${demoAvailable(g.demo) ? `<a class="note" href="/play/${g.demo}/">Open full window ↗</a>` : ''}</div>
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

// Genre pages: the visible step list as an ItemList (P0 kickoff, P1..Pn, optional steps), part of the kit Product.
// Gives crawlers and AI assistants a quotable, page-matching answer to "what does the <genre> sequence build, step by step?"
// Titles only (the prompt text stays in the paid kit); no price here (added 2026-10-22).
const genreSteps = (g) => ['Kickoff: plan with your AI, no code yet', ...g.prompts, ...(g.optional || []).map((t) => `Optional: ${t}`)];
const genreLd = (g) => ({
  '@context': 'https://schema.org', '@type': 'ItemList', '@id': url(`/genres/${g.slug}/#steps`),
  name: `${g.name} prompt sequence (${countLabel(g)})`,
  description: `${plain(g.summary)} Each step is one prompt with a browser Test checkpoint.`,
  url: url(`/genres/${g.slug}/`), numberOfItems: genreSteps(g).length, itemListOrder: 'https://schema.org/ItemListOrderAscending',
  isPartOf: { '@type': 'Product', '@id': url('/#product'), name: P.name },
  itemListElement: genreSteps(g).map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: `P${i}. ${t}` })),
});

for (const g of C.genres) {
  const n = g.prompts.length;
  add(`/genres/${g.slug}/`, {
    title: `${g.name} game with AI: ${countLabel(g)} | ${cfg.brand}`,
    description: `Build your own ${g.name.replace(/ \(.*\)/, '').toLowerCase()} browser game with AI in ${stepTotal(g)} steps (${countLabel(g)}), each with a test checkpoint. ${g.demo === GATED ? `The ${g.game} demo is free by email.` : 'Play the free demo on this page.'}`,
    jsonld: [genreLd(g), crumbLd([['Home', '/'], ['Genres', '/genres/'], [g.name, `/genres/${g.slug}/`]])],
    body: `<section class="page-hero"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/genres/">Genres</a> / ${esc(g.name)}</nav>
<p class="eyebrow">Prompt sequence overview</p>
<h1>${esc(g.name)}${g.game !== g.name ? `: <span class="gold">${esc(g.game)}</span>` : ''}</h1>
<p class="lead">${md(g.summary)}</p>
</div></section>
<section style="padding-top:20px"><div class="wrap">
${demoEmbed(g, { eager: true })}
<div class="demo-meta"><p class="note" style="margin:0">This demo was built by following the sequence below.</p>${demoAvailable(g.demo) ? `<a class="note" href="/play/${g.demo}/">Open full window ↗</a>` : ''}</div>
</div></section>
<section class="band"><div class="wrap grid g2" style="gap:40px;align-items:start">
<div><h2>What the sequence builds</h2><ul class="checks">${g.details.map((d) => `<li>${md(d)}</li>`).join('')}</ul>
<h3>How each step works</h3><p class="sub">Paste one prompt. Do its <strong>Test</strong> checkpoint in the browser. If it passes, commit. If it fails, use the Fix Loop: three tries, then roll back.</p>
<p class="note">This page lists the step titles only. The full prompt text, test checkpoints, and tuning numbers are in the kit's <code>PROMPTS.md</code> and <code>GUIDE.pdf</code>.</p></div>
<div><h2>The ${stepTotal(g)} steps <span class="note" style="font-family:var(--body);font-size:1rem;text-shadow:none">${esc(countLabel(g))}</span></h2>
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
<h2>Refunds</h2><p>If the kit didn't work for you, you can request a refund within 7 days of purchase. Refunds may be declined if the kit has clearly been copied or reused. Updates are free for life. To request a refund or get help, contact ${support}.</p>
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

add('/assistant-kit/', {
  title: `${AK.shortName}: AI assistant team templates for your online shop | ${cfg.brand}`,
  description: 'Four assistant job descriptions, seven routines and approval rules to run a small online product business with AI assistants. Written for Grok Bot. $39.',
  sources: ['src/assistant-kit.mjs', 'src/build.mjs'],
  jsonld: [akProductLd, bundleProductLd, faqLd(akFaq), crumbLd([['Home', '/'], [AK.shortName, '/assistant-kit/']])],
  body: `<section class="page-hero"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / ${esc(AK.shortName)}</nav>
<p class="eyebrow">For non-coders who sell online</p>
<h1>Assistant Team <span class="gold">Starter Kit</span></h1>
<p class="lead">${esc(AK.tagline)} You stay the one who approves anything public, anything sent to a person, and anything that costs money.</p>
<p class="note"><strong>${esc(AK.writtenFor)}</strong> A Grok Bot account is a separate subscription and not included.</p>
<ul class="chips" aria-label="Highlights"><li class="chip gold">4 assistants</li><li class="chip cyan">7 workflows</li><li class="chip">Approval first</li><li class="chip slate">Duplicate guard</li><li class="chip slate">No coding</li></ul>
<p class="price-tag">$${AK.price} <small>one-time · free lifetime updates · 7-day refund</small></p>
<div class="btns"><a class="btn" href="#pricing">See what you get and buy</a><a class="btn alt" href="#bundle">Both kits for $${AK.bundle.price}</a></div>
</div></section>

<section class="band" aria-labelledby="team-h"><div class="wrap">
<p class="eyebrow">The team</p><h2 id="team-h">Four assistants, <span class="gold">one job each</span></h2>
<p class="sub">Each assistant is a Grok Bot with one job, the same approval rules, and the same shared notebooks. Start with one (Shop Ops) and add the others when you're ready.</p>
<div class="grid g4">${akTeam.map(([n, c, d], i) => `<article class="card"><div class="ico ${['bg-gold', 'bg-cyan', 'bg-purple', 'bg-green'][i]}" aria-hidden="true">${i + 1}</div><h3>${esc(n)}</h3><p>${esc(d)}</p></article>`).join('')}</div>
</div></section>

<section aria-labelledby="akin-h"><div class="wrap">
<p class="eyebrow">What's inside</p><h2 id="akin-h">Everything is <span class="gold">ready to paste</span></h2>
<div class="grid g4">${akIncluded.map(([t, d], i) => `<article class="card"><div class="ico ${['bg-cyan', 'bg-gold', 'bg-purple', 'bg-green', 'bg-red', 'bg-blue', 'bg-gold', 'bg-cyan'][i]}" aria-hidden="true">${i + 1}</div><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}</div>
</div></section>

<section class="band" aria-labelledby="akhow-h"><div class="wrap grid g2" style="gap:40px">
<div><p class="eyebrow">How it works</p><h2 id="akhow-h">Set up in an <span class="gold">afternoon</span></h2>
<ol class="steps">${akSteps.map(([t, d]) => `<li><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></li>`).join('')}</ol>
<p class="sub">Plan on one to two hours for setup, then about ten minutes a day to read and approve.</p></div>
<div><p class="eyebrow">Approval first</p><h2>Nothing goes out <span class="gold">without you</span></h2>
<ul class="checks"><li>Every assistant asks before posting, sending, publishing, spending, deleting, or replying to a customer.</li><li>Posts go through one queue: drafted, approved by you, then posted exactly as written.</li><li>The duplicate guard checks your profile before every post and after any error, so a post doesn't go out twice.</li><li>A true-claims check on every public draft: no made-up numbers, reviews or deadlines.</li><li>Every job is run once by hand, and checked by you, before it gets a schedule.</li></ul>
<h3>What it is not</h3><ul class="checks no"><li>Not a promise of sales or income.</li><li>Not autopilot: you approve the important steps.</li><li>Not an official Grok Bot product.</li></ul></div>
</div></section>

<section id="pricing" aria-labelledby="akprice-h"><div class="wrap pricing">
<div><p class="eyebrow">Pricing</p><h2 id="akprice-h">One kit. One price. <span class="gold">Yours to keep.</span></h2>
<p class="lead">Pay once and get every future update free. If the kit didn't work for you, ask for a refund within 7 days (refunds may be declined if the kit has clearly been copied or reused).</p>
<h3 id="license">License in one minute</h3>
<ul class="checks"><li>Use and change every template for your own businesses, including commercially.</li><li>Keep using your edited assistants, skills and routines for as long as you like.</li></ul>
<ul class="checks no"><li>Don't resell, share or give away the kit or its templates, including as a public Bot template.</li></ul>
<p class="note">The full license is <code>LICENSE.md</code> in your download.</p></div>
<div class="price-card"><p class="eyebrow" style="margin:0 0 8px">${esc(AK.name)}</p><p class="amt">$${AK.price}</p><p class="note">USD, one-time</p>
<ul class="checks"><li>4 Bot job descriptions</li><li>7 workflows, each with a skill and a routine</li><li>Approval rules and true-claims check</li><li>Business profile and 6 shared notebooks</li><li>Lessons from running our own shop</li><li>GUIDE.pdf</li><li><strong>Free lifetime updates</strong></li><li><strong>7-day refund if the kit didn't work for you (may be declined if clearly copied or reused)</strong></li></ul>
${akBuy()}
</div></div></section>

<section id="bundle" class="band" aria-labelledby="bundle-h"><div class="wrap pricing">
<div><p class="eyebrow">Bundle</p><h2 id="bundle-h">Make a game. <span class="gold">Run the shop.</span></h2>
<p class="lead">Get the ${esc(P.shortName)} and the ${esc(AK.shortName)} together for $${AK.bundle.price} instead of $${AK.bundle.separate}. Build and publish a browser game with AI, then let an assistant team help you run its launch, posts and feedback.</p>
<p class="sub">Two separate downloads, emailed right after payment. Each kit keeps its own license, free updates and 7-day refund.</p></div>
<div class="price-card"><p class="eyebrow" style="margin:0 0 8px">Bundle: both kits</p><p class="amt">$${AK.bundle.price}</p><p class="note">USD, one-time · instead of $${AK.bundle.separate}</p>
<ul class="checks"><li>${esc(P.name)}</li><li>${esc(AK.name)}</li><li><strong>Free lifetime updates for both</strong></li></ul>
${bundleBuy()}
</div></div></section>

<section aria-labelledby="akfaq-h"><div class="wrap prose" style="max-width:860px">
<h2 id="akfaq-h">FAQ</h2>
${faqBlock(akFaq)}
<p class="note">Questions? ${support} or ${xLink}.</p>
</div></section>`,
});

const SUBMIT_TO = cfg.supportEmail || 'support@promptforgekits.com';
const arcadeLd = () => ({
  '@context': 'https://schema.org', '@type': 'ItemList', name: 'Prompt Forge Kits Arcade: free browser games', url: url('/arcade/'), numberOfItems: ARCADE.length,
  itemListElement: ARCADE.map((g, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'VideoGame', name: g.title, url: url(g.url), description: g.blurb, genre: g.genre, gamePlatform: 'Web browser', playMode: 'SinglePlayer', isAccessibleForFree: true, author: { '@type': 'Organization', name: g.maker } } })),
});
add('/arcade/', {
  title: `Free browser games to play now: the Arcade | ${cfg.brand}`,
  description: 'Free browser games you can play right now, no download. Link-only listings with our own descriptions. Suggest your game, and get the Arcade weekly email.',
  sources: ['src/arcade.mjs', 'src/build.mjs'],
  jsonld: [arcadeLd(), crumbLd([['Home', '/'], ['Arcade', '/arcade/']])],
  body: `<section class="page-hero"><div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Arcade</nav>
<h1>The <span class="gold">Arcade</span></h1>
<p class="lead">Free browser games you can play right now, no download or sign-up. We link to each game where its maker publishes it and describe it in our own words.</p>
<p class="note">Starting small: today the arcade lists our own ${ARCADE.length} free demos, each built with the Browser Game Starter Kit. Games from other makers are added only with the maker's OK.</p>
<div class="btns"><a class="btn" href="#arcade-weekly">Get Arcade weekly</a><a class="btn alt" href="#submit">Suggest a game</a></div>
</div></section>
<section style="padding-top:20px" aria-labelledby="list-h"><div class="wrap">
<h2 id="list-h" class="sr">Games</h2>
<div class="grid g3">${ARCADE.map((g) => `<article class="card genre">${g.ownImage ? img(g.ownImage, `${g.title}: screenshot of our own demo`, { sizes: '(max-width: 640px) 100vw, (max-width: 900px) 50vw, 370px' }) : ''}<div class="body"><h3><a class="stretch" href="${esc(g.url)}">${esc(g.title)}</a></h3><p class="note" style="margin:0 0 6px">${esc(g.genre)} · by ${esc(g.maker)}${g.madeWithKit ? ' · made with the Browser Game Starter Kit' : ''}</p><p>${esc(g.blurb)}</p><span class="more cyan">Play free →</span></div></article>`).join('')}</div>
</div></section>
<section id="arcade-weekly" class="band" aria-labelledby="aw-h"><div class="wrap news">
<div><h2 id="aw-h">Get <span class="gold">Arcade weekly</span></h2><p class="sub">At most one short email a week: free browser games worth playing (link only) and one tip for building your own game with AI. Unsubscribe anytime with one click. This is a separate list from the Core Keepers demo emails.</p></div>
<form action="/api/arcade-subscribe/" method="post" data-newsletter data-endpoint="/api/arcade-subscribe/" data-ok="You're on the list. Check your inbox for a short confirmation (and spam, just in case)." novalidate>
<label for="aw-email">Email address</label>
<input id="aw-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com">
<input type="hidden" name="source" value="arcade"><input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0">
<button class="btn" type="submit">Sign me up</button>
<p class="msg" role="status" aria-live="polite"></p>
</form></div></section>
<section id="submit" aria-labelledby="submit-h"><div class="wrap grid g2" style="gap:40px;align-items:start">
<div><h2 id="submit-h">Suggest a <span class="gold">game</span></h2>
<p class="sub">Made a free browser game, with our kit or anything else? Tell us about it. We review every suggestion by hand. Nothing is listed automatically.</p>
<ul class="checks"><li>Free to play in the browser, no download.</li><li>Family-friendly: no gambling or adult content.</li><li>You made it, or the maker said we may list it.</li></ul>
<h3>How listings work</h3>
<ul class="checks"><li>Link only: we never host, embed or copy your game.</li><li>We write a short description in our own words and use no images unless you send one and say we may use it.</li><li>Credit and the link always go to the maker.</li></ul>
<h3 id="removal">Removal on request</h3>
<p>Want your game removed or a listing changed? Email ${support} from the address on your game page or profile, with the listing's link and we'll take it down, no questions asked, usually within two days.</p></div>
<form class="card" data-mailto="${esc(SUBMIT_TO)}" novalidate style="display:grid;gap:10px">
<label for="s-title">Game title</label><input id="s-title" name="title" required maxlength="80">
<label for="s-link">Link to play it (https://)</label><input id="s-link" name="link" type="url" required placeholder="https://">
<label for="s-maker">Maker name</label><input id="s-maker" name="maker" required maxlength="80">
<label for="s-genre">Genre (optional)</label><input id="s-genre" name="genre" maxlength="60">
<label for="s-notes">Anything else (optional)</label><textarea id="s-notes" name="notes" rows="3" maxlength="600"></textarea>
<label style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" name="permission" style="margin-top:4px"> <span>I made this game, or the maker said it may be listed. It's free to play in the browser.</span></label>
<button class="btn" type="submit">Open my email to send it</button>
<p class="msg" role="status" aria-live="polite"></p>
<p class="note" style="margin:0">This opens your email app with the details filled in, addressed to ${esc(SUBMIT_TO)}. No email app? Send the same details to that address.</p>
</form>
</div></section>`,
});

// Hidden pages for the Stripe checkout: linked nowhere, noindex, not in the sitemap.
add('/buy-test/', {
  title: `Checkout preview | ${cfg.brand}`, description: 'Private checkout preview.', noindex: true, noSitemap: true,
  body: `<section class="page-hero"><div class="wrap prose">
<h1>Checkout <span class="gold">preview</span></h1>
<p class="lead">Private page. Checkout is live: buying here is a real ${PRICE} purchase.</p>
${buyNowForm()}
</div></section>`,
});
add('/thanks/', {
  title: `Thank you | ${cfg.brand}`, description: 'Thanks for your purchase.', noindex: true, noSitemap: true,
  body: `<section class="page-hero"><div class="wrap prose">
<h1>Thank <span class="gold">you</span></h1>
<p class="lead">Payment received. Check your inbox: your download starts automatically (or use the button below), and your personal download link is also on its way to your inbox (it usually arrives within a minute; check spam if not).</p>
<p id="dl" hidden><a class="btn" id="dl-btn" href="#">Download your kit (.zip)</a></p>
<p class="note">Bought the bundle? You get two downloads: both links are on the next page and in your email.</p>
<script>(function(){var m=location.search.match(/[?&]session_id=(cs_[A-Za-z0-9_]+)/);if(!m)return;var u='/api/claim/?session_id='+m[1];document.getElementById('dl-btn').href=u;document.getElementById('dl').hidden=false;setTimeout(function(){location.href=u},600)})();</script>
<p>Your purchase includes free updates and a 7-day refund if the kit didn't work for you (may be declined if clearly copied or reused). Reply to the email if you need anything.</p>
<p><a href="/">Back to the home page</a></p>
</div></section>`,
});

add('/free-pack/', {
  title: `${FP.title} | ${cfg.brand}`, description: FP.intro, noindex: true, noSitemap: true,
  body: `<section class="page-hero"><div class="wrap prose">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Free teaser guide</nav>
<h1>Free <span class="gold">teaser guide</span></h1><p class="lead">${esc(FP.intro)}</p>
<p><a class="btn" href="/downloads/prompt-forge-free-prompt-pack.pdf">Download the PDF</a></p>
</div></section>
<section style="padding-top:12px"><div class="wrap prose">${FP.sections.map((x) => `<h2>${esc(x.h)}</h2>${x.html}`).join('\n')}<h2>After your first game</h2><p>Finished v1 and want more levels, enemies, or items? Read <a href="/blog/grow-your-game-after-v1/">7 tips for adding content to your game without breaking it</a>.</p></div></section>`,
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
// Demo pages under /play/<demo>/ are raw game builds titled "My Browser Game": give each a real title, description and canonical (dist only).
// Public demos also get a share card (Open Graph + X card with the game's own screenshot) and their VideoGame JSON-LD,
// so a demo link posted on X/Discord shows a preview and search/AI crawlers can read what the page is.
for (const g of C.genres.filter((x) => demoAvailable(x.demo))) {
  const f = path.join(OUT, 'play', g.demo, 'index.html');
  const dTitle = `${g.game} demo: free browser game built with AI prompts | ${cfg.brand}`;
  const dDesc = `Play the free ${g.game.toLowerCase()} demo in your browser. It was built by following the ${g.name} prompt sequence in the Browser Game Starter Kit.`;
  const img = url(`/img/g-${g.demo}-1280.webp`);
  const share = g.demo === GATED ? '' : `
    <meta property="og:type" content="website" /><meta property="og:site_name" content="${esc(cfg.brand)}" />
    <meta property="og:title" content="${esc(dTitle)}" /><meta property="og:description" content="${esc(dDesc)}" />
    <meta property="og:url" content="${url(`/play/${g.demo}/`)}" /><meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1280" /><meta property="og:image:height" content="720" /><meta property="og:image:alt" content="${esc(`Screenshot of the ${g.game.toLowerCase()} demo`)}" />
    <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:site" content="@${cfg.xHandle}" />
    <meta name="twitter:title" content="${esc(dTitle)}" /><meta name="twitter:description" content="${esc(dDesc)}" /><meta name="twitter:image" content="${img}" />
    <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...demoGameLd(g), publisher: { '@type': 'Organization', '@id': url('/#org'), name: cfg.brand, url: url('/') } }).replace(/</g, '\\u003c')}</script>`;
  const head = `<title>${esc(dTitle)}</title>\n    <meta name="description" content="${esc(dDesc)}" />\n    <link rel="canonical" href="${url(`/play/${g.demo}/`)}" />${share}`;
  fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/<title>[\s\S]*?<\/title>/, head));
}
for (const pg of pages) {
  const file = pg.path.endsWith('.html') ? path.join(OUT, pg.path) : path.join(OUT, pg.path, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, layout(pg));
}
// sitemap: real last-changed dates per page (src/lastmod.mjs), not the build date
const LM = createLastmod(ROOT, { today });
const SRC = { page: ['src/content.mjs', 'site.config.mjs', 'src/build.mjs'], blog: ['src/posts.mjs'] };
const sm = pages.filter((p) => !p.noSitemap).map((p) => ({ loc: p.path, lastmod: LM.date(p.path, JSON.stringify([p.title, p.description, p.body, p.jsonld || []]), p.path.startsWith('/blog/') ? SRC.blog : (p.sources || SRC.page)) }));
// the five public demo pages (/play/<demo>/) are indexable and listed; the gated Core Keepers demo never is
for (const g of C.genres.filter((x) => x.demo !== GATED && demoAvailable(x.demo))) {
  const f = path.join(OUT, 'play', g.demo, 'index.html');
  sm.splice(sm.findIndex((x) => x.loc === '/play/') + 1 + C.genres.filter((x) => x.demo !== GATED && demoAvailable(x.demo)).indexOf(g), 0, { loc: `/play/${g.demo}/`, lastmod: LM.date(`/play/${g.demo}/`, fs.readFileSync(f, 'utf8'), [`public/play/${g.demo}`]) });
}
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm.map((p) => `  <url><loc>${url(p.loc)}</loc><lastmod>${p.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`);
LM.save();
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /demo/\nDisallow: /api/\nDisallow: /buy-test/\nDisallow: /thanks/\n\nSitemap: ${url('/sitemap.xml')}\n`);
fs.writeFileSync(path.join(OUT, 'blog/rss.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(cfg.brand)} blog</title><link>${url('/blog/')}</link><description>${esc(cfg.description)}</description>\n${posts.map((po) => `<item><title>${esc(po.title)}</title><link>${url(`/blog/${po.slug}/`)}</link><guid>${url(`/blog/${po.slug}/`)}</guid><pubDate>${new Date(po.date + 'T12:00:00Z').toUTCString()}</pubDate><description>${esc(po.description)}</description></item>`).join('\n')}\n</channel></rss>\n`);

// llms.txt + llms-full.txt
const factsTxt = `## Facts
- Product: ${P.name} (v${P.version})
- Seller: ${cfg.brand} (${cfg.siteUrl}, X @${cfg.xHandle})
- Price: ${PRICE} USD, one-time purchase
- Included: Phaser 3 + Vite starter game; AI rules files (AGENTS.md, CLAUDE.md, .cursorrules); Prompt Playbook with 6 genre sequences (60+ prompts); Grow Your Game chapter (adding levels, enemies, weapons, items, modes); Fix Loop debugging guide; publishing guide (itch.io, GitHub Pages, Netlify); THEME.md visual theme; one-page GDD template; GUIDE.pdf (40+ pages)
- Genres: platformer, top-down roguelite, idle/clicker, endless runner, Sokoban-style puzzle, tower defense ("Core Keepers")
- License: use the starter code in your own games, including commercial games; do not resell, share, or redistribute the kit, prompts, or guides, or repackage them into another kit, template, course, or prompt pack
- Refund: 7-day refund if the kit didn't work for you; may be declined if the kit has clearly been copied or reused; free updates
- Updates: free for life
- Requirements: Mac, Windows, or Linux; Node.js 18+; Git; an AI coding tool that opens a local folder (Cursor, Claude Code, Windsurf, or VS Code + Copilot). Lovable and Bolt are supported with caveats.
- Assets: no image files (art is drawn in code); one original background music track, PFK Theme by Prompt Forge Kits (.ogg/.m4a/.mp3, 37.5 s loop), usable in your own games including commercial ones but not resold on its own (LICENSE-MUSIC.txt); sound effects generated in code; bundled Lilita One font (SIL OFL 1.1)
- In every game: a How to play screen with the controls and a Start button before play; an Options menu with separate Music and Sound FX on/off switches
- Where to buy: directly at ${cfg.siteUrl}/#pricing (secure checkout by Stripe)
- Support: ${cfg.supportEmail || 'X @' + cfg.xHandle + ' (support email coming soon)'}
`;
const akFactsTxt = `## Second product: ${AK.name}
- Price: $${AK.price} USD, one-time purchase; bundle with the ${P.shortName}: $${AK.bundle.price} USD for both (instead of $${AK.bundle.separate})
- What it is: text templates for running a small online product business with a team of AI assistants: 4 Bot job descriptions (Lead, Content, Community & Launch, Shop Ops), 7 workflows (daily ops check, fact sync check, feedback watch, post approved posts with a duplicate guard, weekly report, weekly newsletter draft, launch week), approval rules, a true-claims check, a business profile template, 6 shared notebook templates, lessons, GUIDE.pdf
- Platform: ${AK.writtenFor} A Grok Bot account is a separate subscription.
- Approval first: the assistants ask before posting, sending, publishing, spending, deleting or replying to customers
- License: use and change the templates for your own businesses; do not resell or share the kit or its templates
- Refund: 7-day refund if the kit didn't work for you; may be declined if the kit has clearly been copied or reused; free updates
- No income or results claims
- Page: ${url('/assistant-kit/')}
`;
// every public demo page (indexable, in the sitemap) gets its own llms.txt line; the gated Core Keepers demo never does
const llmsDemos = C.genres.filter((x) => x.demo !== GATED && demoAvailable(x.demo));
const llms = `# ${cfg.brand}

> ${cfg.description} Tagline: "${cfg.tagline}" First product: the ${P.name}, ${PRICE}.

${factsTxt}
${akFactsTxt}
## Pages
- [Home](${url('/')}): what the kit is, what's inside, who it's for, how it works, pricing
- [Play demos](${url('/play/')}): five free on-site demos (platformer, roguelite, idle, runner, puzzle); Core Keepers tower defense is free by email
${llmsDemos.map((g) => `- [${g.name} demo](${url(`/play/${g.demo}/`)}): ${plain(g.summary)} Free to play in the browser, no signup; built by following the ${g.name} prompt sequence (${countLabel(g)}).`).join('\n')}
- [Genres](${url('/genres/')}): overview of the six prompt sequences
${C.genres.map((g) => `- [${g.name}](${url(`/genres/${g.slug}/`)}): ${plain(g.summary)}`).join('\n')}
- [Arcade](${url('/arcade/')}): free browser games, link only (today: our own five demos); Arcade weekly email signup; suggest a game
- [Assistant Team Starter Kit](${url('/assistant-kit/')}): AI assistant team templates for a small online product business ($${AK.price}; bundle with the game kit $${AK.bundle.price})
- [FAQ](${url('/faq/')})
- [License](${url('/license/')})
- [Blog](${url('/blog/')})
${posts.map((po) => `- [${po.title}](${url(`/blog/${po.slug}/`)}): ${plain(po.description)}`).join('\n')}
- [Free Core Keepers demo](${url('/#newsletter')}): email signup; the demo link is sent by email (not public)

## Optional
- [Full text for LLMs](${url('/llms-full.txt')})
`;
const full = `# ${cfg.brand}: ${P.name}

> ${cfg.description} Tagline: "${cfg.tagline}"

${factsTxt}
${akFactsTxt}
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
Prompts (${countLabel(g)}): P0 Kickoff; ${g.prompts.map((t, i) => `P${i + 1} ${t}`).join('; ')}${g.optional ? `; optional: ${g.optional.map((t, i) => `P${g.prompts.length + i + 1} ${t}`).join('; ')}` : ''}
Page: ${url(`/genres/${g.slug}/`)} · Demo: ${g.demo === GATED ? 'free by email (signup at ' + url('/#newsletter') + ')' : url(`/play/${g.demo}/`)}`).join('\n')}

## Demos
Each demo on ${url('/play/')} was built by following that genre's prompt sequence one step at a time, with an automated browser test after each step.
${llmsDemos.map((g) => `- ${g.name} demo: ${url(`/play/${g.demo}/`)}`).join('\n')}

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
