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

## CHECK at the exact heads (13 Nov)

T181 was run by calling `run()` over the effective target state of the wiring: the tree of `kaal/release/wire-hotfix` at 2b98258, with the C17 folder of `kaal/release/wire-hotfix-engineering` at 3196eea added.

| Item | Value |
| --- | --- |
| T181 | green |
| sha256 of the installed `.github/PULL_REQUEST_TEMPLATE/hotfix.md` | c17f7a316d4ab654db9384a31bb1692fa4cd29e96b50811333776591bd9236a2 |
| sha256 of the fenced draft in `00-changes/C11-hotfix/interface.md` at 3196eea | c17f7a316d4ab654db9384a31bb1692fa4cd29e96b50811333776591bd9236a2 |
| Delta of `kaal/release/wire-hotfix` against its base | one commit, one file, 17 lines (#1525) |

This is a manual run of the Case, not a CI check. The engineering collector alone does not hold the template, so the Case stays `.red.mjs` there; it is renamed to `.test.mjs` once the template is on `main`. The draft of release/C11 is unchanged by this run. A later amendment of the draft (release/C23) needs the installed template to follow it through its own wiring.

## CHECK at the exact heads (14 Nov, after both SYNCs)

Heads: `kaal/release/wire-hotfix` at e18c14f, `kaal/release/wire-hotfix-engineering` at 6b44cf5, `main` at 0b94738 (release/C24 included); neither collector is behind `main`. `kaal/release/wire-hotfix` differs from `main` by one file, `.github/PULL_REQUEST_TEMPLATE/hotfix.md`.

| Item | Value |
| --- | --- |
| sha256 of `hotfix.md` at e18c14f | a3a14714357f1b2082449cfdfd5551f90df3782fff9510a03804a16f655909f3 |
| sha256 of `hotfix.md` at 6b44cf5 | a3a14714357f1b2082449cfdfd5551f90df3782fff9510a03804a16f655909f3 |
| sha256 of the fenced draft in `C11-hotfix/interface.md` at 6b44cf5 | a3a14714357f1b2082449cfdfd5551f90df3782fff9510a03804a16f655909f3 |
| T181 draft/installed byte equality | green |
| T201 the one envelope cue in the draft | green |
| T150, T151, T152, T153, T154, T155, T157, T159, T160 (active `.test.mjs` at their original paths) | all green |

Method: `run()` of each Case called over the tree of the engineering collector at 6b44cf5, which holds the installed `hotfix.md`; the `.github` collector's file was compared byte for byte. The engineering collector's CI runs the same Cases as active Cases.
