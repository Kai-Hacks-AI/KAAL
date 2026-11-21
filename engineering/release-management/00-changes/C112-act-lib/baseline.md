# C112 baseline

The baseline is the collector `kaal/release/act-lib` at 3d2e46b, which is `main` after the promotion of `kaal/release/act-real-green` (#2174: `hold Act` release/C103, `demand Act` release/C108 and their ACT release/RT1).

- On this baseline: `05-src/phase/judge-act.mjs` (145 lines) holds the reading of the tree (`walk`, `frontmatter`), the facts of a collector (`elementsOf`, `justifiedBy`, `applicableCases`, `retrosOf`, `changeIdOf`), the state of the Cases (`judgeFinished`, `judgeAct`) and the judge (`judgeHold`) together. `judge-demand-act.mjs` (47 lines) imports `retrosOf`, `changeIdOf`, `applicableCases` and `judgeFinished` from it.
- `limit Act` (release/C110) is not yet on `main`: its promotion #2175 follows via the SYNC #2177. Its judge `judge-limit-act.mjs` holds the matching of a path against the write map (`inFolder`, `isFile`, the relative-to-root step) and reads `write-map.json`. This PLAN is written against it as the collector SYNC will bring it, and the DO of the write map module waits for that SYNC.
- Three Cases pin a source file to the draft of its PLAN: release/T1264 (`judge-act.mjs` against the draft in `C103-hold-act/interface.md`), release/T1296 (`judge-demand-act.mjs`) and release/T1302 (`judge-limit-act.mjs` and `write-map.json`). A refactor cannot keep them: they fail on a faithful move.
- Highest ids, read on 20 Nov 2026 against `main` and the heads of the open branches: C111 (verify Act), I60, F86, A76, CTL31, T1309; C110 (limit Act) I59, F85, A75, CTL30, T1304. The ids below follow them: C112, I61, F87, A77, T1310 to T1314.
- Runner on this baseline: the 16 environment failures that also fail on `main`.
