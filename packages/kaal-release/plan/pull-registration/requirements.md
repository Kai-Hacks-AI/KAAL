# Pull Promotion: pull only what is registered (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F45 is relaxed except what F52 states. Every action stays advisory.

- **pull/F50. The accepted registration is discovered on `main` and validated by Engineering's contract.**
  - `discoverRegistrations(tree)` in `engineering/release-management/05-src/pull-promotion/registration.mjs` takes the files and texts of `main`'s tip and returns `{accepted, source, classRoutes, collectors, problems}`, with `source` equal to `main`.
  - A capability registration `kaal-pull.json` sits at a package root and has the shape `{capability, collectors}`. Each collector is an exact name starting with `kaal/<capability>/`. A wildcard, a collector of another capability, class routes, a duplicate collector across files, unparsable JSON or a wrong shape make that file invalid; it contributes nothing and is named in `problems`.
  - Engineering's `kaal-pull.json` is the only file that may carry class routes, and only `HOTFIX: ["hotfix/*"]` and `WIRE: ["wire/*"]`.
  - A valid file is not invalidated by an invalid one.
- **pull/F51. Auto-pulled and judge-pulled are told apart, capability by capability.**
  - `laneStep` accepts a `registry`. A HOTFIX or WIRE candidate is auto-pulled when its source matches an accepted class route. A KAAL candidate is auto-pulled when its exact collector name is registered.
  - An eligible candidate that is not registered is listed in `judgePulled` and never selected. With nothing auto-pulled and some `judgePulled` the step is `judge` naming them. It is not forbidden from manual promotion.
  - Class routes never enroll a KAAL collector, and one capability's registration never enrolls another's.
- **pull/F52. Fail closed, and the legacy path too.**
  - No registry, a registry that is not `accepted: true` with `source: "main"`, or an invalid registry shape makes every candidate judge-pulled. An ad hoc declaration is not an accepted registration.
  - The report `next` path (no `deliveries`) is subject to the same registration: an unregistered `next` is judge-pulled, not opened.
  - pull/F39 to F42 results with a valid registry that registers the candidate equal their previous results.
- **pull/F53. Everything already agreed is preserved.**
  - With a registry that registers the candidates, the class order HOTFIX > WIRE > KAAL, C9 value density inside KAAL, non-preemption, exact-head OUT and IN, UNKNOWN reporting, one admission lane and the pulse guard give the C11 results.
  - No result mentions an approval or a merge. The registration contract is documented in the README with where the accepted registration lives and how an unregistered capability stays available for judgment.
