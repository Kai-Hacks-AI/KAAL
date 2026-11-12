# Pull Promotion wiring: Change (A to B)

This is `pull/C2`, a PLAN Change. It ships no code. It is the wiring of the capability `pull/C1` (the `pull-promotion.mjs` Script, [../pull/00-changes.md](../pull/00-changes.md)) into KAAL's host: the Engineering adapter that reads the real repository. By the Owner's rule of 12 Nov 2026, a wiring has its own PLAN and its own wiring collector and lands only after its capability is done. The core reason is to prevent cheating: the capability's contract cannot be weakened to go green against a wiring that already exists.

## A: the present

`pull/C1` judges one collector from data. Nothing gathers that data from the real repository for KAAL, and nothing proves the Script on the real host.

## B: the target

In `engineering/release-management/05-src/pull-promotion/`, one command reads the repository through the signed-in host reader, reuses Analyze Flow's supplier and command for the facts, adds only the optional facts of `pull/F3`, and prints the verdict of one real collector. It is read-only, with a stated boundary of what is proved, and runs on any appropriately provisioned runner with an explicit read-only credential; the Owner authorizes promotion and is not the test runner. Its acceptance evidence is tied to the exact implementation head and host state. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Order and constraints

Lands only after `pull/C1` is done (its DO and ACT on its collector, all Cases green). Its collector is a wiring collector for the capability, named in the convention `kaal/release/wire-<capability>`. It depends on the optional additions that the Analyze Flow thread would make to its contract; nothing here changes that contract. No PR creation, auto-merge, scheduling, rulesets, hooks, CI or Guard changes.
