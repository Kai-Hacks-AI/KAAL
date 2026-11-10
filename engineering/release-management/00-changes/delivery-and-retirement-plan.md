# Delivering the controls to `main` and retiring the existing setup (PLAN)

Change `release-management/C10`. PLAN, nothing is built or retired; the failing Cases (T59, T60) are in `04-test/retirement.red.mjs`, carried unwired. It folds the earlier "Path to `main`" (`transformation.md`) into one sequence that ends in a clean release-management setup, and it takes the ownership map (`release/ci-ownership-map.md`, CTO assessment for the CPO, 9 November) as the baseline of what exists.

## Intent (Owner, 10 November 2026)

"Plan to deliver the controls to `main` and retire the existing setup, so we have a clean release management setup."

## Standing rules (they bind every step below)

- Only `kaal/*` into `main`. No admin override, no bypass, auto-merge always on, exact-head CPO review.
- **Prove coverage before retiring.** A predecessor is removed only when its replacement has run on a real pull request and merge group and was verified by someone other than its author, with the evidence kept in the Change record (CPO condition, 9 November).
- **Nothing is removed until the fail-closed trust root is live** (defined below).
- **Freeze Collector's rule applies to every promotion** (C6): while a promotion of a collector is open, no pull request targets it. The collector is drained or retargeted first, and the promotion is never "delivered, then recreated".
- Every promotion into `main`, every ruleset import, every live apply and every retirement has its own explicit go from Kai. A landed PLAN is a go for the additive steps, not for those.
- Fall forward: nothing earlier is renumbered or rewritten.

## 1. Inventory (10 November, read live)

`kaal/engineering-release-management` is 28 commits ahead of `main`; its `.github` differs from `main` by one rename, `release.yml` to `publish.yml` (`KAAL / release / publish`). The `KAAL / release / *` control workflows are not on any branch yet: the controls exist as code in `05-src` and as Cases, and nothing in `.github` calls them.

| Change | State |
| --- | --- |
| C1 register, C3 version Package (PLAN, engine DO), C4 assessments, C5 hooks PLAN (#1355), C7 track Work (PLAN #1363, DO #1364), C8 verify Envelope PLAN (#1365) | landed in the collector |
| C2 bind Merge DO | open: #1358 (approved; merge unconfirmed) |
| C8 verify Envelope DO | open: #1366 |
| C6 freeze Collector PLAN | open: #1367 |
| C9 control overview and vocabulary PLAN | open: #1368 |
| Hooks DOs (C5), freeze Collector DO (C6), verify Envelope wiring | to come |
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
| `release.yml` (named `Release` on `main`) | `publish.yml`, `KAAL / release / publish`, with approve Publishing F1, verify Package Promotion F2, version Package F3 | the npmjs trusted-publisher binding (the Owner reports it is already on `publish.yml`) confirmed; a dry run of Pack and the approval wait |
| The four `pull_request_target` workflows and the temporary Actions policy | the same controls on `pull_request` and `merge_group` (F17: pinned to `main`) | the live negative Cases of the trust root (T10) pass on a real pull request; done before 2 December 2026 |
| `bind-group.sh`, `branching.sh`, `branching-audit.sh` | `lineage/` (`bind Merge`, `verify Ancestry`, `audit Lineage`) | covered by the rows above; deleted with their workflows |
| The `Branching` required context (last), the old contexts on the rulesets `lineage` and `main` | the three rulesets as versioned JSON, imported by the Owner, drift-checked | the drift Case green; the old context removed only after the new one is required and green |
| `engineering/release/release.mjs` shim, `change-requirements.md` (F20), the migration record | nothing (the migration ends) | `migration-end.test.mjs` and `shim-facade.test.mjs` Cases |
| **Stays:** `guard-acceptance-boundary.yml` (the PLAN/DO integrity of `kaal/guard`, D2 and D7), `ci.yml` itself, `setup-env` | not covered by a release control; the Change capability owns the PLAN/DO integrity rule | listed as open: the owner of that rule is Change, not this plan |

## 3. The trust root is live when

All of the following hold, observed and recorded: the controls run as `main`'s checker on `pull_request` and `merge_group` (F17) with no `pull_request_target`; the live negative Cases (T10) leave the required context failed or absent for a candidate that edits, renames or skips a control; the three rulesets are imported and the drift Case is green; the gates read absent, skipped, stale, cancelled and timed-out runs as not passed; the tag App exists with its create-only permission set and the tag ruleset names it as the sole bypass actor. Until then no retirement Change is proposed.

## 4. Promotion sequence

Slices are collectors in their own right (`kaal/<capability>/<leaf>`, terminated on promotion), so freeze Collector's rule applies to each. Whether the whole collector promotes in one go or in slices is the Owner's call (open question 1); the order is the same.

1. **Land the open Changes into the collector** (#1358, #1366, #1367, #1368, the hooks and freeze Collector DOs), then freeze it. Nothing targets it while a promotion is open.
2. **P1 documents, engines and Cases** (`02` to `05`, no `.github`): additive; nothing on `main` changes behaviour. Kai's go.
3. **P2 `.github` wiring, additive**: the `KAAL / release / *` workflows on `pull_request` and `merge_group` beside the old checks, the `publish.yml` rename (the trusted-publisher binding already names it), not required yet. Kai's go.
4. **Owner actions** (section 6), then the proof of section 3.
5. **P3 the gates and the required contexts** once the controls are live: the Owner adds the new contexts to the rulesets; the old ones stay.
6. **Retirements**, section 5.
7. **P4 migration end**: the shims, `change-requirements.md`, the migration record. Kai's go. Then Hosting 0.0.1, Foundation 0.0.1 and Guard 0.0.4 are published in that order, each on its own go.

## 5. Retirement order

Each retirement is its own Change (add-new, settings, remove-old), with Kai's go and the evidence of section 2 in its record, only after section 3 holds:

1. The native approval settings on, verified; the ledger-digest decision recorded; then `Change Isolation (review)` removed from the `main` ruleset.
2. The four review and admission workflows, then the attestation code (`attest.mjs`, `attesters.json`) and their Cases.
3. The old `Change Isolation`, `Promotion Source`, `Branching audit`, scans and lane contexts, each only after its new context is required and green; `Branching` last.
4. The four `pull_request_target` workflows and the temporary Actions policy, before 2 December 2026.
5. The scripts and shims that only those served.

## 6. Pending Kai actions

Ruleset imports (`integration`, `promotion`, `publishing`), the GitHub App creation and its permission set, the Envelope cutoff (`05-src/envelope/policy.json`) and whether `verify Envelope` becomes required, the native approval settings on `kaal/*` and `main`, G13 and the ledger-digest decision, the interim home of the path rule, the `Version:` convention and the prerelease policy, the name question Process or Processing, and the possible `hotfix/<name>` rename. Each is one question at a time in the project chat.

## Cases (T59, T60, unwired)

T59: a retirement is judged against the evidence: it fails while the replacement is not observed or not independently verified, and it fails while the trust root is not live. T60: a retirement row names its covering control and evidence, a row without a covering control is `stays` and is never retired, and a missing fact is no evidence. The module is `05-src/retirement/judge-retirement.mjs` (`judgeRetirement({ retirements, trustRootLive })`), a pure function.

## Open for the Owner and CPO

1. One promotion of the whole collector, or slices as leaf collectors (section 4).
2. Whether P2 may carry the `publish.yml` rename alone first, so Foundation 0.0.1 and Guard 0.0.4 are not held by the rest.
3. Whether `guard-acceptance-boundary.yml` gets a retirement plan from the Change capability (it stays here).

Nothing is wired, activated, promoted or retired by this PLAN.
