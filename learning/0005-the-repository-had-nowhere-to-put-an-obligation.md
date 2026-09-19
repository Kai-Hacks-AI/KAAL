# 0005 — The repository had nowhere to put an obligation

2026-09-19. Cycle run by an agent (Claude) on `claude/orders-next-message-26nkhk`,
after kaihacksai's review of `6f5b1d5` required that the Human action identified
in cycle 0004 become a durable order in Git rather than advice in a pull request
comment.

## Applying 0003's own criterion first

Cycle 0003 said that if a record adds nothing a previous record already said,
the cheapest fix is to amend rather than number. This is the first cycle where
that criterion actually had to be applied, so it is worth saying how it went.

Most of this cycle's content is already in 0004: the constraint, the proposed
realization, the excluded settings, the assumptions, and why the producer cannot
install the control. On that alone, this should have been an amendment.

It is a record because one thing here is not in 0004 and is not about branch
protection at all: the repository had no place to put an obligation. `learning/`
holds what was learned. `AGENTS.md` holds how to work. `ORDERS.md` holds what was
given. Nothing held what is *owed* — and an obligation that exists only in a
pull request comment is exactly the GitHub-only evidence the Human's second
constraint forbids. The bootstrap had a memory and no ledger of debts, and did
not notice until it acquired one.

## Plan

Write the order in the smallest durable form that tells a later clone what the
Agent needed the Human to do, why, and whether it had happened before PR #1
entered `main`.

Refusal conditions: refuse to build a task system, issue tracker, order schema
or approval ceremony — one concrete Human action, earned by one concrete
failure, does not justify a general mechanism. Refuse to mark the order complete
on the Agent's own report. Refuse to collapse the Human-required property into
the Agent-proposed realization, which is the distinction the previous three
reviews were all, in different ways, about.

## Do

`ORDERS-TO-HUMAN.md`, holding one order. It keeps the property, the proposed
realization and the deliberate exclusions in separate paragraphs, states the two
substrate assumptions no file here can verify, and carries a status line that
begins at PENDING and may be changed only by the Human.

`AGENTS.md` no longer says `main` *is* protected. It says it must be, and points
at the order file for whether that has happened, so an agent cannot read the
guidance and assume the control exists.

## Check

Judged by the producer, awaiting independent judgement.

The order file states its own limit rather than hiding it: until the protection
exists, nothing stops the producer from editing the status line, which is the
same gap the order is about. That is not a flaw introduced here — it is the
unprotected boundary showing up in a second place, and it disappears when the
order is carried out.

Still no program ran.

## Act — what this cycle leaves for the next

This is the first artifact in the repository whose truth depends on something
outside the repository. Every other file here is true because of what it says;
`ORDERS-TO-HUMAN.md` is true only if a setting on a hosting service matches it.
That is new, and it is the honest shape of HAPTIC's third arrow when the Agent
cannot reach the Program: the repository can describe a control and cannot be
the control.

Worth watching, not acted on: if orders to the Human accumulate faster than they
are carried out, that file becomes a wishlist and stops meaning anything. One
order is not a pattern. The condition that would earn attention is a second order
added while the first is still pending.

Embed and External remain unexercised, now for the fifth consecutive cycle, and
the reason is unchanged: every cycle since the bootstrap has been consumed by
review of the bootstrap. The next cycle after this transition should be an Embed
or External one, or the record should say what displaced it again.
