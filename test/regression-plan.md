# KAAL Regression Plan

`main` accepts a change only when this plan has been demonstrated for it. A change to this file is a change to what KAAL's testing promises, and is reviewed as one.

## Commitments

Each commitment is stated once, where it is owned. Cases that prove it may be split, merged, replaced or moved without changing this plan; changing what a commitment says changes this plan.

1. Genesis is all or nothing: if any step refuses or fails, what the steps before it created is removed again. Stated in `scripts/genesis.ts`.
2. KAAL's initial structure is exactly what Genesis produces through its capabilities. Stated in `scripts/genesis.test.ts`.
3. A learning, once closed, cannot change unnoticed. Stated in `brain/learning/genesis/26/09/25/01/nodes/using-seals.md`.
4. Every committed `SKILL.md` is exactly what its skill's init generates. Stated in `brain/learning/genesis/26/09/25/01/nodes/using-skills.md`.
5. One skill never depends on another. Stated in `brain/learning/genesis/26/09/25/01/nodes/skill.md`.
6. KAAL's testing has one anchor, `test/`, whose entry point is created by the testing skill. Stated in `scripts/test-anchor.test.ts`.

## What must be shown

- Every case `npm test` selects passes, and none fails.
- The code typechecks (`npm run typecheck`) and is formatted (`npm run format:check`).
- BRAIN's seals hold and the change touches no seal state (`npm run seals:check`, `npm run seals:guard`).

## Conditions

- Every case is run on Linux and on Windows, with Node 22, in a checkout made with `core.autocrlf=true`. A result holds only for the conditions it was observed in.
- Seal checks run on Linux.

## Which checks judge a change

- The change's own cases, typecheck and format check run against the change: they prove what the change adds.
- The seal checks run from `main`'s own code against the change: the change cannot alter them.

## Known gaps

- Commitments 1, 2, 4, 5 and 6 are proven only by the change's own cases. A change that weakens their cases is caught by review, not by a check the change cannot alter.
- On Windows, two cases are not run (a named pipe, and symlinks kept verbatim), so their claims are proven on Linux only.
- Which checks `main` requires is set in the repository's ruleset, outside the repository. It should require what this plan names; the repository cannot show that it does.

## Carried out by

- `.github/workflows/test.yml`: `test-linux` and `test-windows`, one run each.
- `.github/workflows/seal.yml`: `seal-linux`.

The same gate also runs `dependency-review-linux`, which is not part of this plan.
