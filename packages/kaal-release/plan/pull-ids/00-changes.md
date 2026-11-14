# Pull Promotion: every Case sits where its id says and is logged by that id (Change A to B)

This is `pull/C8`, a PLAN Change. It ships no code. It closes the two remaining reasons, besides the concluding ACT, that `kaal/release/plan` does not qualify (see the live report on #1577 after pull/C7). It authorizes preparation, not promotion or publication.

## A: the present

Thirteen Cases of the collector have no execution under the id the declaration expects.

- Twelve Cases of Show WIP (`coordination/T33` to `T39`, `coordination/T40` to `T44`) still sit in `plan/coordination/` and `plan/coordination-review/` as `.test.mjs`. The declaration reads such a path as a bare id (`T33`), but they export a scoped id (`coordination/T33`) and `test/show-wip.test.mjs` logs them as `T33`. No log line can ever match.
- `pull/T34` sits in `test/wire/`, so the declaration expects `wire/T34`, while it exports and logs `pull/T34`.

## B: the target

A Case file sits at the path its id names, and a CI run logs it under that id as a success or a failure:

- completed Show WIP Cases live at `packages/kaal-release/test/coordination/T<n>.test.mjs`, and `pull/T34` at `packages/kaal-release/test/pull/T34.test.mjs`;
- no completed `T<n>.test.mjs` remains under `plan/<change>/` (a PLAN holds RED `.red.mjs` Cases only);
- the runners name each test by the id, the requirements it tests and its title, as `engineering/cases/cases.test.mjs` already does.

Case ids, requirements, assertions and the declaration stay as they are. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Not in this Change

No weakening of any rule: scoped PLAN and DO, the exact-head CHECK, Case completeness and exactly one concluding collector-level ACT stay as approved. The declaration, the gatherer and the Script do not change. No Case is dropped, skipped, renamed or edited beyond its location and import paths. No hook, CI, ruleset or Guard change. No promotion of `kaal/release/plan` (#1577 stays in draft on HOLD).

## Order

PLAN (this), then DO (move the Cases and their runners), then ACT, then a fresh concluding ACT of `kaal/release/plan`, then the SYNC, then live integration evidence at the new exact head.
