# C17 evidence

## Method

The Case T181 is called over a tree of each state with a throwaway runner. Run A is an observation of `main`. Runs B and C are simulations: the draft is copied into `.github/PULL_REQUEST_TEMPLATE/hotfix.md` of a working tree, which is not a delivered state. They show what the Case will judge once the template is on `main` and prove nothing about `main` until then.

## Observed

| Run | Tree | T181 |
| --- | --- | --- |
| A | `main` (57c3401) plus the Case file | RED: the installed HOTFIX template is absent |

## Simulated, pending

| Run | Tree | T181 |
| --- | --- | --- |
| B | Run A plus the draft of release/C11 as the installed template | green |
| C | Run B with one line appended to the installed template | RED: bytes differ |

## Pending verification

- After the `.github` promotion lands, the installed template is on `main`. Verified by reading it on `main` and comparing it with the draft.
- After the sync of `main` into the engineering collector, the Case runs green there and on its promotion head.

## Provenance

Runs were made on 13 November over copies of trees. No run changed `main` or a collector.
