---
name: kaal-defect
description: Keep a context's known Defects in a register and derive each Defect's state from the Test Cases that point at it. Use when a Defect is found, or to read what each Defect's Test Cases show at a revision.
license: MIT
---

# KAAL Defect

A Defect is a passive description of an undesirable condition. What it is about is usually free text. It has no known, fixed or open state of its own: its state is derived from the Test Cases that point at it, the way a Control's status is judged from the Cases that test it (see kaal-controls).

## Edge

A Test Case points at a Defect with its first line, `// Case <id> tests: <defect id>`. The Defect lists no Test Case. A Defect is `<owner>/D<n>`, counted per owner, and its record is an md file in a `14-defects` folder whose front matter has `id`.

## Reach

A Defect claims its reach in its record: `reach: <part>, <part>`, where its condition can manifest, such as `.` (repo-wide), `packages/`, or `.kaal/, engineering/`. Each Case covers a corner of it. A record names the parts its run covered, `covers`. A claimed part that no `GREEN` applicable record covers counts toward `unknown`, never `answered`. A covered part covers the parts under it, and `.` covers all. A Defect that claims no reach cannot be answered.

## State

Derive it from records `{case, run, revision, outcome, covers}` that a Case runner made (see kaal-testing), where outcome is `GREEN`, `RED` or `UNKNOWN`. Only records of the revision judged count; another revision is stale. A missing record, or any outcome other than `GREEN` or `RED` (skipped, errored, timed out, incomplete), is `UNKNOWN`.

- `confirmed`: some applicable Case is `RED`, even if every other Case is `UNKNOWN`; one RED Case shows the Defect exists
- `answered`: it has Cases, every applicable Case is `GREEN` with complete evidence, and every part of its reach is covered
- `unknown`: otherwise, including no Case at all

Several Cases that point at one Defect are different manifestations or conditions of the same undesirable condition. They are not several Defects and not several places to fix. Each Case's own outcome is kept beside the derived state.
`UNKNOWN` is never read as `RED` or as `GREEN`. The state is derived each time and never written on the Defect. It is evidence, not permission to merge: what it allows is the policy of the gate that consumes it.

## Register

Each context keeps its own register: `known.json` in its `14-defects` folder, a list of Defect ids that live in the same folder. `known` means only that the Defect is listed. An id with no Defect record there is `invalid`. A Defect stays in the context where it was found until Architecture moves it; Architecture's placement is written as `placed` and Defect only reads it (see kaal-architecture). There is no central register.

## Use

`node scripts/known-defects.mjs --root <dir> --records <file> --revision <revision>` prints `<state> <defect>` per Defect record, with ` known` when its context registers it, then one indented `<case> <outcome>` line for each Case that points at it, `reach unclaimed` when it claims none, and `uncovered <part>` for each claimed part no GREEN Case covers. Add `--list` for what each owner has to fix: registered Defects that are not answered, grouped by `placed`, or by the holding context while there is none. The script runs no Test Case.
