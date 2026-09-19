# AGENTS.md

This is the guidance an agent applies when working in KAAL. It exists at BASS
level two because guidance that lives only in a conversation is lost when the
conversation ends — not because a repository like this is supposed to have one.

Three kinds of thing are written here: what `ORDERS.md` says; constraints the
Human supplied after the orders, which carry the Human's authority but not the
orders' origin and are dated to the cycle that supplied them; and judgements
this repository has added because something was left open that had to be settled
in order to act at all. Each of the last two is marked as such, in the line that
makes the claim. This is not bookkeeping. An unmarked interpretation
becomes, a cycle or two later, indistinguishable from the order it was meant to
serve, and then gets cited with that order's authority — which has already
happened here, and is recorded in
`learning/0003-an-added-interpretation-is-not-an-order.md`. Nothing belongs here
that is neither an order nor a marked judgement serving one.

Keep it short. A bootstrap that grows a long rulebook before it has failed at
anything has stopped learning and started decorating.

## Where you work

`main` is accepted experience. You do not develop on it.

Candidate change happens on a branch and crosses into `main` through a pull
request. MOVE requires that boundary and requires it to be observable. That it
is the pull request, and that the observer is someone other than the change's
author, are this repository's judgements and not the order's words. Under them,
the boundary is where someone other than the author can see what crossed, on
what evidence and under which controls, and can judge it — see *Who may
validate*. A change that never crossed it is not yet experience KAAL operates
from.

`main` must be protected so that the producer of a change cannot place it there
alone: no direct pushes, an approving review required, and no bypass for
administrators. **Human-supplied constraint, cycle 0004.** Whether it has
actually been established is recorded in `ORDERS-TO-HUMAN.md`, which only the
Human may mark complete — do not assume the protection exists because this line
describes it. It was earned by
behaviour observed on PR #1, not imported — twice the producer settled an
underspecified semantic in the direction that let its own work close, and
independent review caught both. The control does not judge whether a review is
good; it only makes the already-chosen boundary non-bypassable, which is the
part a Program can do without being asked to judge meaning. What it rests on,
and what the repository cannot supply for itself, is in
`learning/0004-the-producer-cannot-install-its-own-constraint.md`.

A candidate crosses by squash onto a linear `main`. **Human-supplied context,
cycle 0007.** A squashed tree already tells a later reader most of what a
crossing means: with direct pushes blocked, every commit on `main` is a
crossing; `git show --stat` says which `learning/` records arrived with it; and
`ORDERS-TO-HUMAN.md` travels in the tree with the control state. A commit message may
also carry which candidate was validated and by whom, as a convenience, but
nothing may depend on it — see the constraint below. The rehearsals behind this
are in `learning/0007-what-a-squash-cannot-yield.md` and
`learning/0008-files-know-engines-carry.md`; no crossing has used either yet.

There is still no automated gate on *what* crosses — nothing computes anything
about the content of a change. That remains a real limitation rather than an
oversight, and the first change that should have been stopped and was not is
what will earn it, and will also say what it should compute.

## What you may claim

Two kinds of evidence, never conflated.

**Tested → Verified.** A program ran an explicit test. Report what that test
computes, not what you hope it implies. A green test establishes only what that
test computes, on the inputs it ran. The program computes the same result
whoever invokes it, so a producer running their own test is not a problem —
but whether the test tests the right thing is a judgement, and falls under the
rule below.

**Judged → Validated.** A human or an agent evaluated something that cannot
honestly be reduced to the test that ran. Say who judged it, and against what.

If no program ran, the claim is Judged. Do not dress judgement as computation,
and do not withhold a judgement because it is only a judgement — the failure
mode is the mislabel, not the judging. Neither kind means universally true.
Later experience may overturn either.

## Who may validate

**`ORDERS.md` does not answer this.** MOVE says a Human or Agent evaluated
something; it never says the evaluator must differ from the producer. What
follows is this repository's own judgement — proposed by an Agent in cycle
0002, relabelled in 0003 after review caught it claiming the orders' authority.
Until it is overturned it is how this repository operates, and the Human or
later experience may overturn it.

One part of it does follow from MOVE. A test is separable from whoever ran it,
because the Program computes the same result whoever invokes it, while a
judgement is not separable from whoever made it. So a producer running their own
test is unremarkable — though whether the test tests the right thing is a
judgement, and falls under this section.

The step from there to *a producer cannot validate their own claim* needs one
further premise, and that premise is a judgement rather than a reading:
validation is worth having because it can catch what the producer could not see
in their own work, and an evaluation by the producer cannot supply that, however
careful it is. If that premise is wrong, this section is wrong with it.

On that basis a claim stands in one of two states, and a record says which:

**Judged, awaiting independent judgement** — the producer has evaluated it and
nobody else has.

**Judged → Validated** — a judge other than the producer evaluated it and
accepted it, and the record names that judge and what they judged it against.

A validation attaches to the body as it stood when it was judged. It reaches
nothing added afterwards, however small, and a later record may not extend it —
which is how cycle 0008 went wrong, recorded in
`learning/0009-a-validation-does-not-reach-forward.md`.

The producer must still judge their own work: that judgement is what there is to
review, and withholding it is worse than making it. It simply does not complete
itself. Validated does not mean true either — it means a second judgement was
made, by a named judge, against something they stated, and later experience may
overturn it.

## How a change proceeds

Plan the intended change and its refusal conditions before implementation
settles the answer: say what would make you stop or back out, while it still
costs nothing to say.

Do the work without rewriting the plan to flatter the result. A plan that
turned out wrong is a finding; a plan quietly edited to match the outcome
destroys the finding.

Check what the available evidence actually demonstrates, and state where it
falls short of what the change claims.

Act by preserving what was learned in `learning/` — including failed
hypotheses, limitations, corrections and changed interpretations. A cycle that
produced nothing worth writing down is a cycle worth questioning.

Files know; Engines carry and enforce. **Human-supplied constraint, cycle
0008.** Anything KAAL needs as reusable knowledge after an accepted delivery must
be recoverable from the files alone. Git may version and transport them and
GitHub may enforce the boundary, but neither commit topology nor commit messages
may be the sole store of anything. A useful commit message is fine; a commit
message that is the only place something lives is not.

When a cycle states *why* a choice is required, treat that sentence as the
weakest thing in the cycle. Seven findings so far have landed on exactly it — the
standing of a claim, the source of a rule, the premise under a conclusion, the
carrier for knowledge, the scope of a validation, the sufficiency of a reading
rule, and the attribution of paraphrased evidence — and none on the choices
themselves. This is guidance and computes nothing. Applied prospectively once,
it caught one thing and missed two in the same record, so nothing establishes
that it helps and something now establishes it is not sufficient alone.

What justifies or corrects accepted experience must survive in a clone of
`main`. **Human-supplied constraint, cycle 0004.** GitHub may host the pull
request, the review and the controls, but a later reader holding only the
repository must be able to recover the material learning that justified what
crossed and the corrections that shaped it. This is a durability property, not a
call for a schema or for review transcripts copied in: write the substance into
the record, in prose, and it is met.

## Adding control

When experience teaches something, ask where that learning belongs. Keep it
with human judgement while meaning is still required. Move repeated human
correction into agent capability once it is earned by repetition, not by
anticipation. Move agent behaviour into program control once it is understood
well enough to be computed. The goal is stronger, cheaper, more deterministic
control — never automation for its own sake, and never pretending that
judgement is computation.

The same restraint governs this repository's own machinery. Bare, AGENTS.md,
Skill, Script is a ladder, not a march. After each success or failure, ask for
the least-rightward control strong enough for what was actually learned.

Do not add findings schemas, bug ledgers, roadmap grammars, release machinery,
evidence formats, review ceremonies or mutation rules because a system like
this usually acquires them. Let failures earn them. If one of the orders cannot
perceive or control a failure you hit, that is evidence about the orders
themselves, and it belongs in `learning/` said plainly.

## Meeting the world

Engineering KAAL and embedding it are one loop: what survives separation from
the context that built it is the real measure of it. Exposure to repositories
and contexts KAAL did not construct exists because an internally coherent
learning system can still be wrong about the world. Exercise both early rather
than waiting for the engine to look finished, and remember that observing
something external does not make it KAAL's to own.
