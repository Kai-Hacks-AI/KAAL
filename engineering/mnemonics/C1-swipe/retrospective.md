# SWIPE mnemonic: 4L retrospective (agent's viewpoint)

## Liked

A finished draft in the shape of DISCO made the DO a copy with a check. One runnable RED Case kept a one-file Change honest: it failed for the right reason before the DO and the DO changed nothing in it but its name. The PR templates left no room to guess.

## Learned

A collector cannot be named `kaal/<capability>/<slug>` while the branch `kaal/<capability>` exists, because Git refuses a path under an existing branch; the failure said only "Reference update failed". The Branching check fails on a new pull request until auto-merge is registered, and disabling then enabling auto-merge lets it run again. The pull request tool appends a generated footer and cannot request a review from its own author.

## Lacked

A rule for where the Change record of a mnemonic lives; I placed it in `engineering/mnemonics/C1-swipe/` beside its Case. A way to run the Case before pushing, since this session had no clone. A source of truth for ids: I could only search code and found `mnemonics/` unused.

## Longed for

A documented way to open a collector that names the existing-branch clash. A Branching message that says auto-merge must be on before the first run. A way to run a Case from a session that only has the GitHub API.
