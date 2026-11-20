---
name: kaal-defect
description: List a context's known Defects in a register and derive, from connected Test Case observations at a revision, whether each condition is reproduced, not reproduced or unknown. Use when a Defect is found, or to read the evidence for registered Defects.
license: MIT
---

# KAAL Defect

A Defect is a passive description of an undesirable condition: it has no known, fixed or open state of its own. Its context lists it in a register. Connected Test Cases give evidence about the condition at a revision.

## Register

Each context keeps its own register: `known.json` in its `14-defects` folder, beside its Defect records. `known` means only that the Defect is listed. Each entry is `{defect, case}`, and several entries may name one Defect. `defect` points at a Defect record in the same folder, an md file whose front matter has `id: <owner>/D<n>`. `case` is the Test Case id, kept as plain text. A Defect stays in the context where it was found until Architecture moves it; Architecture's placement is written as `placed` and Defect only reads it. There is no central register.

## Observation

For each registered Defect, derive from its connected Test Cases' observations at one revision whether the condition is `reproduced`, `not reproduced` or `unknown`. It is derived each time and never written on the Defect.

- an observation counts only if it names the revision judged; another revision is stale
- a missing observation, or any outcome other than `pass` or `fail` (unknown, skipped, errored, timed out, incomplete), is `unknown`
- any applicable failing Case: `reproduced`
- `not reproduced` only when every connected Case applicably passes; otherwise `unknown`
- a failing Case that no register lists is reported `reproduced unregistered`
- an entry whose Defect is not in the same folder is `invalid`

This is evidence, not permission to merge: what it allows is the policy of the gate that consumes it.

Run `node scripts/known-defects.mjs --root <dir> --results <file> --revision <revision>` for the observations of every register under the root. Add `--list` for the to-fix list by owner. Results are a JSON list of `{case, outcome, revision}` from Testing, where outcome is `pass`, `fail` or `unknown`; any other value is read as `unknown`. The script runs nothing and fails only when it cannot read its input.

For running Test Cases see kaal-testing. For where a Defect is placed see kaal-architecture.
