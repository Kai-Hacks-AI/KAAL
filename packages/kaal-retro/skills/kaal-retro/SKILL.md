---
name: kaal-retro
description: Look back on your own work after you were corrected, got stuck or lost time, and record what you lacked to act right there, in four distinct lenses, so the owner of the place can fix it once. Use when you finished or stalled on work, were corrected or took a detour, or the work asks for a retrospective, a retro, a 4L or a lessons-learned record. Also finds retros and checks their form.
license: MIT
---

# Looking back on your own work

You are the one who acted, so you are the one who knows what you did not know. A retro is your account: what you lacked to act right here, not a meeting run for others. It decides nothing; the owner of the place decides.

## When

Write a short note at the moment you are corrected or take a detour, while the decision point is in your context: what you were deciding, what you did, what it cost. Do not wait and rebuild it later: a later reader loses the decision point. When the collector or piece of work lands, turn those notes into one retro of the whole.

## Method

Read [4l](references/4l.md). Ask each lens its own question; an item belongs in exactly one, and every entry names its `subject:`.

1. **Lacked first.** Write each observed blocker with its decision point, cost, whether it was findable at the time, and where the fix belongs (`AGENTS.md`, `Skill` or `script`). No cost observed means it is not Lacked.
2. **Learned: go outside.** Take each Lacked, and each hard decision, beyond your own repository: practice elsewhere, literature, a tool's documentation. Bring back what you found with its source. If you could not search, or found nothing, say what you searched. Do not leave it empty.
3. **Liked.** A concept that exists and held up, worth keeping, and what would be lost without it.
4. **Longed For.** Something that would be nice and never blocked you: the thing, and that you worked anyway. `None raised.` is welcome.
5. Check the lenses do not mirror: no subject twice, an address on Lacked only.

## Result

One file with front matter `id` (`<capability>/RT<n>`), `format: 4L` and `reflects: [<Change ids>]`, in the consumer's `02-learnings/retros/`. Say whose account it is. Close with `Decisions: none made, the owner decides.`

## Script

`node scripts/find-retros.mjs <directory>` lists retros with the Changes each reflects and refuses what does not fit (exit 2 when anything is refused). `node scripts/judge-retro.mjs <file>` checks form only: it says `well-formed`, `malformed` with the rule broken, or `unjudged` for a format it does not know. It cannot tell whether a retro is true.
