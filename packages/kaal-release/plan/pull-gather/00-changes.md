# Pull Promotion: a host-neutral package and a GitHub adapter that gather the delivery candidates and consume the verdicts that already decide STOCK and IN (Change A to B)

This is `pull/C13`, a PLAN Change. It ships no code, installs nothing, changes no workflow, ruleset or declaration and opens no PR. It is the first slice of the CTO assessment of 15 Nov 2026 (`pull-promotion/true-pull-architecture-assessment.md`, section 6, step 1), revised after three CPO reviews of #1694. It authorizes preparation, not promotion or publication.

## Principles (CPO)

- **Control placement (Kai, 15 Nov 2026).** **STOCK** = tests against branches. **OUT** = PR creation rules (and npmjs publishing creation). **IN** = PR merge rules. An earlier draft of this PLAN called the branch-test verdict "OUT"; that is STOCK, and the PLAN now says so. C13 consumes the STOCK verdict to select, and reports the OUT and IN verdicts of the PR that the pull creates without gating on either.
- **STOCK is universal, its evidence is class-specific.** A source stock is stock-ready only when the Intent is fulfilled, the delivery is correct and the Change is complete, all PASS. KAAL PROMOTION, HOTFIX and WIRE prove these differently. Pull consumes **one common verdict with its exact revision and producing authority**, never a common evidence structure. Passing development CI is not STOCK; missing evidence is UNKNOWN.
- **The sequence is one transaction.** Stock item, qualified by its STOCK tests at the exact head, then the destination pulls over an established route (the PR is created under the OUT rules), then the destination station's ruleset evaluates IN, then a successful merge completes the transaction and consumes the branch. STOCK readiness precedes the pull. IN is evaluated by the destination **after** the pull begins, because the delivery PR and its IN checks may not exist before. A failed OUT or IN blocks completion, never stock discovery or selection.
- **Registering a capability registers its stock.** Every branch belonging to a registered stock is one uniquely named **stock item**, qualified as a whole at its exact head SHA. Branches need no separate registration. There is no second stock inventory, and issues and PRs are never stock items. Auto-pull is opt-in at stock level.
- **`kaal-release` is a reusable product.** It must not know `kaal/*`, `hotfix/*`, `wire/*`, KAAL repository layouts or GitHub, and must not assume that a delivery candidate is a Git branch. Those are conventions of this installation.
- **C13 implements neither stock readiness nor destination admission.** It discovers, reads and consumes.

## The split

| Layer | Owns | Must not contain |
| --- | --- | --- |
| **Package** (`kaal-release`, a new host-neutral module `scripts/deliveries.mjs`) | Generic semantics over normalized facts: declared delivery classes and the authority each registers per side, host-neutral stock items `{id, class, name, revision, stock}`, accepted registrations of stocks, and verdicts `{candidate, side, verdict, revision, authority}`. It returns the `deliveries` that `laneStep` takes, each with `ready` (STOCK is PASS), `out` and `in` (the verdicts of the PR creation rules and the merge rules at the exact revision if they exist, else `null`) and `pull: 'auto'` or `'judge'`. | Branch prefixes, Git or GitHub words, repository layouts, any lookup, any file or network access. |
| **Engineering host adapter** (`engineering/release-management/05-src/pull-promotion/gather.mjs`, beside `read.mjs`) | Discovers the stock items (the uniquely named branches of the registered stocks, per the class routes) and any delivery PR into `main`, maps them to declared classes using the class routes of the Engineering-owned `kaal-pull.json` read from `main` (the only place prefixes live; no literal in the adapter), resolves the accepted registrations through `registration.mjs` `discoverRegistrations(mainTree)` (pull/C14), reads check runs and the checks `main` requires, and passes **normalized facts** to the package. GET calls only. It is the one place that says `hotfix/`, `wire/`, `kaal/` and GitHub. | Any decision about eligibility or selection. |
| **Installation configuration and registration** | Which routes exist and which capabilities opt into auto-pull. The registration contract is the one of pull/C14 (#1707, #1708): registering a capability registers its stock. C13 consumes the class routes and accepted registrations (Engineering `kaal-pull.json`, per-capability `packages/<pkg>/kaal-pull.json`); it does not define them. | Any readiness or admission policy. |

## A: the present

`laneStep` (pull/C10) and its `deliveries` selection (pull/C11) judge candidates `{class, source, name, out, in}`, but nothing produces them. A person writes the list. HOTFIX and WIRE heads are not seen at all. Note: pull/C11 on `kaal/release/pull-lane` checks that `source` starts with `hotfix/`, `wire/` or `kaal/`, which is an installation convention inside the package. That is the same boundary defect; it is C11's, not changed here, and recorded as an open point.

## Trace of the existing authoritative mechanisms (read on `main`, 15 Nov 2026)

| Class | STOCK: what exists | STOCK: missing connection | IN: what exists | IN: missing connection |
| --- | --- | --- | --- | --- |
| KAAL | The Pull Promotion qualification (`pull-promotion.mjs`, run by hand): PLAN and DO files, expected Cases green at the exact head by scoped id, one concluding 4L ACT. | It does not separate development-time RED from GREEN, does not trace affected Intents to product Cases and publishes no verdict with revision and authority. Reverse traceability is not on `main`. A producer is missing. | The `old promotion` ruleset: required checks, CODEOWNER approval, merge queue; a `kaal/*` PR into `main`. | None for Pull. |
| HOTFIX | The `hotfix` PR template, the KAAL Defect reference check (release/C23), the nine Hotfix Cases. Today the route is the collector `kaal/hotfix`. | No producer says "the correction is complete". `hotfix/<name>` is not realized. | Same ruleset; Promotion Source passes only `kaal/*`, so a `hotfix/<name>` PR cannot pass IN today. | Admission of the class is Engineering's later Change. |
| WIRE | The install judge `wire-judge.mjs` (release/C27, A47). | Not yet a published check with a revision and an authority; wiring is Owner-gated. | Same ruleset; `wire/<name>` not admitted today. | Same as HOTFIX. |

C13 closes none of these. Each one reads as UNKNOWN until its producer exists.

## B: the target

1. **Package:** `resolveDeliveries(facts)` turns normalized, host-neutral facts into `deliveries`. A stock item is a delivery only if its `class` is declared. `stock` is `PASS`, `FAIL` or `UNKNOWN`, decided only from the STOCK verdict for the item whose `revision` equals the item's `revision` and whose `authority` is the one the class registers for STOCK. `ready` is true exactly when `stock` is `PASS`: an item is selectable without any IN verdict. `in` is the destination's verdict at the same exact revision from the registered destination authority when one exists, else `null` (not yet evaluated); it never removes or demotes an item. `pull` is `auto` only when the item's stock has an accepted registration, otherwise `judge`; an unregistered stock is surfaced, never silently auto-eligible. Nothing behind a verdict is read. Value, size and unit are never produced.
2. **Adapter:** from GitHub it builds those facts. Stock items are the uniquely named branches of the registered stocks, mapped to classes by the class routes; a head outside a registered stock is not an item. The IN verdict is derived only once a delivery PR into `main` exists at the item's exact head, from `main`'s own merge checks (`PASS`, `FAIL` or `UNKNOWN` while pending or unreadable); with no such PR there is no IN verdict. STOCK verdicts are passed through as published by their producers. A request that fails leaves what it could not read UNKNOWN.
3. **Portability:** the same unmodified package module works with a different host, candidate naming and source representation, and contains none of this installation's vocabulary.

## Not in this Change

No producer of STOCK verdicts, no destination pull or IN evaluation (the destination's own), no admission of `hotfix/*` or `wire/*` heads, no registration contract (pull/C14, #1707), no change to `laneStep` or to pull/C11's prefix check, no dry-run caller, no workflow, no GitHub App, no ruleset, no recorded value, size or unit. No approve or merge action.

## Open points for the CPO

1. **pull/C11 amendment.** On `kaal/release/pull-lane`, C11 calls the readiness field `out` (it is STOCK in Kai's placement) and makes a candidate eligible only when that and `in` are both PASS, and checks that `source` starts with `hotfix/`, `wire/` or `kaal/`. Both conflict with this contract: eligibility must be STOCK only (IN follows the pull), and `source` is an opaque id. Proposed: a separate amendment of C11 before or with the DO. C13 does not change it.
2. **Registrations** are consumed as accepted stock keys; the contract is pull/C14's.
3. **Verdict carrier**: how producers publish `{verdict, revision, authority}` (proposed: a check run on the exact head). Producers are later Changes.
4. **Held** is UNKNOWN.
5. **Dependency**: the DO needs `laneStep` on `main`, so it waits for `kaal/release/pull-lane`. This PLAN does not.

## Order

PLAN (this), then DO (the package module, the adapter, README, T430 to T434 to green), ACT, a concluding collector-level ACT, SYNC and PROMOTION. Collector: `kaal/release/pull-gather`, from `main`.
