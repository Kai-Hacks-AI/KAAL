# Delivering the controls to `main` and retiring the existing setup (PLAN)

Change `release-management/C10`. PLAN, nothing is built or retired; the failing Cases (T59, T60) are in `04-test/retirement.red.mjs`, carried unwired. It folds the earlier "Path to `main`" (`transformation.md`) into one sequence that ends in a clean release-management setup, and it takes the ownership map (`release/ci-ownership-map.md`, CTO assessment for the CPO, 9 November) as the baseline of what exists.

## Intent (Owner, 10 November 2026)

"Plan to deliver the controls to `main` and retire the existing setup, so we have a clean release management setup."

## Standing rules (they bind every step below)

- Only `kaal/*` into `main`. No admin override, no bypass, auto-merge always on, exact-head CPO review.
- **Prove coverage before retiring.** A predecessor is removed only when its replacement has run on a real pull request and merge group and was verified by someone other than its author, with the evidence kept in the Change record (CPO condition, 9 November).
- **Nothing is removed until the fail-closed CI trust root is live** (defined below).
- **Freeze Collector's rule applies to every promotion** (C6): while a promotion of a collector is open, no pull request targets it. The collector is drained or retargeted first, and the promotion is never "delivered, then recreated".
- Every promotion into `main`, every ruleset import, every live apply and every retirement has its own explicit go from Kai. A landed PLAN is a go for the additive steps, not for those.
- Fall forward: nothing earlier is renumbered or rewritten.

## 1. Inventory (read at the collector head `e110a23`, 10 November; `main` at `9033099`)

Read from the tree at those heads, not from the READMEs (the README is historical evidence, not a live proof). `kaal/engineering-release-management` is 29 commits ahead of `main`. Its `.github` differs from `main` by one change: `release.yml` (named `Release`) became `publish.yml` (named `KAAL / release / publish`, jobs `Pack`, `approve Publishing` with `environment: npm`, `verify Package Promotion` as observed on that date; the control is named verify Package since C16). No other workflow, script or action differs.

| Where | What is there |
| --- | --- |
| `05-src/` | `release-engine/` (version Package, the publish engine and its record), `lanes/` (the lane gate and its claims), `track-work/`, and from the open Changes `envelope/` (#1366). **Not yet in `05-src`:** the lineage, isolation and promotion-source judgments still live where they were (`engineering/github/lineage.ts`, `engineering/change-isolation/`), so moving them is a Change of its own per control (Path to `main`, step 3). |
| `.github/workflows/` | the fourteen workflows of `main`, with the one rename above. **No `KAAL / release / *` control workflow exists on any branch**, and nothing calls the new controls. |
| Rulesets, environments, tag | no ruleset JSON in the repository; the tag App, the tag ruleset and the tag writer do not exist. The `npm` environment and the trusted-publisher bindings are set outside the repository (reported by the Owner, not observed from the repository). |

| Change | State |
| --- | --- |
| C1 register, C3 version Package (PLAN, engine DO), C4 assessments, C5 hooks PLAN (#1355), C6 freeze Collector PLAN (#1367), C7 track Work (PLAN #1363, DO #1364), C8 verify Envelope PLAN (#1365) | landed in the collector |
| C2 bind Merge DO | open: #1358 (approved; merge unconfirmed) |
| C8 verify Envelope DO | open: #1366 (approved) |
| C9 control overview and vocabulary PLAN | open: #1368 |
| This PLAN, C10 | open: #1369 |
| Hooks DOs (C5), freeze Collector DO (C6), the control overview DO (C9) | to come |
| The `.github` wiring of any control, the gates, rulesets as JSON, the tag writer and its audit, the Branching split | to come; each needs Kai's go where it activates |

## 2. What the new controls replace, and the proof (the retirement list)

One row per existing job, workflow, script or setting. The covering control comes from the architecture; the evidence is what must be on record before the retirement Change may be proposed. Rows marked **stays** are not covered by release management and are not retired here.

| Existing | Replaced by | Evidence that proves the coverage |
| --- | --- | --- |
| `Branching` (`lineage-synchronization.yml`, `lineage.ts`; mixed D3) | the split: verify Ancestry F7, isolate Change F6 (synchronization shape), bind Merge F10 (merge method) | parity Cases for each part against the old verdicts; the three controls observed on a real pull request and merge group; the recovery proven live on `pull_request` (not only `pull_request_target`) |
| `Change Isolation` (`change-isolation.yml`, `change-isolation.sh`; D2) | isolate Change F6 with the path sets as data | parity Cases over the existing path sets; observed on a real pull request and merge group |
| `Change Isolation (review)` trio and relay (`merge-group-admission.yml`, `merge-group-review.yml`, `change-isolation-review.yml`, `-relay.yml`, `attest.mjs`; D6) | approve Change F15 and approve Promotion F11 through the native ruleset settings (code owner review, last-push approval, dismiss on push) | the settings verified on a real pull request into `main`; the Owner's recorded decision to give up the ledger-digest attestation (G13) |
| `Promotion Source` (`promotion-source.yml`) | accept Capability F14 | parity Cases; observed on a real promotion |
| `Branching audit` (`branching-audit.yml`) | audit Lineage F5 | the scheduled run observed, same findings on the same stock |
| `CodeQL (actions)`, `CodeQL (javascript-typescript)`, `Dependency Review` as direct required contexts | scan Vulnerabilities F8 and scan Dependencies F9, the same tools called from `KAAL / release / *` | the new contexts observed required and green on a real pull request |
| The lane contexts `Hosting`, `Workspaces`, `Acceptance`, `Engineering`, `Guard` as required contexts | test Candidate F12 and test Integration F16 (FAR lanes), read by `gate (promotion)` and `gate (integration)` | the gates reading the lanes, with the interim FAR marked temporary; the lanes' results identical on the same commit |
| `release.yml` (named `Release` on `main`) | `publish.yml`, `KAAL / release / publish`, with approve Publishing F1, verify Package F2, version Package F3 | the npmjs trusted-publisher binding (the Owner reports it is already on `publish.yml`) confirmed; a dry run of Pack and the approval wait |
| The four `pull_request_target` workflows and the temporary Actions policy | the same controls on `pull_request` and `merge_group` (F17: pinned to `main`) | the CI trust root (section 3) and its live negative Cases (T10); checkpoints in section 5 |
| `bind-group.sh`, `branching.sh`, `branching-audit.sh` | `lineage/` (`bind Merge`, `verify Ancestry`, `audit Lineage`) | covered by the rows above; deleted with their workflows |
| The `Branching` required context (last), the old contexts on the rulesets `lineage` and `main` | the three rulesets as versioned JSON, imported by the Owner, drift-checked | the drift Case green; the old context removed only after the new one is required and green |
| `engineering/release/release.mjs` shim, `change-requirements.md` (F20), the migration record | nothing (the migration ends) | `migration-end.test.mjs` and `shim-facade.test.mjs` Cases |
| **Stays:** `guard-acceptance-boundary.yml` (the PLAN/DO integrity of `kaal/guard`, D2 and D7), `ci.yml` itself, `setup-env` | not covered by a release control; the Change capability owns the PLAN/DO integrity rule | listed as open: the owner of that rule is Change, not this plan |

## 3. Two trust roots, two conditions

The fail-closed proof for pull requests and merge groups is separate from the privileged tag and publish activation (CPO review of #1369), so the second cannot deadlock the first.

**CI trust root live** (gates every retirement of a pull request or merge-group check, including the four `pull_request_target` workflows). All of the following are observed and recorded: the controls run as `main`'s checker on `pull_request` and `merge_group` (F17), with no `pull_request_target`; the live negative Cases (T10) leave the required context failed or absent for a candidate that edits, renames or skips a control; the `integration` and `promotion` rulesets are imported and their drift Case is green; the gates read absent, skipped, stale, cancelled and timed-out runs as not passed. Nothing in this condition needs the tag App.

**Publishing trust root live** (gates only the retirement of the old publish path and any publication, never a pull request check). The tag App exists with its create-only permission set; the tag ruleset names it as the sole bypass actor; the `publishing` ruleset and the `candidate`, `tagging` and `npm` environments are imported and drift-checked; the npm trusted-publisher binding is **observed** (see section 4, step 2), not assumed.

Neither condition relaxes the standing rule: no admin override, and a failed proof is a failed proof.

## 4. Promotion sequence

**Every promotion is a promotion of a whole collector** (the lineage allows no other shape: `kaal/*` into `main`, the collector terminated on promotion). There is no split into leaf collectors in this plan. What the Owner called slices are **successive collectors over time**: when a collector is promoted it is gone, and the next group of Changes is gathered in a new collector established at `main`'s tip (named under `branching.md`). Freeze Collector's rule applies to each: while a promotion is open nothing targets its collector, and an open Change is retargeted or the promotion withdrawn, never delivered and recreated.

1. **Land the open Changes into the current collector** (#1358, #1366, #1368, #1369, the hooks, freeze Collector and overview DOs that are ready), then open the promotion. Nothing targets the collector while it is open.
2. **Promotion 1: what the collector holds today** (documents, engines, Cases, and the `publish.yml` rename, which is already in it). Additive: no `.github` workflow calls a new control, so nothing on `main` changes behaviour except the publish workflow's file and display name. Kai's go. The rename matters only for publication, and the npm trusted-publisher binding is external: **before any publication its binding is observed** (the package's trust settings read by the Owner, then the first `Pack` dry run), as part of that publication's own go. Promotion 1 does not depend on it and does not publish.
3. **Collector 2: the `.github` wiring, additive.** The `KAAL / release / *` workflows on `pull_request` and `merge_group` beside the old checks, not required yet; the lineage, isolation and promotion-source code moved into `05-src` first, each with parity Cases. Promotion 2, Kai's go.
4. **Owner actions** (section 6), then the CI trust root proof (section 3).
5. **Collector 3: the gates and the required contexts**, once the controls are live and observed. The Owner adds the new contexts to the rulesets; the old ones stay. Promotion 3, Kai's go.
6. **Retirements**, section 5.
7. **Final promotion: migration end** (the shims, `change-requirements.md`, the migration record). Kai's go. Then Hosting 0.0.1, Foundation 0.0.1 and Guard 0.0.4 are published in that order, each on its own go and after the publishing trust root is live.

## 5. Retirement order

Each retirement is its own Change (add-new, settings, remove-old), with Kai's go and the evidence of section 2 in its record, only after the CI trust root of section 3 is live (and, for the old publish path, the publishing trust root):

1. The native approval settings on, verified; the ledger-digest decision recorded; then `Change Isolation (review)` removed from the `main` ruleset.
2. The four review and admission workflows, then the attestation code (`attest.mjs`, `attesters.json`) and their Cases.
3. The old `Change Isolation`, `Promotion Source`, `Branching audit`, scans and lane contexts, each only after its new context is required and green; `Branching` last.
4. The four `pull_request_target` workflows and the temporary Actions policy, before the 2 December 2026 block, in this order and with these checkpoints: (a) the replacement workflows on `pull_request` and `merge_group` are live beside them (by 17 November); (b) the live negative Cases pass and the new contexts are required (by 24 November); (c) the old contexts are removed from the rulesets, then the four workflows deleted, then the Actions policy removed (by 1 December). **Fallback if the live proof fails:** the old workflows keep running until the block and are never relaxed in the meantime; the Owner is told at checkpoint (b) that the proof has failed, with the cause, and decides between more time for the fix and holding promotions into `main`. After 2 December a required context whose workflow can no longer run blocks merging (fail closed); removing a required context without its replacement is not an option at any checkpoint.
5. The scripts and shims that only those served.

## 6. Pending Kai actions

Ruleset imports (`integration`, `promotion`, `publishing`), the GitHub App creation and its permission set, the Envelope cutoff (`05-src/envelope/policy.json`) and whether `verify Envelope` becomes required, the native approval settings on `kaal/*` and `main`, G13 and the ledger-digest decision, the interim home of the path rule, the `Version:` convention and the prerelease policy, the name question Process or Processing, and the possible `hotfix/<name>` rename. Each is one question at a time in the project chat.

## Cases (T59, T60, unwired)

T59: a retirement is judged against the evidence: it fails while the replacement is not observed or not independently verified, and it fails while the trust root it needs is not live: a pull request or merge-group check needs only the CI trust root, the publish path needs the publishing one, and neither is a stand-in for the other. T60: a retirement row names its covering control and evidence, a row without a covering control is `stays` and is never retired, and a missing fact is no evidence. The module is `05-src/retirement/judge-retirement.mjs` (`judgeRetirement({ retirements, trustRoots: { ci, publishing } })`), a pure function.

## Open for the Owner and CPO

1. The checkpoint dates of section 5 (17, 24 November and 1 December) and the name of the next collector.
2. Whether `guard-acceptance-boundary.yml` gets a retirement plan from the Change capability (it stays here).

Nothing is wired, activated, promoted or retired by this PLAN.
