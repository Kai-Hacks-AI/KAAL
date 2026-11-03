# kaal-defect record definition: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F98** [testing/I25, testing/I27]: A Defect record is plain data with these members: `id` (nonempty, assigned by the raising context, unique in its holder, no format prescribed), `context` (the raising context, nonempty), `expected` and `observed` (nonempty text), `where` (the subject or location observed), and `status`. It may carry `obligation` (an opaque reference to the Requirements obligation) and `tests` (the identities of the Test Cases that expose it). A missing or empty required member, a duplicate `id`, or a key the record does not define is a finding. `where`, `obligation` and `tests` are opaque to Testing.
- **testing/F99** [testing/I26]: `status` is one of `reported`, `confirmed`, `answered`. Any other word is a finding, never a default.
  - `reported` carries no `tests`.
  - `confirmed` names at least one Case in `tests`, and needs a Run in which each named Case is `failed`.
  - `answered` needs, for each named Case, a Run in which it is `passed`, observed after the confirming Run.
- **testing/F100** [testing/I26]: `state(record, evidence)` derives what the evidence shows: the status the record can claim. A claim without its evidence is unknown, never accepted: a `confirmed` record whose Case is `passed`, `unknown` or absent from the given Runs, or an `answered` record without a later passing Run, is a finding. Evidence is data, given as Runs of Testing's model (`testing/F30`).
- **testing/F101** [testing/I27]: The record carries no Plan membership. Where the Case lives, the Defect Plan before the answer and the Regression Plan after, is Change's wiring; a Case keeps its identity across Plans and its evidence stays with the Runs (`testing/F25`, `F30`).

## Nonfunctional

- **testing/N21** [testing/I26]: `check` and `state` are pure and deterministic: they read nothing from the host, write nothing and do not read the clock. Time is the order of the Runs given.
