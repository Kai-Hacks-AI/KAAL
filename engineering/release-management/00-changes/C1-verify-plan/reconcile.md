# C1 reconcile

Which control owns each existing element, where it belongs, and what depends on it. Owners: CP is create Plan (Development OUT, directive, on `main` as release/C3), VP is verify Plan (Integration IN, detective), GI is `guard Integration` (preventive, its own PLAN), MM is the shared relationship model, TS is Testing, CC is the control contract, H is Change history. Nothing moves in this amendment. The moves are steps of DO.

## Documents, elements and Cases

| Element | Owner | Destination | Cross-control dependency |
| --- | --- | --- | --- |
| I1 verify Plan | VP | stays | none |
| F1 plan-pr | VP | stays, narrowed: rules 1 to 5 cite F2 and F3 instead of restating them | consumes F2 and F3 of CP |
| F1 rule 6, the red plan | CP states its existence (F2 item 4), VP judges whether the observed RED is valid | stays in VP as the judgment; TS owns execution and evidence conventions | consumes F2 and TS |
| F1 rule 8, every template heading is parsed | CP (F3) and VP (A33 on `main`) | superseded: the body is judged by release/A16 and release/A33 | consumes F3, F13 |
| D1 untraced-plan | VP and CP, one Defect | stays in `06-defects/`; A14 gains `addresses: D1` through a Change of create Plan | CP |
| A1 verify Plan, A2 github | VP | stay | none |
| A3 pr-templates, A4 plan-template | CP | superseded by A15 and the template on `main`; removed in DO step 5 | none |
| A5 actions | VP | stays, delivered with the workflow in DO step 7 | A33, the judgment |
| A6 check-job, A7 pr-reader | VP | stay, the GitHub adapter: PR reading and orchestration | none |
| A8 trace-resolver, A9 evidence-reader, A10 plan-rules, A11 reporter | VP | move to a portable branch of A1 beside A2, ids kept (CPO decision), in DO step 5 | MM for the vocabulary, TS for evidence |
| A12 rulesets, A13 integration | GI | leave this Change for the preventive control, named `guard Integration`, with its own PLAN | consumes the verdict of VP |
| A33 check-pr-body | VP | on `main` (release/C8); this Change reuses it | F13, A16 of CP |
| `05-src/plan`: judge, rules, evidence, report, resolve | VP, portable | stay | MM, CC |
| `05-src/plan`: check, reader | VP, GitHub adapter | stay | none |
| `run-red.mjs`, `baseline-judge.mjs` | TS, interim | stay until Testing provides expected-RED execution | TS |
| Cases T1 to T15, T20 to T25, T28, T38 to T42 | VP | stay beside their targets | none |
| Cases T29 to T37 | H, Cases of C1 and C2 | stay, now assertion Cases that fail on `main` | none |
| T16 | VP | stays, re-expressed with A2 in DO step 5 | none |
| T17, T18 | CP | superseded, removed in DO step 5 with A3 and A4 | none |
| T19 | VP | stays, red until the workflow exists | none |
| T26, T27 | GI | leave with A12 and A13 | none |
| C1, C2 and their Cases | H | stay | none |
| C3, C6 to C10 | other Changes | on `main`, not touched here | none |

## Earlier steps

| Earlier step | Status |
| --- | --- |
| PLAN 1, layout, I1, F1, A1 to A13, D1, C1 and Cases | valid, delivered on the collector, not on `main` |
| PLAN 2, interim runner and stand-in | valid, interim |
| PLAN 3, accepted RED through the stand-in | superseded: the baseline is `main` |
| PLAN 4, language review | valid |
| DO 1, judgment (#1384) | valid |
| DO 2, readers and check body (#1386) | valid |
| DO 3, check every PLAN pull request (#1389) | valid, open |
| DO 4, template first as its own `.github` pull request | superseded: create Plan delivered the template, and the pull request #1387 and the collector `kaal/release/wire-verify-plan` are obsolete |
| DO 5, two promotions apart | valid in principle; the template promotion is no longer part of this Change |
| DO 6, workflow later with a throwaway-PLAN adapter test | valid, now DO 7 |
| DO 7, T18 and T19 green on `main` | T18 superseded; T19 valid |
| DO 8, requirement of the status `verify Plan` in the `integration` ruleset | belongs to `guard Integration` |
| DO 9, renames and wiring | valid |
| ACT, learning and closing | valid, with the PR body contamination learning |

## Dependencies between the controls

- VP consumes F2 and F3 of CP, and redefines neither.
- VP's check job reuses the body check of release/C8.
- GI consumes the verdict of VP, so it follows VP.
- CP does not depend on VP, and is already on `main`.
