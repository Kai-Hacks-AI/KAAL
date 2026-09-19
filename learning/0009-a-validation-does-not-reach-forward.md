# 0009 — A validation does not reach forward

2026-09-19. Cycle run by an agent (Claude) on `claude/orders-next-message-26nkhk`,
after the Human's review of `2a5516e` found the standing claimed in `0008` to be
historically false.

## The failure

`0008`, under "The standing of this accepted body", said that `learning/0001`
through `0007` and the rest of the tree "were validated by kaihacksai on
2026-09-19" and therefore stand **Judged → Validated**.

That is false, and checkable from the repository itself. The approval was given
to candidate `a3501c4`. `0006` arrived in `d085e14`, `0007` in `7a9684f`, `0008`
in `e62a1c1` and `2a5516e` — all after it. The judge then requested changes on
`0006` and again on `0007`. A validation of one candidate cannot reach forward to
records that did not exist when it was made, still less to records the same judge
subsequently rejected.

This is cycle `0001`'s failure returning in sharper form. There the producer
declared its own cycle validated outright. Here it took a real validation of an
earlier body and stretched it over its current work — which is harder for a cold
reader to catch, because a real judge, a real date and a real set of
qualifications are named. Everything about the sentence looks like provenance
done properly except its scope.

The Human's file-only boundary makes this worse rather than lighter. If the files
are the brain, a cold reader has nothing but them, and telling that reader the
knowledge was validated when the validating event predates the knowledge is the
one lie the whole arrangement cannot absorb.

## The truthful standing, verified against the repository

**Validated.** Everything present in the tree at candidate `a3501c4`: `ORDERS.md`;
`README.md`; `AGENTS.md` as it stood then; `ORDERS-TO-HUMAN.md` as it stood then,
through its ESTABLISHED status and not including the ruleset paragraph;
`learning/README.md`; and `learning/0001` through `0005` with every amendment and
note they carried at that point. Validated by **kaihacksai** on 2026-09-19, an
independent judge who is not the producer, judging against the bootstrap orders
and the findings raised in the review of that candidate — under the exclusions he
stated: nothing verified by Program for semantic correctness, independent Agent
review not established as equivalent to Human review, the orders not established
as sufficient, and the learning representation not established to scale.

**Judged by the producer, awaiting independent judgement.** Everything added
after `a3501c4`: `learning/0006`, `0007`, `0008` and this record; the notes
appended to `0006` and `0007`; the ruleset paragraph in `ORDERS-TO-HUMAN.md`; and
the three paragraphs added to `AGENTS.md` at cycles 0007 and 0008 — the squash
crossing paragraph, the files-know constraint and the line about doubting
why-sentences. Two of those bodies were met with changes requested rather than
validation.

One distinction inside that group. The constraints themselves are the Human's and
carry his authority: that rebase-then-squash is the merge discipline, and that
files know while Engines carry. This repository's *rendering* of them is the
producer's and is not validated. The constraint is his; the wording is not.

**Tested → Verified, and independent of both.** The merge-shape measurement in
`0006` and the files-only recovery in `0008` keep their bounded Program standing
whatever happens to the producer's interpretation of them. A program ran and
computed what those records say it computed. What was concluded from it is a
separate claim with a separate standing, and in `0006`'s case the conclusion was
already withdrawn while the measurement stood.

`0008` is not rewritten. Its false claim stays as written, with a note appended
pointing here, because a record of this failure that had been tidied away would
be worth less than the failure.

## What it says about the pattern, and what it does not

This is the fifth instance of the producer being wrong about the standing or the
justification of its own claims rather than about the claims themselves.

It establishes nothing about the guidance added at `0008` for exactly this
failure mode. That line was written into `AGENTS.md` in the same commit as the
over-promotion it was meant to catch, so it was never in force while the record
was being drafted and has not been applied once. It cannot be counted as evidence
that the guidance works, and it cannot be counted as evidence that it fails
either. Its first real test is the next cycle, and this record makes no claim
about the outcome.

What the instance does establish is narrower and worth stating: two of the five
failures were specifically about **scope of validation** — `0001` claimed the
producer's own judgement completed itself, `0008` claimed an earlier judgement
extended forward. That is a repetition of one kind, not of the general pattern,
and it is the kind that a single sentence of guidance can actually address. So
one goes into `AGENTS.md`, phrased as a restriction on the producer rather than
as a capability: a validation attaches to the body as it stood when it was
judged, and reaches nothing added afterwards.

## Check

Judged by the producer, awaiting independent judgement — including the statement
of truthful standing above, which is once again a claim about standing made by
the party whose standing it describes, and which has now been wrong twice. A
cold reader should treat the enumeration as the producer's best account, check it
against the tree, and give it no more weight than that until a judge who is not
the producer says otherwise.

## Act — what this cycle leaves for the next

The next cycle is the first in which the `0008` guidance is in force before any
work is written. Whatever happens there is the first evidence about it, and
should be recorded as such whether it helps or not.

Embed and External remain unexercised, nine cycles deep. Every cycle so far has
been spent on a single candidate's attempt to cross a boundary for the first
time. That is no longer merely an unpaid obligation; it is the most consistent
fact about this bootstrap, and a system that has only ever been examined by the
loop that built it should expect its first contact with anything external to go
badly in ways none of these nine records can predict.
