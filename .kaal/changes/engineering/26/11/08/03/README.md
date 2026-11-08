# Engineering: record the Defect "a target without a ledger cannot be judged" with a RED Case

Capability: Engineering. Target: kaal/engineering-attest-target. Record number is provisional until integration.

## Intent

The approval-event handler fails Change Isolation on every review event of a synchronization into a collector that does not yet hold the ledger (#1204, kaal/foundation). The attestation adapter reads the ledger, the pinned attesters and CODEOWNERS from the target branch, and ends in "cannot judge" when the target has no ledger. A synchronization is exactly the change that gives such a branch its ledger. This Change records the Defect and the Case that shows it; the fix is a separate Change.

## Content (2 paths, no `.github`, no ledger entry)

- `engineering/change-isolation/attest-target.red.mjs`: Case 1 (RED on main): a target with no ledger yields no attestation. Case 2 (control): such a target never lets an approval attest. Case 3 (control): a target with a ledger but without pinned attesters or CODEOWNERS is still "cannot judge".
- This record.

## Check

`node --test engineering/change-isolation/attest-target.red.mjs` on main: Case 1 fails with CannotJudge ("the target holds no ledger"), Cases 2 and 3 pass.

## Act

Hand-run. The fix Change follows in the same collector.
