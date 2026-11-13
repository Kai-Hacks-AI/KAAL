# Pull Promotion from file state: Testing (target)

Runnable Cases `T26` to `T30`, `.red.mjs`, with shared fixtures in `fixtures.mjs`. They are RED because today's Script reads `pieces`, not the delta, and so qualifies no collector from file state. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run one from this folder: `node -e "import('./T26.red.mjs').then(m => m.run())"`. They need no network and no credential.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T26 | F25, F26 | One entry per declared collector in order; a missing collector is not judged; a collector with PLAN and DO files in its head tree has them **whether or not they differ from `main`** (files in the tree but not in the delta qualify); one without a PLAN or without a DO in its tree does not qualify naming which; removed files do not count; an empty delta does not qualify. |
| pull/T27 | F27 | Every expected Case green at the current head qualifies, **including an unchanged Case of the tree (T0)**; a failure names the Case; a Case with no execution at the head, a pending latest, or only an older head is not judged; the latest execution wins over an earlier red and the reverse; a Case the declaration pins but the tree lacks does not qualify; a tree without a Case is not judged; an execution of a Case that is not expected is ignored. |
| pull/T28 | F28 | Exactly one 4L ACT after the PLAN and DO files qualifies; none, two or an incomplete retrospective does not; an ACT changed before the last DO file does not; an ACT whose text was not read is not judged. |
| pull/T29 | F29, F30 | A missing or empty evidence declaration makes every collector not judged; pull-request fields in the facts change nothing. |
| pull/T30 | F31 | Qualifiers in the declared order and the first as next; none qualifying gives the reason; no ready or authorization vocabulary; only a file reader imported. |
| pull/T31 | F32 | A collector scoped to its own work qualifies from it; PLAN, DO and Cases outside the scope, inherited from `main`, never qualify it; a delta without a change inside the scope, or with a file outside it, does not qualify naming it; an empty or malformed scope is not judged; no scope behaves as before. |
| pull/T32 | F33 | Cases of every `cases.files` pattern are expected (a package shape and an engineering shape); a red one fails and one without an execution is not judged; a test file in scope that is neither a Case nor declared in `cases.other` makes the collector not judged naming it (so omitting a Case shape from the declaration cannot qualify a collector), and declaring it in `cases.other` lets the collector be judged; ACT files of two patterns are found, and one of each is two retrospectives. The completeness of the PLAN, DO and ACT patterns is not tested: it is the declaration's review. |

It does not prove: the host reading (the revision of `pull/C2`), that the patterns of this repository's declaration are the right ones, or that a qualifier is safe to promote.

## Retired in the DO

The Cases of `pull/C3` that test the piece-based input (pull/T19 to T25) retire or are rewritten on the delta: the walk and the declaration rules carry over as T26, T29 and T30; the piece and delivery judgments (T20, T24) are replaced by T26 to T28. The DO lists exactly which, in a `retired.md`.
