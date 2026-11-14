# C23 evidence

## Method

T193, T194 and T195 are run by calling each Case's `run()` over a tree. Run A is an observation of `main`. Runs B and C use a throwaway copy of `main` outside the repository with the amendment of the DO applied by hand. They show what the Cases will judge and prove nothing about `main` until the DO.

## Observed

| Run | Tree | T193 | T194 | T195 |
| --- | --- | --- | --- | --- |
| A | `main` (f966a84) plus the three Case files | RED: the Defect line does not require a KAAL Defect | RED: the Defect hint does not ask for a KAAL Defect | RED: F16 does not name a KAAL Defect |

## Simulated, pending

| Run | Tree | T193 | T194 | T195 |
| --- | --- | --- | --- | --- |
| B | Run A with the Defect line of F16 and the Defect hint of the draft amended | green | green | green |
| C | Run B with the reference moved into the Urgency line of F16 | RED: the Urgency line must not carry the Defect reference | green | green |

## Distinction

T152 asserts the Defect hint of the installed template and T181 compares the installed template with the draft. Both depend on release/C17, which is held, and are not run here.

## Provenance

Runs were made on 13 November over copies of trees. No run changed `main` or a collector.

## CHECK at the collector head (13 Nov)

T193, T194 and T195 were run by calling `run()` over `kaal/release/hotfix-defect-reference` at 27dca0b: all three green. The DO amended the Defect line of F16 and the Defect hint of the template draft in `00-changes/C11-hotfix/interface.md`. This is a manual run, not a CI check.

The installed template is not changed by this Change. Its re-wiring to the amended draft is a further DO of release/C17, planned after this collector reaches `main`.
