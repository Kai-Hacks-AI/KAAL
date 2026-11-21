# Hold adapter: Intent

This is `testing/C74`, a PLAN Change. It ships no package code. A later DO builds what it plans. Provisional ids (next free block after the open `testing/C71`–`C73` collector, `I44`, `F156`–`F157`, `N35`, `A53`, `T381`–`T383`): release confirms them across all `kaal/testing/*` collectors before DO.

**What is missing.** Release's hold Act judge, `judgeHold({changes, retros, observed})` in `engineering/release-management/05-src/phase/judge-act.mjs`, passes only when every Case that applies to the carried Changes is observed GREEN. It takes the observation as a file, `{ "<capability>/T<n>": "GREEN" | "RED" | "UNKNOWN" }`, and nothing makes that file. `release/C122` therefore reports UNKNOWN for hold until Testing offers an adapter. Testing owns what a test and its evidence mean, so Testing owns the step from "what ran" to "which Case is GREEN".

Two gaps sit under that:

1. **No computed list of Cases.** Testing has `kaal-testing run`, which reports tests with a Case attribution, but nothing lists the Cases that exist. Release's `applicableCases` scans for Case files per Change, and it reads only a single-quoted `export const id = '…'`, so a Case written `export const id = "testing/T383"` is not found at all. On `main` that is 36 of 540 Case files, among them Testing's own `T381`–`T383`. A Case that is not found is not applicable, and a collector can then look green because its Cases were invisible. The list has to be computed from the tree by one deterministic reading, wherever the files sit, as the controls are.
2. **No observation of a Case.** A run report counts tests. A Case is GREEN only when its tests ran, completely, and every one of them is GREEN. Nothing joins the report to the list.

- **testing/I45**: Testing computes the Test Cases that exist in a tree, one deterministic reading wherever their files sit, and from a run report of that tree's exact revision says, for each Case, whether it was observed GREEN, RED or UNKNOWN and why. The observation is evidence a judge can read. It is never a verdict, and it never claims more than the run showed: no report, a report of another revision, or a Case that could not run gives UNKNOWN, never GREEN and never RED.

Principle: Testing observes and describes; release judges (`hold`), and Guard enforces. A GREEN observation produced by the pull request's own CI is evidence from the work under judgment, so it is labelled as produced by the pull request. It is evidence, not enforcement.

**Out of scope.** Where and when the observation runs. The producing CI job and the hold job, their workflow and the WIRE that installs it belong to release (`release/C122`) and engineering, under Kai's go. Release's own widening of `applicableCases` to both quote forms is release's. No flag, no ruleset, no `.github/` change, no change to `kaal-testing run` or to its report schema.
