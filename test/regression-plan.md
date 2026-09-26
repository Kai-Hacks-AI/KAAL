# KAAL Regression Plan

This is KAAL's regression plan, as the `testing` skill defines one (`skills/testing/SKILL.md`). It protects `main`: `main` accepts a change only when this plan has been shown for it.

## Commitments

Each commitment is owned by one capability of KAAL and stated in one place, where its meaning lives. That place is also its identity: its cases point to it.

1. Genesis is all or nothing: if any step refuses or fails, what the steps before it created is removed again. Owned by Genesis; stated in `scripts/genesis.ts`.
2. KAAL's initial structure is exactly what Genesis produces through its capabilities. Owned by Genesis; stated in `scripts/genesis.test.ts`.
3. A learning, once closed, cannot change unnoticed. Owned by KAAL's use of `using-seals`; stated in `brain/learning/genesis/26/09/25/01/nodes/using-seals.md`.
4. Every skill KAAL keeps follows the Agent Skills standard and is born from its own init: every committed `SKILL.md` is exactly what its init generates. Owned by KAAL's use of `using-skills`; stated in `brain/learning/genesis/26/09/25/01/nodes/using-skills.md`.
5. One skill never depends on another. Owned by KAAL, for every skill it keeps; stated in `brain/learning/genesis/26/09/25/01/nodes/skill.md`.
6. KAAL's testing has one anchor, `test/`, whose entry point is created by the testing skill. Owned by KAAL's use of `testing`; stated in `scripts/test-anchor.test.ts`.
7. Every script of every skill KAAL keeps does what its skill's `SKILL.md` says it does. Owned by each skill; stated in each `skills/*/SKILL.md`; the guidance a `SKILL.md` gives agents is not a commitment here.
8. KAAL's BRAIN is valid, so every learning in it can be sealed. Owned by KAAL's use of `using-brain`; stated in `brain/learning/genesis/26/09/25/01/nodes/using-brain.md`.

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

- Trusted regression is not yet carried out: commitments 1, 2, 4, 5, 6 and 7 are proven only by the change's own cases, and a change can also move or remove the `Why:` lines that link its cases. A change that weakens their cases is caught by review, not by a check the change cannot alter.
- Nothing checks the links: that every case outside the skills has a `Why:` line, that each names a commitment this plan states, or that every commitment has a case.
- Commitments 2 and 6 are stated only in the file of the cases that prove them. Commitment 6 is KAAL's own decision about its testing; its meaning belongs in BRAIN's `testing` node, which is sealed and was learned before `test/` existed.
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
