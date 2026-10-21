# Start here

Do these steps in order. Each step ends with a check, so you know it worked before you move on.

**How Grok Bot works, in one paragraph.** A Bot is an AI assistant with a name, a job and its own conversation. You set it up by messaging it: give it its job and ask it to remember. All your Bots share one cloud computer, so they can read and write the same files. A *skill* is a saved way of doing a task. A *routine* tells one Bot when to run a job. Apps you connect (email, X and so on) are available to all your Bots, which is why the approval rules matter: they decide what each Bot may do with that access.

## Step 1. Fill in your business profile (15 min)
Open `BUSINESS-PROFILE.md` and fill in every line marked `{{...}}`. Plain sentences are fine. Write "unknown" rather than guessing.

**Check:** a new helper could read this page and know what you sell, to whom, and what they must never say.

## Step 2. Create the first Bot: Shop Ops (15 min)
1. In Grok Bot, create a new Bot and name it **Shop Ops**.
2. Send it the whole text of `bots/shop-ops.md` as its first message.
3. Send the text of `safety/APPROVAL-RULES.md` and add: "Remember these rules for every task, including routines."
4. Send your filled-in `BUSINESS-PROFILE.md` and add: "Save this as /workspace/shop-notes/BUSINESS-PROFILE.md. Read it before every task."

**Check:** ask Shop Ops "What are you not allowed to do without my OK?" It should list posting, sending, publishing or deploying, spending, deleting, and replying to customers.

## Step 3. Set up the shared notebooks (5 min)
Send Shop Ops:

> Create the folder /workspace/shop-notes if it doesn't exist. In it, create these files with the text I send next: CHANGELOG.md, FEEDBACK.md, POST-QUEUE.md, POSTED-LOG.md, IDEAS.md, DECISIONS-NEEDED.md. Also create the folders reports and newsletter.

Then send each file from `notes-templates/`, one message per file, starting with its name.

**Check:** ask "List the files in /workspace/shop-notes." You should see the profile and all six notebooks.

## Step 4. Run the daily ops check once by hand (15 min)
Send Part A of `workflows/daily-ops-check.md` and add: "Do this now, once." Read the result. If it got something wrong, correct it and fix `BUSINESS-PROFILE.md`.

When you're happy, send: "Save the process we just used as a skill called Daily ops check." Then send Part B to create the routine.

**Check:** ask "When does the Daily ops check routine run next, and in which time zone?"

## Step 5. Connect apps only when a job needs them
Each workflow lists what it uses. When a Bot needs an app, it asks you or shows a connect card. Finish the sign-in yourself.
- **Never paste passwords, API keys or one-time codes into a chat.** For sign-ins, take over the Bot's computer for that one step, or use the secure secret request when Grok Bot offers one.
- Connected apps and sign-ins are shared by all your Bots. Only connect what the team needs.

## Step 6. Add the other Bots (15 min each)
Repeat Step 2 for `bots/content.md`, `bots/community-launch.md` and `bots/lead.md`. Then run each of their workflows once by hand (like Step 4) before giving it a schedule.

| Bot | Workflows |
|---|---|
| Shop Ops | `daily-ops-check.md` (done), `fact-sync-check.md` |
| Content | `weekly-newsletter-draft.md` |
| Community & Launch | `feedback-watch.md`, `post-approved-posts.md` |
| Lead | `weekly-report.md`, `launch-week.md` (only when you launch something) |

**Rule of thumb:** a job runs by hand at least once, and you're happy with it, before it gets a schedule. A routine's test run does real work, so test with safe inputs.

## Step 7. Your daily 10 minutes
1. Open `/workspace/shop-notes/DECISIONS-NEEDED.md` (or ask Lead to show it). Answer each item, or say "skip".
2. Open `POST-QUEUE.md`. Change `DRAFT` to `APPROVED` on posts you like, after editing them if you want. Or tell Community & Launch: "Approve P-004 as written."
3. Skim today's entry in `CHANGELOG.md`.

Everything else is drafts waiting for you.

## First week
| Day | Do |
|---|---|
| 1 | Steps 1-4 (Shop Ops running) |
| 2 | Add Content. Ask for 5 post drafts. Approve 2. |
| 3 | Add Community & Launch. Run the feedback watch by hand. Watch it post one approved post. |
| 4 | Add Lead. Ask for a first weekly report by hand. |
| 5-7 | Let the routines run. Read, approve and correct. Make lasting corrections stick with "From now on, ..." and "Remember this." |

## Working as a team
- Each Bot owns its own jobs. When one needs another, it can message that Bot directly, or you can start a group chat with several Bots and say who owns which step.
- One owner per step. Two Bots doing the same job creates duplicates.

## If something goes wrong
- **A Bot did something you didn't want:** send "Stop now" if it's still working. Then tell it exactly what was wrong and say "From now on, never do X without asking me. Remember this." Check that `APPROVAL-RULES.md` covers it.
- **A routine keeps failing:** ask its Bot "Run the job now and show me where it fails." Don't let it retry public actions without checking first (see `LESSONS.md`, lesson 1).
- **To pause everything:** open each Bot's details and pause its routines, or ask the Bot to pause them. Deleting a routine can't be undone, so pause first.
