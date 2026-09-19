# AGENTS.md

This is the guidance an agent applies when working in KAAL. It exists at BASS
level two because guidance that lives only in a conversation is lost when the
conversation ends — not because a repository like this is supposed to have one.
Every line below traces to `ORDERS.md`. Anything that cannot trace there does
not belong here.

Keep it short. A bootstrap that grows a long rulebook before it has failed at
anything has stopped learning and started decorating.

## Where you work

`main` is accepted experience. You do not develop on it.

Candidate change happens on a branch and crosses into `main` through a pull
request. The pull request is the observable integration boundary: it is where
someone other than the change's author can see what crossed, on what evidence,
and under which controls, and where they can judge it — see *Who may validate*. A change that never crossed it is not yet experience
KAAL operates from.

There is no automated gate on that boundary yet. That is a real limitation, not
an oversight — see `learning/0001-bootstrap.md`. When a failure arrives that a
program could have caught, that failure earns the gate.

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

A test is separable from whoever ran it; a judgement is not separable from
whoever made it. That is where the parallel between the two arrows breaks, and
it decides what completes the second one.

The producer of a change must judge their own work. That judgement is what
there is to review, and withholding it is worse than making it. But producing a
judgement does not complete it: Validated is not a property a judgement
acquires by being written down, and a producer cannot confer it on their own
claim.

So a claim stands in one of two states, and a record says which:

**Judged, awaiting independent judgement** — the producer has evaluated it and
nobody else has.

**Judged → Validated** — a judge other than the producer evaluated it and
accepted it, and the record names that judge and what they judged it against.

This is what MOVE's boundary is for. It is not paperwork around a change; it is
the place where someone other than the author judges what crossed, which is the
only operation that moves a claim from the first state to the second. Validated
still does not mean true. It means a second judgement was made, by a named
judge, against something they stated — and later experience may overturn it.

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
