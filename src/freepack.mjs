// Free Prompt Pack content (lead magnet). Used by build.mjs for the web page and the PDF.
// Written from the Browser Game Starter Kit content (QUICKSTART, FIX-LOOP, PROMPTS, THEME).
const code = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pre = (s) => `<pre><code>${code(s)}</code></pre>`;

export const title = 'Free Prompt Pack: your first browser game in 30 minutes';
export const intro = `A free sample from the Browser Game Starter Kit by Prompt Forge Kits: one real genre prompt from the kit's Platformer sequence, plus a 30-minute walkthrough for getting your first game running with an AI coding tool.`;

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
<p><strong>Minutes 15-25: add the free genre prompt below.</strong> It's a real prompt from the kit's Platformer sequence, and it's the one that makes a platformer feel good to play.</p>
<p><strong>Minutes 25-30: add one more feature of your own, test, commit.</strong> Pick something small: a coin you can collect, a spike that restarts the level, a score in the corner. Write it as one prompt, with a "how do I test it" line at the end.</p>`,
  },
  {
    h: 'Your free genre prompt: Better jump feel (Platformer)',
    html: `<p>Paste this after step 1 works. It adds the two tricks nearly every good platformer uses.</p>${pre(`Improve jump feel in GameScene: add coyote time (100 ms after leaving a ledge you can still jump) and jump buffering (pressing jump up to 100 ms before landing still jumps). Put both values in config.js.`)}
<p><strong>Test:</strong> Run off a ledge and press jump slightly late. You still jump. Press jump a moment before you land. You jump as soon as you touch down.</p>
<p>If your scene isn't called <code>GameScene</code>, just tell the AI the right name. Commit when it passes: <code>git add -A &amp;&amp; git commit -m "jump feel"</code>.</p>`,
  },
  {
    h: 'When something breaks: the Fix Loop',
    html: `<p>AI tools are fast at writing code and also fast at breaking it. The habit that keeps you shipping:</p>${pre(`Change breaks something
  -> Try 1: paste the exact error + what you did
  -> Try 2: give more context: the file contents, what you expected
  -> Try 3: ask the AI to explain the cause BEFORE fixing
  -> Still broken? ROLL BACK to your last commit. Re-ask with a smaller step.`)}
<p>To roll back to your last save point:</p>${pre(`git checkout .     # restore changed files
git clean -fd      # remove new untracked files (careful: deletes them)`)}
<p>Rolling back costs two minutes. Spiraling costs an evening.</p>`,
  },
  {
    h: 'Make every game look like yours: the "Chunky Flat Toy" look',
    html: `<p>The kit gives all six genres one consistent style, so a game built from it looks deliberate instead of random. Four rules you can use right now in any game:</p>
<ul><li><strong>Thick dark outline</strong> (3 px, color <code>#1b1f2e</code>) around every character and pickup. Backgrounds get no outline.</li><li><strong>Flat shapes, one highlight each:</strong> a small white blob at about 50% alpha near the top-left. No gradients on characters.</li><li><strong>Color means something:</strong> cyan <code>#3ec9e6</code> is the player, red <code>#ef4f4f</code> is danger, gold <code>#ffc93c</code> is money and rewards, green <code>#5bd16b</code> is healing, purple <code>#a45ee5</code> is magic or rare.</li><li><strong>Muted backgrounds, bright actors:</strong> use soft slate and olive tones behind, so your characters always stand out.</li></ul>
<p>Paste those four rules into your AI tool's rules file and your next game inherits the look.</p>`,
  },
  {
    h: "What's next",
    html: `<p>You now have a running game, a save-point habit, and a recovery plan. The full <strong>Browser Game Starter Kit</strong> ($29, one-time) is the next step: a finished Phaser 3 + Vite starter game, rules files your AI tool reads automatically, six genre sequences with 60+ tested prompts (platformer, top-down roguelite, idle/clicker, endless runner, puzzle, tower defense), the full Fix Loop guide, and a publishing guide. It comes with a 7-day refund and free updates. Details: <a href="https://promptforgekits.com/#pricing">promptforgekits.com</a>. Store pages are still launching, so there's no rush and no pressure.</p>
<p class="note">Free Prompt Pack v1 by Prompt Forge Kits, <a href="https://promptforgekits.com">promptforgekits.com</a>. For your personal use; please don't redistribute.</p>`,
  },
];
