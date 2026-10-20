import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// Since 2026-10-19 the kit ships an original music track (PFK Theme) + Options menu; the site must not say "no sound files" (added 2026-10-20).
const d = (f) => fs.readFileSync(new URL(`../dist/${f}`, import.meta.url), 'utf8');
test('art/sound facts match the kit (music included, Options switches, How to play)', () => {
  for (const f of ['llms.txt', 'llms-full.txt', 'index.html', 'faq/index.html']) {
    const h = d(f);
    assert.doesNotMatch(h, /no image or sound files/i, f);
    assert.doesNotMatch(h, /No image or sound files/, f);
    assert.match(h, /PFK Theme/, f);
    assert.match(h, /Music and Sound FX/, f);
  }
  assert.match(d('llms.txt'), /How to play screen/);
  assert.match(d('license/index.html'), /LICENSE-MUSIC\.txt/);
  // FAQ JSON-LD answer carries the corrected text
  const ld = [...d('faq/index.html').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const faq = ld.flatMap((x) => (x['@graph'] || [x])).find((x) => x['@type'] === 'FAQPage');
  const a = faq.mainEntity.find((q) => q.name === 'Is there art or sound included?');
  assert.ok(a && /PFK Theme/.test(a.acceptedAnswer.text) && /LICENSE-MUSIC/.test(a.acceptedAnswer.text));
  // the kit actually ships what we claim
  for (const f of ['LICENSE-MUSIC.txt', 'starter/public/assets/audio/pfk-theme-v1-alt.ogg', 'starter/src/scenes/OptionsScene.js', 'starter/src/scenes/HowToScene.js'])
    assert.ok(fs.existsSync(new URL(`../private/kit/${f}`, import.meta.url)), f);
});
