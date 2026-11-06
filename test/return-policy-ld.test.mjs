// Every Product offer (kit $19, Assistant kit $29, bundle $45) carries a complete offer-level MerchantReturnPolicy
// (2026-11-02): Google's merchant listing markup requires applicableCountry + returnPolicyCategory, and
// merchantReturnDays for a finite window. Without applicableCountry the refund policy is flagged and not shown.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const products = (file) => [...fs.readFileSync(file, 'utf8').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((m) => JSON.parse(m[1])).filter((j) => j['@type'] === 'Product');
test('each Product offer has a complete 7-day MerchantReturnPolicy (applicableCountry, category, days, free, full refund)', () => {
  const all = [...products('dist/index.html'), ...products('dist/assistant-kit/index.html')];
  assert.equal(all.length, 3);
  const prices = {};
  for (const p of all) {
    const o = p.offers; prices[p['@id']] = o.price;
    const r = o.hasMerchantReturnPolicy;
    assert.equal(r['@type'], 'MerchantReturnPolicy', p['@id']);
    assert.ok(Array.isArray(r.applicableCountry) && r.applicableCountry.length >= 1 && r.applicableCountry.length <= 50, p['@id'] + ': applicableCountry 1-50');
    for (const c of r.applicableCountry) assert.match(c, /^[A-Z]{2}$/, p['@id'] + ': ISO alpha-2');
    assert.equal(new Set(r.applicableCountry).size, r.applicableCountry.length, 'no duplicate countries');
    assert.ok(r.applicableCountry.includes('US') && r.applicableCountry.includes('CA'));
    assert.equal(r.returnPolicyCategory, 'https://schema.org/MerchantReturnFiniteReturnWindow');
    assert.equal(r.merchantReturnDays, 7);
    assert.equal(r.returnFees, 'https://schema.org/FreeReturn');
    assert.equal(r.refundType, 'https://schema.org/FullRefund');
    assert.ok(!('returnShippingFeesAmount' in r), 'FreeReturn must not carry a shipping fee');
    assert.match(r.merchantReturnLink, /^https:\/\/promptforgekits\.com\/(license\/|assistant-kit\/#license)$/);
  }
  // prices unchanged
  assert.deepEqual(prices, { 'https://promptforgekits.com/#product': '19', 'https://promptforgekits.com/assistant-kit/#product': '29', 'https://promptforgekits.com/assistant-kit/#bundle': '45' });
});
