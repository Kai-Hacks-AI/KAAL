# Show WIP: Testing (v1, target)

Cases trace requirements. They are written first as runnable files, `T<n>.red.mjs`, beside the requirements, with shared fixtures in `fixtures.mjs`. They fail because the Script and the reader do not exist (RED). They are run by hand (`node packages/kaal-release/plan/coordination/red.mjs`) and are not in `npm test`, so CI stays green. The DO makes them GREEN and renames them `.test.mjs`, which `npm test` runs.

| Case | Requirement | What it shows |
| --- | --- | --- |
| coordination/T33 | F3, F6 | The mapping places a piece by its `from` and `into`, first match wins; a piece no entry matches is in `unknown station`, last; stations follow the config order and empty ones are omitted; pieces are ordered by reference whatever the input order. |
| coordination/T34 | F4, F5 | Each WORK cause, REVIEW, and both WAITs are reached from observed facts, with a short reason; the type is the declared prefix, else `unknown`; the first WORK cause wins. |
| coordination/T35 | F2, F5, F6 | A fact that was not observed gives UNKNOWN naming it, never a guess; a known WORK cause still shows WORK; supplier gaps are carried into `notObserved`. |
| coordination/T36 | F1, F7, F10 | The same files give the same report and rendered text; the line is `#ref TYPE from → into DISPOSITION reason`; the Script runs from a command line with an empty environment, imports only built-ins, calls no network, process or write API, and holds no KAAL identity or host term. |
| coordination/T37 | F8 | The reader follows the cursor through every page at 20 pieces a page, reports a page limit or missing cursor as a gap, takes the newest run per check name, maps conflicts, behind, draft, changes requested, landing, and treats a cut list as not observed. |
| coordination/T38 | F9 | The command, against a stand-in for the host's command line, makes only read calls, prints the report and exits 0, retries a gateway failure, and exits 2 naming the host error when it cannot read. It proves the path, not the host. |
| coordination/T39 | F9 | On the real repository, the command prints one line per open piece with a disposition; evidence recorded in `evidence/`. Run by hand. |

Withdrawn with the previous scope: coordination/T1 to T32 (actions, pairs, deliveries, holds, freshness, readiness, the board and its supplier). They are in the branch history.

Moved in pull/C8: the Cases `T33` to `T39` and `fixtures.mjs` now live in `packages/kaal-release/test/coordination/`, run by `test/show-wip.test.mjs`. The hand runner `red.mjs` is retired.
