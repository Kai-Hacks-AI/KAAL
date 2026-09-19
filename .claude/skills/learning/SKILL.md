---
name: learning
description: Use this skill whenever writing or amending a record in KAAL's learning/ directory, or when a cycle is about to state what it established. It carries the record-writing discipline that AGENTS.md alone failed to enforce - marking each claim's source, stating standing honestly, saying what the evidence does not establish, and stopping rather than guessing when a sufficiency sentence is the only thing holding a conclusion up. Triggers - starting a PDCA cycle, writing a learning record, appending a correction to an earlier record, or claiming that anything in this repository has been validated.
---

# Writing a learning record

BASS defines a Skill as a bounded capability with procedure, evidence standard,
outputs, stopping conditions and limitations. This file is that, for the one
capability KAAL uses every cycle.

**Why this rung exists.** Bare model capability failed at cycle 0001. Guidance in
`AGENTS.md` was the answer, and it failed too: the line written to catch this
exact failure was in force and applied when four more instances arrived in a
single review. A failure at a rung earns the next rung — **Human-supplied
context, cycle 0016** — so this is a Skill. A script belongs inside a skill, once
the skill shows which part is deterministic enough to compute.

## Procedure

Before the work, write the refusal conditions: what would make you stop or back
out. It costs nothing before the result exists and it is a finding afterwards.

While writing, for every claim:

- **Mark its source.** An order, a Human-supplied constraint, or this
  repository's own judgement. Never cite `ORDERS.md` without checking its text —
  `grep` it. Cycle 0003 happened because an interpretation was cited with the
  order's authority.
- **State its standing.** *Judged, awaiting independent judgement*, or *Judged →
  Validated* naming the judge, the body they judged and what they judged it
  against. A validation attaches to the body as it stood when judged and reaches
  nothing added since.
- **Say what it does not establish.** Especially for a `Tested → Verified`
  result: what the program computed, on what inputs, and what it does not cover.

When correcting an earlier record, append a marked note to that record and point
forward. Never edit its body. The wrong earlier reading is the evidence.

Before finishing, find every sentence of the form *this is sufficient because…*
and treat it as the weakest thing you wrote. Twelve findings have landed there
and none on the choices underneath.

## Evidence standard

A program ran, or it did not. If it did not, the claim is Judged. An observation
of the environment is neither, and says so rather than being promoted.

An account of what someone outside this repository said is the producer's
paraphrase, and cannot be called independent evidence.

## Outputs

One numbered prose record in `learning/`, plus an appended note on any earlier
record whose claims it supersedes. No template, no schema, no required sections
beyond what the cycle actually has.

## Stopping conditions

Stop and ask rather than write, when:

- the only thing holding a conclusion up is a sufficiency sentence;
- a validation is about to be claimed and no judge other than the producer can
  be named for that exact body;
- the orders are about to be cited for something their text does not say;
- the record would add nothing a previous record already says — amend instead;
- a mechanism is about to be added because an observer recommended it, a
  neighbouring repository has one, or it is the shape such systems usually take.

## Limitations

This computes nothing. It is applied by the producer to the producer's own work,
which is the party worst placed to apply it.

The previous rung failed in exactly this way, and nothing establishes that this
one works. If it fails the same way, the next move is a script inside this skill,
and five of the twelve findings have a computable core to start from: whether a
named judge exists and differs from the producer, whether cited text appears in
the file cited, whether a claimed validation covers only the judged body, whether
a claim exists in a file rather than only in commit metadata, and whether a
source called independent is present in the repository at all.
