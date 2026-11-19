# C72 evidence

## Provenance

- Baseline: `main` at 16a5a7d.
- Method: each Case's `run()` is imported and called in the tree of this PLAN. Observed 18 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T932 | release/I39 | RED: I39.md is absent |
| release/T933 | release/C72 | RED: decide.mjs has no decideRaise |
| release/T934 | release/C72 | RED: decide.mjs has no decideRaise |
| release/T935 | release/C72 | RED: decide.mjs has no decideRaise |
| release/T936 | release/C72 | RED: cli.mjs is absent |

5 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

With the drafts of `interface.md` written as the DO's files (I39.md, `05-src/promotion-raise/decide.mjs` and `cli.mjs`) and the five Cases left as they are, all five were green. The files were removed again and are not part of this PLAN.

## What this shows and does not show

The Cases show the rule: when a collector is ready, which facts hide it, how a SYNC after the ACT differs from a PLAN or DO after it, what the title and body are, and that the command decides from standard input alone with no network, `gh`, `git`, approval or merge in it. They do not show that real facts about a real collector can be gathered; that is a later slice.

## Reproduce

For each of T932 to T936: `node -e "import('./engineering/release-management/00-changes/C72-promotion-decide/T9NN.red.mjs').then(m=>m.run())"`.
