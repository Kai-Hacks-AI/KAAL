---
name: kaal-defect
description: Derive each Defect's state from the Test Cases that point at it and list the unresolved Defect inventory. Use to read what a context's Defect records and their Test Cases show at a revision.
license: MIT
---

# KAAL Defect

A Defect is a passive description of an undesirable condition. What it is about is usually free text. It has no known, fixed or open state of its own: its state is derived from the Test Cases that point at it, the way a Control's status is judged from the Cases that test it (see kaal-controls).

## Edge

A Test Case points at a Defect with its first line, `// Case <id> tests: <defect id>`. The Defect lists no Test Case. A Defect is `<owner>/D<n>`, counted per owner, and its record is an md file whose front matter has `id`.

## Scope

A Defect describes the underlying undesirable condition, not merely the observed symptom or where it was found. It expresses its scope in its description; it has no mandatory path-based reach and its records carry no coverage metadata. A Test Case verifies that condition robustly, across its relevant manifestations and contexts, without a complex metamodel. Existing relationships: Test Case verifies Defect; Review validates Defect (is its scope meaningful) and validates Test Case (adequate, robust, reproducible); Testing owns the verification evidence; Architecture owns where the correction belongs.

## State

Derive it from records `{case, run, revision, outcome, complete}` that a Case runner made (see kaal-testing), where outcome is `GREEN`, `RED` or `UNKNOWN`. `complete` is the runner's own statement that the run observed everything that should count (see kaal-testing); a `GREEN` without `complete: true` is `UNKNOWN`, since complete evidence is established by the runner and never inferred from the records received. Only records of the revision judged count; another revision is stale. The records handed over for the revision are the runs that count. A missing record, or any outcome other than `GREEN` or `RED` (skipped, errored, timed out, incomplete), is `UNKNOWN`.

- `confirmed`: some applicable Case is `RED`, even if every other Case is `UNKNOWN`; one RED Case shows the Defect exists
- `answered`: it has Cases, every applicable Case is `GREEN` with complete evidence
- `unknown`: otherwise, including no Case at all

Several Cases that point at one Defect are different manifestations or conditions of the same undesirable condition. They are not several Defects and not several places to fix. Each Case's own outcome is kept beside the derived state.
Missing, stale or incomplete evidence stays `unknown`. `UNKNOWN` is never read as `RED` or as `GREEN`. The state is derived each time and never written on the Defect. It is evidence, not permission to merge: what it allows is the policy of the gate that consumes it. It does not select a CARE treatment (Contain, Accept, Ratchet, Eliminate) or authorize a release. A validated Finding stays a Finding; it may prompt an Intent, a backlog item (not proof of a Defect) or the investigation of a suspected Defect, none automatic. A Test Case with reproducible evidence, manual or automated, verifies the Defect. CARE comes after, for a verified Defect; Eliminate runs by a hotfix or by a fix through a normal Change.

## Inventory

A recorded Defect is a record in the context where it was born, and the record is authoritative. Discover the records; keep no second list of Defect ids (no register, no membership marker), because a list would be a second source of truth and a second decision on what is recorded. A recorded Defect persists unresolved across Changes and releases until it is `answered`.

Three things stay apart: where a Defect manifests and is recorded; another Defect elsewhere that may explain it (Review may find that one independently and it is born with its own proving Test Case, and neither proves or replaces the other); and where Architecture decides the correction belongs, which is Architecture's `addresses:` relationship to the Defect (see kaal-architecture). A Defect is never moved and carries no field that says where its correction belongs.

## Use

The caller says where things are: it hands over a JSON file `--places`, a list of `{context, defects, architecture, cases}`: the place a Defect was found, the folder with its Defect records, the folders with its Architecture elements, and the folders with its Test Cases. The Skill knows no folder name or number. `node scripts/known-defects.mjs --places <file> --records <file> --revision <revision>` prints `<state> <defect>` per Defect record, then one indented `<case> <outcome>` line for each Case that points at it. Add `--list` for the unresolved inventory: Defect records that are not answered, grouped by the context of the Architecture element that addresses them, or by the holding context while none does. It is an input to planning, not an order to fix and not a release veto. The script runs no Test Case.
