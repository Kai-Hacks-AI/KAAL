---
name: kaal-review
description: Write a round of review in its canonical form (the result reviewed and its exact identity, findings or converged, the Reviewer's statement of authority and independence, the findings), check that a file is one, and tell whether the rounds in a directory have converged on a given identity. Use when a result must be reviewed or you are to review one, for any result from any viewpoint or capability of KAAL.
license: MIT
compatibility: Needs Node.js 20 or later. It needs no other package.
---

# Review

Use this to report a review of a result, to check that a file is a round, or to ask whether review has converged. What this capability means to KAAL is stated by the Nodes `Skill` and `Review` in the installed KAAL: read them there, by following references from Core. This file only tells you how to do the work.

## What belongs to whom

Review owns the form of a round and the judgement that review has converged on a result. It owns nothing about when review is owed, who reviews, how a seat is assigned, what is done with findings or what follows. Whatever asks for the review decides that, and says what the result is and how to identify it; you bring that to Review as a name for the result, its exact identity, the outcome and your texts. Review is a capability and not a role: any role may use it, if the actor using it holds the authority and the independence the situation needs.

## Steps

1. **Examine the result as it stands.** Read what was realized and its evidence, not what you would have made; run what can be run. A finding is stated against what the review was asked to examine the result against, and says what must be resolved. Do not change the result you review, and do not widen the review to redesign it.
2. **Take the identity of the result as it stands now**, from whatever the asker identifies it by. A round names exactly that, so it holds only for the result it examined.
3. **Say under whose authority you hold the seat and in what independence of the one whose result it is**, in plain words. If you cannot say it truthfully, you are not the reviewer, and you do not report convergence.
4. **Write the round.** `node scripts/review.mjs write <destination> --of <Name> --identity <id> --outcome findings --reviewer <text> --findings <text>`, or `--outcome converged` with no `--findings`. `<Name>` is one capitalised word for what was reviewed (for example `Work`). A text given as `@path` is read from that file, which is the easy way to give several paragraphs. It prints the destination.
5. **Check, or ask about convergence.** `node scripts/review.mjs check <file>` exits 0 only if the file is a round. `node scripts/review.mjs converged <directory> <identity>` exits 0 only if the rounds in the directory (`01.md`, `02.md`, … with no gap) are all rounds and the latest says converged and names that identity.

## Rules

- Never write the structure by hand: the form is Review's.
- A round has exactly one line starting `Result:` and one starting `<Name>:`, so no text of yours may begin a line that way; indent a quotation of such a line. `write` refuses it and `check` rejects a file with a second.
- A round has one Reviewer part and one Findings part; your own further parts may follow, but never redefine those.
- A round is written once. `write` refuses to replace a file, and you do not edit one after it is written. A later round says whether each earlier finding stands.
- A green check is evidence and not a review. A round does not converge because a check passed.
- The statement of authority and independence is something an owner can inspect and is not proof. These scripts cannot show that it is true, and you do not make it true by writing it.
- Review adds no metadata, scores, verdicts or approvals, and knows nothing of Git, GitHub, any process or any host.

## Scripts

- `scripts/review.mjs write <destination> --of <Name> --identity <id> --outcome findings|converged --reviewer <text> [--findings <text>]`: creates the file; exit 0, 1 when it refuses (a part is empty or holds a heading line, findings missing with `findings` or given with `converged`, a bad name or identity, or the destination exists), 2 on usage.
- `scripts/review.mjs check <file>`: exit 0 only for a round, otherwise 1.
- `scripts/review.mjs converged <directory> <identity>`: exit 0 only when review has converged on exactly that identity, otherwise 1 with the reason on standard error. It writes nothing.
