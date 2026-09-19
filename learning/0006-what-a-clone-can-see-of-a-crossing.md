# 0006 — What a clone can see of a crossing

2026-09-19. Cycle run by an agent (Claude) on `claude/orders-next-message-26nkhk`,
before PR #1 crosses into `main`, in response to the Human's question: what can a
future observer holding only Git inspect about this candidate and its crossing,
keeping the durable learning records apart from the delivery evidence, and what
does the chosen merge operation preserve or destroy.

## The first program this repository has run

The merge question is structural, so it was measured rather than argued. A
scratch clone was built from the real commits and the three merge operations were
applied to the real candidate against the real base.

**Tested → Verified**, and the exact claim: with `e75eacd` as base and `a3501c4`
as candidate, a no-fast-forward merge yields 8 reachable commits, all 6 cycle
commits present, 1 commit with two parents, and a first-parent chain of length 2.
Replaying the commits onto the base yields 7 reachable commits, all 6 cycle
commits present, 0 commits with two parents, and a first-parent chain of length 7.
A squash yields 2 reachable commits, 0 of the 6 cycle commits, and a first-parent
chain of length 2, while all 6 files under `learning/` are present in the tree.

What the test computes and nothing more: the shape of the history that the
corresponding local git operations produce on these commits. It does not
establish what GitHub's server-side implementation of its three merge buttons
does; that correspondence is assumed, and a reader should not take this test as
covering it.

Reading those numbers: squash keeps the content and destroys the sequence — a
clone would hold every learning record but could no longer tell which record
arrived as which correction, and the six commit messages carrying the reasoning
for each change collapse into one. Replay keeps the sequence and destroys the
boundary — the candidate's commits become indistinguishable from commits made
directly on `main`, so nothing in Git marks that anything crossed. Only the merge
commit keeps both, and it does so by existing: its two parents are the accepted
experience and the validated candidate, which is MOVE's transition written in the
one vocabulary Git has for it.

That also makes crossings enumerable. `git log --first-parent main` lists exactly
the transitions into accepted experience and nothing else, which is what a later
reader wants to walk.

## What a Git-only observer can inspect today

The learning records and the delivery evidence are different things and the
question rightly separates them.

**Durable, and already met.** `ORDERS.md` holds the origin record. `AGENTS.md`
holds the guidance with each claim marked by its source. `ORDERS-TO-HUMAN.md`
holds the Human order, its required property, the proposed realization, the
deliberate exclusions, the assumptions it rests on and its completion.
`learning/0001` through `0005` hold the cycles, including the two wrong claims
left in place with amendments attached, and the qualifications under which the
candidate was validated. The six commit messages carry the reasoning for each
change. Because the substance was written into files rather than into commit
messages, even a squash would preserve the learning itself — which is the first
evidence that the Human's durability constraint was implemented in the right
place.

**Delivery evidence, currently on GitHub only.** That a pull request existed and
which one it was. Which commit was validated, by whom, and when. The ruleset
configuration that was in force at the crossing. None of that is in any file
here, and none of it is recoverable from a clone.

Git can carry all of it without new machinery: a merge commit's message is
written by the merging party at the moment of the crossing, which is exactly when
that evidence exists. So it goes there, and no archive, manifest or transition
log is invented to hold it.

**Deliberately not carried, and the sharpest limit of the whole arrangement.**
The reviewer's own words are not in Git. Every account here of what the reviews
found was written by the producer whose work was being judged. The Human asked
for durability of substance and explicitly refused a copied transcript, so this
is a decision rather than an oversight — but a later reader should know that the
record of each criticism is the criticised party's paraphrase, checked by the
reviewer at the time and not independently preserved. If a paraphrase is ever
found to have softened a finding, that failure is what would earn a different
arrangement.

## An observation that answers the question by accident

While testing, the working copy's `origin/main` was found to point at `806a35f`,
a root commit with no ancestor in common with today's `main` at `e75eacd`. Both
are titled "Initial commit". The ref was stale; a fetch corrected it. The first
attempt at the merge test was measuring that stale ref and produced three
identical, meaningless results, which is how it was noticed.

Two things follow, and the second is the one that matters.

A Git-only observer's view is only as current as their last fetch, and a stale
ref fails quietly — it does not look like an error, it looks like an answer. That
is worth knowing about the medium the Human's constraint relies on.

And `main` in this repository has already been replaced rather than advanced at
least once, before any of this work. A clone of today's `main` contains no trace
that `806a35f` was ever there. What that commit held is unknown here beyond a
README, and it predates `ORDERS.md`, so nothing claims it was accepted experience
in KAAL's sense — but the mechanism is exactly the one the Human's first
constraint was about, and it had already been exercised in this repository's
short life before anyone asked for protection. The ruleset now in force blocks
non-fast-forward updates and deletion, so that particular disappearance cannot
recur on `main`. This is the first time a control here has been shown to close a
hole that was not hypothetical.

## Check

The merge-shape claim is **Tested → Verified** within the limit stated above, and
is the first claim in this repository of that kind. Everything else is
**Judged by the producer, awaiting independent judgement** — including the
judgement that a merge commit's message is the right carrier for delivery
evidence, and the reading of what the stale ref implies.

The observation about `806a35f` is a read of Git's own state and is checkable by
anyone with the repository. The claim that it means `main` was replaced is an
inference, and the operation that produced it is unknown.

## Act — what this cycle leaves for the next

The merge method is now a decision with evidence behind it rather than a default,
and it should be stated once in `AGENTS.md` rather than rediscovered — but only
after it has actually been used, since nothing has yet crossed under it.

Cycle 0004 recorded that observations of the substrate fit neither kind of
evidence. This cycle produced a third instance, and also the repository's first
genuine Tested → Verified claim, which narrows the problem: what did not fit was
never observation as such, it was observation of things outside the repository
that no program here computed. The pressure toward a third term is now better
described and still unearned.

Embed and External remain unexercised, now six cycles deep. Every one has been
spent on the bootstrap crossing its own boundary for the first time. That is
defensible for exactly as long as the crossing has not happened.
