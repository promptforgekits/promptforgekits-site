// Blog posts. Add a new object to publish a post (newest first).
export const posts = [
  {
    slug: 'grow-your-game-after-v1',
    title: '7 tips for adding content to your AI-built game without breaking it',
    date: '2026-10-15',
    description: 'Make levels and enemies data instead of code, add one thing per prompt, play new content alone first, and keep your art style consistent. A free teaser from the Grow Your Game chapter.',
    html: `
<p>Your first version works. Now you want more levels, another enemy, a new weapon. This is where AI-built games usually fall apart: each new feature is another chance for the AI to rewrite something that was fine. These seven tips keep growth boring and safe. They come from the <em>Grow Your Game</em> chapter in the Browser Game Starter Kit.</p>
<h2>1. Move content into data</h2>
<p>If adding an enemy means editing five methods, the AI will eventually break one. If it means adding a row to a table, it can't. In the starter, the level is a handful of arrays (platforms, coins, enemies, spikes, goal) measured in tiles. Move them into their own file as an array of level objects, and a new level becomes one new object.</p>
<pre><code>export const LEVELS = [
  { name: 'Level 1', platforms: [...], coins: [...], enemies: [...], spikes: [...], goal: [65, 11] },
  { name: 'Level 2', platforms: [...], coins: [...], enemies: [...], spikes: [...], goal: [65, 11] }
];</code></pre>
<h2>2. One prompt, one addition</h2>
<p>One enemy, one level, one item. "Add three enemies and a boss" is five places to go wrong. Tell the AI which files it may change, and ask it to list what it changed and how to test it.</p>
<h2>3. Play new content alone first</h2>
<p>Build a tiny throwaway level with only the new enemy in it. If it reads clearly and feels fair in two minutes there, then put it in the real game.</p>
<h2>4. Give every new thing a name on screen</h2>
<p>A new enemy or item should show a short name and one line of description ("Runner: fast, avoid"). Keep the text in your config file, not scattered through scenes. Players can't enjoy content they can't read.</p>
<h2>5. New enemies need a new look, not a new color</h2>
<p>Give each enemy its own shape and speed or size so players recognize it at a glance. If your game uses color roles (red for danger, gold for money), keep them. A gold enemy reads as a coin.</p>
<h2>6. Change one balance number at a time</h2>
<p>Keep your numbers in one file. Change one, play, and only then change the next. Find the one lever that scales the whole game (enemy hp growth, speed ramp, cost growth) and tune that before the small stuff.</p>
<h2>7. Commit before and after</h2>
<p>Every addition gets a commit before you start and another when it works. If a prompt fails three times, roll back and split it into two smaller prompts.</p>
<h2>Want the whole chapter?</h2>
<p>The full <em>Grow Your Game</em> chapter in the <a href="/#pricing">Browser Game Starter Kit</a> goes further: data-table patterns for levels and enemies that we built and played in the starter, how to add weapons, items, upgrade cards and new modes, a balance and playtest loop, and copy-paste example prompts for all six genres. It is included in the kit at the same price, as <code>GROW-YOUR-GAME.md</code> and as a chapter in <code>GUIDE.pdf</code>.</p>
`,
  },
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
