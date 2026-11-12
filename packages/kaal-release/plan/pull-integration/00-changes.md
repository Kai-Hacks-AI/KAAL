# Pull Promotion host integration: Change (A to B)

This is `pull/C2`, a PLAN Change. It ships no code. It is the **host integration** of the capability `pull/C1` (the `pull-promotion.mjs` Script, [../pull/00-changes.md](../pull/00-changes.md)) with KAAL's GitHub host: a read-only command that obtains the facts from the real repository and evaluates a real collector, invoked by a person or an agent. By the Owner's rule of 12 Nov 2026 it has its own PLAN and its own collector and lands only after its capability is done. The core reason is to prevent cheating: the capability's contract cannot be weakened to go green against an integration that already exists.

## Three concerns, three Changes

In KAAL, **wiring** means connecting a capability to an execution trigger (a Git hook or a CI workflow). Reading facts from the host through an adapter and running the capability by hand is **host integration**. They are different Changes (CPO, 12 Nov 2026):

| Concern | Change | What it is |
| --- | --- | --- |
| Capability | `pull/C1` (done) | The host-independent readiness decision from supplied facts. |
| Integration | `pull/C2` (this) | The command that evaluates a real collector on request, using the shared GitHub observer (see [decomposition.md](decomposition.md)); no host mapping of its own. |
| Wiring | a future Change, not planned here | A hook or CI trigger that invokes the integrated command automatically. |

## A: the present

`pull/C1` judges one collector from data. Nothing gathers that data from the real repository for KAAL, and nothing proves the Script on the real host.

## B: the target

In `engineering/release-management/05-src/pull-promotion/`, one command obtains the observations of the real repository from the shared GitHub observer (not from Analyze Flow), runs the capability and prints the verdict of one real collector. It is read-only, with a stated boundary of what is proved, and runs on any appropriately provisioned runner with an explicit read-only credential; the Owner authorizes promotion and is not the test runner. Its acceptance evidence is collected first and certified afterwards, tied to the exact implementation head and host state. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Boundaries and exclusions

- **In this Change:** the adapter, the command, its read-only and portability evidence (`pull/F14` to `pull/F18`), and the proof that nothing triggers it (`pull/F20`).
- **Not in this Change:** any Git hook, CI workflow, scheduled job, required check, ruleset or Guard change; any automatic invocation; any PR creation, auto-merge, approval or promotion; any change to Analyze Flow's supplier or contract; any change to the capability (its re-basing is `pull/C3`, a separate Change). The command is run by hand.
- **Dependency (revised, CPO direction of 12 Nov):** the integration depends on the shared host-observation elements and on the capability re-based on them, **not** on Analyze Flow: neither its findings nor its supplier (#1476). The elements, ownership and delivery order are proposed in [decomposition.md](decomposition.md), for CPO alignment before any implementation. The integration DO does not start before them.

## Order and constraints

Lands only after `pull/C1` is done (its DO and ACT on its collector, all Cases green) and after the shared elements of [decomposition.md](decomposition.md). Its collector is named `kaal/release/integrate-pull-promotion`. Nothing here changes Analyze Flow's contract or the merged capability; their changes are separate Changes named in the decomposition.
