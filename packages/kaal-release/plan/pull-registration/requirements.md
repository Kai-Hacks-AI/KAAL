# Pull Promotion: pull only what is registered (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F45 is relaxed except what F61 and F62 state. Every action stays advisory. The package is host-neutral; KAAL's branch, stock and file conventions belong to Engineering's KAAL installation. Everything outside `main` is WIP; STOCK = tests against branches, OUT = PR creation rules, IN = PR merge rules. Registration gives stock membership, the STOCK verdict at the exact head gives readiness, OUT applies when the pull creates the PR and IN when it merges.

- **pull/F60. KAAL's installation discovers the registered stock on `main` and normalizes it.**
  - `discoverRegistrations(tree)` in `engineering/release-management/05-src/pull-promotion/registration.mjs` takes the files and texts of `main`'s tip and returns `{accepted, source, classRoutes, stocks, problems, registry}`. `registry` is the normalized shape `{accepted, authority, classes: [{name, routes}]}` with `authority` equal to `main`, classes ordered HOTFIX, WIRE, KAAL, Engineering's routes for HOTFIX and WIRE, and the registered stock scopes for KAAL. It lists no branches.
  - A capability `kaal-pull.json` at a package root has the shape `{capability, stock}` with `stock` exactly `kaal/<capability>/*`. An exact branch, a wider or foreign scope, a wildcard inside a name, a per-branch list, class routes, a duplicate across files, unparsable JSON or a wrong shape make that file invalid; it contributes nothing and is named in `problems`. A valid file is not invalidated by an invalid one.
  - Engineering's `kaal-pull.json` is the only file that may carry class routes, only `HOTFIX: ["hotfix/*"]` and `WIRE: ["wire/*"]`, and carries nothing else.
  - A tree that is not `main`'s tip yields a registry that is not accepted.
- **pull/F61. The package pulls GREEN stock items using only the normalized registry.**
  - `laneStep` accepts `registry`. A candidate is auto-pulled when its STOCK verdict is PASS at the exact head, its class is in `registry.classes` and its source matches one of the class's routes. The class order is the order of `classes`.
  - Any branch under a registered stock scope is a stock item with no per-branch opt-in: `kaal/release/other` belongs to the `release` stock and is pullable if STOCK-GREEN. An item whose STOCK is FAIL or UNKNOWN is not ready and is not pulled.
  - Neither OUT (PR creation rules) nor IN (PR merge rules) is a precondition of selection. An `in` of PASS, FAIL or UNKNOWN does not change whether a STOCK-GREEN item is selected; OUT applies when the pull creates the PR and IN when it merges (#1694, #1706). The C11 `out` field is renamed `stock`.
  - The package contains no KAAL-specific class names, branch prefixes, collector names or `packages/<package>` locations. A consumer registry with its own classes and route scopes works the same way.
  - A STOCK-GREEN item outside registered scope is listed in `judgePulled` and never selected. With nothing auto-pulled and some `judgePulled` the step is `judge` naming them. It is not forbidden from manual promotion.
- **pull/F62. Fail closed, and the legacy path too.**
  - No registry, `accepted` not true, a missing or empty `authority`, or a malformed shape makes every candidate judge-pulled. An ad hoc declaration or fixture is not an accepted registration.
  - The report `next` path (no `deliveries`) is held the same way.
  - pull/F39 to F42 results with a registry that covers the candidates equal their previous results, except that IN no longer gates selection and `out` is renamed `stock`.
- **pull/F63. Everything already agreed is preserved.**
  - With a registry that covers the stock, the class order, C9 value density inside the lowest class, non-preemption, exact-head STOCK, UNKNOWN reporting, one admission lane and the pulse guard give the C11 results.
  - No result mentions an approval or a merge. The README states where KAAL's accepted registration lives, how discovery works, the difference between stock membership, STOCK-GREEN eligibility, OUT (PR creation) and IN (PR merge), how an item outside a registered stock stays available for judgment, and that routes and scope are installation configuration. This Change settles no `kaal-release` product default or template.
