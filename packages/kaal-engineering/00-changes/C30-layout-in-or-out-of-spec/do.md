# C30 do

## Implement

1. The template marks the required parts: the root files `AGENTS.md`, `README.md` and `package.json`, and the folders `10-intent`, `11-requirements`, `12-architecture`, `13-source` and `14-operations`. Edited in place; `draft/` is removed and was not moved over the template.
2. `check-layout.mjs` reads the flag and names every tracked root file and every folder the template does not name, and every required part that is missing. The finding "the folder holds none of the layout's folders" goes: the missing parts say it.
3. `package-layout.md` has a section "In or out of the specification"; the CTL2 text names the new faults (PASS: nothing missing and nothing too much).
4. F52 and F57 are amended, and so are the three Cases that pinned the old answers: T1231 (an unnumbered folder is named; the missing parts are named), T1243 (a package with no `14-operations` is FAIL) and T1335 (its fixture holds the required folders). T1380 to T1382 were plain `.test.mjs` from the PLAN and are not renamed.

## Evidence

T1380 to T1382 are GREEN. The package's Cases are GREEN except T1178 and T1228, which are RED on the collector too (they need the Hosting environment). The rest of the layout Cases (T1220 to T1245, T1331 to T1335) are GREEN.

## The baseline: the first run over every package

The check run over each folder in `packages/` that has a `package.json`, at the head of this DO. It is a detective report; no job, ruleset or pull request reads it. The findings per package are what a later ratchet tightens against, never these numbers.

| Package | Verdict | Findings |
| --- | --- | --- |
| kaal-architecture | FAIL | 13 |
| kaal-change | FAIL | 17 |
| kaal-controls | FAIL | 12 |
| kaal-core | FAIL | 17 |
| kaal-engineer-skill | FAIL | 11 |
| kaal-engineering | FAIL | 14 |
| kaal-foundation | FAIL | 12 |
| kaal-graph | FAIL | 10 |
| kaal-guard | FAIL | 14 |
| kaal-hosting | FAIL | 16 |
| kaal-release | FAIL | 12 |
| kaal-retro | FAIL | 12 |
| kaal-review | FAIL | 14 |
| kaal-testing | FAIL | 14 |

## Refactor

None.

## Not done

No baseline file, ratchet, job or ruleset, and no package migrated.
