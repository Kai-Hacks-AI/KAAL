# Pull Promotion: pull only what is registered (Change A to B)

This is `pull/C14`, a PLAN Change. It ships no code and installs nothing: no workflow, App, ruleset or hook. It answers the CPO's correction on the pull-lane PROMOTION (#1707): the tooling that lands on `main` must tell **auto-pulled** from **judge-pulled** branches, capability by capability. It authorizes preparation, not promotion or publication.

## Assessment

`laneStep` (C10, C11) hardcodes the `hotfix/`, `wire/` and `kaal/` prefixes, treats every `kaal/` branch as pullable, and requires the destination's merge checks (IN) to have passed before a branch counts as eligible. Nothing says a capability agreed to be pulled automatically, and IN is checked in the wrong order for a pull.

## A: the present

A hand-fed candidate list with two verdicts (`out`, `in`) that both must be PASS. No registration is read.

## B: the target, in git and GitHub terms

**Model.** `main` is production and has no stock. The stocks are `hotfix/*`, `wire/*` and `kaal/<capability>/*`; every other branch is development. Each stock branch is one stock item, and everything outside `main` is WIP (no WIP object, no state machine).

**Controls.**
- **STOCK** = the branch passes all tests at its exact head. The `stock` verdict (the C11 `out` field, renamed) says so. A collector that is only green after its PLAN is not ready: it needs a full PDCA. That is for whoever produces the verdict (#1694) to establish; selection only reads it.
- **OUT** = a PR into the target is opened only when the branch passes all tests.
- **IN** = the target's ruleset (`main`, `kaal/**`, `hotfix/*`, `wire/*`; tags for publishing). Development IN is `.githooks`.

Selection reads only STOCK. OUT and IN apply when the PR is opened and merged, and are not preconditions of selecting (admission is engineering/C16 #1706, gathering is pull/C13 #1694). A successful merge into `main` consumes the item.

**Auto-pulled** means one thing: deterministic selection of a stock branch whose `stock` verdict is PASS, never approval, merge or publication. A PASSing stock branch outside every registered stock is **judge-pulled**: reported for a person, still open to manual promotion, never auto-pulled and never forbidden. A stock branch that is not PASS is not ready and is neither pulled nor judge-pulled.

1. **The reusable package (kaal-release) takes a minimal registry.** `laneStep` gets `registry`: `{accepted: true, stocks: [{name, routes: [pattern...]}, ...]}`. The order of `stocks` is the delivery priority. A candidate is auto-pulled when its `stock` verdict is PASS, its class names a registered stock and its source matches one of that stock's routes. No per-branch opt-in, no inventory. The package knows no `hotfix/`, `wire/`, `kaal/` or `packages/<package>` convention; the C11 literals are replaced by the registry. `in` is still reported and never gates selection.
2. **KAAL's installation (Engineering) is the adapter.** `engineering/release-management/05-src/pull-promotion/registration.mjs` has `discoverRegistrations({ref, files})`, reads `main`'s tip and returns `{accepted, source, classRoutes, problems, registry}`. It holds KAAL's fixed stocks in code, in this priority: HOTFIX `hotfix/*`, WIRE `wire/*`, KAAL `kaal/<capability>/*` for each opted-in capability. There is no separate routes file; `classRoutes` is returned for #1706 as before. A consumer repository does the same in its own `.kaal` installation; this Change prescribes none of it and settles no `kaal-release` default or template.
3. **A capability opts in with one tiny file.** `packages/<package>/kaal-pull.json` is `{"capability": "<name>"}`, one path segment, nothing else. Its stock is `kaal/<name>/*`. An invalid file, a duplicate, a name with `/` or a wildcard, class routes or any other key contributes nothing and is named in `problems`; a valid neighbour still counts. No capability is opted in by this Change.
4. **Accepted means on `main`.** The adapter accepts only a tree whose ref is `main`. A file on a collector, a declaration passed by hand or a fixture is test input, not operational registration.
5. **Fail closed.** No registry, `accepted` not true or a malformed shape makes every candidate judge-pulled, the legacy report `next` path included. Holder steps (SYNC, ready-for-cpo) need no registration.
6. **Selection.** Unchanged otherwise: stock order, non-preemption, UNKNOWN reporting, one admission lane, the pulse guard, no approve or merge action. With nothing auto-pulled and some `judgePulled`, the step is `judge` naming them.

## What it reuses

`chooseNext`, `laneStep`, the pulse guard and the `deliveries` shape of C11. No new PR type, template, workflow or ruleset.

## Not in this Change

No capability is opted in, including `release`. No `kaal-release` product default or template. No gatherer reads `main`. Nothing is wired.

## Order

PLAN (this), then DO (the adapter, its README chapter, the Script change, T460 to T463 to green, T40 to T46 updated to supply a registry and to `stock`), then ACT, an updated concluding ACT, SYNC if `main` moved, a fresh exact-head report and PROMOTION #1707 at its new head. Collector: `kaal/release/pull-lane`.
