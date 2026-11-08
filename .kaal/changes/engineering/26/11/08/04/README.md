# Engineering: a target without a ledger yields no attestation instead of "cannot judge"

Capability: Engineering. Target: kaal/engineering-attest-target. Record number is provisional until integration.

## Intent

A synchronization into a collector that does not yet hold the ledger (#1204, kaal/foundation) must not fail Change Isolation at the approval-event handler only because the target has nothing to attest against. The attestation adapter now returns no attestation for such a target, and the checker judges the change on its own rules. No attestation is the strict outcome, so nothing is admitted that was not admitted before.

## Content (2 paths, no `.github`, no ledger entry)

- `engineering/change-isolation/attest.mjs`: one line, `if (target === null) return { attested: null, head }`, with the reason in a comment.
- This record.

The Defect and its RED Case are the previous Change (`attest-target.red.mjs`, record 03). This Change does not edit them.

## Check

`node --test engineering/change-isolation/attest-target.red.mjs`: 3 of 3 GREEN (Case 1 was RED). `node --test engineering/change-isolation/attest.test.mjs`: unchanged and GREEN, including "a target without pinned attesters or CODEOWNERS cannot be judged".

## Act

Promotion to main by squash through the queue on the CPO's exact-head approval. It touches no `.github`, ruleset or workflow.
