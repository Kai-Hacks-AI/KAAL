# C41 change

## What exists

`lineage.ts` holds `deliveryStock(headRef)` (exported), `notGreen(head, checks)` (private) and `promotionSource(facts)`, whose body does three things in order: not a promotion (`baseRef` is not the default branch), origin (`deliveryStock` of a head in this repository, else fail), then the checks (`facts.checks` absent is a fail, otherwise `notGreen`). Facts are read elsewhere (`readRequired`, `readRuns`, `promotion-source.sh`), so the judging is already pure.

## Decisions (the approval of this pull request is the go for the DO)

1. **`promotionOrigin(f)`** is the first two steps: for `{repo, defaultBranch, baseRef, headRepo, headRef}` it returns the verdict (`not-applicable`, `fail` with the guide pointer, or `pass`) together with `stock` (`kaal`, `hotfix`, `wire` or `null`). It carries the same messages `promotionSource` gives today for those two outcomes.
2. **`notGreen(head, checks)`** is exported as it is: the reasons a head is not green, empty when it is. Its own rule (the newest completed run of the required app on this exact commit, the judged check itself not required) does not change.
3. **`promotionSource`** calls `promotionOrigin`, then handles absent `checks`, then `notGreen`, and returns the same verdicts and messages as before. The existing tests of `promotionSource` stay as they are and are the proof.
4. **Names are Release's call.** If Release wants other names for the two exports, it says so before the DO; the Cases pin behaviour, and the DO renames.
5. **Not in this Change:** `runControl`, the control, a workflow, the readers, the shell script.

## What this Change pins (Cases, plain `.test.mjs`)

- T1580: `promotionOrigin` is exported and gives not-applicable outside the default branch, fail with the guide for a fork or a development branch (stock null), and pass with the stock for `kaal/x/y`, `hotfix/z` and `wire/w` of this repository.
- T1581: `notGreen` is exported and says why a head is not green: no required check besides the judged one, no run, a pending newest run, a failed newest run, a success on another commit, a success by another app; and returns nothing for a newest success on this commit.
- T1582: `promotionSource` equals what the two give together: its verdict kind for a fork, a green delivery branch, a red one and one with no facts agrees with `promotionOrigin` then `notGreen`.

All three are RED against `main`: the two exports do not exist.

## Not in this Change

No workflow, no ruleset, no WIRE.
