// ─────────────────────────────────────────────────────────────────────────────
// Prompt Forge Kits site config. EVERY placeholder lives in this file.
// Search for "PLACEHOLDER" to find what still needs filling in before launch.
// After editing, run `npm run build`.
// ─────────────────────────────────────────────────────────────────────────────

export default {
  siteUrl: 'https://promptforgekits.com', // canonical origin (no trailing slash)
  brand: 'Prompt Forge Kits',
  tagline: 'Tested prompts. Real projects. Shipped.',
  description:
    'Prompt Forge Kits makes tested AI prompt kits that help vibe coders build and ship real projects, starting with browser games.',
  xHandle: 'promptforgekits',
  githubUrl: 'https://github.com/promptforgekits',

  product: {
    name: 'Browser Game Starter Kit by Prompt Forge Kits',
    shortName: 'Browser Game Starter Kit',
    price: 29, // USD, one-time
    currency: 'USD',
    version: '1.0',
  },

  // PLACEHOLDER: store links are not live yet. Leave '' until the listing is
  // published; while empty, buy buttons render as a clearly labeled
  // "launching soon" state instead of a broken link.
  stores: {
    gumroad: '', // PLACEHOLDER e.g. 'https://promptforgekits.gumroad.com/l/browser-game-starter-kit'
    itch: '', // PLACEHOLDER e.g. 'https://promptforgekits.itch.io/browser-game-starter-kit'
  },

  // PLACEHOLDER: support email is not set up yet. While empty, pages say
  // "support email coming soon" and point to X instead.
  supportEmail: '', // PLACEHOLDER e.g. 'support@promptforgekits.com'

  // PLACEHOLDER: newsletter endpoint, to be wired to Resend later
  // (e.g. a Vercel function that adds the address to a Resend audience).
  // The form POSTs JSON { email, source } to this URL.
  // While `live` is false the form does not send anything and tells the
  // visitor signups are not open yet (honest, no fake success).
  newsletter: {
    endpoint: '/api/subscribe', // PLACEHOLDER endpoint path or URL
    live: false, // PLACEHOLDER flip to true once the endpoint exists
  },

  // PLACEHOLDER: analytics, OFF by default. Paste the provider's snippet
  // (Plausible, Fathom, Vercel Web Analytics, etc.) and set enabled: true.
  analytics: {
    enabled: false,
    headSnippet: '', // e.g. '<script defer data-domain="promptforgekits.com" src="https://plausible.io/js/script.js"></script>'
  },
};
