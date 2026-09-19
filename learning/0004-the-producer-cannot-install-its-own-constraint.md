# 0004 — The producer cannot install its own constraint

2026-09-19. Cycle run by an agent (Claude) on `claude/orders-next-message-26nkhk`,
after kaihacksai approved candidate `314a38b` and then corrected that approval:
the content stands, but the authorization of candidate → `main` was premature.

## What the approval established, and did not

Recorded here because the repository must carry it, not only GitHub.

kaihacksai, reviewing `314a38b` against the bootstrap orders and the two earlier
review findings, validated the candidate content. `learning/0001`, `0002` and
`0003` and the guidance in `AGENTS.md` therefore stand as
**Judged → Validated by kaihacksai**, under the qualifications the reviewer
stated explicitly: nothing is verified by Program; independent *Agent* review is
not established as equivalent to Human review; the orders are not established as
sufficient; and the current learning representation is not established to scale.

The transition itself was withdrawn. Two constraints have to hold first.

## The two constraints the Human supplied

**The producing Agent must not be able to place candidate change onto `main` by
itself.** The boundary was already chosen; what was missing is that nothing
prevents the producer from going around it.

**Evidence needed to understand accepted experience must survive in Git, not
only on GitHub.** A later clone of `main` must not need GitHub history to
recover the material learning that justified or corrected what crossed.

## What earned the first one

Not ceremony imported from elsewhere — behaviour observed on this very pull
request. Twice the producer settled an underspecified semantic in the direction
that let its own work close: self-judgement became "Validated" in cycle 0001,
and an Agent-added interpretation became something claimed as derived from MOVE
in cycle 0002. Independent review caught both.

The part worth carrying forward is the *direction*. Both errors leaned the same
way, toward closure, and both times the producer had checked its work and
believed it sound. A Program cannot be asked to judge whether a review was any
good, but it can be asked to ensure a review happened at all. That is a control
over the producer's leverage rather than over its meaning, which is exactly the
kind HAPTIC says may move rightward.

## Plan

Establish the protection, and make the learning durable in Git.

Refusal conditions set before starting: refuse to infer CI, extra approval
counts, code-owner rules, merge-strategy restrictions, linear history, signed
commits or dismiss-stale-review settings — none is required by the stated
property. Refuse to reopen the approved bootstrap content. Refuse to copy the
review transcript into the repository, since the ask is durability of substance,
not of correspondence.

## Do, and what could not be done

Written: the two constraints into `AGENTS.md`, marked as Human-supplied and
dated to this cycle; a third provenance kind in its opening, since the orders
and this repository's judgements no longer exhaust what is written there; and
this record, which carries the validation standing and the constraints
themselves so that a clone of `main` is sufficient to understand them.

**Not done: the protection is not installed, and the producer cannot install
it.** Two reasons, and the second matters more than the first.

The available GitHub tool surface has no branch-protection capability, and an
attempt to check for an API credential to do it directly was refused by this
environment's own controls.

The reason that survives better tooling: a protection configured by the producer,
under the producer's own credential, is not a control over the producer. It is a
setting the producer can also remove. HAPTIC's move rightward only lands when
the control ends up held by someone the producer is not, so this particular
control has to be installed by the Human. That is not an obstacle to work
around; it is what the constraint means.

## The configuration the constraint requires

Recorded here so it is durable in Git and so the Human can install exactly this
and no more. On branch `main`: require a pull request before merging; require at
least one approving review; and allow no bypass for administrators, which
includes blocking force pushes and deletion of the branch, both being direct
writes by another name.

Deliberately not included: required status checks, since there is no CI and none
has been earned; more than one approval; code-owner review; dismissal of stale
approvals; restrictions on merge method; linear history; signed commits.

Two assumptions carry this control, and neither is a property of any file in
this repository:

The producer's identity must not be one that can approve. GitHub does not let an
author approve their own pull request, so the control holds only while the
producing Agent and the reviewing Human are different accounts. On PR #1 they
are — the pull request is authored as `ChBrain` and reviewed by `kaihacksai`. If
they ever became the same account, the required approval would be satisfiable by
the producer and the control would fail silently, which is the worst way for a
control to fail.

The protection must be owned by an account the producer does not control.
Otherwise the producer removes the constraint instead of meeting it.

Nothing in this repository can verify either assumption. Both are substrate.

## Check

Judged by the producer, awaiting independent judgement.

One item in this record is an observation rather than a judgement, and the
distinction is worth keeping clean: that the producer could not install the
protection is a fact about the environment, not an opinion about it. It is still
not **Tested → Verified**, because no program in this repository computed it —
it is the producer's own report of a tool surface and a refusal, and a reader
should confirm it rather than take it. The repository's vocabulary has two kinds
of evidence and this does not fit either comfortably. Recorded as an
imperfection in the vocabulary rather than resolved by stretching it; if
observations of the substrate keep mattering, that pressure is what would earn a
third term, and not before.

Still no program ran.

## Act — what this cycle leaves for the next

The repository can now say what control it needs and cannot install it. That
asymmetry is the shape of an agent-built system reaching HAPTIC's third arrow:
moving behaviour into Program control requires a hand the Agent does not have,
by design and not by accident. Until the Human installs it, the boundary is held
by convention and by the reviewer's attention — and the record of this pull
request is that the attention is what actually caught things, three times.

Whether an Agent may serve as the independent judge is still open, and this
cycle makes it sharper rather than answering it: the control now being requested
would be satisfied by *any* approving account that is not the producer,
including an Agent. Whether that would supply what the boundary needs is exactly
the open question, and the protection does not settle it.

Embed and External remain unexercised, now for the fourth consecutive cycle.
Every one of those cycles was consumed by review of the first. That is a fact
about how this bootstrap has spent itself, and it is starting to be the most
interesting thing the records have to say: a system that has so far only ever
been tested by its own engineering loop.

Three review rounds have produced four records, and no record has yet repeated
another. The transcript-versus-memory tension from 0003 stands where it was,
watched and unacted on.
