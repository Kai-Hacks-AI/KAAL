# Pull Promotion: pull only what is registered (Change A to B)

This is `pull/C14`, a PLAN Change. It ships no code and installs nothing: no workflow, App, ruleset or hook. It answers the CPO's bounded correction on the pull-lane PROMOTION (#1707, 15 Nov 2026): the tooling that lands on `main` must already tell **auto-pulled** from **judge-pulled** candidates, capability by capability. It authorizes preparation, not promotion or publication.

## Assessment

`laneStep` (C10, C11) treats every KAAL collector the report names as pullable and every `hotfix/`, `wire/`, `kaal/` source as a valid class. Nothing says that a capability agreed to be pulled automatically, so today an unregistered capability would be auto-pulled and the wildcard-like class prefixes would enroll every KAAL collector.

## A: the present

Eligibility is evidence only (OUT and IN). No registration is read. An opt-in by a capability, and the paths it opts in, are not facts the step can see.

## B: the target

**Auto-pulled** means one thing: deterministic selection of an accepted, eligible candidate, never approval, merge or publication. A candidate is auto-pulled only when it is both eligible (C11) and **registered**. Otherwise it is **judge-pulled**: reported for a person to judge and still open to manual promotion, never silently auto-eligible and never forbidden.

1. **Where the authoritative registration lives.** On `main`. A registration counts only as the file exists at the tip of `main`, so it has passed review and CI. A file on a collector, a declaration passed in by hand, or a test fixture is test input and never accepted operational registration.
2. **Who owns what.**
   - **Engineering** owns the mechanism: the contract, the discovery and the validation (`engineering/release-management/05-src/pull-promotion/registration.mjs`, with its README chapter), and the class routes file `engineering/release-management/05-src/pull-promotion/kaal-pull.json`, the only file that may carry `hotfix/*` and `wire/*`. That file carries class routes only; any unknown key is a named problem. Delivery admission (engineering/C16) keeps its data in its own sibling file, never in `kaal-pull.json`, so selection never reads admission and admission never reads selection.
   - **Each capability** owns its own `kaal-pull.json` at its package root (`packages/<package>/kaal-pull.json`), analogous in principle to `kaal-guard.json`. It decides whether to opt in and which of its collector paths are eligible. There is no central blanket opt-in, and this Change registers no capability.
3. **The contract of a capability registration.** `{"capability": "<name>", "collectors": ["kaal/<name>/<concern>", ...]}`. Each collector is an exact name that starts with `kaal/<name>/`; no wildcard; no entry for another capability; no class routes; no duplicate across files. Anything else makes that file invalid.
4. **The class routes.** Engineering's file carries `{"classRoutes": {"HOTFIX": ["hotfix/*"], "WIRE": ["wire/*"]}}`. Only these two classes and only their own prefix are valid. A wildcard or class route in a capability registration is invalid, so wildcard support never enrolls a KAAL capability.
5. **Discovery.** `discoverRegistrations(tree)` takes the file list and file texts of `main`'s tip, finds every `kaal-pull.json` (Engineering's one, and one at each package root), validates each, and returns the registry `{accepted, source, classRoutes, collectors, problems}`. An invalid file contributes nothing and is named in `problems`; a valid file is not made invalid by a bad neighbour.
6. **Selection.** `laneStep` takes the registry as an input fact. A HOTFIX or WIRE candidate is auto-pulled when its source matches an accepted class route; a KAAL candidate when its exact collector name is in the registry. A candidate that is eligible but not registered is reported as `judgePulled` (names), never selected. With nothing auto-pulled and some `judgePulled`, the step is `judge` naming them. The same applies to the legacy report `next` path.
7. **Fail closed.** No registry, a registry that is not accepted, or a registry from any source other than `main` makes every candidate judge-pulled. The rest is unchanged: the class order HOTFIX > WIRE > KAAL, non-preemption, exact-head OUT and IN evidence, one admission lane and the pulse guard, and no approve or merge action.

## What it reuses

`chooseNext`, `laneStep`, the pulse guard and the `deliveries` shape of C11; the `kaal-guard.json` idea of a capability-owned, Engineering-validated file. No new PR type, template, workflow or ruleset.

## Not in this Change

No capability is registered, including `release`. No gatherer reads `main` yet: the registry is a fact the step is given, as the pulse already is. Nothing is wired.

## Order

PLAN (this), then DO (the module, the README chapter, the Script change, T460 to T463 to green, T40 to T46 updated to supply a registry), then ACT, an updated concluding ACT, SYNC if `main` moved, a fresh exact-head report and the PROMOTION #1707 at its new head. Collector: `kaal/release/pull-lane`.
