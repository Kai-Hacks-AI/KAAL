# Live run of Pull Promotion v1 on the real repository (Case pull/T14)

Invocation: `node engineering/release-management/05-src/pull-promotion/run.mjs kai-hacks-ai/kaal engineering/release-management/05-src/pull-promotion/declaration.json`

Exit code: 0 (stderr empty). The result is `live-report.json`, written by the command itself, unedited.

## Where it ran

13 Nov 2026 09:42 UTC, in the engineering session's container, with Node v22.23.4, gh 2.89.0 and the session's `GITHUB_TOKEN`, on a checkout of commit `ad606595968e20f0a442951fd419ccaf10110e41` (the DO commit of pull/C2, whose code the later commits of this PR do not change). The host was Kai-Hacks-AI/KAAL, read through GET calls only. It took 48 seconds.

## What it shows

One entry per declared collector (12), in the declared order. No collector qualifies; each says what is missing:

| Collector | Status | Missing (first three) |
| --- | --- | --- |
| kaal/release/plan | does not qualify | #1476 names no Change; #1512 names no Change; #1519 names no Change |
| kaal/release/wire-fallback-template | does not qualify | ACT of release/C14; DO of release/C6; DO of release/C7 |
| kaal/release/wire-hotfix-template | does not qualify | a Change in the collector not yet delivered; check Branching has no run; check Change Isolation has no run |
| kaal/release/wire-hotfix | does not qualify | ACT of release/C17; DO #1525 of release/C17 is open; DO of release/C17 |
| kaal/release/wire-hotfix-engineering | does not qualify | DO of release/C6; DO of release/C7; PLAN of release/C6 |
| kaal/release/wire-analyze-vulnerabilities | does not qualify | #1510 names no Change; DO of release/C6; DO of release/C7 |
| kaal/release/wire-analyze-vulnerabilities-engineering | does not qualify | #1506 names no Change; DO of release/C6; DO of release/C7 |
| kaal/release/check-pr-envelope | does not qualify | ACT of release/C21; DO of release/C21; DO of release/C6 |
| kaal/release/change-isolation | does not qualify | a Change in the collector not yet delivered |
| kaal/release/verify-plan | does not qualify | a Change in the collector not yet delivered; check Branching has no run; check Change Isolation has no run |
| kaal/release/wire-verify-plan | does not qualify | a Change in the collector not yet delivered |
| kaal/release/approve-change | does not qualify | a Change in the collector not yet delivered; check Branching has no run; check Change Isolation has no run |

The qualifiers are empty, so nothing is named as next. This agrees with the hand assessment of 12 Nov: the PLAN and ACT of release/C14 are missing in wire-fallback-template.

## Limitations

- This is the green-path-less run: no real collector qualifies today, so the run shows the not-qualifies and not-judged paths on the real host. The qualifies path is proven on fixtures only (pull/T20, T21).
- It ran in a container with a token that the `gh` login check does not accept (`gh auth status` reports a failed login for `GITHUB_TOKEN`), but REST reads worked; it is not a run in CI with a read-only workflow token, as the Show WIP run was. A run in that form can be recorded on request.
- Commits on a collector include history merged in from `main`. A piece is only counted when its subject is `TYPE: description (#number)` and it landed after the collector's last delivery; a piece without a `Driven-by:` trailer names no Change and makes the collector not judged.
- The declaration's order of collectors is this PR's proposal (the open collectors in the lane order of the queue); the CPO or the Owner decides it by reviewing `declaration.json`.
- Legacy commit statuses are not read, only check runs.
- A run is a point in time. T14 checks that this record exists and has the right shape; with `KAAL_LIVE=<owner/repo>` it also reruns the command on the host.
