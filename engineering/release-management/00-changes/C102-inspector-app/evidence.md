# C102 evidence

Observed on Node 24, on `main` 1168212 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the five Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1250 | `I55.md is absent` |
| T1251 | `F79.md is absent` |
| T1252 | `A70.md is absent` |
| T1253 | `app.json is absent` |
| T1254 | `inspector.yml is absent` |

`node --test engineering/cases/cases.test.mjs` on this tree: 300 tests, 284 pass, 16 fail. The same 16 fail on `main` at 1168212 (a clean checkout), so this PLAN adds none. The `.red.mjs` files are ignored by the finders and the runner.

## Each Case can pass (throwaway copy)

In a throwaway copy of the Change folder, the five drafts of `interface.md` were written as the DO's files (the three elements, `05-src/inspector/app.json`, `05-src/wiring/workflows/inspector.yml`) and each Case run alone: T1250 to T1254 all pass. T1253 and T1254 pass only because their hand-made negatives are refused by the same judgement: a manifest with `contents` or `pull_requests` write, `administration`, `statuses`, a subscribed event, an active webhook or a missing permission; a workflow with a secret in the judge job, a judge that keeps credentials, `pull_request_target`, `write-all`, a signer that checks out the change or does not need the judge, and the key named in the judge job.

## Not observed here

The judge, the sign step and the workflow template of controls are not on `main` (only slice 1 of release/C14 of controls), so the `node` paths in the workflow draft are not run by any Case. The DO waits for them.
