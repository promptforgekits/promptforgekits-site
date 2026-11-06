// Product catalog for direct checkout + delivery (added 2026-10-21). One place for every sku.
// bgsk is the game kit: its checkout params, email and download are unchanged.
// Price numbers below are display/catalog amounts. Stripe Price ids still point at the OLD live amounts
// until new Price objects are created at go-live (see /workspace/ops/review/price-drop-1106.md).
// Stripe Price ids are not secrets; env vars override them (STRIPE_PRICE_ID for bgsk, as before).
export const PRODUCTS = {
  bgsk: {
    sku: 'bgsk', name: 'Browser Game Starter Kit', fullName: 'Browser Game Starter Kit by Prompt Forge Kits', price: 19, version: '1.0',
    priceEnv: 'STRIPE_PRICE_ID', priceId: null, // go-live: point STRIPE_PRICE_ID at a new $19 Price on prod_VS59pZzv78Lw0p
    kitDir: 'kit', zipRoot: 'browser-game-starter-kit', cancelPath: '/#pricing', start: 'README.md, then QUICKSTART.md',
  },
  atsk: {
    sku: 'atsk', name: 'Assistant Team Starter Kit', fullName: 'Assistant Team Starter Kit by Prompt Forge Kits', price: 29, version: '1.0',
    priceEnv: 'STRIPE_PRICE_ID_ATSK', priceId: 'price_1USyqBLgIACCBJCoe2ol9YLp', // STILL $39 until go-live; then replace with new $29 Price on prod_VTwjEw0VwqPzoz (or set STRIPE_PRICE_ID_ATSK)
    kitDir: 'assistant-kit', zipRoot: 'assistant-team-starter-kit', cancelPath: '/assistant-kit/#pricing', start: 'README.md, then START-HERE.md',
  },
  bundle: {
    sku: 'bundle', name: 'Browser Game Starter Kit + Assistant Team Starter Kit', fullName: 'Bundle: Browser Game Starter Kit + Assistant Team Starter Kit by Prompt Forge Kits', price: 45, version: '1.0',
    priceEnv: 'STRIPE_PRICE_ID_BUNDLE', priceId: 'price_1USyqBLgIACCBJCoFoebOJdc', // STILL $55 until go-live; then replace with new $45 Price on prod_VTwjT6P9kqjB6K (or set STRIPE_PRICE_ID_BUNDLE)
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
