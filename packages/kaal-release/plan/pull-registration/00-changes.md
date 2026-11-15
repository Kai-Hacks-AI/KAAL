# Pull Promotion: pull only what is registered (Change A to B)

This is `pull/C14`, a PLAN Change. It ships no code and installs nothing: no workflow, App, ruleset or hook. It answers the CPO's bounded correction on the pull-lane PROMOTION (#1707, 15 Nov 2026): the tooling that lands on `main` must already tell **auto-pulled** from **judge-pulled** candidates, capability by capability. It authorizes preparation, not promotion or publication.

## Assessment

`laneStep` (C10, C11) treats every KAAL collector the report names as pullable and every `hotfix/`, `wire/`, `kaal/` source as a valid class. Nothing says that a capability agreed to be pulled automatically, so today an unregistered capability would be auto-pulled and the wildcard-like class prefixes would enroll every KAAL collector.

## A: the present

Eligibility is evidence only (OUT and IN). No registration is read. An opt-in by a capability, and the paths it opts in, are not facts the step can see.

## B: the target

**Auto-pulled** means one thing: deterministic selection of an accepted, eligible candidate, never approval, merge or publication. A candidate is auto-pulled only when it is both eligible (C11) and **registered**. Otherwise it is **judge-pulled**: reported for a person to judge and still open to manual promotion, never silently auto-eligible and never forbidden.

The default lifecycle is: develop in Engineering, create the reusable package, embed or install it in `.kaal`. So the target has two sides and one seam.

1. **The reusable package (kaal-release) consumes a host-neutral registry.** `laneStep` takes `registry` as an input fact with this normalized shape: `{accepted: true, authority: "<where it was accepted>", classes: [{name, routes: [pattern...], optIn: "all" | [exact source...]}, ...]}`. The order of `classes` is the delivery priority. A candidate is auto-pulled when its class is in the registry, its source matches one of that class's routes, and the class's `optIn` is `all` or lists it. The package does not know `packages/<package>` locations, `kaal/<capability>/*` names, `hotfix/` or `wire/` prefixes, or any branch convention; the C11 literals for them are replaced by the registry. Whether an opt-in covers all candidates of a class or a subset is the installation's accepted configuration, never a universal default of the package.
2. **The installation produces the registry.** Whatever accepted configuration a consuming repository keeps in `.kaal` is turned into the normalized registry by that installation's own adapter. This Change does not prescribe it, does not settle `kaal-release` product defaults or templates (a separate `kaal-release` PR and product discussion), and does not forbid the package from later offering them.
3. **KAAL's own installation (Engineering).** Engineering owns KAAL's setup, an adapter under `engineering/release-management/05-src/pull-promotion/registration.mjs` with its README chapter. `discoverRegistrations(tree)` takes `{ref, files}` of `main`'s tip and returns `{accepted, source, classRoutes, collectors, problems, registry}`, where `registry` is the normalized shape above with `authority: "main"`, classes in the order HOTFIX, WIRE, KAAL, `optIn: "all"` for HOTFIX and WIRE, and the registered collectors for KAAL.
4. **Where KAAL's accepted registration lives.** On `main`: it counts only as the file exists at the tip of `main`, after review and CI. A file on a collector, a declaration passed by hand or a test fixture is test input, never accepted operational registration.
5. **KAAL's files.** Engineering's `engineering/release-management/05-src/pull-promotion/kaal-pull.json` carries class routes only, `{"classRoutes": {"HOTFIX": ["hotfix/*"], "WIRE": ["wire/*"]}}`; any unknown key is a named problem. Delivery admission (engineering/C16) keeps its data in its own sibling file, never in `kaal-pull.json`, so selection never reads admission and admission never reads selection. Each KAAL capability owns `packages/<package>/kaal-pull.json`, `{"capability": "<name>", "collectors": ["kaal/<name>/<concern>", ...]}`: exact names starting with `kaal/<name>/`, no wildcard, no class routes, no duplicate across files. An invalid file contributes nothing and is named in `problems`; a valid neighbour still counts. These are KAAL installation conventions of the adapter, not rules of the package.
6. **Fail closed.** No registry, `accepted` not true, a missing or empty `authority`, or a malformed shape (classes, routes or opt-in) makes every candidate judge-pulled. The adapter returns an unaccepted registry for any tree that is not `main`'s tip. The legacy report `next` path is held the same way. Holder steps (SYNC, ready-for-cpo) need no registration.
7. **Selection.** An eligible but unregistered candidate is reported as `judgePulled` (names), never selected; with nothing auto-pulled and some `judgePulled` the step is `judge` naming them. The rest is unchanged: the class order, non-preemption, exact-head OUT and IN evidence, one admission lane, the pulse guard and no approve or merge action.

## What it reuses

`chooseNext`, `laneStep`, the pulse guard and the `deliveries` shape of C11; the `kaal-guard.json` idea of a capability-owned, Engineering-validated file. No new PR type, template, workflow or ruleset.

## Not in this Change

No capability is registered, including `release`. No `kaal-release` product default or template is added or ruled out. No gatherer reads `main` yet: the registry is a fact the step is given, as the pulse already is. Nothing is wired.

## Order

PLAN (this), then DO (the module, the README chapter, the Script change, T460 to T463 to green, T40 to T46 updated to supply a registry), then ACT, an updated concluding ACT, SYNC if `main` moved, a fresh exact-head report and the PROMOTION #1707 at its new head. Collector: `kaal/release/pull-lane`.
