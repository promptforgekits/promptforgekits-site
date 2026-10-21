# Post approved posts, with duplicate guard  (owner: Community & Launch)

**Uses:** your social account (for example X), connected in Grok Bot, to post and to read your own profile.

## Part A. The job (send it, run it once by hand, then say "Save the process we just used as a skill called Post approved posts")

Post the next approved post, exactly once.

1. Open `shop-notes/POST-QUEUE.md`. Take the first block with `Status: APPROVED` and a `Post after` time that has passed. If there is none, stop and say "nothing approved to post".
2. **Check the post before posting.** If a link is broken, a fact no longer matches `BUSINESS-PROFILE.md`, or it breaks a post rule (for example a price in a social post), don't post. Set its status to `HELD`, add the reason, and add an item to `DECISIONS-NEEDED.md`.
3. **Duplicate guard (always):**
   - Search `shop-notes/POSTED-LOG.md` for this post's ID and for its first 60 characters. If found, don't post. Set status to `POSTED` and stop.
   - Open our profile and look at the last 20 posts. If a post with the same text is already there, don't post. Log it in `POSTED-LOG.md` with its link, set status to `POSTED`, and stop.
4. Post the text exactly as approved, with the approved image and alt text, if any.
5. **After posting:** open our profile and confirm exactly one copy is there. Copy its link.
6. Add a line to `POSTED-LOG.md`: `- ID | date time (time zone) | link | first 60 characters`. Set the queue status to `POSTED`.
7. **If posting gave an error or timed out:** do NOT post again. Open the profile first. If the post is there, log it as posted. If it is not there, wait until the next run, and run the duplicate guard again before trying. After two failed tries, set `HELD` and tell the owner.
8. If you find two copies of the same post, keep the first and add a `DECISIONS-NEEDED.md` item asking to delete the extra one. Don't delete without approval unless the owner has said that cleaning up our own duplicate posts is OK.

Post at most 1 post per run, and keep at least 3 hours between posts (change these numbers if you like).

## Part B. The routine (send to the owning Bot, then test it once)

A test run does real work: if an approved post is due, it gets posted. Test when nothing is due, or when the next approved post may go out.

> Every day at {{POSTING TIMES from BUSINESS-PROFILE.md}} {{TIME_ZONE}}, run the Post approved posts skill. Post only items marked APPROVED in POST-QUEUE.md, exactly as written. Never retry a post without checking the profile first. Report what you posted with links.
