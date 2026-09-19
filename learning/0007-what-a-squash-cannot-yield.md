# 0007 — What a squash cannot yield

2026-09-19. Cycle run by an agent (Claude) on `claude/orders-next-message-26nkhk`,
after the Human's review of `d085e14` supplied operating context cycle 0006 did
not have: rebase-then-squash is the normal merge discipline here, deliberately.

## The correction

Cycle 0006 concluded that only a merge commit preserves what a crossing needs,
"which is MOVE's transition written in the one vocabulary Git has for it." The
measurements behind that sentence stand. The conclusion does not.

It rested on an unexamined premise: that the candidate's engineering commit
chronology is part of the durable experience MOVE requires. Nothing established
that. The Human's constraint in cycle 0004 was that the **material learning**
needed to understand accepted experience must survive in Git — not that every
intermediate commit must. This candidate is itself the counterexample: the wrong
claims, their corrections, the provenance marks, the Human order and the merge
measurements are all tracked *content*. A squash discards the branch's
implementation chronology and leaves every one of them intact.

This is the same family of error as cycle 0003, on a different surface. There, an
interpretation the repository had added was promoted into the authority of an
order. Here, a premise the producer had assumed was promoted into a requirement.
Both times the promoted thing happened to be one that made the producer's own
answer correct, and both times an independent reviewer had to say so. Three
findings now, all of the same shape: the producer's account of *why* something
must be true is where it goes wrong, not its account of what is true.

0006 is not rewritten. Its measurements are evidence and remain exactly as
recorded; a note appended there points here.

## The requirement, narrowed

After a squashed crossing, a Git-only observer needs to identify the accepted
delivery as a crossing, know which candidate was independently validated, know
under what qualifications and control state, and know what learning belongs to
it. Without GitHub, without rewriting records, without new machinery.

Most of that a squashed tree already yields, and the useful finding of this cycle
is how little is actually missing.

**Crossings are enumerable without any marking.** With the ruleset in force,
direct pushes to `main` are blocked, so every commit on `main` arrives through
the boundary. `git log main` is therefore the list of crossings. That is a
property of the control rather than of Git, it holds only while the control
holds, and it does not hold for `e75eacd`, which predates it.

**What learning arrived with a crossing comes from the diff.** `git show --stat`
on the squash commit lists exactly the records that entered with it. No trailer,
no index, nothing to maintain.

**The control state comes from the tree.** `ORDERS-TO-HUMAN.md` travels with the
commit, carrying the required property, the realization, the exclusions, the
assumptions and the ruleset as independently read.

Two facts remain, and they are the only two, because they are facts about a
judgement rather than about content — no tree can contain them:

**Which candidate was independently validated**, and **by whom, when, and under
what qualification.**

So the minimal durable representation is the squash commit's own message with two
trailers, and nothing else:

    KAAL-Candidate: <full sha> (<branch>)
    KAAL-Validated-By: <judge>, <date>, <what they judged it against and what
    the judgement explicitly does not establish>

These two names are not a schema and nothing should treat them as one. They are
the two questions this crossing could not answer without them. A later crossing
that needs something different should carry something different.

## Demonstration

Rehearsed on the real commits in a scratch clone: the candidate squashed onto
`e75eacd` with the message above, then queried as a Git-only observer would.

**Tested → Verified**, and the exact claim: after that squash, `git log main`
lists the crossing; `git log -1 --format=%B` yields both trailers; `git show
--stat` lists the `learning/` records that arrived; and `git show
main:ORDERS-TO-HUMAN.md` yields the order's status and the ruleset in force. All
four questions were answered from the repository alone, with no reference to
GitHub.

What the test computes and nothing more: that these four queries return those
answers on this candidate under a local squash. It does not establish that
GitHub's squash button produces an identical commit, and it does not establish
that the representation suits any crossing but this one.

One measured limit worth stating plainly. The candidate SHA named in the trailer
resolves in a clone only while the candidate branch still exists on the remote;
it is never reachable from a squashed `main`. So the trailer is an identifier
whose object may or may not be present. That is acceptable, because the
requirement is that the delivery be identifiable and its qualifications durable,
not that the candidate's commits be replayable — which is the very premise this
cycle removed. A reader who has the object can check; a reader who does not still
knows what was judged, by whom, and against what.

## Check

The four-query result is Tested → Verified within the limit above. Everything
else here is **Judged by the producer, awaiting independent judgement** —
including the judgement that two trailers are the right two, which is precisely
the kind of "why this is sufficient" claim that the last three findings all
landed on.

## Act — what this cycle leaves for the next

Nothing has crossed yet. The representation is rehearsed, not used, and no line
in `AGENTS.md` should harden further until a real crossing has exercised it.

The producer has now been wrong three times about the justification for its own
answers and not yet once about the answers themselves. That pattern is worth
more than any of the three findings separately, and it argues for something
narrow: when a cycle states *why* a choice is required, that sentence deserves
more suspicion than the choice. No mechanism is proposed for it — a fourth
instance would be the point at which to ask for one, and the shape of it should
come from that instance rather than from this observation.

Embed and External remain unexercised, seven cycles deep.

---

## Note appended at cycle 0008 — 2026-09-19

The Tested → Verified result above stands exactly as recorded. The product
conclusion drawn from it does not.

This record correctly established that implementation chronology is not
knowledge, and then placed the two remaining facts in commit trailers — the same
mistake moved from one Engine store to another. The Human has since supplied the
boundary: knowledge must be recoverable from the files alone, with Git and
GitHub as Engine that may be swapped. The four-query rehearsal proves the Git
implementation works and, in using `git log -1 --format=%B`, exhibits the
coupling it does not escape.

The trailers are not withdrawn; they are demoted to convenience. What knowledge
this delivery actually contains, and where it now lives, is in
`learning/0008-files-know-engines-carry.md`.
