# Engineering: Cases for the activation of deferred attestation (B1)

Capability: Engineering. Target: kaal/engineering-b1-activation-cases. Record number is provisional until integration (07 holds the F4 Cases).

## Intent

The third trial window starts only with deferred attestation inactive: the pull request job and the merge group's `Change Isolation` job judge strictly, so an unattested ledger-bearing promotion cannot enter the queue. Activation is a separate, reviewed `.github` Change that sets one flag, `KAAL_ATTESTATION=deferred`, in exactly those two judging steps. The Case 6 result is only meaningful if the activation took effect in both jobs and reached no review workflow. This Change gives that Change its Cases, so a test holds the properties the CPO set for the activation.

## Content

`engineering/github/activation.red.mjs`, hand-run (no suite or lane names it), four Cases:

- T158: the helpers return exactly the requested job and step.
- T159: `KAAL_ATTESTATION: deferred` is a literal, set once, in the env of the pull request job's judging step and of the merge group `Change Isolation` job's judging step, and in no other step of either job.
- T160: only the two judging workflows and, since F5, the approval-event handler (`change-isolation-review.yml`, in its judging step only; held by T162 to T167) name the flag; `merge-group-review.yml` never mentions deferred and still judges with the attestation it read; the handler still exports the attestation it read; the admission context is not deferred.
- T161 (precondition): `change-isolation.sh` honours only the exact value `deferred`, only when no attestation is supplied, and passes the checker's deferred mode. It is RED on `main` until the ledger Change (#1119) lands, which is the order the runbook requires.

No ledger entry is carried.

## Check

Against `main` today: T158 GREEN, T159, T160 and T161 RED (strict R1, R2 only in the review workflows, no deferred branch in the script). Against the activation Change plus #1119's script: 4 of 4 GREEN (evidence on the activation PR). The Cases are static; they do not show GitHub's queue behaviour. The live proof is the trial.

## Act

Hand-run until the trial. Lands after the activation, like F4's Cases. No queue, ruleset, promotion or publication.
