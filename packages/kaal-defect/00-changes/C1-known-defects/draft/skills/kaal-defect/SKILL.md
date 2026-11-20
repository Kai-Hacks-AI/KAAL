---
name: kaal-defect
description: Keep a context's known Defects in a register and derive each Defect's state from the Test Cases that point at it. Use when a Defect is found, or to read what each Defect's Test Cases show at a revision.
license: MIT
---

# KAAL Defect

A Defect is a passive description of an undesirable condition. What it is about is usually free text. It has no known, fixed or open state of its own: its state is derived from the Test Cases that point at it, the way a Control's status is judged from the Cases that test it (see kaal-controls).

## Edge

A Test Case points at a Defect with its first line, `// Case <id> tests: <defect id>`. The Defect lists no Test Case. A Defect is `<owner>/D<n>`, counted per owner, and its record is an md file in a `14-defects` folder whose front matter has `id`.

## State

Derive it from records `{case, run, revision, outcome}` that a Case runner made (see kaal-testing), where outcome is `GREEN`, `RED` or `UNKNOWN`. Only records of the revision judged count; another revision is stale. A missing record, or any outcome other than `GREEN` or `RED` (skipped, errored, timed out, incomplete), is `UNKNOWN`.

- `confirmed`: some applicable Case is `RED`
- `answered`: it has Cases and every one is `GREEN`
- `unknown`: otherwise, including no Case at all

`UNKNOWN` is never read as `RED` or as `GREEN`. The state is derived each time and never written on the Defect. It is evidence, not permission to merge: what it allows is the policy of the gate that consumes it.

## Register

Each context keeps its own register: `known.json` in its `14-defects` folder, a list of Defect ids that live in the same folder. `known` means only that the Defect is listed. An id with no Defect record there is `invalid`. A Defect stays in the context where it was found until Architecture moves it; Architecture's placement is written as `placed` and Defect only reads it (see kaal-architecture). There is no central register.

## Use

`node scripts/known-defects.mjs --root <dir> --records <file> --revision <revision>` prints `<state> <defect>` per Defect record, with ` known` when its context registers it. Add `--list` for what each owner has to fix: registered Defects that are not answered, grouped by `placed`, or by the holding context while there is none. The script runs no Test Case.
