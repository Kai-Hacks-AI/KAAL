# C58 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the three controls, the record, the two decisions, the workflow) and the Cases T750 to T757, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no control item, no Intent item, no source, no workflow, no `.github` file, no ruleset and no setting.

## Mechanism

One workflow with three jobs, run by `pull_request_target` from the default branch for a pull request titled `SYNC:` into `kaal/*`, `hotfix/*` or `wire/*`. Nothing of the candidate is checked out or run: its commits are fetched as Git data.

- `verify Sync` (release/CTL7, detective) reads the head and recomputes git's clean merge of its two parents. A SYNC is pure when its tree is exactly that merge, so a resolved conflict, a changed file and an extra commit each fail it without reading any content. It reuses the facts the `synchronization` verdict of `lineage.ts` already reads (second parent on `main`, strictly newer) and is stricter: that verdict admits named resolutions, this one admits none. Branching stays as it is.
- `approve Sync` (release/CTL8, preventive) reads that verdict again for the current head just before it acts, and approves with the workflow token only when it passes, the base is not `main`, and the head has no approval of its own. Mode is a dry run unless the repository variable `KAAL_SYNC_APPROVE` is exactly `on`, so nothing is approved until the Owner sets it.
- `review Sync` (release/CTL9, corrective) acts on every other outcome, FAIL, UNKNOWN or a missing verdict: it labels `sync: needs review`, requests a review and posts one comment per head naming the failed conditions. It never approves, merges or edits.

The decisions are pure functions (`approve.mjs`, `review.mjs`) over facts the workflow reads, so the Cases test them without GitHub.

## Ids

Change `release/C58`, Cases T750 to T759 (eight used: T750 to T757), Intent `release/I32`, gap `release/G87`, controls `release/CTL7`, `release/CTL8` and `release/CTL9`. Allocated by the coordinator on 17 Nov 2026 after release/C57.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Add `01-intent/I32-pure-sync-needs-no-review/I32.md`, the three control items, `05-src/sync-review/` (`verify.mjs`, `approve.mjs`, `review.mjs` and the adapter that reads the facts) and `05-src/wiring/workflows/sync-review.yml`, equal to the drafts.
2. Rename T750 to T757 from `.red.mjs` to `.test.mjs` when they are green.

Rollout after the DO, each step with the Owner's go and no `.github` change before it: the WIRE that installs the workflow with `approve Sync` in dry run; `verify Sync` and `review Sync` live; then a number of real SYNCs read in dry run beside the CPO's own approvals; then, and only on the Owner's decision, `KAAL_SYNC_APPROVE=on`.

## ACT

A 4L retrospective in `act.md`.

## Left open

- **Code Owner review on the collectors.** Whether the old integration ruleset (24952357) requires a review, and a Code Owner review, of `kaal/**` is not confirmed. A bot approval counts toward a required number of approvals and does not satisfy a Code Owner requirement, and no App can be a Code Owner. If the requirement is there, `approve Sync` cannot satisfy it; `verify Sync` and `review Sync` still stand. The Owner confirms before the WIRE.
- **The repository setting** "Allow GitHub Actions to create and approve pull requests" is the Owner's to turn on, and the organization may block it.
- **Who the review is requested of.** `review Sync` requests the review from the Code Owner of the repository. Whether the CPO's reviews come from another login is not recorded here.
- **The type of `approve Sync`.** It is preventive because a SYNC lands only with an approval, and this control supplies that approval. The Owner may name another type of the four the finder accepts.
- **A SYNC into `main`.** It does not exist and is never approved by this control.
- **A SYNC that needs a resolution.** Always a person's, by design.
- **Whether the Branching freshness change** (queue-only promotion) makes the promotion SYNC unnecessary does not change this Change: the SYNC "to unblock development" and the repair after a queue ejection remain.
