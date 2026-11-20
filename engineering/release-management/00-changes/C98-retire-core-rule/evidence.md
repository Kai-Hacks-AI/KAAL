# C98 evidence

Observed on Node 24, on `main` plus this PLAN.

## Expected RED

T1171 and T1172 fail on `main`: the Core rule refuses `packages/kaal-core/x` with `engineering/y.md`, and reports two violations for `.github/x` with `packages/kaal-core/y`.

## It can pass (throwaway copy)

In a throwaway copy (`engineering`, `packages`, `.kaal`, `.github`) with the rule removed as in `interface.md`, T1171 and T1172 pass. The tests of `engineering/change-isolation` that fail in the copy but not on an untouched copy are exactly the Accept list of `change.md`: the block "core travels alone", "fails .github mixed with Core under both rules", "aggregate changes", two CLI tests, two ledger refusals and engineering/T119. Nothing else of Change Isolation turns red.

## What is not proven

That removing the ledger's refusal tests, rather than rewriting them against another rule, is what the Owner wants: the ledger itself is the next Change. That nothing outside the checker names the retired rule: the guard note `.kaal/config/guard/Change-Isolation.md` and the READMEs under `engineering/change-isolation` still say "Core travels alone", and the DO edits their text.
