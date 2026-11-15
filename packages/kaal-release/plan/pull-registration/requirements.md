# Pull Promotion: pull only what is registered (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F45 is relaxed except what F61 and F62 state. Every action stays advisory. `main` is production with no stock; the stocks are `hotfix/*`, `wire/*` and `kaal/<capability>/*`; any other branch is development. STOCK = the branch passes all tests at its exact head; OUT = a PR is opened only then; IN = the target's ruleset. Selection reads only STOCK.

- **pull/F60. KAAL's adapter validates a Pull opt-in against Core's accepted Registration on `main` and turns it into a stock.**
  - `discoverRegistrations(tree, core)` in `engineering/release-management/05-src/pull-promotion/registration.mjs` takes `{ref, files}` and the Core evidence engineering/C15 reads from `main` (`{registrations: {claims, collisions}, capabilities}`), and returns `{accepted, source, classRoutes, problems, registry}`. `registry` is `{accepted, stocks: [{name, routes, pull?, type?}]}`, ordered HOTFIX (`hotfix/*`), WIRE (`wire/*`), KAAL (`kaal/<scope>/*` per valid opt-in). It lists no branches.
  - Capability identity and scope are Core's. A Pull opt-in `packages/<package>/kaal-pull.json` is exactly `{"scope": "<core scope>"}`. It is valid only when the scope is claimed once by a Registration whose holder is an admitted Capability (engineering/C15's assessment is reused, not a second authority). The route is built from the Core-claimed scope. A name alone, a name-derived scope without a claim, a second identity key, a wildcard or a scope with `/`, class routes, unparsable JSON or a wrong shape make that file invalid.
  - An invalid opt-in, an unclaimed, non-Capability or ambiguous scope, missing, empty or unreadable Core evidence, or a duplicate opt-in contributes nothing and is named in `problems`; UNKNOWN never passes. A valid file is not invalidated by an invalid one.
  - A Core-registered capability without an opt-in has no route: its STOCK-GREEN branches are judge-pulled.
  - Only a tree whose ref is `main` is accepted, and the Core evidence is main's: a PR head cannot authorize its own opt-in or its own Registration. Core is read from the repository workspace; this requirement does not depend on Core's publication or a deployed `.kaal`.
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
  - The README states how an opt-in validated against Core's Registration on `main` becomes a stock, how an unregistered branch stays available for judgment, and that stocks and routes are installation configuration. This Change settles no `kaal-release` default or template.
