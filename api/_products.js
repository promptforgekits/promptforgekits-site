// Product catalog for direct checkout + delivery (added 2026-10-21). One place for every sku.
// bgsk is the game kit: its checkout params, email and download are unchanged.
// Catalog amounts match live Stripe Prices. Env vars override the fallback priceId (STRIPE_PRICE_ID for bgsk).
export const PRODUCTS = {
  bgsk: {
    sku: 'bgsk', name: 'Browser Game Starter Kit', fullName: 'Browser Game Starter Kit by Prompt Forge Kits', price: 19, version: '1.0',
    priceEnv: 'STRIPE_PRICE_ID', priceId: 'price_1UYruWLgIACCBJCo8mne38EW', // $19 USD live Nov 6 2026; env STRIPE_PRICE_ID overrides
    kitDir: 'kit', zipRoot: 'browser-game-starter-kit', cancelPath: '/#pricing', start: 'README.md, then QUICKSTART.md',
  },
  atsk: {
    sku: 'atsk', name: 'Assistant Team Starter Kit', fullName: 'Assistant Team Starter Kit by Prompt Forge Kits', price: 29, version: '1.0',
    priceEnv: 'STRIPE_PRICE_ID_ATSK', priceId: 'price_1UYruWLgIACCBJCoLdjm0oIE', // $29 USD live Nov 6 2026; env STRIPE_PRICE_ID_ATSK overrides
    kitDir: 'assistant-kit', zipRoot: 'assistant-team-starter-kit', cancelPath: '/assistant-kit/#pricing', start: 'README.md, then START-HERE.md',
  },
  bundle: {
    sku: 'bundle', name: 'Browser Game Starter Kit + Assistant Team Starter Kit', fullName: 'Bundle: Browser Game Starter Kit + Assistant Team Starter Kit by Prompt Forge Kits', price: 39, version: '1.0',
    priceEnv: 'STRIPE_PRICE_ID_BUNDLE', priceId: 'price_1UYruXLgIACCBJCoQ1z4bXID', // $39 USD live Nov 6 2026; env STRIPE_PRICE_ID_BUNDLE overrides
    includes: ['bgsk', 'atsk'], cancelPath: '/assistant-kit/#bundle',
  },
};
export const DEFAULT_SKU = 'bgsk';
export const KIT_SKUS = ['bgsk', 'atsk']; // skus that are a downloadable kit
export const productFor = (sku) => PRODUCTS[sku] || null;
// What a paid sku delivers: a bundle delivers each included kit.
export const deliverables = (sku) => (PRODUCTS[sku]?.includes || (KIT_SKUS.includes(sku) ? [sku] : []));
export const priceIdFor = (sku) => {
  const p = PRODUCTS[sku]; if (!p) return null;
  return process.env[p.priceEnv] || p.priceId || null;
};
