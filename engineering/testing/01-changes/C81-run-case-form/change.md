# C81 change

## Finding

On `main`, `kaal-testing run <Case file>` for a Case in the export form (`export const id`, `export const tests`, `export async function run()`, no node:test; 249 files under `engineering/release-management`, for example `00-changes/C132-judge-from-default-branch/T1430.test.mjs`) reports no test, the problem `empty-inventory: the file has no test`, and `execution.complete: false`. `kaal-testing observe` attributes by the catalog's file and reads a Case GREEN only when its file ran and has a test, so every such Case is UNKNOWN. That is the fail-closed answer for a file it cannot see run, and it means hold Act evidence can never read GREEN from these Cases. The wrapper `engineering/cases/cases.test.mjs` runs each `run()` but reports it under its own file, which `observe` cannot attribute.

## PLAN

1. Place `I49.md`, `F174.md` and `A60.md` (drafts in `interface.md`) in the DO, with the change in `lib/run.mjs` and a bootstrap the child imports; `reconstruct`, `observe` and the report schema stay as they are.
2. Cases `testing/T402` to `testing/T406`, plain `.test.mjs` files in their destination folders (the `C30` and `C80` precedent), RED on this PLAN tree and GREEN in place in the DO:
   - `T402` (`testing/I49`), `T403` (`testing/F174`), `T404` (`testing/A60`): each file equals its draft.
   - `T405` (`testing/F174`): `runCases` over fixture Cases reads an export-form Case that returns as one GREEN test under its own file, a `run()` that throws an assertion error as RED, a `run()` that throws a `TypeError` as UNKNOWN (never RED), and `execution.complete` stays true for the first.
   - `T406` (`testing/F174`): unchanged behaviour and the edges: a node:test file still reports its tests, a file with neither still has `empty-inventory`, `export const run = 42` is not executed (`empty-inventory`), a file with node:test tests and a callable `run` reports both, and a file with a syntax error is `file-failed`.
3. Evidence: `T402` to `T406` RED on this tree, GREEN on a throwaway DO, and the same fixtures giving the report above on `main` versus the DO.

## Order and overlap

- `C69`/`C70` (`kaal-testing/form`, PLAN #2251, not on main) judge Case form; this Change shares only the meaning of a callable `run` and does not wait for it.
- `C80` prerequisite 4 (a route that runs the catalog's Cases with `kaal-testing run`) is served by this Change; the `C80` DO is unaffected.
- Release `C135` DO proceeds on node:test-form disposable Cases and carries this gap until this Change's DO lands.
- Advisory first: no WIRE, required check or ruleset change.

## Ids

Change `testing/C81`, Intent `testing/I49`, Requirement `testing/F174`, Architecture `testing/A60`, Cases `testing/T402` to `testing/T406`. The ids are taken by hand and need the release capability's confirmation; on a clash the newer PR renumbers.

## Risk for the DO

A throwaway prototype (not committed) that always starts the child on a bootstrap importing the Case file turned `T405` GREEN with about five lines, but changed the file-level event (its name and position), so `reconstruct` listed a test for an empty file and two existing `testing/C63` run Cases went RED (the Node 22.23 sandbox already has one failing; Node 24 in CI has none). The DO must keep every existing Case of `test/plan/run-cases` and `test/run-termination` GREEN and must make `T406` GREEN; how the child starts is the DO's choice within `A60`.
