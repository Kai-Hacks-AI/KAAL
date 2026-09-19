# 0018 — Use what is already there

2026-09-19. Cycle run by an agent (Claude) on `claude/orders-next-message-26nkhk`,
after the Human's review of `9c9d207` found stale semantics in the skill's
output contract, supplied a new constraint, and corrected an overstatement about
the Engine adapter.

Written under `skills/learning/SKILL.md`.

## The residue, and where the second copy was

Cycle 0017 corrected the procedure to ask what BASS decision an experience calls
for, and left the skill's **Outputs** still promising *what rung it earns*. The
argument changed and one operational sentence kept the old ontology, which the
Human found.

Running the standard's own tool then surfaced a second copy: the skill's
frontmatter description also still said *which rung it earns under BASS*. Stated
precisely, because it would be easy to launder — the program did not detect a
semantic error. `read-properties` printed the field and the stale phrase was
read there. What the tool supplied was the surface, not the judgement.

Both are corrected. A correction that changes the argument has to be walked
through every place the old shape was written down, and this one was written in
three places and fixed in one.

## URBAN

**Human-supplied constraint, cycle 0018.** For a technical decision — a
representation, protocol, format or mechanism — work down URBAN: **U**se what is
already there; **R**ent if nothing suitable is; **B**uy if you cannot rent;
**A**dapt what you have; **N**ew only as the last exit. Moving down a step
requires an explicit reason the step above is insufficient.

It reads as licence to import and is the opposite: do not reinvent commodity
infrastructure when a suitable standard exists. It also sits against the orders'
refusal to bootstrap mechanisms, and the two do not conflict — the orders govern
whether a mechanism is needed at all, URBAN governs where it comes from once it
is.

For this skill the answer is **Use**. The Agent Skills standard exists and
applies, and the Human supplied that it is mandatory for skills. No KAAL skill
format was invented around it.

## What the validation establishes

**Tested → Verified.** `skills-ref validate` — the standard's reference
validator, installed from npm as `skills-ref` — returns *Valid skill* for both
`skills/learning` and `.claude/skills/learning`, exit 0.

What that computes and nothing more: that each directory satisfies the checks
the validator implements. It does not establish that the skill is well written,
that the capability works, that Agent Skills is the right standard, or that the
adapter arrangement is sound. Those are judgements and remain awaiting one.

One limit worth stating plainly: the specification at agentskills.io could not be
read — the network egress proxy blocks the domain. What this repository knows of
the standard's requirements comes from the behaviour of its validator and from
the Human's account of the specification, not from the specification's text. A
validator passing is evidence about the validator's checks; it is not evidence
that every normative requirement was met.

This is the first program KAAL has run against its own content rather than as a
rehearsal of a git operation.

## The adapter carries Engine concerns

`0017` said the Engine adapter *carries nothing*. That is too absolute and the
Human corrected it. An adapter carries the Engine's discovery path, its routing
metadata and a pointer, and it is allowed to — Engine adapters are for Engine
concerns. What it must not carry is the capability as its only home, which is
the files-know boundary. Both files now say it that way.

## Check

Judged by the producer, awaiting independent judgement, apart from the
validator result above.

The skill was in force while this record was written. It changed one thing: the
first draft of the validation section said the tool had caught the stale
description, which the evidence standard does not support, and it now says the
tool printed a field that was then read. Second prospective use, second time a
sentence was narrowed rather than dropped.

## Act — what this cycle leaves for the next

URBAN is now in `AGENTS.md` and has been exercised once, on a decision where the
answer was obvious because a standard already existed and the Human named it. It
has not yet been exercised where the answer is not obvious, which is the only
place it could be wrong.

The residue found here suggests a check worth having when the next correction
lands: a changed argument leaves copies of the old shape in frontmatter, output
contracts and guidance surfaces, and grepping the old phrase is cheap. That is an
observation about this cycle, not yet a decision to write anything.
