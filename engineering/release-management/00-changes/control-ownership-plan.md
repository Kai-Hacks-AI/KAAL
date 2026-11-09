# Control ownership and CI disposition (PLAN)

PLAN, nothing is built, moved or removed. It answers the Owner's direction of 9 Nov: Release Management is the accountable owner of the end-to-end release process and CI/CD is its execution infrastructure, not a second architecture. It is part of the existing Release management PLAN, RED and DO sequence (`transformation.md`), not a second CI-cleanup program. Inputs: the CI ownership map (17 jobs, D1 to D7), PLAN #1339 (testing controls and lanes), PLAN #1340 (FAR authorization, merged), and Change's PLAN #1342.

## Roles (one process owner, delegated capabilities)

| Concern | Accountable owner |
| --- | --- |
| Release stages, readiness, sequencing, promotion, publication, recovery | Release (the process; reusable product: `kaal-release`) |
| PLAN/DO lifecycle, authorization, FAR Accepts, change isolation | Change |
| Check execution, verdict vocabulary, trusted checker | Guard |
| Testing methodology, test infrastructure, coverage mechanisms | Testing |
| Individual requirements, Cases, protective rules | their capability (Hosting's tests are Hosting's; the scanner is CodeQL's) |
| KAAL's workflows, gates, matrices, rulesets, required contexts | Engineering Release Management (Delivery) |

Release owns when evidence is required and whether progression is allowed. It does not become the owner of every control it invokes. Executor is not owner. `kaal-release` is the reusable product; this folder is KAAL's implementation of its principles, and none of the KAAL-specific machinery below is exported as part of that product.

## Control-ownership matrix (one authoritative owner of the rule per control)

| Control (F#) | Rule owned by | Executed by | Consumed by Release as | KAAL realization today | Disposition |
| --- | --- | --- | --- | --- | --- |
| isolate Change (F6) | **Change**: a Change that touches X touches only X, with declared path sets | Guard | a verdict at integrate and promote | `change-isolation/` (Core and `.github`), `guard-acceptance-boundary.yml` (Guard boundary), `kaal-change` `isolate` | **One implementation.** Change provides it parameterized; KAAL declares Core, `.github` and the Guard boundary as data; `change-isolation/` becomes the interim realization until then (D2, D7) |
| PLAN/DO integrity, FAR Accepts authorization (F18 clauses) | **Change** (PLAN #1342, our PLAN #1340) | Guard (target's own copy) | fail-closed reading in test gates | hand-rolled boundary workflow | with the isolation row; gates wait for G13 |
| verify Ancestry (F7), audit Lineage (F5) | **Release** (promotion freshness, lineage) | Guard | a verdict | `lineage/` (`lineage.ts`) | split out of Branching (D3) |
| bind Merge (F10) | **Release** | the merge queue, `merge-group/` | a verdict | `bind-group.sh`, Branching's merge-method verdict | split out of Branching (D3) |
| accept Capability (F14) | **Release** | Guard | a verdict | `promotion-source/` | keep, one reusable workflow |
| test Integration (F16), test Candidate (F12) | the **owning capability's Cases** (Testing mechanism; Hosting, Guard, Foundation own theirs) | CI lanes under Guard | evidence | `ci.yml` lanes, `lanes/` | per #1339; Guard overlap (D4) is evidence first |
| scan Vulnerabilities (F8), scan Dependencies (F9) | the scanners (CodeQL, dependency-review) | the tool | evidence | `codeql.yml`, `dependency-review.yml` | keep; claimed by the control, not by Guard |
| approve Change (F15), approve Promotion (F11), serialize Promotion (F13) | **Release** (what must be approved); **Change** for the authority behind an approval | native ruleset and queue settings | a setting | ledger-attestation trio | retire the trio for native settings after the Owner's ledger-digest decision (D6) |
| version Package (F3), verify Package Promotion (F2), approve Publishing (F1) | **Release** | `release-engine/` | a verdict | `release.yml`, the engine | keep; F2 optional-peer scope open (G12); readiness evidence D1 |

Two consequences for what is documented as Release management's today: `change-isolation/` is not Release's rule (Change's), and `lineage/` is two rules, ancestry and merge method (Release's), plus the synchronization-shape verdict that belongs with isolate Change. Both need Requirements and Architecture entries stating this when their per-control Changes are planned.

## CI disposition (per workflow and job, by the five decisions)

Decisions: 1 one authoritative implementation per control; 2 separate mixed judgments; 3 one orchestration layer owned by Release management; 4 no redundant testing without justification (hosts, contexts and installed-artifact verification preserved); 5 prove before retiring.

| Present | Disposition | Decision | Carried by (existing sequence) |
| --- | --- | --- | --- |
| `ci.yml` Hosting x3, Acceptance per host, Workspaces, Engineering | keep; claimed by the testing controls. Guard and Guard x3 judged first | 4 | #1339 |
| `codeql.yml`, `dependency-review.yml` | keep as used tools | 1 | per-control Change |
| `change-isolation.yml`, `merge-group.yml` isolation job, `guard-acceptance-boundary.yml` | one isolate Change (Change's rule, Guard executes, KAAL path sets) | 1 | per-control Change, with the Change thread |
| `lineage-synchronization.yml`, `branching-audit.yml`, `merge-group.yml` Branching job | split into verify Ancestry, isolate Change, bind Merge | 2 | per-control Change |
| `promotion-source.yml`, `merge-group.yml` Promotion Source job | accept Capability | 1, 3 | per-control Change |
| the three `pull_request_target` workflows and each per-event copy | one reusable workflow per control, used by pull request, merge group and audit events, composed in `KAAL / release / <step>` | 3 | per-control Changes |
| `change-isolation-review*.yml`, `merge-group-admission.yml`, `merge-group-review.yml` | retire for native approval settings | 1 | after the Owner's decision |
| `release.yml` | keep as the realization of version Package and approve Publishing | 3 | version Package Change |
| `actions/setup-env`, `scripts/bind-group.sh` | keep while used; `bind-group.sh` becomes bind Merge | 1 | bind Merge Change |

## Proof before retirement (decision 5)

A predecessor is removed only when, for its replacement: (a) a Case judges the same real change set both ways with equal verdicts, including the red cases; (b) the replacement's required-context behavior is shown on a proof ruleset (the existing proof steps); (c) every execution context the predecessor ran in (host, event, runner) is either kept or listed as retired with its argument. The removal is its own step.

## Where this sits

No new program. The per-control Changes of `transformation.md` carry every row above; this PLAN adds the owner of each rule, so no Change re-decides it, and the matrix correction to Requirements and Architecture (isolate Change and the Branching split) is the first part of the next per-control PLAN. Before build: use, not build, is argued in each per-control PLAN.

## Open for the Owner

- Whether `change-isolation/` stays Release management's interim realization until `kaal-change` provides `isolate`, or the Change thread's capability is built first.
- G13 (the source of designated authority) before any FAR gate activates.
- The ledger-digest decision before the review trio retires; the ruleset contexts.
