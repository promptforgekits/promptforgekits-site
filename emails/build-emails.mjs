// Generates the day-3 and day-7 Resend template HTML + text (unsubscribe via Resend's {{{RESEND_UNSUBSCRIBE_URL}}}).
import fs from 'node:fs';
const wrap = (inner) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"></head><body style="margin:0;padding:0;background-color:#e9edf5;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#e9edf5"><tr><td align="center" style="padding-top:24px;padding-bottom:24px;padding-left:12px;padding-right:12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;"><tr><td bgcolor="#1b1f2e" style="background-color:#1b1f2e;padding-top:22px;padding-bottom:22px;padding-left:26px;padding-right:26px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:30px;color:#ffc93c;font-weight:bold;">Prompt Forge Kits</td></tr><tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding-top:28px;padding-bottom:28px;padding-left:26px;padding-right:26px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#1b1f2e;">${inner}</td></tr><tr><td style="padding-top:16px;padding-bottom:8px;padding-left:26px;padding-right:26px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#4a5373;">You're getting this because you asked for the free Core Keepers demo at promptforgekits.com. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#4a5373;">Unsubscribe</a> anytime.</td></tr></table></td></tr></table></body></html>`;
const p = (t, last) => `<p style="margin-top:0;margin-bottom:${last ? 0 : 14}px;font-size:16px;line-height:24px;color:#1b1f2e;">${t}</p>`;
const h = (t) => `<p style="margin-top:0;margin-bottom:14px;font-size:22px;line-height:28px;font-weight:bold;color:#1b1f2e;">${t}</p>`;
const pre = (t) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr><td bgcolor="#e9edf5" style="background-color:#e9edf5;border:2px solid #1b1f2e;padding-top:10px;padding-bottom:10px;padding-left:12px;padding-right:12px;font-family:Courier New,Courier,monospace;font-size:13px;line-height:19px;color:#1b1f2e;">${t}</td></tr></table>`;
const btn = (href, t) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr><td bgcolor="#ffc93c" style="background-color:#ffc93c;border:3px solid #1b1f2e;border-radius:10px;"><a href="${href}" style="display:inline-block;padding-top:12px;padding-bottom:12px;padding-left:22px;padding-right:22px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;color:#1b1f2e;text-decoration:none;">${t}</a></td></tr></table>`;

const day3 = {
  subject: 'The one habit that makes AI-built games work',
  html: wrap(h('One prompt = one feature') +
    p('Here is the single habit that separates AI-built games that ship from the ones that fall apart: ask for one thing at a time, then test it before you ask for the next.') +
    p('Bad prompt: "Add enemies, a score, three levels, sound, and a menu."') +
    p('Better, in four separate prompts:') +
    pre('1. Add one red circle enemy that walks back and forth on the ground.<br>2. Make the player lose when touching it. Show how to test.<br>3. Let the player stomp it from above. Score +25.<br>4. Add a score counter in the top-left corner.') +
    p('After each one: play it, check the browser console (F12) for red errors, then commit with <b>git add -A &amp;&amp; git commit -m "step works"</b>. If three fixes in a row fail, roll back to your last commit and ask for a smaller step. Rolling back costs two minutes. Spiraling costs an evening.') +
    p('If you haven\'t yet, the free teaser guide has a 30-minute walkthrough that puts this into practice (and your welcome email has your private link to the Core Keepers demo):') +
    btn('https://promptforgekits.com/free-pack/', 'Open the teaser guide') +
    p('Already have a game running and want more content? Here are 7 free tips for adding levels, enemies, and items without breaking it: <a href="https://promptforgekits.com/blog/grow-your-game-after-v1/" style="color:#2a5bd7;">promptforgekits.com/blog/grow-your-game-after-v1/</a>') +
    p('If you get stuck, reply to this email and tell me where.', true)),
  text: `One prompt = one feature

The single habit that separates AI-built games that ship from the ones that fall apart: ask for one thing at a time, then test it before you ask for the next.

Bad prompt: "Add enemies, a score, three levels, sound, and a menu."

Better, as four separate prompts:
1. Add one red circle enemy that walks back and forth on the ground.
2. Make the player lose when touching it. Show how to test.
3. Let the player stomp it from above. Score +25.
4. Add a score counter in the top-left corner.

After each one: play it, check the browser console (F12) for red errors, then commit (git add -A && git commit -m "step works"). If three fixes in a row fail, roll back to your last commit and ask for a smaller step. Rolling back costs two minutes. Spiraling costs an evening.

The free teaser guide has a 30-minute walkthrough that puts this into practice (and your welcome email has your private link to the Core Keepers demo): https://promptforgekits.com/free-pack/

Already have a game running and want more content? Here are 7 free tips for adding levels, enemies, and items without breaking it: https://promptforgekits.com/blog/grow-your-game-after-v1/

If you get stuck, reply to this email and tell me where.

Prompt Forge Kits
You're getting this because you asked for the free Core Keepers demo at promptforgekits.com. Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`,
};
const li = (t) => `<tr><td valign="top" style="padding-bottom:6px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#1b1f2e;width:18px;">&bull;</td><td style="padding-bottom:6px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#1b1f2e;">${t}</td></tr>`;
const day7 = {
  subject: 'After the Core Keepers demo: the full Browser Game Starter Kit',
  html: wrap(h('The full kit, if you want it') +
    p('A week ago you grabbed the free Core Keepers demo. If you built something after the teaser guide, nice. If you got stuck or just haven\'t had time, that\'s normal too.') +
    p('The free demo shows one finished game. The <b>Browser Game Starter Kit</b> is the whole thing:') +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">${li('A working Phaser 3 + Vite starter game (menu, game, and game-over scenes, art drawn in code)')}${li('Rules files (AGENTS.md, CLAUDE.md, .cursorrules) so your AI tool follows the small-steps workflow automatically')}${li('Six genre sequences, 60+ copy-paste prompts with a test checkpoint after each: platformer, top-down roguelite, idle/clicker, endless runner, puzzle, tower defense')}${li('The full Fix Loop debugging guide, a publishing guide (itch.io, GitHub Pages, Netlify), and the Chunky Flat Toy visual theme')}</table>` +
    p('It\'s <b>$29</b>, one-time. <b>7-day refund</b> if it didn\'t work for you, and <b>free updates</b>. You can play demos of games built by following the sequences on the site before deciding. Secure checkout on the site, with instant email download.') +
    btn('https://promptforgekits.com/#pricing', 'Get the Browser Game Starter Kit') +
    p('That\'s the last email in this sequence. Thanks for reading, and good luck shipping your game.', true)),
  text: `The full kit, if you want it

A week ago you grabbed the free Core Keepers demo. If you built something after the teaser guide, nice. If you got stuck or just haven't had time, that's normal too.

The free demo shows one finished game. The Browser Game Starter Kit is the whole thing:
- A working Phaser 3 + Vite starter game (menu, game, and game-over scenes, art drawn in code)
- Rules files (AGENTS.md, CLAUDE.md, .cursorrules) so your AI tool follows the small-steps workflow automatically
- Six genre sequences, 60+ copy-paste prompts with a test checkpoint after each: platformer, top-down roguelite, idle/clicker, endless runner, puzzle, tower defense
- The full Fix Loop debugging guide, a publishing guide (itch.io, GitHub Pages, Netlify), and the Chunky Flat Toy visual theme

It's $29, one-time. 7-day refund if it didn't work for you, and free updates. You can play demos of games built by following the sequences on the site before deciding. Secure checkout on the site, with instant email download.

Get the Browser Game Starter Kit: https://promptforgekits.com/#pricing

That's the last email in this sequence. Thanks for reading, and good luck shipping your game.

Prompt Forge Kits
You're getting this because you asked for the free Core Keepers demo at promptforgekits.com. Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`,
};
for (const [n, d] of [['day3', day3], ['day7', day7]]) {
  fs.writeFileSync(new URL(`./${n}.html`, import.meta.url), d.html);
  fs.writeFileSync(new URL(`./${n}.txt`, import.meta.url), d.text);
}
