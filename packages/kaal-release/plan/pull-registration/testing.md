# Pull Promotion: pull only what is registered (testing)

Runnable Cases `T460` to `T463`, `.red.mjs`. They are RED because the Engineering adapter `registration.mjs` does not exist and `laneStep` ignores `registry` today. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-registration/T460.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T460 | F60 | KAAL's adapter on a `main` tree produces the normalized registry (authority, ordered classes, routes): a valid stock registration and Engineering's class routes are accepted; an exact branch, a wider or foreign scope, a per-branch list, class routes in a capability file, duplicates and bad JSON make only that file invalid, named in `problems`; a valid neighbour still counts. |
| pull/T461 | F61 | Any STOCK-GREEN branch under a registered stock (including a sibling like `kaal/release/other`), and a HOTFIX or WIRE source on an accepted route, is auto-pulled whatever its `in` verdict, and a consumer's own classes and route scopes (no KAAL names) work the same way; a stock item with STOCK FAIL or UNKNOWN is not pulled; a STOCK-GREEN item outside every registered stock is `judgePulled`, never selected, and alone it gives `judge` naming it; a class route does not enroll a KAAL collector. |
| pull/T462 | F62 | No, unaccepted, authority-less, non-`main`-tree or malformed registry makes every candidate judge-pulled, an ad hoc declaration included, and the legacy `next` path is held the same way. |
| pull/T463 | F63 | With a registry that registers everything, the C11 order, non-preemption, UNKNOWN reporting, pulse guard and the absence of approve or merge text still hold. |

They do not show the live host or `main`'s real tree, and they register no capability.
