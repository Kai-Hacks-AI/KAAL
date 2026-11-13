# Second live run: PLAN and DO read from the head tree (after pull/F26 refinement)

The first run ([live-run.md](live-run.md), [live-report.json](live-report.json)) is kept unedited. This run repeats the same command after the Script judged PLAN and DO from the collector's head tree (the delta only says whether there is anything to promote). Same invocation, same host (Kai-Hacks-AI/KAAL, GET calls only), 13 Nov 2026 after 16:00 UTC, exit 0, stderr empty. Result: [live-report-tree-state.json](live-report-tree-state.json), unedited. **No collector qualifies.**

## What changed against the first run

PLAN and DO are no longer reported missing for any collector: the tree holds them. What remains is what the collectors really lack, or what the reader cannot see.

| Collector | Reading | Why |
| --- | --- | --- |
| kaal/release/plan | **genuinely missing** | five retrospectives (one per Change), where one concluding ACT for the collected work is required |
| wire-fallback-template, wire-hotfix-template, wire-hotfix, wire-hotfix-engineering, wire-analyze-vulnerabilities, wire-analyze-vulnerabilities-engineering, verify-plan, approve-change | **genuinely missing** | no retrospective of their own in the delta |
| the same eight, change-isolation, wire-verify-plan | **declaration limitation** | "an expected Test Case in the tree": the Case pattern (`packages/*/test/<scope>/T<n>.test.mjs`) finds no Case file in their tree, so CHECK cannot be judged; whether they have Cases not matching the pattern is not known |
| change-isolation, wire-verify-plan | **genuinely nothing to promote** | the delta against `main` is empty |
| check-pr-envelope | **host reading** | the host no longer lists the collector (not judged, naming it) |

Not shown by this run, and said plainly: no real collector reaches a green path today. The qualifying state is shown below on a fixture, not on the real host.

## Representative qualifying state

`test/pull/fixtures.mjs` builds, as the Cases do, two states that are judged through the same Script:

- **qualifies** (`good`): PLAN, DO, two changed Cases and one ACT in the delta, one unchanged Case in the tree, every Case green at the exact head, the ACT in the last commit.
- **qualifies, evidence carried** (`carried`): PLAN and DO already in the tree and identical to `main`; the delta holds one changed Case and the ACT.
- **does not qualify**: no PLAN in the tree; no DO; empty delta; a Case red; two retrospectives; a DO file changed after the ACT.
- **not judged**: a Case with no execution at the head; a history that does not end at the head; an unread ACT.

## Limitation of the tree rule

The tree holds every file of `main` too, so the declaration's PLAN and DO patterns match for any collector unless they name the capability's folders. The ties to the collected work are the non-empty delta, the one ACT that must be a delta file, and the Cases at the exact head. A per-collector evidence declaration would be a further PLAN change; none is made here.
