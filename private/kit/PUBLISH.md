# Publishing Your Game

Three ways to put your game online, all free. itch.io is best for players and feedback; GitHub Pages and Netlify are best for a simple link.

## Step 0: Build and test (always)

```bash
npm run build      # creates dist/
npm run preview    # open the URL it prints and play a full run
```
Checklist before uploading:
- [ ] Menu -> game -> game over -> restart works
- [ ] No red errors in the browser console (F12)
- [ ] `vite.config.js` still has `base: './'` (needed for itch.io and GitHub Pages)
- [ ] Page title in `index.html` is your game's name
- [ ] You own or have a license for every image/sound

## Option A: itch.io (recommended)

1. **Zip the build.** Zip the *contents* of `dist/`, so `index.html` sits at the top level of the zip, not inside a `dist` folder.
   - Mac: open `dist/`, select all files, right-click > Compress.
   - Windows: open `dist/`, select all, right-click > Send to > Compressed (zipped) folder.
   - Terminal: `cd dist && zip -r ../game.zip . && cd ..`
2. Create a free account at **itch.io**, then go to **Dashboard > Create new project**.
3. Fill in:
   - **Title**, **Project URL**, short **description**.
   - **Kind of project: HTML** (important).
4. **Uploads:** upload `game.zip` and tick **"This file will be played in the browser"**.
5. **Embed options:**
   - Viewport: 800 x 450 (the starter's size) or larger; tick **"Mobile friendly"** if you support touch, and **"Fullscreen button"**.
   - Tick **"Automatically start on page load"** only if your game has a menu (the starter does).
6. Add a **cover image** (630 x 500) and 3+ **screenshots**. Pages with screenshots get far more clicks.
7. **Genre + tags** (e.g. platformer, pixel-art, short, made-with-phaser).
8. **Visibility:** start with **Draft**, click "View page", play it. Then set to **Public** and **Save**.

Updating: build again, re-zip, upload the new zip and delete the old one (or use itch's `butler` CLI later).

Troubleshooting: blank game on itch = `index.html` is not at the zip root, or asset paths start with `/`.

## Option B: GitHub Pages

1. Create a GitHub account and a new **public** repository (e.g. `my-game`).
2. Push your project:
   ```bash
   git remote add origin https://github.com/YOURNAME/my-game.git
   git branch -M main
   git push -u origin main
   ```
3. Add the automatic deploy workflow. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: dist
         - id: deployment
           uses: actions/deploy-pages@v4
   ```
4. On GitHub: **Settings > Pages > Build and deployment > Source: GitHub Actions**.
5. Commit and push the workflow:
   ```bash
   git add -A && git commit -m "deploy to pages" && git push
   ```
6. Watch the **Actions** tab. When it's green, your game is at `https://YOURNAME.github.io/my-game/`.

Every future `git push` redeploys automatically.

## Option C: Netlify

**Fastest (drag and drop):**
1. Run `npm run build`.
2. Go to **app.netlify.com/drop** (log in or sign up).
3. Drag the **`dist` folder** onto the page. You get a live URL in seconds.
4. Rename the site under **Site configuration > Change site name**.

**Auto-deploy from GitHub:**
1. Push your project to GitHub (Option B, step 2).
2. Netlify: **Add new site > Import an existing project > GitHub**, pick the repo.
3. Build command: `npm run build`. Publish directory: `dist`. Deploy.
4. Every `git push` now redeploys.

## After you publish

- Post your link with a GIF of gameplay (ScreenToGif / Kap / OBS) on X, Reddit (r/WebGames, r/IndieDev, r/playmygame), and itch.io's community.
- Join a game jam on itch.io: deadlines make you ship.
- Ask 3 people to play while you watch silently. Fix what confuses them first.
