# C97 evidence

Observed on Node 24, on `main` e221e990 plus this PLAN.

## Expected RED

T1170 alone fails: "the template spells a delivery root" (the Target hint names `.githooks/` and `.github/`).

## It can pass (throwaway copy)

In a throwaway copy with the drafts of `interface.md` (the template source with the new hint, T281 amended, T1170 renamed `.test.mjs`), T1170 and T281 pass. `node --test engineering/cases/cases.test.mjs` in that copy and in an untouched copy of the same files (it holds `engineering`, `packages`, `.kaal` and `.github`, no `.githooks` or root files) fail the same 24 tests, so this Change breaks none; the 24 are the C15 failures and the missing files of the partial copy.

## What is not proven

That the wording of the hint is what the CPO wants: the PLAN states it and the review decides. That T281's amendment is the right way to retire the equality with the C27 draft: it is the Accept item of `change.md`.
