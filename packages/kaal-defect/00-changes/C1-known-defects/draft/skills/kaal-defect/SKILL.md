---
name: kaal-defect
description: Keep known Defects in a register so a proven but unfixed Defect does not block every merge and is not forgotten. Use when a Test Case proves a Defect that will not be fixed in this change, or to judge a run against the register.
license: MIT
---

# KAAL Defect

A Defect is a negative Requirement: what must not be the case. A Defect that a Test Case proves is RED would block every merge. List it as known instead.

## Register

Each entry is `{defect, case}`. `defect` points at a Defect record, an md file in a `14-defects` folder whose front matter has `id: <owner>/D<n>`. `case` is the Test Case id, kept as plain text. A Defect is at `found`, where it was found (a review or a test gives it), until Architecture moves it. The record sits in the `14-defects` of `found`. Architecture's functional placement is written as `placed` and Defect only reads it.

## Verdict

Judge every run against the register:

- registered and failing: `known`, does not block
- registered and passing: `fixed`, blocks until the entry leaves the register
- not registered and failing: `blocking`
- registered with no result: `unknown`, blocks

Run `node scripts/known-defects.mjs --register <file> --defects <dir> --results <file>` for the verdicts. Add `--list` for the to-fix list by owner. Results are a JSON list of `{case, outcome}`, `pass` or `fail`.

For running Test Cases see kaal-testing. For where a Defect is placed see kaal-architecture.
