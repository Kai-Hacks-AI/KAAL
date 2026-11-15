# Pull Promotion: pull only what is registered (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F45 is relaxed except what F62 states. Every action stays advisory. The package is host-neutral; KAAL's branch, collector and file conventions belong to Engineering's KAAL installation.

- **pull/F60. KAAL's installation discovers the accepted registration on `main` and normalizes it.**
  - `discoverRegistrations(tree)` in `engineering/release-management/05-src/pull-promotion/registration.mjs` takes the files and texts of `main`'s tip and returns `{accepted, source, classRoutes, collectors, problems, registry}`. `registry` is the normalized shape `{accepted, authority, classes: [{name, routes, optIn}]}` with `authority` equal to `main`, classes ordered HOTFIX, WIRE, KAAL, `optIn: "all"` for HOTFIX and WIRE, and the registered collectors for KAAL.
  - A capability `kaal-pull.json` at a package root has the shape `{capability, collectors}`. Each collector is an exact name starting with `kaal/<capability>/`. A wildcard, another capability's collector, class routes, a duplicate across files, unparsable JSON or a wrong shape make that file invalid; it contributes nothing and is named in `problems`. A valid file is not invalidated by an invalid one.
  - Engineering's `kaal-pull.json` is the only file that may carry class routes, only `HOTFIX: ["hotfix/*"]` and `WIRE: ["wire/*"]`, and carries nothing else.
  - A tree that is not `main`'s tip yields a registry that is not accepted.
- **pull/F61. The package tells auto-pulled from judge-pulled using only the normalized registry.**
  - `laneStep` accepts `registry`. A candidate is auto-pulled when its class is in `registry.classes`, its source matches one of the class's routes and the class's `optIn` is `all` or lists it. The class order is the order of `classes`.
  - The package contains no KAAL-specific class names, branch prefixes, collector names or `packages/<package>` locations. A consumer registry with its own classes, routes and subset opt-in works the same way.
  - An eligible candidate that is not covered is listed in `judgePulled` and never selected. With nothing auto-pulled and some `judgePulled` the step is `judge` naming them. It is not forbidden from manual promotion.
  - One capability's registration never enrolls another's, and a route never enrolls a candidate outside its opt-in.
- **pull/F62. Fail closed, and the legacy path too.**
  - No registry, `accepted` not true, a missing or empty `authority`, or a malformed shape makes every candidate judge-pulled. An ad hoc declaration or fixture is not an accepted registration.
  - The report `next` path (no `deliveries`) is held the same way.
  - pull/F39 to F42 results with a registry that covers the candidates equal their previous results.
- **pull/F63. Everything already agreed is preserved.**
  - With a registry that covers the candidates, the class order, C9 value density inside the lowest class, non-preemption, exact-head OUT and IN, UNKNOWN reporting, one admission lane and the pulse guard give the C11 results.
  - No result mentions an approval or a merge. The README states where KAAL's accepted registration lives, how discovery works, how an unregistered capability stays available for judgment, and that routes and opt-in scope are installation configuration. This Change settles no `kaal-release` product default or template.
