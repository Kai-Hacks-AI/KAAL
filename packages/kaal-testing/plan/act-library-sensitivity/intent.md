# ACT library sensitivity: Intent

This is `testing/C78`, a PLAN Change. It ships no code and changes no Skill and no file outside `packages/kaal-testing/`. `testing/C79` (DO, one-off pilot, not yet authorized) applies the method that `testing/C71`–`C73` taught, Behavioural RED, Targeted Mutation Verification and the uncovered-behaviour rule, to release's ACT library, and records the evidence. Provisional ids (after the open `testing/C74` and the builder's `testing/C75`–`C77`): release confirms them across all `kaal/testing/*` collectors before DO. One collector ACT follows `C79`, then promotion.

**What is missing.** Testing's method has been shown on Testing's own code (`lib/contracts.mjs`, `testing/C73`). It has not been applied where a wrong answer costs most. Release's ACT library decides PASS, FAIL or UNKNOWN for a promotion: `lib/cases-green.mjs` and the hold and act judges in `judge-act.mjs`, about 170 lines of pure code with Cases of their own (`release/T1299`, `T1310`–`T1314`). A mutant of that code that its Cases do not reject is a possible false PASS at the gate. Today nothing says which of its claims the Cases really pin. The pre-known example is `applicableCases`: it reads only a single-quoted id, so 36 Case files on `main` are invisible to hold, and no Case notices.

- **testing/I47**: Testing applies its sensitivity method to release's ACT library, once, at a pinned commit, and reports which of the library's claims its Cases do not pin. Release owns the code and its Cases and decides what to do with a finding. Testing writes nothing into release's tree and decides no verdict.

**Ownership.** Testing runs the pilot and owns the evidence. Release owns its code, its Cases and every fix, and lands any Case Testing justifies. A confirmed breach of a documented contract is a Defect through the Defect flow (Testing holds no Defect lifecycle).

**Out of scope.** Any edit under `engineering/`, any standing mutation harness, any Skill change, any new export, `.github/`, and the independent Skill trial.
