# 0017 — A failure does not name the next rung

2026-09-19. Cycle run by an agent (Claude) on `claude/orders-next-message-26nkhk`,
after the Human's review of `83e465a` found three overreaches in cycle 0016 and
the skill it installed. `0016` is preserved; this record qualifies it.

Written under `skills/learning/SKILL.md`.

## The rule was inflated

The Human supplied that BASS is an instruction to the Agent: guide the move
rightward, and do not treat staying left as the safe default. `0016` wrote that
down as **a failure at a rung earns the next rung**, and put it in `AGENTS.md`
and in the skill as a promotion rule.

That is more than was supplied, and it turns BASS from the misread *never march*
into an automatic march. `ORDERS.md` says to ask for the least-rightward control
strong enough for what was actually learned. A failure while a control is in
force is evidence that the current realization may be insufficient. It does not
establish that the next named rung is the right answer: the control may have been
misapplied, scoped wrongly, aimed at a capability that was not the failing one,
or be worth removing rather than strengthening.

The narrower claim the evidence supports: repeated failure under the `AGENTS.md`
rung made *remaining there without reconsideration* unjustified, and required an
explicit BASS decision. This candidate is one such decision, and it is reviewable
as a decision rather than as a consequence. `0016`'s claim that a Skill had been
owed since cycle 0015 is the sufficiency step this repository keeps making;
what was owed was the reassessment.

The shape of the error is cycle 0003's, moved onto new ground. There an
interpretation the repository added was cited with the orders' authority. Here a
constraint the Human supplied was restated with stronger semantics than he gave
it. The authority borrowed differs; the move is identical, and it took a review
to see it both times.

Corrected in `AGENTS.md` and in the skill: staying put requires a justification
and so does moving, and the decision is recorded either way, because a decision
to stay leaves no other trace.

## The skill was placed on a vendor path

`0016` put the skill at `.claude/skills/learning/SKILL.md`. Asked which standard
to follow, the Human said the official Agent Skill — which answers the *format*,
and the producer read it as also answering the *address*.

That conflicts with a constraint this repository already holds. **Files know;
Engines carry and enforce** — Human-supplied, cycle 0008 — means a capability KAAL
holds may not depend semantically on one supplier discovering `.claude/skills`.
A different Engine would find nothing, and the knowledge would be gone with the
supplier.

The capability now lives at `skills/learning/SKILL.md`. The directory name is
BASS's own word from `ORDERS.md`, not an import. `.claude/skills/learning/SKILL.md`
remains as an Engine adapter that carries nothing and points at the real file,
which is the files-know boundary applied rather than a vendor-file architecture
copied from the repository cycle 0014 read. Another Engine takes another adapter,
or none.

## The mechanical cores were less mechanical than claimed

`0016` named five findings with a "computable core". Three of those checks
establish less than the findings they came from, and stating them as provenance
cores risks laundering a syntactic check into semantic assurance.

Whether a named judge differs from the producer is computable only where identity
has a reliable representation, and establishes that two names differ — not that
the judgement was independent. Whether cited text appears in the file cited
establishes textual presence, not that the text supports the claim drawn from it.
Whether a source called independent is present in the repository establishes
presence, not independence.

Each candidate check in the skill is now bound to exactly what it could settle.
Only validation scope survives close to its original strength: given the commit a
judge validated, whether anything claimed as validated is absent from that tree
is set membership, and it is the one worth writing first.

## Check

Judged by the producer, awaiting independent judgement.

Three findings in one review, all in the family the skill was installed to
address, and the skill was in force for this record. It caught nothing in the
drafting of `0016` because it did not yet exist; it has now been applied once,
to this record, and what it changed is that the corrections above are stated as
decisions rather than as consequences. That is one instance, self-reported, and
establishes nothing about whether the rung helps.

No program ran. The checkable claims are the file paths and the text of
`ORDERS.md`.

## Act — what this cycle leaves for the next

Every BASS decision from here is recorded, including a decision to stay, because
that is the one the last twelve cycles could not see.

If this rung fails the way the last one did, validation scope is the script to
write, and the skill now states what it would and would not establish.
