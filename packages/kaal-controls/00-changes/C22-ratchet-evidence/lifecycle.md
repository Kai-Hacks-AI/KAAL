# The accepted-baseline lifecycle

Definitions the script and the adopter share. The script does the comparison and the transition; the adopter stores and enforces (A20, C21).

- **Accepted baseline** `A`: the baseline of the last run that was accepted. It is the reference (`previous`) of the next run.
- **Adoption.** The first accepted baseline is the findings present when the ratchet is adopted, by the owner's decision. At adoption the reference is that baseline itself.
- **A run** takes the candidate's findings `F`, the candidate's baseline `B` and the reference `A`, and gives a verdict.
- **Accepted** means the verdict is PASS. Then, and only then, the verdict carries `next` (`A ∩ F`), and the adopter stores `next` as the new `A`. On PASS the candidate's baseline `B` equals `next`.
- **Rejected** means FAIL or UNKNOWN. The verdict carries no `next`, and `A` is kept as it was. A rejected run advances nothing.
- **Improvement.** When findings are resolved, `next` is `A` without them. The allowance for a resolved finding is gone from then on.
- **Rollback.** A resolved finding that returns is new and blocks; putting its allowance back into `B` is growth and blocks.
- **Monotone.** Across accepted runs each `A` is a subset of the one before it, never a superset.
- **End.** When `A` is empty the ratchet is spent and the control is plain preventive; the filter and the baseline are then removed.

What the script cannot know, and the adopter owes: that `A` really is the last accepted baseline (not the candidate's own), and that `next` is stored only after an accepted run.
