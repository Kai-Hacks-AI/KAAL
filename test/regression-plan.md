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
7. Every script of every skill KAAL keeps does what its skill's `SKILL.md` says it does. Stated in each `skills/*/SKILL.md`; the guidance a `SKILL.md` gives agents is not a commitment here.

## What must be shown

- Every commitment above holds, shown by the cases that prove it; commitment 3 also by the seal checks.

## Conditions

- Every commitment is shown on Linux and on Windows, with Node 22, in a checkout made with `core.autocrlf=true`.
- The seal checks run on Linux.

## Which checks judge a change

- The change's own cases, for every commitment.
- From `main`, which the change cannot alter: the seal checks, for commitment 3.

## Known gaps

- Commitments 1, 2, 4, 5, 6 and 7 are proven only by the change's own cases. A change that weakens their cases is caught by review, not by a check the change cannot alter.
- Nothing yet links each commitment to the cases that prove it. Every case is run, so every commitment's cases are reached, but which case proves which commitment is not recorded.
- On Windows, two cases are not run (a named pipe, and symlinks kept verbatim), so their claims are proven on Linux only.
- Which checks `main` requires is set in the repository's ruleset, outside the repository. It should require what this plan names; the repository cannot show that it does.

## Carried out by

- `.github/workflows/test.yml`: `test-linux` and `test-windows`, one run each. `npm test` runs every case in the repository, which is how the commitments' cases are reached today.
- `.github/workflows/seal.yml`: `seal-linux`.

The same gate also runs typecheck, format check and `dependency-review-linux`, which are not part of this plan.
