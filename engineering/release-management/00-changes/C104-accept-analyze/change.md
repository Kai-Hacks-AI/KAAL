# C104 change

## PLAN

1. Add the drafts in `interface.md` and the Case T1267 (RED). release/T583 is the second RED Case of this Change and is not changed by the PLAN.
2. Observe the expected RED and that both Cases can pass with the drafts (`evidence.md`).
3. The PLAN adds no record, changes no workflow, no `.github` file and no ruleset.

## Ids

Change `release/C104`, Case T1267 (T1268 and T1269 reserved), gap `release/G113`. Derived from `main` and the open collectors on 20 Nov 2026; release/C102 and C103 are the highest in use.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Add `00-changes/C48-analyze-vulnerabilities-stages/acceptance.md`, equal to the draft of the acceptance record, and rename T583 from `.red.mjs` to `.test.mjs`.
2. Add `00-changes/C104-accept-analyze/equivalence.md`, equal to its draft, and rename T1267 to `.test.mjs`.

## What this does not decide

- Loading the `promoting` ruleset, and retiring `Dependency Review`, which is a WIRE.
- Whether a live old ruleset requires the context `Dependency Review`. It is not read here, and it must be checked before the workflow is deleted.

## ACT

A 4L retrospective in `act.md`.
