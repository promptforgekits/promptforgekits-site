# Daily ops check  (owner: Shop Ops)

**Uses:** your website and store pages (reading). Optional: your support inbox (read only). Without the inbox, step 6 is skipped.

## Part A. The job (send it, run it once by hand, then say "Save the process we just used as a skill called Daily ops check")

Check that customers can find, buy and use our product today. Read `BUSINESS-PROFILE.md` first.

1. **Site up:** open the homepage, product page, FAQ, and every page listed in `BUSINESS-PROFILE.md`. Each should load (no error page), show the right product name and price, and have no broken images.
2. **Links:** check every link on the homepage and product page that points to our own site or store. List any that fail.
3. **Buy button:** click it and confirm it reaches the checkout page with the right product and price. **Stop there. Do not pay.** (If the owner set up a test mode, you may complete a test-mode purchase only.)
4. **Delivery:** if there is a test download link in `BUSINESS-PROFILE.md`, check it still downloads and the file opens.
5. **Store listings:** open each store listing (if any) and confirm it loads and matches the site's facts.
6. **Inbox (if connected, read only):** any customer emails since the last run? List subject + date. Don't reply.
7. **Compare with yesterday:** read yesterday's entry in `shop-notes/CHANGELOG.md`. Note anything new or still broken.

Output: add an entry to `shop-notes/CHANGELOG.md`:
```
## YYYY-MM-DD Daily ops check
- Site: PASS/FAIL (details)
- Links: N checked, N broken (list)
- Checkout: PASS/FAIL (stopped before payment)
- Delivery: PASS/FAIL/not set up
- Listings: PASS/FAIL
- Customer mail: N new (subjects)
- Fixed (draft only): ...
- Needs owner: ... (also added to DECISIONS-NEEDED.md)
```
If anything blocks a customer, mark it `URGENT` at the top of `DECISIONS-NEEDED.md`.

## Part B. The routine (send to the owning Bot, then test it once)

> Every day at 7:00 AM {{TIME_ZONE}}, run the Daily ops check skill. Post a three-line summary here. Do not change anything live, contact anyone, or make a real purchase. If a site or tool is unavailable, report the failure instead of using old results.
