# Pull Promotion v1 command: Change (A to B)

This is `pull/C2`, a PLAN Change. It ships no code. It is the **host integration** of Pull Promotion v1: the command that, run by hand, reads the real repository and prints, per declared collector, whether it has fulfilled its PDCA and which collector moves next. The governing document is [v1.md](v1.md) (CPO direction of 12 Nov 2026: land the smallest useful version first).

In KAAL, **wiring** means connecting a capability to an execution trigger (a hook or a CI workflow). This Change is not that; wiring is a separate, unplanned Change.

## A: the present

The capability `pull/C1` judges one collector from supplied data. Nothing reads the real repository for it and nothing walks the collectors.

## B: the target

In `engineering/release-management/05-src/pull-promotion/`, `run.mjs <repo> <declaration file>` reads the host with a small GET-only gatherer of its own, runs the v1 capability (`pull/C3`) and prints for every declared collector: qualifies, does not qualify (naming the missing phase or check) or not judged (naming the missing fact), and the qualifiers in the declared order. It reads nothing of Show WIP and depends on neither its output nor its supplier. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Order and constraints

Lands after `pull/C3` (the v1 capability, its own PLAN, DO and ACT). Its collector is named `kaal/release/integrate-pull-promotion`. Nothing here is a Git hook, CI workflow, scheduled job, required check, ruleset or Guard change, an automatic invocation, a PR action, an approval or a promotion. Deferred refinements are listed in [v1.md](v1.md) section 4.

## Revision (13 Nov 2026): the command as built

The command first gathered pull-request pieces, deliveries and Check checks for the piece-based capability (`pull/C3`). The capability now qualifies a collector from its file state (`pull/C4`), and the DO #1527 rebuilt the gatherer accordingly. [requirements.md](requirements.md) pull/F14 now describes that gatherer: delta, history by ancestry, head tree, ACT texts and Case executions of the exact head read from CI job logs, the scope of each collector in the declaration, and not judged for whatever the host cut. F15 (credential, read-only) and F20 (not a trigger) are unchanged. See [testing.md](testing.md) for why no new Case is needed.
