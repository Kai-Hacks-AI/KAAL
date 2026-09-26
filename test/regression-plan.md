# KAAL Regression Plan

This is KAAL's regression plan, as the `testing` skill defines one (`skills/testing/SKILL.md`). It protects `main`: `main` accepts a change only when this plan has been shown for it.

## Commitments

Each commitment is owned by one capability of KAAL and stated in one place, where its meaning lives. That place is also its identity: its cases point to it. This plan names each commitment by that place and does not restate it.

1. Genesis's atomicity. Owned by Genesis; stated in `scripts/genesis.ts`.
2. Genesis's output. Owned by Genesis; stated in `scripts/genesis.test.ts`.
3. Closed learnings. Owned by KAAL's use of `using-seals`; stated in `brain/learning/genesis/26/09/25/01/nodes/using-seals.md`.
4. The skills' standard and birth. Owned by KAAL's use of `using-skills`; stated in `brain/learning/genesis/26/09/25/01/nodes/using-skills.md`.
5. The skills' independence. Owned by KAAL, for every skill it keeps; stated in `brain/learning/genesis/26/09/25/01/nodes/skill.md`.
6. The testing anchor. Owned by KAAL's use of `testing`; stated in `brain/learning/genesis/26/09/26/02/nodes/testing.md`.
7. The skills' scripts. Owned by each skill; stated in each `skills/*/SKILL.md`, as far as it says what the skill's scripts do; the guidance a `SKILL.md` gives agents is not a commitment here.
8. BRAIN's validity. Owned by KAAL's sealing policy; stated in `scripts/brain-seals.ts`.

## How this regression differs from the one it was derived from

Derived from: `main` at `f359663`.

This section names the regression a plan was derived from and what the plan does not retain of it; every commitment of that regression it does not name is retained. On a candidate, the base must be `main` as it is now; once the candidate is merged, the section stays as the record of how this regression came to be, and the next candidate replaces it with its own. Changes made within a candidate before it is merged are not changes to the regression. How a commitment is replaced or withdrawn is stated in `brain/learning/genesis/26/09/26/02/nodes/testing.md`.

- Replaces: nothing.
- Withdraws: nothing.
- Adds: commitment 6, which `main` does not have. `main` has no regression plan: its cases already prove commitments 1 to 5, 7 and 8, which are named here for the first time, and every one of `main`'s cases passes on this candidate.

## How a commitment's cases are found

This plan names commitments, never cases. A case says which commitments it helps prove:

- A case KAAL keeps outside its skills has a `// Why: <place>` line directly above it for each commitment it helps prove, naming the place where that commitment is stated.
- A case a skill keeps helps prove that skill's `SKILL.md`, commitment 7, and never points at KAAL, so the skill stays independent of it.

Some commitments rest on others: Genesis (1, 2) composes skills whose own creation is all or nothing (7), and KAAL's sealing (3) uses the `using-seals` skill's mechanism (7). Such a commitment's own cases prove only what KAAL adds.

## What must be shown

- Every commitment above holds, shown by the cases that prove it; commitments 3 and 8 also by the seal checks.

## Conditions

- Every commitment is shown on Linux and on Windows, with Node 22, in a checkout made with `core.autocrlf=true`.
- The seal checks run on Linux.

## Which checks judge a change

- The change's own cases, for every commitment.
- From `main`, which the change cannot alter: the seal checks, for commitments 3 and 8.

## Known gaps

- Trusted regression is not yet carried out: commitments 1, 2, 4, 5, 6 and 7 are proven only by the change's own cases, a change can move or remove the `Why:` lines that link its cases, and what a candidate retains of `main` is stated only by its own plan. A change that weakens any of these is caught by review, not by a check the change cannot alter.
- Validity is not all that sealing requires: a learning holding a symlink or a special file is valid, and no check sees it before sealing on `main` refuses it.
- Nothing checks the links: that every case outside the skills has a `Why:` line, that each names a commitment this plan states, or that every commitment has a case.
- Commitments 1, 2, 7 and 8 are stated in files that can change in place, so a change to one of them is seen only in the diff of its statement, and nothing yet compares that statement with `main`'s. Commitment 2 is also stated only in the file of the cases that prove it.
- Nothing checks the section on how this regression differs from the one it was derived from: that its base is `main` as it is now, and that every commitment of `main` missing here, or stated differently, is named as replaced or withdrawn.
- Commitment 7 is known to be proven only in part: the skills' command-line entry points, such as `create-node.ts`'s `--edge` parsing, have no cases. Their cases call the scripts' exported functions, not the command lines their `SKILL.md` promises.
- Some proofs are weaker than their claims. Commitment 5's case sees only `from "…"` imports, so a side-effect or dynamic import of another skill passes it. Some cases still hold data inline.
- `package.json` allows Node 22 and later, but only Node 22 is run, so no commitment is proven on a later Node.
- On Windows, two cases are not run (a named pipe, and symlinks kept verbatim), so their claims are proven on Linux only.
- Nothing checks that the workflows carry out what this plan names. Which checks `main` requires is set in the repository's ruleset, outside the repository. It should require what this plan names; the repository cannot show that it does.
- A run reports cases, not commitments, and each workflow runs on both a push and a pull request, so a change is often run twice.

## Carried out by

- `.github/workflows/test.yml`: `test-linux` and `test-windows`, one run each. `npm test` runs every case in the repository, which is how the commitments' cases are reached today.
- `.github/workflows/seal.yml`: `seal-linux`.

The same gate also runs typecheck, format check and `dependency-review-linux`, which are not part of this plan.
