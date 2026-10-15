// Blog posts. Add a new object to publish a post (newest first).
export const posts = [
  {
    slug: 'four-rules-vibe-coded-games-ship',
    title: 'The 4 rules that make vibe-coded games actually ship',
    date: '2026-10-14',
    description: 'One prompt per feature, test after every change, commit every working step, and roll back after three failed fixes. Why each rule matters when you build a game with AI.',
    html: `
<p>Building a game with an AI coding tool is fast at the start. The trouble comes around prompt 40, when the game is a black screen and the AI keeps "fixing" things that weren't broken. These four rules are the core of the Browser Game Starter Kit, and they're free to use whether or not you buy anything.</p>
<h2>1. One prompt = one feature</h2>
<p>Never ask for five things at once. A prompt like "add double jump, coins, a shop, and save games" gives the AI too many places to go wrong, and when something breaks you can't tell which part did it. Ask for one feature, small enough that you can check it in under a minute.</p>
<h2>2. Test after every change</h2>
<p>Play it. Open the browser console (F12) and look for red errors. A bug you catch right after the change that caused it takes one prompt to fix. A bug you find ten prompts later is buried under ten layers of new code.</p>
<h2>3. Commit every working step</h2>
<p>Git is your save game. Run this once at the start:</p>
<pre><code>git init
git add -A
git commit -m "starter works"</code></pre>
<p>Then, after every step that works:</p>
<pre><code>git add -A
git commit -m "player can double jump"</code></pre>
<p>Now every working version of your game is one command away.</p>
<h2>4. Three failed fixes = roll back</h2>
<p>When a change breaks something, give the AI three tries: first the exact error and what you did, then more context (file contents, what you expected), then ask it to explain the cause <em>before</em> fixing. Still broken? Roll back to your last commit and ask for a smaller step.</p>
<p>Why three? After three failed fixes the AI is usually patching its own patches. Each attempt adds code, and the bug gets buried deeper. Rolling back costs you two minutes; spiraling costs you an evening.</p>
<h2>One more: tell the AI to stay in its lane</h2>
<p>If the AI keeps changing code you didn't ask about, paste this:</p>
<pre><code>Stop. Only change what I ask. Do not refactor, rename, or reformat other code. Re-read AGENTS.md and follow the "small steps" rules.</code></pre>
<h2>Where the kit fits</h2>
<p>The kit bakes these rules into the project: <code>AGENTS.md</code>, <code>CLAUDE.md</code>, and <code>.cursorrules</code> tell your AI tool to work in small steps, every prompt in the playbook ends with a test checkpoint, and <code>FIX-LOOP.md</code> has the debug prompt templates and git commands. You can <a href="/play/">play the demos</a> built that way, or see <a href="/#inside">what's inside</a>.</p>
`,
  },
];
