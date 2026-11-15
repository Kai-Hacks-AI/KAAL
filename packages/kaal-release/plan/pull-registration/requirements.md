# Pull Promotion: pull only what is registered (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F45 is relaxed except what F61 and F62 state. Every action stays advisory. `main` is production with no stock; the stocks are `hotfix/*`, `wire/*` and `kaal/<capability>/*`; any other branch is development. STOCK = the branch passes all tests at its exact head; OUT = a PR is opened only then; IN = the target's ruleset. Selection reads only STOCK.

- **pull/F60. KAAL's adapter turns opt-ins on `main` into stocks.**
  - `discoverRegistrations(tree)` in `engineering/release-management/05-src/pull-promotion/registration.mjs` takes `{ref, files}` and returns `{accepted, source, classRoutes, problems, registry}`. `registry` is `{accepted, stocks: [{name, routes}]}`, ordered HOTFIX (`hotfix/*`), WIRE (`wire/*`), KAAL (`kaal/<capability>/*` per opted-in capability). It lists no branches.
  - A capability file `packages/<package>/kaal-pull.json` is `{"capability": "<name>"}`, one path segment. A scope, a branch list, a name with `/` or a wildcard, class routes, a duplicate across files, unparsable JSON or a wrong shape make that file invalid; it contributes nothing and is named in `problems`. A valid file is not invalidated by an invalid one.
  - Only a tree whose ref is `main` is accepted; any other ref or a missing tree yields a registry that is not accepted.
- **pull/F61. The package pulls PASSing stock branches using only the registry.**
  - `laneStep` accepts `registry`. A candidate is auto-pulled when its `stock` verdict is PASS, its class names a registered stock and its source matches one of that stock's routes. The order of `stocks` is the delivery priority.
  - Any branch under a registered scope is a stock item with no per-branch opt-in: `kaal/release/other` belongs to the `release` stock and is pullable if its `stock` is PASS. FAIL or UNKNOWN is not ready and is not pulled.
  - `in` (and OUT) is not a precondition of selection; an `in` of PASS, FAIL or UNKNOWN does not change the result. The C11 `out` field is renamed `stock`.
  - The package holds no `hotfix/`, `wire/`, `kaal/` or `packages/<package>` convention. A consumer registry with its own stocks and routes works the same way.
  - A PASSing branch outside every registered stock is listed in `judgePulled` and never selected; with nothing auto-pulled and some `judgePulled` the step is `judge` naming them. It stays open to manual promotion.
- **pull/F62. Fail closed, and the legacy path too.**
  - No registry, `accepted` not true or a malformed shape makes every candidate judge-pulled. A hand-passed declaration or fixture is not an accepted registration. The legacy report `next` path is held the same way.
  - pull/F39 to F42 results with a registry that covers the candidates equal their previous results, except that `in` no longer gates selection and `out` is `stock`.
- **pull/F63. Everything already agreed is preserved.**
  - With a registry that covers the stock: stock order, C9 value density inside the lowest stock, non-preemption, exact-head `stock`, UNKNOWN reporting, one admission lane and the pulse guard give the C11 results. No result mentions an approval or a merge.
  - The README states how an opt-in on `main` becomes a stock, how an unregistered branch stays available for judgment, and that stocks and routes are installation configuration. This Change settles no `kaal-release` default or template.
