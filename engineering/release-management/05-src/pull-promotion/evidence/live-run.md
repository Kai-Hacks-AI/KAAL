# Live run of Pull Promotion on the real repository (Case pull/T14)

Invocation: `node engineering/release-management/05-src/pull-promotion/run.mjs kai-hacks-ai/kaal engineering/release-management/05-src/pull-promotion/declaration.json`

Exit code: 0. The result is `live-report.json`, written by the command itself, unedited. stderr held one line: `pull Promotion: could not order the history: 51dc7aa8 does not follow 57c3401f` (the collector `check-pr-envelope`, reported below as not judged).

## Where it ran

13 Nov 2026 about 15:35 UTC, in the engineering session's container (Node v22.23.4, gh 2.89.0, the session's `GITHUB_TOKEN`), on a working tree whose command files are those of commit `bae1c0cd92d48e9d9d6ded83303cf687ce069d40` (the DO of this revision; the commits after it change only this evidence). The host was Kai-Hacks-AI/KAAL, read through GET calls only. It took 6 minutes 44 seconds: the history of each collector is read commit by commit and the logs of every completed CI job of each head are read.

## What it shows

One entry per declared collector (12), in the declared order, judged from file state; no pull request is read. **No collector qualifies**, and each says what is missing:

| Collector | Status | Missing (first two) |
| --- | --- | --- |
| kaal/release/plan | does not qualify | ACT: more than one retrospective (packages/kaal-release/plan/coordination-review/00-changes.md, packages/kaal-release...; Test Case pull/T19 has no execution at the current head |
| kaal/release/wire-fallback-template | does not qualify | ACT: no file of the delta holds one 4L retrospective; PLAN: no file of the delta matches the plan evidence |
| kaal/release/wire-hotfix-template | does not qualify | ACT: no file of the delta holds one 4L retrospective; PLAN: no file of the delta matches the plan evidence |
| kaal/release/wire-hotfix | does not qualify | ACT: no file of the delta holds one 4L retrospective; PLAN: no file of the delta matches the plan evidence |
| kaal/release/wire-hotfix-engineering | does not qualify | ACT: no file of the delta holds one 4L retrospective; PLAN: no file of the delta matches the plan evidence |
| kaal/release/wire-analyze-vulnerabilities | does not qualify | ACT: no file of the delta holds one 4L retrospective; PLAN: no file of the delta matches the plan evidence |
| kaal/release/wire-analyze-vulnerabilities-engineering | does not qualify | ACT: no file of the delta holds one 4L retrospective; PLAN: no file of the delta matches the plan evidence |
| kaal/release/check-pr-envelope | not judged | the delta, the tree and the history of the collector |
| kaal/release/change-isolation | does not qualify | an expected Test Case in the tree; files that differ from main: the delta is empty |
| kaal/release/verify-plan | does not qualify | ACT: no file of the delta holds one 4L retrospective; PLAN: no file of the delta matches the plan evidence |
| kaal/release/wire-verify-plan | does not qualify | an expected Test Case in the tree; files that differ from main: the delta is empty |
| kaal/release/approve-change | does not qualify | ACT: no file of the delta holds one 4L retrospective; DO: no file of the delta matches the do evidence |

## What this means, and limitations

- **kaal/release/plan** holds five retrospectives (one per Change since its last promotion), so by the one-ACT rule it does not qualify. Its `pull` Cases (T19 to T25) have no execution at the current head under a scoped id, because the earlier head reported them as bare `T19` names; the Cases of this DO report as `pull/T<n>`.
- **The wiring collectors** (wire-*) hold files of the wiring only: no PLAN file, no ACT and no Case in their delta or tree. Under the collector-level contract they do not qualify; their PLANs and ACTs live in other collectors.
- **change-isolation, wire-verify-plan** have an empty delta against `main`.
- **check-pr-envelope** is not judged: the host's list of its commits did not follow the first-parent order the capability orders by, so its history is not read. The command names it and does not guess.
- **The green path is not shown on the real host.** No collector has a complete PDCA of this form today; it is proven on fixtures (T26 to T30) and on a recorded real CI log excerpt (`ci-log-excerpt.txt`) for the execution reading.
- **Case executions come from the CI job logs of the exact head**, where the runner prints a Case under a scoped id (`scope/T<n>`). Cases written inline in a suite file, under another name, or whose log the host no longer keeps are not discovered or have no execution, and so are not judged. A test runner other than node's reporter would need its own reading.
- The comparison is the host's three-dot one (from the merge base); a collector that has not been synced since earlier work was promoted by squash shows that work in its delta.
- It ran in a container with a token that the `gh` login check does not accept, but REST reads worked; it is not a run in CI with a read-only workflow token.
- The order of the collectors in `declaration.json` is a proposal for the Owner. A run is a point in time. T14 checks that this record exists and has the right shape; with `KAAL_LIVE=<owner/repo>` it also reruns the command on the host.
