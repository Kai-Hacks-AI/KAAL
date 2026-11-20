---
name: kaal-defect
description: Keep known Defects in a register so a proven but unfixed Defect does not block every merge and is not forgotten. Use when a Test Case proves a Defect that will not be fixed in this change, or to judge a run against the register.
license: MIT
---

# KAAL Defect

A Defect is a negative Requirement: what must not be the case. A Defect that a Test Case proves is RED would block every merge. List it as known instead.

## Register

Each context keeps its own register: `known.json` in its `14-defects` folder, beside its Defect records. Each entry is `{defect, case}`. `defect` points at a Defect record in the same folder, an md file whose front matter has `id: <owner>/D<n>`. `case` is the Test Case id, kept as plain text. A Defect stays in the context where it was found until Architecture moves it; Architecture's placement is written as `placed` and Defect only reads it. There is no central register.

## Verdict

Judge every run against the register:

- registered and failing: `known`, does not block
- registered and passing: `fixed`, blocks until the entry leaves the register
- not registered and failing: `blocking`
- registered with no result: `unknown`, blocks

Run `node scripts/known-defects.mjs --root <dir> --results <file>` for the verdicts of every register under the root. Add `--list` for the to-fix list by owner. Results are a JSON list of `{case, outcome}`, `pass` or `fail`.

For running Test Cases see kaal-testing. For where a Defect is placed see kaal-architecture.
