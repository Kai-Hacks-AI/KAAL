# Case Ownership: Testing

The planned Cases live in `packages/kaal-testing/test/plan/case-ownership/`, named `T<n>.red.mjs`. Each exports `id`, `tests`, `title` and `run()`, and reads the repository only. They are immutable to DO. `testing/C62` renames them `.test.mjs` when GREEN and adds `test/plan/case-ownership.test.mjs` to Testing's `npm test`.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| testing/T360: the survey of a stated scope equals the one recomputed, and sorts every Case as owned or unresolved, never as rejected | testing/F134, testing/F135 | the scope has two or more packages; every Case file is listed with its declared links, hash and status; owned means every link is defined in exactly one place; unresolved carries a reason; the links name nodes of two or more owning concerns |
| testing/T361: every owned node has exactly one judgment of its Cases, recorded by the owning concern | testing/F136 | one record per owned node, the judge is the owner read from the node id, the Cases are all and only the survey's, the verdict is one of three values, reasoning and evidence are present, two or more concerns judged |
| testing/T362: every unresolved Case has a recorded investigation, and no Case was changed to resolve it | testing/F137 | one investigation per unresolved Case, an outcome of four, whom to ask, reasoning, and every Case file still has the hash the survey recorded |

No Case decides whether a verdict is right, whether a Case is adequate, or which node should own an unresolved Case. Those are the owners' judgments, read by a reviewer.

## RED evidence

Run `node packages/kaal-testing/test/plan/case-ownership/run-red.mjs`. At `testing/C61` on main all three are RED, because the survey records are absent. See `evidence.md`.
