# C3 ownership review

Every document under the release/C1 setup, classified by the control or concern it belongs to. Nothing is moved by this review. Destinations are proposals for the agreement of the Owner and the CPO.

## Controls and concerns

| Code | Concern | Placement |
| --- | --- | --- |
| CP | create Plan: guides how a PLAN is produced | directive control, Development OUT |
| VP | verify Plan: judges a PLAN and returns PASS, FAIL or UNKNOWN | detective control, Integration IN |
| RP | requires the verdict of verify Plan before a pull request merges | preventive control, Integration IN, name pending |
| MM | shared relationship model: vocabulary, `parent`, id grammar | not owned by CP or VP |
| TS | Testing: Case design, identity, placement, expected-RED execution | not owned by CP or VP |
| CC | control contract: verdict semantics, Recovery, UNKNOWN never passes | not owned by CP or VP |
| H | history of a Change | stays under `00-changes/` with its Change |

A control consumes MM, TS and CC and never restates them. The control contracts of CP and VP name no Git or GitHub concept: the pull request, commits, changed files, templates, workflows and rulesets belong to the GitHub deployment target (an adapter) of each control.

## Per document

| Document | Today | Proposed owner | Destination | Rationale and dependencies |
| --- | --- | --- | --- | --- |
| `README.md` intro | names verify Plan only | CP and VP | stays | names both controls in the DO |
| `README.md` Layout | folder layout | release-management | stays | the incubator layout |
| `README.md` Identity, Relationships, Cases | id grammar, relationship table, Case placement | MM and TS | stays, marked as not owned | incubated here until MM and TS own them |
| `README.md` Language | language rules | release-management | stays | |
| `AGENTS.md` | agent rules | release-management | stays | control-neutral |
| I1 verify Plan | `01-intent/I1-verify-plan/` | VP | stays | |
| I2 create Plan | new | CP | `01-intent/I2-create-plan/` | |
| F1 plan-pr | eight rules | VP and CP | see the per-rule table | narrowed in the DO, not duplicated |
| F2 plan-structure | new | CP | `02-requirements/F2-plan-structure/` | the structure that VP evaluates |
| F3 plan-interface | new | CP | `02-requirements/F3-plan-interface/` | the five sections; VP's reader depends on them |
| D1 untraced-plan | `06-defects/` | VP | stays | CP also prevents it: open question 2 |
| A1 verify Plan | root of VP | VP | stays | |
| A14 create Plan | new | CP | `03-architecture/A14-create-plan/` | |
| A2 github | VP's deployment target | VP | stays | |
| A15 github | new | CP | under A14 | deployment target of CP |
| A3 pr-templates, A4 plan-template | under A2 | CP | under A15, ids kept | the template is the interface of CP, an adapter |
| A5 actions, A6 check-job | under A2 | VP | stay | GitHub adapter of VP |
| A7 pr-reader | under A6 | VP | stays | GitHub adapter; parses the five headings of F3 |
| A8 trace-resolver | under A6 | MM, consumed by VP | stays for now | the vocabulary is not VP's: open question 1 |
| A9 evidence-reader, A10 plan-rules, A11 reporter | under A6 | VP | stay for now | portable judgment sitting under a GitHub element: open question 1 |
| A12 rulesets, A13 integration | under A2 | RP | stay for now | a separate preventive control; depends on the status name `verify Plan` |
| `05-src/plan/check.mjs` | check body | VP | stays | GitHub adapter of A6 |
| `05-src/plan/reader.mjs` | PR reader and tree reader | VP | stays | adapter (A7) |
| `05-src/plan/judge.mjs`, `rules.mjs`, `evidence.mjs`, `report.mjs` | judgment | VP | stay | portable |
| `05-src/plan/resolve.mjs` | resolver | MM, consumed by VP | stays | |
| `00-changes/C1-verify-plan/run-red.mjs`, `baseline-judge.mjs` | interim runner and stand-in | TS | stay until Testing provides expected-RED execution | the stand-in is specific to the original C1 PLAN |
| C1, C2 and their Cases T29 to T37 | Changes of VP | H | stay | |
| C3 create Plan and its Cases | new | H | `00-changes/C3-create-plan/` | |

## F1 per rule

| Rule | Concern | Owner of the requirement | Judged by |
| --- | --- | --- | --- |
| 1 Change drivers, Gaps | structure | CP (F2 item 1) | VP |
| 2 Requirement serves Intent | structure | CP (F2 item 2) | VP |
| 3 Architecture addresses, `parent`, parent done | structure; `parent` semantics are MM | CP (F2 item 2), MM | VP |
| 4 Case targets, ids, a Case for every element | structure; id grammar is MM and TS | CP (F2 item 3), MM, TS | VP |
| 5 placement derived from `tests` | TS | TS | VP applies it |
| 6 at least one observed RED | existence is structure; counting is judgment | CP (F2 item 4) for existence, VP for evidence judgment | VP |
| 7 gap Cases apart from target Cases | TS | TS | VP applies it |
| 8 findings, Recovery, UNKNOWN never passes, headings parsed | verdict is CC; headings are F3 | CC, CP (F3) | VP |

## Cases

A Case belongs to the owner of its target. T1, T15 to T16, T19 to T25 and T28 stay with VP, T17 and T18 follow A3 and A4 to CP, T26 and T27 stay with RP, and T29 to T37 stay with their Changes. The Cases T2 to T14 and T38 to T42 test F1 and exercise the judgment, so they stay with VP. No Case moves in this Change. F2 gets its own Case, and whether the rule Cases also test F2 is decided in the DO, because a Case may test several targets.

## Proposed file tree

```
engineering/release-management/
  00-changes/C1-verify-plan/  C2-verify-plan-ids/  C3-create-plan/
  01-intent/       I1-verify-plan/   I2-create-plan/
  02-requirements/ F1-plan-pr/ (judgment)   F2-plan-structure/   F3-plan-interface/
  03-architecture/ A1-verify-plan/ ...        A14-create-plan/ A15-github/ A3-pr-templates/ A4-plan-template/
  05-src/plan/
  06-defects/      D1-untraced-plan/
```

## Dependencies between the controls

- VP consumes F2: its rules cite F2 for the structure they evaluate.
- VP's reader (A7) consumes F3: it parses the five sections that the interface presents.
- CP and VP consume MM, TS and CC and own none of them.
- RP consumes the status that VP reports.
- CP does not depend on VP, so the template is delivered first and alone.

## Open questions for the Owner and the CPO

1. A8 to A11 are portable but sit under the GitHub element A6. Do they stay there, or does VP get a portable feature of its own beside its deployment target?
2. D1 is both prevented by CP and detected by VP. Does D1 stay with VP and is it addressed by A14 as well?
3. Is F2 one requirement, or does the red plan (item 4) become its own requirement?
4. What is the name of the control RP?
