# Pull Promotion: pull only what is registered (testing)

Runnable Cases `T460` to `T463`, `.red.mjs`. They are RED because the Engineering adapter `registration.mjs` does not exist and `laneStep` ignores `registry` today. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-registration/T460.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T460 | F60 | KAAL's adapter on a `main` tree with Core evidence: an opt-in for a scope Core claims for an admitted Capability yields the `kaal/<scope>/*` stock route and the registry; a Core-registered capability without an opt-in has no route; an unclaimed scope, a non-Capability holder, a scope claimed by several holders, missing, empty or unreadable Core evidence, the name-only shape, a second identity key, a bad scope, class routes, bad JSON or a wrong shape contribute nothing and are named in `problems`; a duplicate is named; a bad neighbour does not invalidate a valid one; a PR head's own opt-in or own Core evidence never authorizes itself. |
| pull/T461 | F61 | Any branch under a registered stock (including a sibling like `kaal/release/other`) and a `hotfix/` or `wire/` branch with `stock` PASS is auto-pulled whatever its `in`; `stock` FAIL or UNKNOWN is not pulled; a PASSing branch outside every registered stock is `judgePulled`, never selected, and alone gives `judge` naming it; a consumer's own stocks and routes (no KAAL names) work the same way. |
| pull/T462 | F62 | No, unaccepted, non-`main`-tree or malformed registry makes every candidate judge-pulled, a hand-passed declaration included, and the legacy `next` path is held the same way; the holder's SYNC needs no registration. |
| pull/T463 | F63 | With a registry that registers everything, the C11 order, non-preemption, UNKNOWN reporting, pulse guard and the absence of approve or merge text still hold. |

They do not show the live host or `main`'s real tree, and they register no capability.
