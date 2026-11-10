# Release lifecycle and flow-driven controls (CTO assessment and PLAN)

Assessment and recommendations for the CPO, answering the two handovers of 10 November ("Release Management: lifecycle, controls and consolidation" and "Flow-Driven Control Architecture"). Nothing is built, moved, activated or retired. No ruleset, tag, GitHub Release, promotion or publication is changed or authorized. It extends `control-ownership-plan.md` and `control-chain-assessment.md` (the basis) inside the existing PLAN, RED and DO sequence; it is not a second program. The 15 controls keep their names and owners from the basis.

Method: the lifecycle is read transition by transition, and each control is placed where its judgment is required. Where a claim rests on GitHub's behavior it is marked **to prove live**, because documentation is not proof.

## 1. Recommended lifecycle

`kaal/* -> main -> package tag -> draft GitHub Release -> npmjs`, with one rule applied at every step: **an event requests progression, a control authorizes it.** A tag, a Release or a `release` event proves nothing about the transition before it. Each stage therefore re-reads its inputs from the trusted baseline and from the previous stage's recorded evidence, never from the event.

| Transition | Native mechanism | What progresses | What authorizes it (not the event) |
| --- | --- | --- | --- |
| `kaal/<capability>/* -> kaal/<capability>` and `-> main` | pull request, branch rulesets, merge queue (main only) | a Change, then a promotion | `gate (integration)` and `gate (promotion)` |
| `main -> tag` | package-qualified annotated tag (`<package>@<version>`), tag ruleset (creation restricted to the release workflow, no move or delete) | one version bound to one `main` commit | version Package: version greater than the registry's, the commit is on `main`, test Candidate evidence exists for that exact commit, the version is recorded in an admitted Change Record |
| `tag -> GitHub Release` | **draft** Release created from the tag, carrying the pack digest and the evidence | the Release identity and its evidence | version Package (identity), kept as a draft until Publishing is approved |
| `Release -> npmjs` | protected `npm` environment, trusted publishing (OIDC, provenance) | publication | approve Publishing (the environment's required reviewer), then verify Package Promotion (registry acceptance and an installed-artifact check) |

Design points that follow from GitHub's behavior (all **to prove live** before the stage is required):

- **Chain stages with `workflow_call` and `workflow_dispatch`, not with events.** A workflow that a `GITHUB_TOKEN` pushes (a tag) or creates (a Release) does not start another workflow, so a tag-triggered or `release`-triggered chain written with that token silently never runs. The two exceptions GitHub documents, `workflow_dispatch` and `repository_dispatch`, do start a run. A human publishing the draft Release does emit the event. Recommendation: one release workflow with reusable stages and the environment gate, started by an Owner dispatch; the Release event is never the only trigger of publication.
- **The publish step is a workflow job in the protected `npm` environment** (required reviewer = the Owner's approval, trusted publishing). That, not the Release being published, is approve Publishing. Publishing the Release is a record of intent.
- **Retries and partial failure.** Every stage is idempotent for the same tag. A failed publish is re-run for the same tag and commit (the version is still unpublished, nothing is retagged). A published version that fails verify Package Promotion is deprecated and superseded by a new version; a tag never moves and a version is never reused. A draft Release without a publish is deleted with its tag only by the Owner while the version is unpublished.

### Tag before npm, or after (Owner decision; PLAN #1348 chose after)

| | Tag before publication (recommended) | Tag after publication (#1348 as written) |
| --- | --- | --- |
| What the tag means | the exact commit the Owner authorized to publish | the commit that was published |
| Evidence anchor | the draft Release and the tag exist while the approval is given, so the approver sees what is released | the evidence is assembled after the irreversible step |
| Orphan risk | a tag for a version that never publishes (mitigated: a failed publish retries on the same tag, a never-published tag is deleted by the Owner while unpublished, tag rulesets forbid anyone else) | none for tags, but a publish whose tagging step fails leaves a published version without its identity |
| Token and permissions | `contents: write` is held by the stage before the approval, so it needs the narrowest identity (a release workflow and its tag ruleset) | `contents: write` only after publication |
| Fits the Owner's flow | yes (`main -> tag -> Release -> npmjs`) | reverses two stages |

Recommendation: **tag before**, as a draft-Release pair created by version Package, with the publish gated by approve Publishing. #1348's tag preflight (no tag at another commit, no tag for an unpublished version of another commit) is kept and extended: preflight before the tag, creation of the tag, then after publication a check that tag, commit and registry agree. #1348's RED and DO stay frozen until the Owner chooses.

## 2. Transition-to-control matrix (all 15 controls)

KAAL control owner is Engineering Release Management for every row (`control-ownership-plan.md`). The rule owner is the reusable owner. Guard is the execution mechanism where marked; it is not the semantic owner. Cases are the existing or planned ones; **bind Merge** is covered for its auto-merge verdicts (#1349, RED #1352).

| Transition | Control (F#) | Risk it stops | Rule owner | Guard | Evidence it produces | Cases |
| --- | --- | --- | --- | --- | --- | --- |
| each Change into a collector | approve Change (F15) | an unauthorized Change enters | Change (authority) | native approval setting | an approval bound to the head | FAR plan; settings proof after the ledger-digest decision |
| | isolate Change (F6) | Core and `.github` travel together | Change (path rule, name undecided), KAAL supplies the path sets | yes | verdict at the head | `change-isolation` Cases; one authoritative path rule |
| | verify Ancestry (F7) | a Change on a stale or wrong lineage | Release (freshness) | yes | verdict at the head | Branching Cases, per-control RED after the split |
| | test Integration (F16) | the product does not work on a host | the owning capabilities' Cases (Testing mechanism) | yes | lane results per host in `gate (integration)` | lanes T22 to T24 |
| | scan Vulnerabilities (F8), scan Dependencies (F9) | known-vulnerable code or dependency | the scanners | no (the tool) | code-scanning and review results | control-named jobs to add |
| | bind Merge (F10) | landing by a method the flow does not name | Release | yes (`held` before a method is knowable) | method verdict | T25 to T29 (RED) |
| collector `-> main` (promotion) | accept Capability (F14) | a promotion from outside a collector | Release | yes | verdict at the head | Promotion Source Cases |
| | approve Promotion (F11), serialize Promotion (F13) | an unapproved or concurrent promotion | Release (what), Change (authority) | native ruleset and merge queue | approval, queue position | proof ruleset after Owner decisions |
| | test Candidate (F12) | the candidate fails on a host or installed | the owning capabilities' Cases | yes | `gate (promotion)` lane results at the queue's commit | lanes T22 to T24; early readiness Case (G17) |
| | audit Lineage (F5) | a lineage left unaccounted | Release | yes (scheduled) | audit verdict, not a gate | Branching audit Cases |
| `main -> tag -> Release` | version Package (F3) | wrong, lower or duplicate version; tag at another commit | Release | yes | the tag, the draft Release, the pack digest | #1348 T1 to T3, after the lifecycle decision |
| `Release -> npmjs` | approve Publishing (F1) | publication without the Owner | Release | native environment | the approved run | trusted-publishing and environment proof |
| | verify Package Promotion (F2) | a published package that does not install | Release | yes | registry acceptance and installed result recorded on the Release | G12 (optional peers) and installed-artifact Cases |

Placement check against the objective ("executes before the risk it protects can materialize"): version Package runs before the tag and before any publish; approve Publishing runs before `npm publish`; verify Package Promotion runs after. test Candidate's evidence for the commit is **reused**, not re-run, at the tag stage (the control compares the commit and the pack digest); a re-run there would be an unjustified duplicate. The same control may run at two transitions (verify Ancestry, isolate Change, bind Merge) through one implementation.

**Hook and CI.** The pre-push hook and CI already call the same judgments (`lineage.ts`, `check.mjs`) through Guard; the competing parts are the path matchers (`check.mjs` regexes against the boundary workflow's grep) and the fact-resolution wrappers (`control-chain-assessment.md`). Equivalence is proved by a shared Case, and the hook runs the cheap subset, not the CI matrix.

## 3. Target CI inventory: 21 current checks to 25 named checks

**Current (my count, from PR check runs and the workflow files):** 21 names = 11 test legs (Hosting x3, Acceptance x3, Guard x3, Workspaces, Engineering) + 10 others (Branching, Change Isolation, Change Isolation (review), Promotion Source, Dependency Review, CodeQL, CodeQL (javascript-typescript), CodeQL (actions), Guard Acceptance Boundary, Branching audit). Branching, Change Isolation, Change Isolation (review) and Promotion Source also exist as separate copies in `merge-group.yml`.

| Current | Disposition | Target | Why |
| --- | --- | --- | --- |
| 11 test legs | **keep** | test Integration (F16) / test Candidate (F12) | host, installed-artifact and package coverage is preserved; Guard overlap (D4) is evidence first; the lanes become one reusable workflow used at both transitions |
| Branching | **replace** (split) | verify Ancestry (F7), bind Merge (F10) | two judgments and two owners; the synchronization-shape verdict goes with isolate Change |
| Change Isolation | **keep, consolidate** the PR and merge-group copies | isolate Change (F6) | one implementation, two invocations |
| Guard Acceptance Boundary | **consolidate** | isolate Change (F6) | it is a path rule over the Guard boundary; one authoritative rule with a Guard boundary check |
| Change Isolation (review) | **replace** | approve Change (F15), approve Promotion (F11) as native settings | after the Owner's ledger-digest decision and proof; the pass-through admission job retires with it |
| Promotion Source | **keep, consolidate** | accept Capability (F14) | one reusable workflow for the PR and the merge group |
| Dependency Review | **keep, rename** | scan Dependencies (F9) | control-named job |
| CodeQL (3 names) | **keep, rename** | scan Vulnerabilities (F8) | the tool's names stay; the control claims them |
| Branching audit | **keep, rename** | audit Lineage (F5) | scheduled, not a gate |
| (none) | **add** | `gate (integration)`, `gate (promotion)` | the only required contexts; they read the controls' results fail-closed |
| (in `release.yml`, not among the 21) | **add as named checks** | version Package (F3), approve Publishing (F1), verify Package Promotion (F2) | the release stages become explicit and tested |

**Reconciliation.** 21 = 11 test legs + 10 others. The 10 others lose 2 (Change Isolation (review), Guard Acceptance Boundary) and gain 1 by the split (Branching -> verify Ancestry + bind Merge): 9. Add the two gates: 11. Add the three release-stage checks: 14. **Target: 14 named checks + the same 11 test legs = 25 names, of which 2 are the only required contexts.** The number of names rises by 4 and the required contexts fall to 2 (the current set of required contexts is the Owner's ruleset and is not restated here). The extra four are the explicit gates and the release stages that today exist only inside `release.yml`; none duplicates an existing judgment. The number is the outcome of the controls, not a target. approve Change, approve Promotion and serialize Promotion are native settings, not named checks; approve Publishing is the environment-gated publish job; scan Vulnerabilities keeps GitHub's three CodeQL names. That is how 15 controls and two gates give 14 names.

**Not counted:** `change-isolation-review-relay.yml` and the admission workflow produce no judgment of their own and retire with the review trio.

**Performance.** Baseline before any change, from recent real runs: critical path, elapsed and runner time per workflow, repeated executions (the same suite in more than one job, `npm ci` per job, the per-event copies). Targets to measure after consolidation: the per-event copies removed (one reusable workflow per control instead of a copy per event), `npm ci` shared, and evidence reuse between promotion and release. A regression in the critical path needs an argument or a fix; protection is never dropped for speed.

## 4. Retirement plan (each its own authorized Change; proof first)

1. Build and prove the control; make it required (a proof ruleset, the Owner imports it); only then retire the predecessor. Never both in one step.
2. Equivalence across event, host, inputs and RED fixtures, and every context the predecessor ran in kept or argued away (`control-ownership-plan.md`, "Proof before retirement").
3. Order: (a) Branching split (verify Ancestry, bind Merge; isolate Change with the Guard boundary), (b) native approvals and the review trio, after the ledger-digest decision, (c) per-event copies to reusable workflows, (d) the gates, then the required contexts, (e) legacy lanes by the testing PLAN's positive list. `release.mjs` and the shims retire as the last caller is rewired, with the early readiness signal (G17) restored first.
4. Remaining exceptions stay documented: the optional-peer scope (G12), the carried Guard overlap file (G16), and anything the Owner keeps.

## 5. Implementation sequence (inside the existing sequence)

PLAN (this document) -> RED and DO per control, in this order: bind Merge recovery (#1349 line) -> Branching split -> version Package (after the tag-timing decision) -> tag and draft Release stage -> approve Publishing environment proof -> gates (after G13 and the verifier) -> required contexts -> retirements. Live proof of each GitHub behavior above (tag-triggered workflows, the Release event, the dispatch chain, the environment approval, the queue) is part of its RED, with the proof ruleset the Owner imports.

## 6. Open decisions

Owner, one at a time in this order:
1. **Tag before or after publication** (section 1). Recommendation: before, as a draft Release pair; #1348's RED and DO wait.
2. G13 (where Accept authority is read from) before any FAR gate activates.
3. The ledger-digest decision before the review trio retires.
4. Who holds tag-creation: the release workflow identity with `contents: write` and the tag ruleset (recommended) or a separate App.
5. Prerelease policy (refused until decided) and the `Version:` member convention of the admitted Change Record.
6. Whether the GitHub Release stage deserves its own control (a 16th, "bind Release") or stays inside version Package and approve Publishing (recommended: inside).
7. G12 (optional peers for verify Package Promotion), the interim home of the path rule, and the proof rulesets and contexts.

## 7. Risks and what is not claimed

This is an assessment, not proof of GitHub's behavior; every "to prove live" point needs its own run. The 21 count is mine, from check runs and workflows, and the CPO's approximation may include different contexts (for example, the queue's copies). The CodeQL names are GitHub's, so their count depends on the language matrix. No retirement is argued from this document alone.
