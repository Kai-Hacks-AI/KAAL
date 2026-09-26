# KAAL Regression Plan

This is KAAL's regression plan, as the `testing` skill defines one (`skills/testing/SKILL.md`). It protects `main`: `main` accepts a change only when this plan has been shown for it.

## Commitments

Each commitment is named where it is owned.

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

- Every case is run on Linux and on Windows, with Node 22, in a checkout made with `core.autocrlf=true`.
- Seal checks run on Linux.

## Which checks judge a change

- The change's own: its cases, typecheck and format check.
- From `main`, which the change cannot alter: the seal checks.

## Known gaps

- Commitments 1, 2, 4, 5 and 6 are proven only by the change's own cases. A change that weakens their cases is caught by review, not by a check the change cannot alter.
- On Windows, two cases are not run (a named pipe, and symlinks kept verbatim), so their claims are proven on Linux only.
- Which checks `main` requires is set in the repository's ruleset, outside the repository. It should require what this plan names; the repository cannot show that it does.

## Carried out by

- `.github/workflows/test.yml`: `test-linux` and `test-windows`, one run each.
- `.github/workflows/seal.yml`: `seal-linux`.

The same gate also runs `dependency-review-linux`, which is not part of this plan.
