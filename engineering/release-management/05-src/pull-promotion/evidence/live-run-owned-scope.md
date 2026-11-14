# Fourth live run: scopes of owned work and every Case shape

Runs one to three ([live-run.md](live-run.md), [live-run-tree-state.md](live-run-tree-state.md), [live-run-scoped.md](live-run-scoped.md)) are kept unedited. This run follows the CPO review of 13 Nov 17:40: each collector's scope now covers exactly the work it owns, a delta file outside the scope keeps a collector from qualifying (pull/F32), and the Case patterns cover both record shapes (pull/F33). Same invocation and host (Kai-Hacks-AI/KAAL, GET calls only), 13 Nov 2026 after 17:45 UTC, exit 0, stderr empty. Result: [live-report-owned-scope.json](live-report-owned-scope.json), unedited. **No collector qualifies.**

## How the scopes were fixed

Each scope was checked mechanically against the collector's real delta (`git diff main...<collector>`): every delta file lies inside its scope, so no owned work is left out. The check found three files that the earlier scopes missed: `package.json` and `package-lock.json` of `kaal/release/plan`, and `AGENTS.md`, `README.md` and `package.json` of `kaal/release/verify-plan`. They are now in those scopes. The wiring collectors' scopes now include the Change records of their own capability (C17, C18), even though those records are held by the paired `-engineering` collector. Collectors with an empty delta own no known work, and their scope names the Change folder from their name, so nothing is claimed for them.

## What the run shows

| Collector | Reading | Why |
| --- | --- | --- |
| kaal/release/plan | **genuinely missing** | five retrospectives in scope instead of one. Its `pull` Cases still lack a scoped-id execution at the head (**reader limit**: earlier heads printed bare `T19`) |
| wire-fallback-template, wire-hotfix-template, wire-hotfix, wire-analyze-vulnerabilities | **genuinely missing** | their own PLAN and ACT records are not in the collector: the paired `-engineering` collector (or none yet) holds them |
| wire-hotfix-engineering, wire-analyze-vulnerabilities-engineering, verify-plan | **genuinely missing** | the Change records are there (PLAN found by the `change.md`/`gap.md` pattern) but no concluding ACT; their Cases are `.red.mjs` |
| approve-change | **genuinely missing** | no PLAN, DO or ACT file of its own in scope |
| change-isolation | **genuinely missing** | T48, T49, T50, T51 and T54 (engineering Cases) are now expected and have **no execution at the head**: those Cases are not run by CI on this repository, so the host holds no record of them. The delta is also empty |
| wire-verify-plan | nothing to promote | empty delta |
| check-pr-envelope | **host reading** | the host no longer lists the collector |

The engineering Cases are no longer omitted: `change-isolation` is the proof, because it did not name them before. They cannot be judged green until CI runs them and logs them under a scoped id; that is a gap of the host's CI, not something the Script may assume away.

## Positive evidence

Case pull/T14 (end to end on a host that answers the gatherer's REST reads like the real one) shows `kaal/demo/own` qualifying with complete evidence of its own, and `kaal/demo/inherits` not qualifying. Cases pull/T31 and T32 show the scope and discovery rules on the Script. There is no qualifying real collector today, and none was staged.
