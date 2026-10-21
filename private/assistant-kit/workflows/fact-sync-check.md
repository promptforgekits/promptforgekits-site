# Fact sync check  (owner: Shop Ops, weekly)

**Uses:** your website, store listings and social profile (reading). Without access to email templates, that row says "not checked".

## Part A. The job (send it, run it once by hand, then say "Save the process we just used as a skill called Fact sync check")

Make sure the same facts appear everywhere. Old facts left in one place confuse buyers (and AI search tools that read our pages).

1. From `BUSINESS-PROFILE.md`, list the key facts: product name, price, what's inside, refund policy, license line, support email.
2. Check each fact on: homepage, product page, FAQ, checkout page text, every store listing, the pinned social post and bio, the welcome/purchase emails (if you can read the templates), and any `llms.txt` or "about" page.
3. Make a table: fact / where it's wrong / what it says now / what it should say.

Output: the table in `shop-notes/CHANGELOG.md`, and one item in `DECISIONS-NEEDED.md` listing every fix needed (draft fixes for pages you can edit locally). Don't change anything live.

## Part B. The routine (send to the owning Bot, then test it once)

> Every Thursday at 8:00 AM {{TIME_ZONE}}, run the Fact sync check skill. Post the table here. Don't change anything live.
