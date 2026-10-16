// Free Prompt Pack content (lead magnet). Used by build.mjs for the web page and the PDF.
// Written from the Browser Game Starter Kit content (QUICKSTART, FIX-LOOP, PROMPTS, THEME).
const code = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pre = (s) => `<pre><code>${code(s)}</code></pre>`;

export const title = 'Free Core Keepers demo: teaser guide';
export const intro = `A short teaser from the Browser Game Starter Kit by Prompt Forge Kits: how the approach works, plus a 30-minute walkthrough for getting your first game running with an AI coding tool. Your free Core Keepers tower defense demo link is in your welcome email.`;

export const sections = [
  {
    h: 'Before you start (5 minutes)',
    html: `<p>You need three things: <a href="https://nodejs.org">Node.js 18+</a> (LTS), <a href="https://git-scm.com">Git</a>, and an AI coding tool that opens a local folder (Cursor, Claude Code, Windsurf, or VS Code + Copilot). That's it. The game is drawn in code, so you don't need any art files.</p>`,
  },
  {
    h: 'The 4 rules that make vibe-coded games actually ship',
    html: `<ol><li><strong>One prompt = one feature.</strong> Never ask for five things at once.</li><li><strong>Test after every change.</strong> Play it. Open the browser console (F12) and look for red errors.</li><li><strong>Commit every working step.</strong> Git is your save game.</li><li><strong>Three failed fixes = roll back.</strong> Then ask for a smaller step.</li></ol>`,
  },
  {
    h: 'The approach in one minute',
    html: `<p>The kit doesn't ask an AI for a whole game in one go. Each of its six genre sequences is a numbered series of small prompts, with a test checkpoint after each one, built on a working Phaser 3 starter, rules files your AI tool reads automatically, and one consistent visual theme. The Core Keepers demo you got by email was built exactly this way. The full prompts, the complete debugging routine and the visual theme stay in the paid kit.</p>`,
  },
  {
    h: 'First game in 30 minutes',
    html: `<p><strong>Minutes 0-5: scaffold.</strong> In a terminal, create a Vite project and add Phaser 3:</p>${pre(`npm create vite@latest my-first-game -- --template vanilla
cd my-first-game
npm install
npm install phaser
git init && git add -A && git commit -m "empty project"`)}
<p>Open the <code>my-first-game</code> folder in your AI tool.</p>
<p><strong>Minutes 5-10: give the AI its rules, then build a tiny platformer.</strong> Paste this as your first message:</p>${pre(`You are helping me build a small browser game with Phaser 3 and Vite. Rules:
- One feature per step. Never change more than I ask for.
- Keep it small: a single scene is fine for now, split files only when a file passes ~200 lines.
- Put every tunable number (speed, gravity, jump power) in a config.js file as named constants.
- Draw all graphics in code with Phaser Graphics (rectangles, circles). No image files.
- After each change, tell me exactly how to test it in 1-2 sentences.
- If I paste an error, explain the cause in one sentence before you fix it.

Step 1: replace the starter content with a Phaser 3 game, 800x450, arcade physics, gravity 900. Draw a cyan circle player, an olive ground strip along the bottom, and 3 floating slate platforms. Arrow keys move left/right, Space jumps (only when standing on something). Don't add anything else.`)}
<p><strong>Minutes 10-15: run it and commit.</strong></p>${pre(`npm run dev`)}
<p>Open the link Vite prints. You should see a circle you can move and jump. If it works, save your progress:</p>${pre(`git add -A && git commit -m "step 1: player moves and jumps"`)}
<p><strong>Minutes 15-25: tweak the feel.</strong> Change the numbers in <code>config.js</code> (speed, gravity, jump power), reload, and see what changes. Commit the version you like best.</p>
<p><strong>Minutes 25-30: add one more feature of your own, test, commit.</strong> Pick something small: a coin you can collect, a spike that restarts the level, a score in the corner. Write it as one prompt, with a "how do I test it" line at the end.</p>`,
  },
  {
    h: "What's next",
    html: `<p>You now have a running game, and a save-point habit. The full <strong>Browser Game Starter Kit</strong> ($29, one-time) is the next step: a finished Phaser 3 + Vite starter game, rules files your AI tool reads automatically, six genre sequences with 60+ tested prompts (platformer, top-down roguelite, idle/clicker, endless runner, puzzle, tower defense), the full Fix Loop guide, and a publishing guide. It comes with a 7-day refund (if the kit didn't work for you) and free updates. Details: <a href="https://promptforgekits.com/#pricing">promptforgekits.com</a>. Buy it directly at <a href="https://promptforgekits.com/#pricing">promptforgekits.com</a>, no rush and no pressure.</p>
<p class="note">Free teaser v2 by Prompt Forge Kits, <a href="https://promptforgekits.com">promptforgekits.com</a>. For your personal use; please don't redistribute.</p>`,
  },
];
