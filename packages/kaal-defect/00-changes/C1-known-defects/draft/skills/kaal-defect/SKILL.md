---
name: kaal-defect
description: Keep a context's known Defects in a register with the Test Cases linked to each, and list what each owner has to fix. Use when a Defect is found, or to read the registers of a tree.
license: MIT
---

# KAAL Defect

A Defect is a passive description of an undesirable condition: it has no known, fixed or open state of its own. Whether the condition is reproduced is Testing's observation, not the Defect's (see kaal-testing).

## Register

Each context keeps its own register: `known.json` in its `14-defects` folder, beside its Defect records. `known` means only that the Defect is listed. Each entry is `{defect, case}`, and several entries may name one Defect. `defect` points at a Defect record in the same folder, an md file whose front matter has `id: <owner>/D<n>`. `case` is the Test Case id, kept as plain text. An entry whose Defect is not in the same folder is `invalid`. A Defect stays in the context where it was found until Architecture moves it; Architecture's placement is written as `placed` and Defect only reads it (see kaal-architecture). There is no central register.

## Use

Run `node scripts/known-defects.mjs --root <dir>` to list each Defect's linked Test Cases as `link <defect> <case>` lines, for Testing to observe, and `invalid <defect> <case>` for an entry with no Defect. Add `--list` for the to-fix list by `placed`, or by the holding context while there is none. The script reads no result and no revision and decides nothing about the condition. What a registered Defect allows is the policy of the gate that consumes the register together with Testing's observation.
