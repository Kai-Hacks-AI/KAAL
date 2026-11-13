# Third live run: evidence scoped to the capability of each collector

The first run ([live-run.md](live-run.md)) and the second ([live-run-tree-state.md](live-run-tree-state.md)) are kept unedited. This run repeats the command after the declaration gave each collector a `scope` (path patterns of the capability it carries) and listed both record shapes of a concluding ACT (`plan/<change>/00-changes.md` and `00-changes/<change>/act.md`). Same invocation and host (Kai-Hacks-AI/KAAL, GET calls only), 13 Nov 2026 after 16:35 UTC, exit 0, stderr empty. Result: [live-report-scoped.json](live-report-scoped.json), unedited. **No collector qualifies.**

## What the scope changed

Without a scope, the PLAN and DO of every collector were satisfied by files inherited from `main`. With it, a collector is judged by its own capability's files only:

| Collector | Reading | Why |
| --- | --- | --- |
| kaal/release/plan | **genuinely missing** | five retrospectives in scope, where one concluding ACT is required; its `pull` Cases have no scoped-id execution at the head (**reader limitation**: earlier heads printed bare `T19`) |
| the wire-* collectors (6), verify-plan, approve-change | **genuinely missing** | no PLAN, no ACT of their own inside their scope; their Change records live in other collectors |
| the same, and change-isolation, wire-verify-plan | **declaration limitation** | the Case pattern finds no Case file in scope (engineering Cases are `00-changes/C<n>-.../T<n>.test.mjs`, which the pattern and the scoped-id log reading do not cover), so CHECK is not judged |
| change-isolation, wire-verify-plan | **nothing to promote** | empty delta against `main` |
| check-pr-envelope | **host reading** | the host no longer lists the collector |

## The qualifying path

No real collector is complete in this form today, so no real collector qualifies; that is said plainly. The qualifying path is shown by Case pull/T31 on a host that answers the gatherer's REST reads like the real one: `kaal/demo/own` carries PLAN, DO, a Case and a `00-changes/<change>/act.md` retrospective inside its scope, its Cases are green at the exact head in the job log, and it qualifies; `kaal/demo/inherits` holds only PLAN, DO and Cases inherited from `main` and does not qualify, naming that nothing differs inside its scope.

## Concluding ACT convention in this declaration

One retrospective per capability collector, in a file under the capability's scope that matches either `plan/<change>/00-changes.md` or `00-changes/<change>/act.md` and holds the four 4L headings. Both shapes are read; two retrospectives of any shape in scope do not qualify. A different convention is a change of the declaration, reviewed as any other file.
