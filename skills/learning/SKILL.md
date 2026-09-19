---
name: learning
description: Use this skill when a cycle has produced an experience and KAAL has to determine what it taught - what the evidence establishes and what it does not, what standing that knowledge has, where the learning belongs under HAPTIC, and which rung it earns under BASS. This is the act of learning, not the act of writing it down; the record is the artefact, and it will faithfully preserve a wrong conclusion. Triggers - a cycle ending, a review finding, an experiment returning, an External or Embed contact, a failure of any kind, or any moment the question is "what did we learn from that".
---

# Learning from an experience

BASS defines a Skill as a bounded capability with procedure, evidence standard,
outputs, stopping conditions and limitations. This file is that, for the
capability KAAL exercises every cycle and has failed at twelve times.

**Why this rung exists.** Bare model capability failed at cycle 0001. Guidance
in `AGENTS.md` was the answer and failed in turn: the line written for this exact
family was in force and applied when four more instances arrived in a single
review. That made remaining at the `AGENTS.md` rung without reconsideration
unjustified, and a Skill was the realization judged most likely to address the
capability that was failing. It is a decision open to review, not a promotion the
failure compelled — a failure can also mean a control was misapplied, scoped
wrongly, aimed at the wrong capability, or should be removed.

**The capability has failed in both directions.** Eleven times by concluding
more than the evidence carried. Once, and expensively, by concluding that
nothing further was earned — which is the answer that never appears in a diff
and so was never caught by review.

## Procedure

**Say what happened.** The events, not their meaning. A cycle that starts from
its own interpretation cannot recover the facts later.

**Separate what the evidence establishes from what it suggests.** For each
conclusion, name which it is: a program ran; a judge who is not the producer
evaluated it; the producer judged it; or the environment was observed. Mark the
source of every claim — an order, a Human-supplied constraint, or this
repository's own judgement — and check the text before citing an order.

**Say what it does not establish**, including for a `Tested → Verified` result:
what the program computed, on what inputs, and what it leaves untouched.

**Ask where the learning belongs.** HAPTIC: does this still need a human because
meaning is required, has a human correction now repeated often enough to move
into agent capability, or is part of it understood well enough to compute? Answer
for the parts separately — a conclusion that no part is computable is usually a
true statement about some parts applied to all of them.

**Ask what BASS decision this calls for.** A failure while a control is in force
does not by itself name the next rung — it may mean the control was misapplied,
scoped wrongly, aimed at the wrong capability, or is worth removing. What it does
establish is that staying where you are is no longer the default: **remaining put
now requires a justification, and so does moving.** Ask it of this cycle's
failure and of the standing ones, and record the decision either way, because a
decision to stay leaves no other trace.

**Then write it down**, in prose, in `learning/`. Append a marked note to any
earlier record this supersedes; never edit its body. The wrong earlier reading is
the evidence.

## Evidence standard

A program ran, or it did not. If it did not, the claim is Judged. An observation
of the environment is neither and says so rather than being promoted.

An account of what someone outside this repository said is the producer's
paraphrase and cannot be called independent evidence.

A validation attaches to the body as it stood when judged and reaches nothing
added since.

## Outputs

What was learned, what standing it has, where it belongs, and what rung it
earns. One numbered prose record carries it, with no template beyond what the
cycle actually has.

## Stopping conditions

Stop and ask rather than conclude, when:

- the only thing holding a conclusion up is a sentence of the form *this is
  sufficient because…*; twelve findings have landed there and none on the
  choices underneath;
- **the conclusion is that nothing further is earned.** That answer leaves no
  trace, so no reviewer will catch it. It needs a reason that survives being
  asked twice, and a check of whether it is true of every part or only some;
- a validation is about to be claimed and no judge other than the producer can
  be named for that exact body;
- the orders are about to be cited for something their text does not say;
- the cycle teaches nothing a previous record already says — amend instead;
- a mechanism is about to be adopted because an observer recommended it, a
  neighbouring repository has one, or it is the shape such systems usually take.

## Limitations

This computes nothing, and it is applied by the producer to the producer's own
work, which is the party worst placed to apply it.

The previous rung failed in exactly this way and nothing establishes that this
one works.

If it fails the same way, a Script inside this skill is one candidate. Five
findings have a deterministic subcheck available, and each establishes less than
the finding it came from — naming what each could actually settle, so a syntactic
check is not laundered into semantic assurance:

- **Validation scope.** Given the commit a judge validated, whether anything
  claimed as validated is absent from that tree. Establishes set membership, and
  is the strongest of the five.
- **Citation presence.** Whether text cited from `ORDERS.md` appears there.
  Establishes textual presence, not that the text supports the claim made from
  it.
- **Judge distinctness.** Whether a record names a judge other than the producer.
  Computable only where identity has a reliable representation, and establishes
  that two names differ, not that the judgement was independent.
- **File carriage.** Whether a claim exists in a file rather than only in commit
  metadata. Establishes presence, not that the file states it usefully.
- **Source presence.** Whether a source called independent is in the repository.
  Establishes presence, not independence.
