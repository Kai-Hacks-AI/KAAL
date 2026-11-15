# C54 change (provisional id: confirm it is the next free core id)

## PLAN

1. Lists what `kaal/core` holds that `main`'s `packages/kaal-core` (0.0.1) does not, and what `main` holds that `kaal/core` does not (`gap.md`).
2. Decides, per item, one of: land by a small Change, drop, or already on main. It changes no behaviour and touches no package byte, hook, workflow or ruleset.
3. Orders the survivors so each becomes one small PDCA step on a `kaal/core/<concern>` collector. Several steps may reach main before 0.0.1 is published.

## Cases

Not authored yet. The first DO step writes them from the gap table and runs them RED against `main` before this PLAN is called a PLAN. This PR stays draft until they exist.

## Not in this Change

- npmjs publication or a version bump (Kai's go).
- Moving old Core branches to `kaal/old/` (Kai's local agent drains them).
- Foundation 0.0.2 pin (core/C53, #1236): listed in the gap, not decided here.

## DO

Not authorized. On the CPO's approval of the order in `gap.md`.

## ACT

A 4L retrospective in `act.md`.
