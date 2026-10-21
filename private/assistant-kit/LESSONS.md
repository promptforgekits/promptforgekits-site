# Lessons from running a business this way

These are real mistakes we made or nearly made while running our own small product business with a team of AI assistants, and the rule that fixed each one. They are already built into the templates.

1. **A post that "failed" had actually gone out.** A posting step timed out, the assistant tried again, and the same post appeared twice. Rule: after any error on a public action, look first, then retry. (Duplicate guard, steps 3 and 7.)
2. **An old fact stayed in one place.** We changed how people buy, but a pinned post still described the old way for days. Rule: when a fact changes, list every place it appears and update them together. (Fact sync check.)
3. **The website and the downloadable product drifted apart.** Fixes were made in one copy of the product but the file buyers download was older. Rule: the daily check confirms what buyers actually receive, not just what's on the site.
4. **A public page under-described the product.** Our FAQ said something wasn't included after we had added it. AI search tools quote these pages. Rule: same facts everywhere, including plain-text pages for AI tools.
5. **Test purchases could email real people.** We set this up before it could happen. Rule: in test mode, only send to the owner's own addresses; keep an allowlist.
6. **A check said "pass" because the page wasn't ready yet.** Rule: if a check fails once, re-run it before calling it a bug, and say when a result came from a re-run.
7. **Long reports hide the one thing the owner must decide.** Rule: one page, decisions at the top, each answerable with yes / no / pick one.
8. **"Nothing happened" is a real result.** Assistants are tempted to pad reports. Rule: write "none found" instead of filler, and skip the newsletter in a week with no real news.
