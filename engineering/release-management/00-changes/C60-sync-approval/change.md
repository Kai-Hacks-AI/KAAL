# C60 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the two additions to the controls, the classification, the output, the settings file, the workflow change) and the Cases T790 to T793, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no control item, no Intent item, no source, no workflow and no `.github` file, and changes no ruleset and no setting.

## Mechanism

- `approve.mjs` gains `classifyRefusal(message)`: `actions-not-permitted` for the refusal that names Actions not being permitted to approve, `other` for anything else.
- `cli.mjs approve` catches only the failure of the approving call. A refusal of class `actions-not-permitted` becomes `::error title=approve Sync: Actions may not approve` naming the setting, sets the job output `approval` to `refused` and exits 1. Any other failure still throws, unnamed, so it is never mistaken for the setting. The output `approval` is `approved`, `would-approve` or `skipped` otherwise.
- `review.mjs`: `decideReview` takes the `approval` output. A passing verdict with `approval` `refused` is put in front of a person like any other SYNC that needs one: label, one comment per head naming the refused approval, request a review.
- `sync-review.yml`: `review Sync` needs `verify` and `approve`, still runs when `approve` failed, and reads `approval`.
- `05-src/sync-review/settings.json` declares the two settings CTL8 needs, and release/CTL8 states them and that it reaches Running once a live run has approved a SYNC, shown by an APPROVED review of `github-actions[bot]` on a SYNC head.

## Ids

Change `release/C60`, Cases T790 to T799 (four used: T790 to T793), Intent `release/I33`, gap `release/G91`. No new control. Allocated by the coordinator on 17 Nov 2026.

## DO

On the go of the Owner, into the collector of this Change: add `01-intent/I33-refused-approval-reaches-a-person/I33.md`, the additions to `approve.mjs`, `cli.mjs`, `review.mjs`, the workflow source and `settings.json`, add release/I33 to `has` of CTL8 and CTL9 and the stated settings to CTL8, all equal to the drafts. Rename T790 to T793 from `.red.mjs` to `.test.mjs` when green.

Three Cases of release/C58 assert the shapes this Change deliberately changes and move with it in the DO: release/T751 and release/T752 (the controls equal their C58 drafts: CTL8 and CTL9 now also hold release/I33, CTL8 has the Settings paragraph) and release/T757 (`review Sync` needs `verify` only). Observed in the trial of the drafts: those three fail on the drafted files and nothing else of C58 does.

## ACT

A 4L retrospective in `act.md`.

## Left open

- The refusal can only occur in live mode, so the setting is first evidenced by the first live approval. The Owner's switch-on is that moment.
- Whether the organization blocks Actions from approving is not read here; the finding names both places.
- The WIRE of the changed workflow is a separate step with the Owner's go.
