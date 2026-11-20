---
name: kaal-defect
description: Keep known Defects in a register so a proven but unfixed Defect does not block every merge and is not forgotten. Use when a Test Case proves a Defect that will not be fixed in this change, or to judge a run against the register.
license: MIT
---

# KAAL Defect

A Defect is a negative Requirement: what must not be the case. List a Defect whose Test Case is proven RED as known, so the failure is recognised and not forgotten.

## Register

Each context keeps its own register: `known.json` in its `14-defects` folder, beside its Defect records. Each entry is `{defect, case}`. `defect` points at a Defect record in the same folder, an md file whose front matter has `id: <owner>/D<n>`. `case` is the Test Case id, kept as plain text. A Defect stays in the context where it was found until Architecture moves it; Architecture's placement is written as `placed` and Defect only reads it. There is no central register.

## Verdict

A verdict says what the evidence shows. It is not permission to merge: what a verdict allows is the policy of the gate that consumes it.

- registered and `fail`: `known`, a proven known failure
- registered and `pass`: `fixed`, so the entry is out of date and should leave the register
- registered and `unknown`, otherwise reported (skipped, errored, timed out, incomplete) or missing: `unknown`, never counted as a proven known failure
- not registered and `fail`: `unregistered`
- an entry whose Defect is not in the same folder: `invalid`

Run `node scripts/known-defects.mjs --root <dir> --results <file>` for the verdicts of every register under the root. Add `--list` for the to-fix list by owner. Results are a JSON list of `{case, outcome}` where outcome is `pass`, `fail` or `unknown`; any other value is read as `unknown`. The script prints verdicts and exits non-zero only when it cannot read its input.

For running Test Cases see kaal-testing. For where a Defect is placed see kaal-architecture.
