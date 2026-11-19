# C73 evidence

## Provenance

- Baseline: the tip of `kaal/release/promotion-raise` at a4417836 (release/C72, not yet on main).
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 18 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T942 | release/I40 | RED: I40.md is absent |
| release/T943 | release/C73 | RED: gather.mjs has no listCollectors |
| release/T944 | release/C73 | RED: raise.mjs has no raiseAll |
| release/T945 | release/I40 | RED: gather.mjs is absent |
| release/T946 | release/C73 | RED: dispatcher.yml is absent |
| release/T947 | release/C73 | RED: app-manifest.json is absent |
| release/T948 | release/C73 | RED: seat.mjs has no oneAtATime |
| release/T949 | release/I40 | RED: raise.mjs has no raiseAll |
| release/T950 | release/I40 | RED: raise.mjs has no raiseAll |

9 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the drafts of `interface.md` written as the DO's files (I40.md, `gather.mjs`, `raise.mjs`, `dispatch.mjs`, `app-manifest.json`, `dispatcher.yml`, `seat.mjs`) and the nine Cases left as they are, all nine were green (T942 to T947 first; T943, T944, T948 and T949 were re-run after the CPO's idempotency request of 18 Nov 2026 against minimal trial drafts of `gather.mjs`, `raise.mjs` and `seat.mjs`, T949 including three overlapping runs against a stand-in that keeps one open pull request per head and base; after the CPO's second review (least privilege, freshness at the write boundary) T944, T947, T949 and T950 were re-run against trial drafts of `raise.mjs`, `withRevision` and the manifest; T942, T945 and T946 were not re-run after those changes, they read nothing it touched, and `dispatch.mjs`, the workflow and the manifest were not re-drafted). The pin of the token action in the trial workflow was a placeholder of forty zeros, which T946 accepts as a commit name; the DO reads the real commit. The files were removed again and are not part of this PLAN.

## What this shows and does not show

The Cases show the boundary as a shape: the facts are read by GET; the one write is the creation of a pull request and only for a strictly read decision; nothing in the sources can approve, merge, enable auto-merge or push; the job that holds the App token reads no collector; no trigger lets a candidate start the workflow. They do not run a real App, a real token mint or a real schedule: those show only in the first dry run after the WIRE, and only the Owner can create the App.

## Reproduce

For each of T942 to T950: `node -e "import('./engineering/release-management/00-changes/C73-dispatcher-raise/T9NN.red.mjs').then(m=>m.run())"`.
