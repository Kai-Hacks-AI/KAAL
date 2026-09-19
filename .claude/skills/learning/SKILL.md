---
name: learning
description: Use this skill when a cycle has produced an experience and KAAL has to determine what it taught - what the evidence establishes and what it does not, what standing that knowledge has, where the learning belongs under HAPTIC, and which rung it earns under BASS. This is the act of learning, not the act of writing it down; the record is the artefact, and it will faithfully preserve a wrong conclusion. Triggers - a cycle ending, a review finding, an experiment returning, an External or Embed contact, a failure of any kind, or any moment the question is "what did we learn from that".
---

# Learning from an experience

BASS defines a Skill as a bounded capability with procedure, evidence standard,
outputs, stopping conditions and limitations. This file is that, for the
capability KAAL exercises every cycle and has failed at twelve times.

**Why this rung exists.** Bare model capability failed at cycle 0001. Guidance
in `AGENTS.md` was the answer and failed in turn: the line written for this
exact family was in force and applied when four more instances arrived in a
single review. A failure at a rung earns the next rung — **Human-supplied
context, cycle 0016** — so this is a Skill. A Script belongs inside it, once the
skill shows which part is deterministic enough to compute.

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

**Ask what rung it earns.** A failure at a rung earns the next rung. Ask it of
this cycle's failure, and ask it of the standing ones: a failure that has
recurred while its control was in force has already earned the move.

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
one works. If it fails the same way, the next move is a Script inside this
skill. Five of the twelve findings have a mechanical core to start from: whether
a named judge exists and differs from the producer, whether cited text appears
in the file cited, whether a claimed validation covers only the body judged,
whether a claim lives in a file rather than only in commit metadata, and whether
a source called independent is present in the repository at all.
