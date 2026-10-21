// Product catalog for direct checkout + delivery (added 2026-10-21). One place for every sku.
// bgsk is the original $29 kit: its checkout params, email and download are unchanged.
// Stripe Price ids are not secrets; env vars override them (STRIPE_PRICE_ID for bgsk, as before).
export const PRODUCTS = {
  bgsk: {
    sku: 'bgsk', name: 'Browser Game Starter Kit', fullName: 'Browser Game Starter Kit by Prompt Forge Kits', price: 29, version: '1.0',
    priceEnv: 'STRIPE_PRICE_ID', priceId: null, // live price comes from STRIPE_PRICE_ID (unchanged)
    kitDir: 'kit', zipRoot: 'browser-game-starter-kit', cancelPath: '/#pricing', start: 'README.md, then QUICKSTART.md',
  },
  atsk: {
    sku: 'atsk', name: 'Assistant Team Starter Kit', fullName: 'Assistant Team Starter Kit by Prompt Forge Kits', price: 39, version: '1.0',
    priceEnv: 'STRIPE_PRICE_ID_ATSK', priceId: 'price_1USyqBLgIACCBJCoe2ol9YLp', // live, prod_VTwjEw0VwqPzoz, 39.00 USD
    kitDir: 'assistant-kit', zipRoot: 'assistant-team-starter-kit', cancelPath: '/assistant-kit/#pricing', start: 'README.md, then START-HERE.md',
  },
  bundle: {
    sku: 'bundle', name: 'Browser Game Starter Kit + Assistant Team Starter Kit', fullName: 'Bundle: Browser Game Starter Kit + Assistant Team Starter Kit by Prompt Forge Kits', price: 55, version: '1.0',
    priceEnv: 'STRIPE_PRICE_ID_BUNDLE', priceId: 'price_1USyqBLgIACCBJCoFoebOJdc', // live, prod_VTwjT6P9kqjB6K, 55.00 USD
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
