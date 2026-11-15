# C16 evidence

## Delivery sequence

1. `main` before the installation. Observed.
2. `main` after the separate `.github` promotion (#1487), which carries only `.github/PULL_REQUEST_TEMPLATE/sync.md`. Pending: #1487 has not landed.
3. This engineering collector, `kaal/release/wire-sync-engineering`, carrying the Change folder, A37 and the three Cases. Observed at the PLAN head.

The engineering files reach `main` after step 2, so the Cases check the installed bytes on `main` and not on a collector.

## Method

The three Cases T116, T117 and T121 are called over a tree of each state. Only Run A and Run B are observations of delivered states. Run C is a simulation: the template text of #1487 is copied into the PLAN head, which is not `main`. It shows what the Cases will judge after step 2 and proves nothing about `main` until step 2 happens.

## Observed

| Run | Tree | T116 | T117 | T121 |
| --- | --- | --- | --- | --- |
| A | `main` plus the three Cases files | RED: A37 absent | RED: the installed template absent | RED: A37 absent |
| B | this collector at the PLAN head: `main`, the template text of release/C9, A37 and the Cases, no installed template | green | RED: the installed template absent | RED: the installed template absent |

## Simulated, pending

| Run | Tree | T116 | T117 | T121 |
| --- | --- | --- | --- | --- |
| C | Run B plus the template text of #1487 | green | green | green |
| C' | Run C with one line appended to the installed template | green | RED: bytes differ | RED: bytes differ |

## Pending verification

- Step 2: after #1487 lands, the installed template is on `main`. Verified by reading `.github/PULL_REQUEST_TEMPLATE/sync.md` on `main` and comparing it with `sync-template.md`.
- After the sync of `main` into this collector, the Cases run green on the collector with the installed template present from `main`, and again on the promotion head. Verified by the DO, the Cases and the checks on its promotion.

## Distinction

T116 and A37 state where the capability is installed. T117 and T121 are the engineering evidence that the installed bytes equal the capability text. Installing the template is `.github`'s work in #1487; this Change proves the installation matches.

## Provenance

Runs A to C' were made on 12 November with a throwaway runner over copies of trees. No run changed `main` or a collector.
