# True-claims check

Every public word (post, page, email, listing, newsletter) passes these checks before it goes into the approval queue. The Content assistant runs it on its own drafts; the Lead assistant spot-checks.

Paste into an assistant once and say: "Save this as a skill called True-claims check. Run it on every public draft before you add it to the queue."

---

For each sentence in the draft:
1. **Is it true today?** Check it against `BUSINESS-PROFILE.md` (Facts we are allowed to say) or the live website. If you can't find it there, remove it or mark it `[NEEDS SOURCE]`.
2. **Numbers.** Every number (price, count, size, time, percentage) must match the source exactly. No rounding up. No "thousands of users" without proof.
3. **Price rules.** Follow the price rules in `BUSINESS-PROFILE.md` (for example, no price in social posts).
4. **No borrowed fame.** No other company's name used to suggest a partnership, endorsement or "official" status. Saying a product works with a named app is fine when it's true.
5. **Original.** Not copied from another product, post or site. No other product's names, characters or art.
6. **No pressure tricks.** No fake deadlines, fake scarcity ("only 3 left") or fake discounts ("was $99").
7. **Same facts everywhere.** If the draft changes a fact (new price, new feature, new policy), list every other place that says the old fact (site pages, FAQ, store listing, pinned post) so they can be updated together.

Output: the cleaned draft, plus a short list of what you changed and why.
