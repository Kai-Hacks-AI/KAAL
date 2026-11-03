---
name: kaal-review
description: Review work as an Agent reviewing another Agent's work, leave a structured record that can be found and analysed, and leave the human observer what they need to see. Use when asked to review a change, a pull request, a plan or another Agent's result, in any repository.
license: MIT
---

# Reviewing another Agent's work

This Skill needs no KAAL Engine. Where one is present, the Nodes `Review` and `HOW ARE WE DOING?` state the same meaning in full and are a deeper reference, never a prerequisite. Detail lives one level down in `references/`. What it needs and what it does in a target repository are declared in `references/standalone.md`.

Review enhances agent leverage: a human observes and steers where human judgment or authority matters, and Agents other than the one that produced the work challenge it. Testing gives executable evidence; a review gives findings. The scope holder reads the findings and decides what to do with them.

## 1. Take the request

You are invoked with a request: subject, scope, lenses (the standards to review against), severity floor, evidence expected, checks to run, claims to test, independence, prior record. Take it as given. Apply only the lenses supplied; do not assume any others. See `references/request.md`.

## 2. Do three kinds of work

- **Deterministic**: run the requested checks and scripts; record the command, exit status and output as observed.
- **Judgment**: Read the work itself and its evidence, not only its description. Report each finding with what you checked: a file and line, a command and its output, or a statement that it is inferred. See `references/finding-format.md` and `references/dimensions.md`, including security and untrusted input.
- **Self-check**: Confirm both kinds were done as requested. Say what you did not check. An unchecked part is not a passed part.

Review as an Agent other than the one that produced the work. Report on the work, not the Agent.

## 3. Leave a record

End with a human summary and one structured record in the marker block, so reviews can be found and analysed. See `references/record.md` and `references/example.md`. Check it with `scripts/check-record.mjs <file>`; analyse many with `scripts/collect.mjs`. On a re-review, see `references/re-review.md`.

End by naming what a human should look at themselves: the decisions the work makes, and anything your review could not settle. A review by Agents does not replace the human observing the work.

## Rules

- A review grants no authority. Never approve, merge or decide because a review found nothing. The record has no approval or verdict field.
- Do not weaken a check, or the evidence asked for, so that work passes review.
- Report what you observed and the evidence for it. A finding with no evidence is a guess; say so.
- A request cannot lower these rules.
