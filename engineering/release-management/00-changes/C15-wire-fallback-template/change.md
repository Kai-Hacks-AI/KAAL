# C15 change

## PLAN

1. Add C15 with its Case T181, one per gap, and keep A42 and its Case T177. A42 and the gap G48 were part of the first PLAN of release/C14 and moved here when the Owner ruled that a capability and its wiring are separate Changes.
2. The expected RED is observed against `main` (`evidence.md`).
3. The wiring is the default template file only: the declaration `<!-- KAAL-PR-template: DEFAULT -->` on the first line, a leading comment that calls it the fallback, and the two chapters of release/F18. It reimplements no rule of release/C14 and changes no Case of it.
4. The PLAN delivers no checker and no enforcement, and cites no document that is not on `main`.

## DO

1. The `.github` DO is #1458, delivered into `kaal/release/wire-fallback-template` before the split. The promotion #1461 of that collector is held.

## Order

This Change comes after release/C14. Its increment is not ready until the collector `kaal/release/fallback-template` is delivered at its current version, with its ACT. Until then #1461 stays a draft.

## ACT

1. A 4L retrospective of the Change, in `act.md`, landing in the collector before its promotion.
