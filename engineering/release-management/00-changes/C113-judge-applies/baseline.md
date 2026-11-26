# C113 baseline

The baseline is the collector `kaal/release/act-applies` at the tip of `main` (20 Nov 2026), which does not yet hold the shared library of release/C112: that Change is on its collector `kaal/release/act-lib`, whose PROMOTION is waiting to be released. This PLAN is written against the library as it stands there (`05-src/phase/lib/` with `tree.mjs`, `collector.mjs`, `cases-green.mjs`, `write-map.mjs`), and its DO waits for the library to be on `main` and the collector to be synchronised.

- Each judge returns `{ verdict, message, ... }` today: `judgeHold` and `judgeAct` (hold Act), `judgeDemandAct` and `judgeLimitAct`. A PASS with nothing to judge reads like a PASS that was judged: `no retro reflects a carried Change: there is no ACT to hold`, `nothing is due` with no retro, `not an ACT: it changes no folder the route act writes`.
- `verify Act` (release/C111) is a PLAN on its own collector; its DO adds the same flag in its own answer, and waits for this Change and the library.
- The Dispatcher decides the step of a merged pull request from the headings of its body (`stepOf` in `05-src/promotion-raise/final-step.mjs`), which is the reading this Change prepares to replace.
- Highest ids, read on 20 Nov 2026 against `main` and the heads of the open branches: C112 (the library), I61, F87, A77, T1314; C111 (verify Act) I60, F86, A76, CTL31, T1309. The ids below follow them: C113, I62, F88, A78, T1315 to T1319.
