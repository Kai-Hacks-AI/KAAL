---
name: kaal-defect
description: Derive each Defect's state from the Test Cases that point at it and list the unresolved Defect inventory. Use to read what a context's Defect records and their Test Cases show at a revision.
license: MIT
---

# KAAL Defect

A Defect is a passive description of an undesirable condition. What it is about is usually free text. It has no known, fixed or open state of its own: its state is derived from the Test Cases that point at it, the way a Control's status is judged from the Cases that test it (see kaal-controls).

## Edge

A Test Case points at a Defect with its first line, `// Case <id> tests: <defect id>`. The Defect lists no Test Case. A Defect is `<owner>/D<n>`, counted per owner, and its record is an md file whose front matter has `id`.

## Reach

A Defect claims its reach in its record: `reach: <part>, <part>`, where its condition can manifest, such as `.` (repo-wide), `packages/`, or `.kaal/, engineering/`. Each Case covers a corner of it. A record names the parts its run covered, `covers`. A claimed part that no `GREEN` applicable record covers counts toward `unknown`, never `answered`. A covered part covers the parts under it, and `.` covers all. A Defect that claims no reach cannot be answered. What a Case covers is what its record declares in `covers`, not what the Case reads: a Case whose condition is fully decided by what it reads (for example a top-level listing that decides whether `packages/` holds a non-package entry) declares the whole part, `packages/`, and covers it.

## State

Derive it from records `{case, run, revision, outcome, covers}` that a Case runner made (see kaal-testing), where outcome is `GREEN`, `RED` or `UNKNOWN`. Only records of the revision judged count; another revision is stale. A missing record, or any outcome other than `GREEN` or `RED` (skipped, errored, timed out, incomplete), is `UNKNOWN`.

- `confirmed`: some applicable Case is `RED`, even if every other Case is `UNKNOWN`; one RED Case shows the Defect exists
- `answered`: it has Cases, every applicable Case is `GREEN` with complete evidence, and every part of its reach is covered
- `unknown`: otherwise, including no Case at all

Several Cases that point at one Defect are different manifestations or conditions of the same undesirable condition. They are not several Defects and not several places to fix. Each Case's own outcome is kept beside the derived state.
`UNKNOWN` is never read as `RED` or as `GREEN`. The state is derived each time and never written on the Defect. It is evidence, not permission to merge: what it allows is the policy of the gate that consumes it.

## Inventory

An accepted Defect is a record in the context where it was born, and the record is authoritative. Discover the records; keep no second list of Defect ids (no register, no membership marker), because a list would be a second source of truth and a second acceptance decision. An accepted Defect persists unresolved across Changes and releases until it is `answered`.

Three things stay apart: where a Defect manifests and is recorded; another Defect elsewhere that may explain it (Review may find that one independently and it is born with its own proving Test Case, and neither proves or replaces the other); and where Architecture decides the correction belongs, which is Architecture's `addresses:` relationship to the Defect (see kaal-architecture). A Defect is never moved and carries no field that says where its correction belongs.

## Use

The caller says where things are: it hands over a JSON file `--places`, a list of `{context, defects, architecture, cases}`: the place a Defect was found, the folder with its Defect records, the folders with its Architecture elements, and the folders with its Test Cases. The Skill knows no folder name or number. `node scripts/known-defects.mjs --places <file> --records <file> --revision <revision>` prints `<state> <defect>` per Defect record, then one indented `<case> <outcome>` line for each Case that points at it, `reach unclaimed` when it claims none, and `uncovered <part>` for each claimed part no GREEN Case covers. Add `--list` for the unresolved inventory: Defect records that are not answered, grouped by the context of the Architecture element that addresses them, or by the holding context while none does. It is an input to planning, not an order to fix and not a release veto. The script runs no Test Case.
