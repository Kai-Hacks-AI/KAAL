# C65 do

## What the DO added

- `01-intent/I35-sync-review-token-boundary/I35.md`, equal to its draft.
- `05-src/sync-review/cli.mjs`: `verify` takes the head and body from the environment and reads no API; `approve` reads the pull request and the base's tip through the API, never runs `git`, and attaches the approval to the head it read; `review` reads the verdict as data and never runs `git`, leaves a verdict of another head to its own run and reads a pass whose base moved as FAIL (`base-moved`). `approve.mjs`: `readVerdict` and `decideApproveNow` on the live head and base tip. `review.mjs`: `cleanVerdict`.
- `05-src/wiring/workflows/sync-review.yml` (a source, not installed): `verify Sync` has `permissions: {}`, no token and no API, and is the only job that fetches the candidate; `approve Sync` and `review Sync` fetch nothing and name no `refs/pull`.
- `CTL7.md` and `CTL8.md`: release/I35 in `has` and the Boundary paragraphs, equal to the drafts.
- T850 to T855 renamed from `.red.mjs` to `.test.mjs`; all green.

## Cases that moved with it

release/T750 and release/T751 (the controls equal their drafts with what C65 adds), release/T759 (approve and review judge from the live head and base; the rewound-main step is dropped as `change.md` says), release/T791 and release/T792 through the shared `fixtures.mjs` of release/C60 (the stand-in GitHub answers the base ref, and `verify` takes the body from the environment). release/T753 to T758, T790, T793, T752, T540, T600 and T730 are unchanged and green.

## Not done

No `.github` file, ruleset or setting is changed and nothing is switched on. The new WIRE of the workflow replaces #1885 and is a separate step with the Owner's go; CodeQL on it is the evidence that the real scanner reads the boundary as clean.
