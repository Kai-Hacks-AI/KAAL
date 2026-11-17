# C67 change

## PLAN

1. Record the Defect release/D1 (`D1-envelope-hotfix-route.md`), add the drafts in `interface.md` and the Cases T870 to T873 (RED).
2. Observe the expected RED on `main`, that each Case can pass with the drafts (`evidence.md`), and which old Cases fail when the drafts are applied.
3. The PLAN changes no source, requirement or existing Case.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C67`, Cases T870 to T879 (four used). No gap id. The Defect `release/D1` is the first of the release capability, taken as the next free one (none exists in the repository).

## DO

On the merged PLAN, into the collector of this Change:

1. Apply the draft to `05-src/plan-body/envelope.mjs` and the draft lines to `F17.md`.
2. Amend T161, T188, T189, T190, T191 and T192 to the agreed route.
3. Rename T870 to T873 from `.red.mjs` to `.test.mjs` when green; run every Case of release-management and the package Cases that read the envelope.
4. Run the body of the HOTFIX template of release/C63 through the corrected check.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

- The promotion of this Change has delivery priority: a HOTFIX cannot pass the live check until it is on `main`.
- The templates WIRE does not proceed until this Defect is answered. The ACT of release/C63 references release/D1 and this Change.
- A WIRE pull request (from `wire/*`) has no route row; it is reported as not judged and is not changed here.
