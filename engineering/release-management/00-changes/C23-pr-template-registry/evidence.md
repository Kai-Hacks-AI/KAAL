# C23 evidence

## Method

Each Case is called over a tree with a throwaway runner. Run A is an observation of `main` plus the Case files. Run B is a simulation: a throwaway `install.mjs`, `manifest.json` (SYNC only, `closed` false) and `sync.md` are added to a working tree and the SYNC text is removed from A34. It is not a delivered state. It shows that the Cases are satisfiable and proves nothing about `main`.

## Observed

| Run | Tree | T193 | T194 | T195 | T196 | T197 |
| --- | --- | --- | --- | --- | --- | --- |
| A | `main` (f966a84) plus the Case files | RED: manifest.json is absent | RED: install.mjs is absent | RED: install.mjs is absent | RED: install.mjs is absent | RED: a second SYNC source remains in A34 |

## Simulated

| Run | Tree | Result |
| --- | --- | --- |
| B | Run A plus the throwaway registry | all five Cases pass |

Run B also showed a defect of the first design: with SYNC as the only entry, a check that fails on every unregistered installed template fails on PLAN, DO, ACT and PROMOTION. The manifest therefore carries `closed`, false until the last installed template is adopted (A43, T194, T195).

## Pending verification

- The DO makes the Cases pass in the collector at its head.

## Provenance

Runs were made on 13 November over copies of trees. No run changed `main` or a collector.
