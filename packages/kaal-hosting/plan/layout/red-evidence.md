# Hosting takes the package layout: RED evidence (hosting/C107)

RED for the approved PLAN (`plan/layout/plan.md`, #1064). It adds no source change and no Case. It records what is RED today and the inventory of Cases whose path clause the DO supersedes. The two reserved layout questions (where non-shipped Cases live; where the standing checker guard lives) are open with Kai; this record assumes the recommended answer to each (A, A) and says where a different answer changes it.

## RED: Packaging's structure checker on Hosting's folder today

Checker: `checkStructure` from `packages/kaal-packaging/lib/structure.mjs` at `kaal/packaging` `941f9a8` (packaging/C24 DO, #1053), run on `packages/kaal-hosting` at `kaal/hosting` `5396fc6` (with the PLAN), Node 24, `packed: []`, `build: () => {}`.

Result: `not-in-layout`, with findings for the folders `bin`, `defects`, `docs`, `payload`, `plan`, `skills`, `src` and `test`. That is the RED. The DO is done when the same checker, given the real `npm pack` file list and the real build, reports `verified`.

## Inventory: Cases whose path clause the DO supersedes

Only the path clause changes (Kai's blanket ruling A, 4 Nov); no behaviour clause does. File-level, from a search of every test and source file for the moved paths; the DO refines it to one line per Case with exact before and after paths, and the DO's evidence counts every Case before and after (same Cases, same count).

| File (today) | Moves to | Cases | Moved paths it names |
| --- | --- | --- | --- |
| `test/embed/requirements.test.mjs` | `04-test/package-check/` | T1 to T74 (24) | `docs/`, `src/` |
| `test/embed/architecture.test.mjs` | `04-test/package-check/` | T60 to T66 | `docs/`, `skills/`, `bin/`, `dist/`, `test/verify` |
| `test/embed/intent.test.mjs` | `04-test/package-check/` | T55 to T72 | `docs/`, `bin/`, `src/`, `test/verify` |
| `test/embed/hosting.test.mjs` | `04-test/package-check/` | T110 and the embed Cases | `payload/Hosting.md` (installed Node), `docs/`, `skills/` |
| `test/embed/allocation.test.mjs`, `fixture-ownership.test.mjs` | `04-test/package-check/` | T80, T81 | the allocation tables in `docs/testing.md` |
| `test/embed/conformance.test.mjs`, `harness.mjs`, `usage-harness.mjs` | `04-test/package-check/` | conformance | `skills/` |
| `test/verify.mjs`, `test/verify.json` | `04-test/package-check/` | (the shipped verification entry) | `docs/`, `dist/`, `test/embed` |
| `test/plan/ownership.test.mjs` | `04-test/development/plan/` | T70 | `payload/Hosting.md` -> `kaal/Hosting.md` |
| `test/plan/boundary-check.test.mjs` | `04-test/development/plan/` | T22 to T124 (12) incl. T122 | `test/boundary-check.md` -> `04-test/boundary-check/`, `docs/`, `skills/`, `bin/`, `dist/`, `src/` |
| `test/plan/boundary.test.mjs`, `portability.test.mjs`, `interface.test.mjs`, `usage-skill.test.mjs`, `release.test.mjs`, `directory-listing.test.mjs` | `04-test/development/plan/` | T21 to T75, T129 to T133 | `src/`, `skills/`, `bin/`, `dist/`, `docs/`, `plan/` |
| `test/publisher/*` | `04-test/development/publisher/` | T79 to T136 and the mutation checks | `dist/`, `docs/`, `bin/`, `skills/`, `test/verify`, `test/embed` |
| Source: `src/*.ts`, `bin/kaal-hosting-boundary.mjs` | `05-src/skills/kaal-hosting/scripts/` | (no Cases) | self-references to `skills/`, `payload/`, `plan/` in comments and messages |

If Kai answers B to question 1 (ship the non-shipped Cases), the destination of `test/plan` and `test/publisher` becomes `04-test/package-check/` and the manifest and `dist/` contents change with it. If Kai answers B to question 2, the DO adds one Hosting-local layout-shape Case and this record gains it.

## What the DO must show

1. Hosting's whole suite on the three hosts with the same Cases and the same counts as before the move (190 pass plus the 15 release Cases on Linux today), no behaviour clause edited.
2. `npm pack` delivers exactly `dist/` plus `package.json`, `README.md`, `LICENSE`.
3. A fresh install verifies on the installed copy and `kaal-hosting-boundary --target` runs from it.
4. The checker above reports `verified` on the real folder.
