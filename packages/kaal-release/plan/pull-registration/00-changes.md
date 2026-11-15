# Pull Promotion: pull only what is registered (Change A to B)

This is `pull/C14`, a PLAN Change. It ships no code and installs nothing: no workflow, App, ruleset or hook. It answers the CPO's bounded correction on the pull-lane PROMOTION (#1707, 15 Nov 2026): the tooling that lands on `main` must already tell **auto-pulled** from **judge-pulled** candidates, capability by capability. It authorizes preparation, not promotion or publication.

## Assessment

`laneStep` (C10, C11) treats every KAAL collector the report names as pullable and every `hotfix/`, `wire/`, `kaal/` source as a valid class. Nothing says that a capability agreed to be pulled automatically, so today an unregistered capability would be auto-pulled and the wildcard-like class prefixes would enroll every KAAL collector.

## A: the present

Eligibility is a pair of verdicts (the C11 `out` and `in`) on a hand-fed candidate list. No registration is read, so an opt-in by a capability is not a fact the step can see. C11 also requires the destination IN (merge rules) to have passed before a candidate counts as eligible, which is the wrong order for a pull. Under the placement above the readiness verdict C11 calls `out` is the STOCK verdict (tests against the branch); the DO renames that field to `stock`.

## B: the target

**Placement of controls** (Kai's definition, which fixes where each check sits): **STOCK** = the tests against branches. **OUT** = the PR creation rules (and npm publish creation). **IN** = the PR merge rules. Selection reads only STOCK.

**Governing model** (Owner decision, option A). Everything outside `main` is WIP; there is no WIP object or state machine. A registered capability identifies its **stock**, for example `release` owns `kaal/release/*`. Every branch in that scope is one stock item, GREEN or not. Three things stay apart:

- **Stock membership** is established by registration alone: the branch lies in a registered stock scope.
- **STOCK-GREEN eligibility** is established by the stock's own tests against the branch at its exact head: STOCK PASS means ready to pull. Neither registration nor an issue or PR establishes readiness.
- **OUT and IN** come after selection. The pull creates the PR under the OUT rules (PR creation); the destination then applies its IN rules (PR merge) at merge. Neither is a precondition of selecting an item, and selection reads neither (admission is engineering/C16, #1706; gathering is pull/C13, #1694).

A successful merge into `main` completes the transaction and consumes the item. Nothing else is tracked.

**Auto-pulled** means one thing: deterministic selection of a stock item that is GREEN at its exact head, never approval, merge or publication. A STOCK-GREEN item outside every registered stock is **judge-pulled**: reported for a person to judge and still open to manual promotion, never silently auto-pulled and never forbidden.

1. **The reusable package (kaal-release) consumes a host-neutral registry.** `laneStep` takes `registry` as an input fact: `{accepted: true, authority: "<where it was accepted>", classes: [{name, routes: [pattern...]}, ...]}`. The order of `classes` is the delivery priority. A candidate is auto-pulled when its STOCK verdict is PASS at the exact head, its class is in the registry and its source matches one of that class's routes. There is no per-branch opt-in and no inventory of branches. The package knows no `packages/<package>` location, `kaal/<capability>/*` name, `hotfix/` or `wire/` prefix or other branch convention; the C11 literals are replaced by the registry, and the C11 requirement of a passed destination IN for eligibility is dropped for selection (IN stays reported, never blocking; OUT is applied when the PR is created, not read by selection). Which scopes a consumer registers is the installation's accepted configuration, never a package default.
2. **The installation produces the registry.** A consuming repository's accepted `.kaal` configuration is turned into the normalized registry by that installation's own adapter. This Change does not prescribe it, does not settle `kaal-release` product defaults or templates (a separate `kaal-release` PR and product discussion) and does not forbid the package from later offering them.
3. **KAAL's own installation (Engineering).** Engineering owns KAAL's setup: an adapter `engineering/release-management/05-src/pull-promotion/registration.mjs` with its README chapter. `discoverRegistrations(tree)` takes `{ref, files}` of `main`'s tip and returns `{accepted, source, classRoutes, stocks, problems, registry}`. `registry` is the normalized shape with `authority: "main"` and classes in the order HOTFIX, WIRE, KAAL, where HOTFIX and WIRE carry Engineering's routes and KAAL carries the registered stock scopes.
4. **Where KAAL's accepted registration lives.** On `main`, after review and CI. A file on a collector, a declaration passed by hand or a test fixture is test input, never accepted operational registration.
5. **KAAL's files.** Engineering's `engineering/release-management/05-src/pull-promotion/kaal-pull.json` carries class routes only, `{"classRoutes": {"HOTFIX": ["hotfix/*"], "WIRE": ["wire/*"]}}`; any unknown key is a named problem. Delivery admission (engineering/C16) keeps its data in its own sibling file, never in `kaal-pull.json`. Each KAAL capability owns `packages/<package>/kaal-pull.json`, `{"capability": "<name>", "stock": "kaal/<name>/*"}`: exactly that scope, no exact branch, no wider or foreign scope, no wildcard inside a name, no class routes, no per-branch list, no duplicate across files. An invalid file contributes nothing and is named in `problems`; a valid neighbour still counts. These are KAAL installation conventions of the adapter, not rules of the package.
6. **Fail closed.** No registry, `accepted` not true, a missing or empty `authority`, or a malformed shape makes every candidate judge-pulled. The adapter returns an unaccepted registry for any tree that is not `main`'s tip. The legacy report `next` path is held the same way. Holder steps (SYNC, ready-for-cpo) need no registration.
7. **Selection.** A STOCK-GREEN item outside a registered stock is reported as `judgePulled` (names), never selected; with nothing auto-pulled and some `judgePulled` the step is `judge` naming them. An item that is not STOCK-GREEN is a stock item that is not ready, and is neither pulled nor judge-pulled. The rest is unchanged: the class order, non-preemption, exact-head STOCK evidence, one admission lane, the pulse guard and no approve or merge action.

## What it reuses

`chooseNext`, `laneStep`, the pulse guard and the `deliveries` shape of C11; the `kaal-guard.json` idea of a capability-owned, Engineering-validated file. No new PR type, template, workflow or ruleset.

## Not in this Change

No capability is registered, including `release`. No `kaal-release` product default or template is added or ruled out. No gatherer reads `main` yet: the registry is a fact the step is given, as the pulse already is. Nothing is wired.

## Order

PLAN (this), then DO (the module, the README chapter, the Script change, T460 to T463 to green, T40 to T46 updated to supply a registry), then ACT, an updated concluding ACT, SYNC if `main` moved, a fresh exact-head report and the PROMOTION #1707 at its new head. Collector: `kaal/release/pull-lane`.
