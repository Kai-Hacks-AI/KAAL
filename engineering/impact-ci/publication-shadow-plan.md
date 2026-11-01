# PLAN: trusted stable-gate publication and live shadow

Status, 2026-11-01: the Owner's [Actions-native direction](actions-native-plan.md)
supersedes this infrastructure-first delivery sequence and proposed gate names.
Retain this accepted PLAN as historical design/evidence. Its source-trust and
freshness findings remain relevant; it no longer makes App/receipts/store setup
a prerequisite to the next full-matrix aggregation increment. No activation or
ruleset migration is authorized by the redirection.

## Decision and boundary

Engineering will connect approved #790 to authenticated GitHub evidence and a
dedicated check publisher, then verify the results alongside existing checks.
The two independent policies remain `KAAL Main` and `KAAL Lineage`. This is KAAL
repository-specific Engineering functionality, delivered through `kaal/ci-gates`;
no product package or publication is proposed. Advances #759/#776; C11 and #769's
impact selector are not prerequisites and authorize no exclusions here.

**This PR changes Markdown only.** Approval establishes design direction for
bounded TDD/DO proposals. It does not deploy a publisher, install an App, grant
credentials, alter workflows, run mutation experiments against protected branches,
change rulesets, synchronize or promote. Each live activation/configuration and
experiment scope needs separate Owner alignment. Migration is a further decision.

The technical recommendation is a dedicated GitHub App outside candidate
execution, with a read-only evidence collector and an isolated check writer.
App identity solves publisher attribution. It does **not** make asynchronous
invalidation atomic with a GitHub merge. This PLAN does not assert that stable
checks alone can close the remaining stale-GREEN window.

## 1. Evidence baseline and source inventory

Read on 2026-11-01:

- #790 is approved and merged into `kaal/ci-gates` at
  `72fa700be1af7d6de75ab893c396fdc64168c959`, tree
  `9b26a90f223e2ea09ad4dbed4d09b1651cd857e0`. Its approved head was
  `55f2bae349fc7af5c87a33dd4ff78ee9dd2c4543`.
- Current main is `dd39d3be7b3d51b47658c7fdafa1b7b3799f3e44`. It contains
  auto-merge enforcement (#789) and focused Testing deduplication (#796), but
  reading `engineering/impact-ci/full-policy.mjs` there returns 404. An accepted
  collector implementation is not automatically installed production governance.
- The main-to-collector baseline differences do not change the ten workflows or
  nine Guard declarations pinned by #790. Main's Branching implementation has
  advanced; workflow-byte equality does not prove equality of executed checkers.
- #792's [live finding](https://github.com/Kai-Hacks-AI/KAAL/pull/792#issuecomment-6558569755)
  observed unchanged-head GREEN, a registered replacement in progress, then RED
  and blocked mergeability. The first observation after disable already saw the
  replacement. It did not measure or exclude the earlier registration window;
  Owner review was withheld and no merge attempt occurred.

All existing source paths below are relative to `engineering/impact-ci/` at the
pinned collector unless specified. These are the inputs to reuse, not new owners.

| Existing source | Authority/interface to retain |
| --- | --- |
| `policies/main.json`, blob `ef871e899e8b74b434abb8ad1d5c656a67b4656b` | `kaal-main` 1.0.0: explicit main PR and push profiles; 17 and 14 instances |
| `policies/lineage.json`, blob `53dc0bc3e7c0b57538b7683e1da7516fa02f157d` | `kaal-lineage` 1.0.0: ordinary and Guard PR profiles; 17 and 18 instances |
| `assurance-policy.mjs`, blob `a7161c41aa17bb1d5e599cb9cc05aac127d0a74b`; `workflow-definitions.mjs`, blob `d28994927b461e7d8854b823fd59c890dc8fd94d` | Independent policy selection and explicit reference resolution; shared definitions confer no required membership |
| `full-policy.mjs`, blob `fc626b76249b7a4a02d41cc74736a6cc93dfd6f1`; `policy-identity.mjs`; `full-matrix-anchors.json` | Opaque authority, manifests, selected-policy identity/digests, exact source reconciliation |
| `full-gate.mjs`, blob `eeaf21df622794bd25a78b3e120eb33239b72f74`; `selection-contract.mjs`; `execution-gate.mjs`; `selection-gate.mjs`; `target-policy.mjs` | The single completeness/evaluation path, including generation and completion-time checks; preserve #760/#764 regressions |
| `git-input.mjs`, blob `707a0b47bd6664e39e979a1168bdcbe70fda8321` | `readTargetSnapshot` and `authorityFromGit`; raw Git commit parent/tree proof through Hosting |
| `replay.mjs`, `fixtures/pr773-actions.json`, `evidence/` | Retained real-history facts and calibrated unknowns; not live authentication |
| The eight `*.test.mjs` files, `full-fixtures.mjs`, `dependencies.json` | 170 approved gate/policy/adapter/replay cases, including the unchanged three original contract files; preserve assertions |
| `packages/extensions/kaal-hosting`, `kaal-hosting` 0.0.1 on this target | Existing `execute`/filesystem interfaces for Git and host mechanics; no new host implementation inside the evaluator |
| `packages/kaal-foundation`, `@kaihacksai/kaal-foundation` 0.0.1 | Its public SHA-256 for KAAL digests; no copied hashing or Foundation utility bucket |
| `.github/workflows/{ci,codeql,dependency-review,change-isolation,lineage-synchronization,promotion-source,guard-acceptance-boundary,branching-audit,guard-release,release}.yml` and `.kaal/config/guard/` | Exact definition inventory already pinned in `full-matrix-anchors.json`; record actual executed revisions as well |
| `engineering/github/{lineage.ts,branching.sh,promotion-source.sh,change-isolation.sh}`; `engineering/change-isolation/check.mjs`; root package/lock and Guard package | Resolve the trusted checker, command and dependency revisions used by producers; do not infer them solely from unchanged workflow YAML |

The 11 CI instances remain Hosting, Acceptance and Guard on Linux/Windows/macOS,
plus Workspaces and Engineering on Linux. PR profiles additionally require the
three repository policy checks, both CodeQL analyses and Dependency Review.
Guard PRs additionally require Guard Acceptance Boundary. Main push requires the
11 CI instances, two analyses and Branching audit. Release/manual/scheduled runs
are not substitutes. Main and Lineage retain separate policy versions, inputs,
inventories and additional controls; neither is the other's filtered baseline.

## 2. Proposed trust architecture

| Boundary | Responsibility | Prohibited shortcut |
| --- | --- | --- |
| Trusted policy loader | Load an Owner-approved immutable #790 evaluator/policy bundle and actual target/governance Git objects | Candidate-selected evaluator, inventory, branch name or authority flag |
| GitHub acquisition adapter | Authenticate deliveries/receipts, query provider APIs, preserve all pages and source facts, normalize attributable evidence | Derive missing source/checkout/PR identity from matching strings, artifact claims or job names alone |
| Generation controller | Maintain durable context/generation and producer registrations, reconcile events and current facts | Treat arrival order, an in-memory counter or a rerun request as a complete snapshot |
| #790 evaluator | Establish the expected full matrix and judge normalized evidence exactly once | Second job-counting, selection or completeness algorithm in controller/attestor/publisher |
| Isolated publisher | Map verdicts to the two App-owned check contexts, write, read back and record acknowledgement | Candidate-accessible App credentials or caller-supplied success booleans |
| GitHub rulesets/review | Eventually enforce approved source-bound checks plus independent controls | Treat an authentic displayed check as proof of atomic merge enforcement |

Proposed code lives under `engineering/impact-ci/github/`: acquisition and receipt
verification, generation storage/controller, and publication/transport adapters.
Pure mappings/state transitions remain separate from I/O. Git uses the existing
Hosting adapter; provider transport is injected and realized through a pinned
client executed by Hosting or a separately reviewed Hosting integration. Hosting
0.0.1 is not being assumed to provide a new HTTP or distributed-storage API.

The controller runs outside candidate jobs. Its immutable deployment revision,
dependency lock, two policy identities and allowed source revisions are recorded.
There is currently no production policy registry on main or other collectors:
Owner must separately approve a bootstrap mapping from each applicable target to
the accepted policy bundle. Later integration uses normal reviewed promotion and
dependency flows. A candidate cannot update its own bootstrap mapping. A missing
mapping is unresolved; do not copy the whole Engineering collector to supply it.

## 3. Publisher identity, permissions and external setup

Propose one dedicated App, provisionally named **KAAL CI Gate Publisher**. No App
ID, installation, hosting location or credential readiness is currently claimed.
Configure exactly the KAAL repository ID `1415996637`; names alone are insufficient.
The App may share transport/state code between gates, not policy authority.

| Permission/setup | Proposed need | Owner/external prerequisite |
| --- | --- | --- |
| Metadata read; Contents read | Repository IDs, immutable Git/workflow bytes and source manifests | Selected-repository installation; approved deployment/source pins |
| Actions read | Runs, attempts, jobs and their provider state | Provider API access for all required producers |
| Checks write | Read underlying check/suite identities and create/update the App's two aggregate checks | App registration/installation and separately authorized shadow publication; expected App ID recorded |
| Pull requests read | Current PR, target/head/base, state and review observations | No approval, edit, merge or auto-merge authority for this App |
| Optional Administration read | Effective classic protections and rule inspection | Prefer an Owner-provided export if unavailable; no Administration write |
| Webhook secret; installation credentials | Authenticated delivery ingress and scoped short-lived API access | Owner-managed secret storage/rotation, TLS endpoint, service deployment and operational owner |
| Optional protected receipt job with OIDC | Independently authenticate otherwise absent workflow/job/revision facts | Separately reviewed `.github`-only Change, precise issuer/audience/trust restrictions and allowed workflow SHAs |
| Durable registry, clock and recovery | Generation/producer/check IDs, audit log and publication outbox | Accepted storage/lease realization and tested restart/outage behavior; no assumed distributed Hosting lock |

No Actions write, Contents write, workflow write, merge, approval, code-scanning
configuration or ruleset write is needed for the initial observer/publisher.
Required full reruns are requested through the existing authorized process; do
not broaden App permissions just to make incomplete evidence disappear. The
publisher needs Checks write, not Commit statuses write. If GitHub's source-picker
UI needs additional setup/permissions, resolve that explicitly during isolated
configuration tests rather than granting a broad token by assumption. [D1,D2]

Keys and installation tokens stay outside candidate runners. A receipt job can
have narrowly scoped `id-token: write`, not the App key or Checks write token.
Never log raw JWTs or secrets. An Actions-only implementation using App 15368 is
not an equivalent default: another candidate workflow can use that same source.
An alternative needs independently demonstrated equivalent source enforcement.

## 4. Authoritative acquisition and normalization

Signed webhook deliveries are wake-ups to refresh provider facts, not verdicts.
Verify the raw-body signature and expected installation/repository, journal the
delivery ID, acknowledge promptly and process asynchronously. Redelivery must be
idempotent. Reconcile independently of webhook arrival: failed deliveries are not
automatically redelivered by GitHub. A durable periodic sweep/recovery process is
required; this PLAN creates no scheduled task. [D3,D4]

Subscribe only to needed PR changes (including target/auto-merge metadata), push,
workflow_run, workflow_job, check_run/check_suite rerequests and relevant
installation/configuration events. Validate actions against the documented event
schema. Do not assume every rerun has a new `workflow_run.requested` event. [D5]

| Required fact | Acquisition and evidence retained |
| --- | --- |
| Repository/PR/push and current target | Fresh authenticated repository/PR/ref reads; immutable repository and head-repository IDs, PR number, base ref/SHA and head SHA; push ref/before/after plus actual commit |
| Tested merge/tree and parents | Independently resolve/fetch the applicable PR merge ref and Git commit/tree; use `authorityFromGit`. Conflicts, vanished refs or unproven head/base relationships are unresolved. Main push is its own actual commit/event, not PR success reused |
| Workflow source and checker governance | Provider-authenticated workflow revision, exact file bytes, dependency/command pins and actual checker/checkout revisions. Authenticate receipts where APIs do not expose these facts |
| Producer and child identity | Repository workflow ID/path, run ID/attempt, check suite, job ID and each check's App ID/subject SHA via its check-run URL; verify provider relationships in both directions |
| Required job key and host | Resolve a unique job/check/OS entry through the approved workflow catalog, actual workflow definition and provider runner labels. Job display name alone is not a source identity |
| Population and generations | All runs in the bounded authoritative subject/event window; all attempts and relevant check runs, with `filter=all` where needed; exact-attempt job pages; explicit generation membership/disposition |
| Outcomes and times | Provider job status/conclusion/start/completion; authenticated terminal observations for producer state, with origin and acquisition time recorded; never call `updated_at` a proven completion timestamp |

Use provider pagination metadata/links to the last page, retain page boundaries,
counts and request provenance, then reuse #790's complete-page and matrix
contracts. A search cap, truncated page, changing population, unknown producer or
incomplete acquisition is unresolved. Bounded rescans and final re-reads reduce
inconsistent snapshots; they do not establish an atomic provider snapshot. Never
hide competing runs behind a latest-only query or join successes across attempts.
Exact-attempt jobs matter because failed-jobs-only reruns can be partial. [D6,D7]

Transport is restricted to the configured GitHub API/repository and numeric
provider IDs. Verify any returned resource URL before following it; never forward
installation credentials to a candidate-supplied origin or redirect.

### Execution-source proof and known #790 integration gaps

REST run/job success is necessary but not proof of every normalized revision
field. The first adapter increment must report unavailable provenance rather than
populate #790 fields with plausible constants. These are explicit DO dependencies:

| Gap in current evidence/interface | Proposed treatment before an authoritative live GREEN |
| --- | --- |
| Raw Actions history lacks authenticated workflow/checker/tested-byte bindings | Authenticate a minimal receipt from a protected immutable attestor, joined to the provider run/job/check. Candidate artifacts/logs are not that receipt |
| #790 binds policy-producer `workflowSha` to one `context.governanceSha`, but current workflows check out/fetch a moving default branch | Distinguish workflow definition revision from executed checker/governance revision. Pin or independently prove each; do not invent equality. Raise a narrow, versioned evaluator-input extension with new cases if actual facts require it |
| GitHub run records do not supply the exact producer `completedAt` expected by the offline fixture | Keep genuine job completion times; explicitly model authenticated terminal-observation time as an upper bound where needed. Do not silently substitute run `updated_at`. Any schema extension preserves existing cases and completion assurance |
| PR associations can be empty, especially for forks; metadata edits/reruns may share a head | Join the independently read PR, event/ref, source repository and tested merge object. An absent association is not permission to infer a PR from SHA alone |
| Native duplicate runs and partial reruns lack an independently chosen complete generation | Pin one complete attempt per producer through the trusted registry. Keep every competing run visible; no passing union or automatic latest-run selection. Ambiguity stays unresolved |

Proposed receipt design: an immutable approved reusable attestor, separate from
candidate execution, authenticates to the controller using GitHub OIDC. Validate
signature/key, issuer, dedicated audience, validity/replay bounds, repository ID,
run/attempt, `check_run_id`, event/ref and workflow/reusable-workflow identities;
then requery provider relationships. OIDC documents workflow SHA and reusable
workflow SHA claims. Validate available claims; missing ones stay unresolved.
Use keys from configured GitHub issuer metadata, not token-supplied key URLs.
OIDC authenticates the job/workflow identity, not arbitrary checkout claims. [D8,D9]

The attestor must not run/install candidate code or accept its environment,
caches, executable artifacts or success flags. Verify the caller workflow bytes
and the immutable attestor source. Candidate code must not be able to obtain an
accepted attestor identity or alter the receipt's facts. For tested bytes, prove
the checkout/command mapping from the authenticated immutable execution driver;
floating/dynamic checkout or governance fetch needs trusted source capture or a
separately approved pinning Change. A valid OIDC token alone does not prove which
bytes a job tested. Platform claim availability and this isolation are live
acceptance gates, not existing capabilities claimed by this PLAN.

Keep raw provider facts and proof references alongside normalized evidence. The
acquirer establishes authenticity; only #790 judges expected population and
completeness. It may reject input before evaluation for authentication failure,
but may not certify its own alternative full matrix. Reuse existing provider run
ownership and #790 evidence conventions; no second Case/timing recorder.

## 5. Publication contract

| Independent policy | Applicability | Stable context |
| --- | --- | --- |
| `kaal-main` / main-pr | PR currently targeting main | KAAL Main |
| `kaal-main` / main-push | Push to main | KAAL Main |
| `kaal-lineage` / lineage-pr | Ordinary supported collector PR | KAAL Lineage |
| `kaal-lineage` / lineage-guard-pr | PR into kaal/guard, with its additional boundary | KAAL Lineage |

Each policy owns its own version, full inventory and controls. Unknown or
inapplicable targets cannot emit either success or a skipped aggregate. Publication
SHA is the proved tested SHA used by the approved profile; verify which head or
synthetic merge check GitHub actually evaluates, including forks. Do not merely
publish on a `workflow_run` observer's default-branch GITHUB_SHA. Direct App
check runs avoid assuming its workflow-job check is PR-eligible. [D2]

| Evaluator/acquisition state | Proposed Checks API write | Required meaning |
| --- | --- | --- |
| Pending, authentic required work unfinished | `queued` or `in_progress`, without a conclusion | Non-success, no assurance claim; deadline still applies |
| Passed with authenticated, current complete evidence | `completed` / `success` | GREEN for the recorded policy/profile/subject/generation only |
| Failed required obligation or expired generation | `completed` / `failure` | RED with failed stage and evidence links |
| Unresolved: missing/ambiguous/stale/unauthenticated evidence | `completed` / `failure`, summary headed `UNRESOLVED` | Blocking, distinguishable from an evaluated failed assertion |
| Transport or publication acknowledgement unknown | Durable unresolved publication record; no local claim of published GREEN | Requery/repair; never convert a timeout into successful publication |

Do not emit neutral/skipped conclusions as a non-success substitute: GitHub can
accept them for required checks. The App uses queued/in-progress rather than the
Actions-only status literal `pending`. The App cannot set the conclusion `stale`;
diagnose stale evidence in the summary while writing failure. [D1,D2]

The summary/details bind repository, PR/push/ref, head/base/tested/tree/governance,
policy ID/version/profile/digests, evaluator revision, generation, producer IDs
and attempts, verified findings and acquisition/publication times. `external_id`
is a deterministic ledger reference, not a GitHub uniqueness lock or extra merge
predicate. Read back ID, App, SHA, state and ledger reference after each write.
Crash recovery uses an idempotent outbox/reconciliation record, not blind retries
creating competing same-name checks.

## 6. Generations, invalidation and the merge race

The durable logical key includes repository ID, PR number or push identity,
target, source repository, head/base/tested/tree, policy/evaluator/governance
versions and the complete producer run/attempt population. A generation carries
that immutable tuple, evidence window, deadline and monotonic fencing epoch.
The worker may publish only for a still-current registered generation after a
fresh provider read and completed #790 judgment. A final re-read after publication
detects changes and triggers invalidation; it cannot undo an intervening merge.

On head/target/policy/population/rerun change, durably retire the old generation
and attempt to revoke every App-owned GREEN that could be reused before preparing
the replacement. Do not launch a controller-owned rerun until revocation is
acknowledged. Restart must reconcile remote check state, current producer state
and unresolved outbox operations before permitting another success. A failed-only
partial attempt needs a complete fresh attempt; it never borrows children.

Publishing serializes by **repository + publication SHA + gate**, not only PR.
Multiple PRs/targets, or main-push/PR contexts, can share that key. Until live
same-SHA coalescing is accepted, competing applicable contexts yield a non-success
and require distinct tested revisions or a separately reviewed conjunction of all
active contexts. Such a conjunction cannot discard one context's independent
policy/version. Discovery of a new context is itself asynchronous.

### Limitations that block migration

1. **Registration latency:** a rerun, retarget or metadata edit can occur before
   the controller receives it. Earlier GREEN can remain usable in that interval.
   #792 did not close it. Faster polling/webhooks are not synchronous revocation.
2. **Publication/merge atomicity:** GitHub's check interface does not expose a
   transaction over this complete tuple and a merge. A local lease/fencing epoch
   does not make GitHub reject an older in-flight write. Timeout/restart can leave
   remote state uncertain; do not claim a distributed lock solved the platform gap.
3. **Commit scope:** check name/App/SHA does not itself enforce PR number, target,
   policy digest, attempt or `external_id`. Same-SHA aliasing and newly opened
   contexts can reuse a historical check before the observer reacts.
4. **Old-success replacement:** test whether updating an existing completed check
   removes its usable success, and how competing same-name/App runs are evaluated.
   Do not assume creating a new pending run immediately invalidates every old one,
   or that an attempted reset cleared the prior conclusion.
5. **Outage after GREEN:** initial publication failure leaves a missing check,
   but failure to revoke an existing GREEN may leave it usable. An alert/watchdog
   cannot truthfully be called a merge fence. Code deadlines also do not cause
   GitHub to expire an already published success at that instant.

These are enforcement limitations/inferences from the asynchronous boundary,
not reported live false-GREEN incidents beyond the recorded #773/#792 coverage.
Record every observed unsafe interval, even when review withholding prevented a
merge. In shadow, existing mandatory checks/review remain authoritative; no one
may call a scoped check certificate a race-free authorization of a later tuple.

If these gaps remain, retain individual required checks and stop migration.
Propose a separate enforcement design: for example, a GitHub-native merge-group
admission fence with fresh tested SHAs, or exclusive trusted merge/mutation
coordination with a provider-enforced final-generation boundary. Merge queues
need new event support and configuration, and wildcard-branch restrictions need
verification; they are not an automatic solution to reruns on the same SHA.
A broker that merely reads then calls merge with a head-SHA precondition does
not establish a target/policy/attempt transaction either. Neither mechanism is
authorized here. If GitHub cannot supply the necessary fence, report the
unmet guarantee explicitly rather than replacing current controls. [D10,D11]

## 7. Multi-loop TDD and live shadow cases

Use KAAL Testing's three loops; preserve the 170 approved #790 cases and retained
contracts. New Cases belong to Engineering's repository assurance work.

| Loop | Discriminating evidence required |
| --- | --- |
| Architecture | Permitted authenticated acquisition → #790 → isolated publisher; injected candidate policy/code/token access or duplicated completeness logic is prohibited; undecidable trust/storage/callback behavior is an explicit validation item, never a pass |
| Acceptance | Drive public controller/publisher interfaces against a faithful provider test transport, then an Owner-authorized real App. Inspect the consumer-visible check source, SHA, state and evidence; model concurrent/expired generations, not only return values |
| Implementation | Behavioural RED before the fix, GREEN after, and mutations of authentication, source/event binding, pagination, producer registration, stale-writer rejection and verdict mapping. Missing credentials/imports are blocked evidence, not discriminating RED |

The live campaign must cover the following cases. Each records raw authenticated
API references, policy/evaluator version, complete producer/job pages, mutation
time, request/acknowledgement times, check IDs/App IDs and mergeability observations.

| Case | Live experiment and required observation |
| --- | --- |
| S1 Full positives | Ordinary lineage and legal main PRs, plus an independently authorized real main push; GREEN appears only after every required Linux/Windows/macOS obligation and producer is complete |
| S2 Delayed tail | Hold/delay a required Guard Windows job and separately a policy/security producer; aggregate remains non-success while other work is GREEN; measure `successNotBefore` against actual job completion |
| S3 Failed/unfinished work | Required failure, skipped job, cancelled run and never-created producer; RED or unresolved/deadline failure, never success; no suppression of original outcomes |
| S4 Guard scope | Real PR targeting kaal/guard must include the boundary. Missing or violated boundary blocks; ordinary lineage does not inherit that extra obligation implicitly |
| S5 Reruns/duplicates | Complete rerun, failed-only partial attempt, two competing run IDs and out-of-order completion callbacks; old success cannot be assembled with incompatible children; ambiguity remains unresolved |
| S6 Revision/policy change | New head, advanced base/merge ref, retarget, governance/policy update and newly required producer; old tuple is rejected and replacement state/any invalidation interval is recorded |
| S7 Same SHA | Two PRs to different collectors, main-vs-lineage contexts and push/PR collision; independently bind each context and expose any commit-scoped reuse gap |
| S8 Counterfeit evidence | Candidate emits the aggregate name or a required child name through Actions App 15368; edits workflow/evaluator/receipt, supplies wrong workflow/App/repository/fork identity or replays a signed receipt. No authenticated aggregate GREEN from those claims |
| S9 Publication failures | Before-write rejection, 401/403, throttling, server timeout after possible acceptance, crash before ledger acknowledgement and failed revocation after a previous GREEN. Compare local outbox with actual remote state; report the outage-after-GREEN gap |
| S10 Invalidation race | Start from genuine GREEN, change one prerequisite on unchanged SHA, observe before replacement registration, during pending and after RED; delay old writes deliberately. Review withholding is a safety interlock, not proof CI alone would have blocked |
| S11 Independent controls | Successful CodeQL analysis with a blocking finding still faces the separate code-scanning rule; all CI success without independent approval remains blocked; Branching and Change Isolation continue their own judgments |

Synthetic transport and historical replay run first but do not satisfy S1–S11.
Source-binding and same-App merge-blocking tests need an Owner-authorized isolated
platform probe with a source-bound required check. This is an additional explicit
configuration decision, not a modification to KAAL's existing required checks.
Any separate test repository must be identified as a platform-semantics probe;
do not change #790's KAAL repository binding to pass it off as production evidence.
Actual KAAL evidence remains necessary for its four policy profiles.

For KAAL shadow, keep both aggregates **non-required** and all current required
checks unchanged. Approvals are withheld on disposable challenge PRs, auto-merge
method follows the canonical Branching judge, and no experiment merges or bypasses
rules. Do not approve #792 or reuse its closed probe. A positive main PR must use
the legal same-repository collector source/freshness route; any temporary probe
collector/Change requires explicit experiment alignment. Observe a separately
authorized normal main promotion for the push profile, not a synthetic direct
push. Guard challenges use a reviewed isolated fixture disturbance, not weakened
accepted assertions. Stop if the safety interlock is lost.

Shadow reports compare three independent columns: existing-required result,
complete policy result, and published aggregate result. RED/unresolved while the
old subset is GREEN may be expected stronger coverage; explain it. Any aggregate
GREEN with incomplete/wrong evidence, unexplained difference or unsafe reuse is
a stop finding. A run count or one observed GREEN is not acceptance. Record a
case as blocked if its App/receipt/platform setup is absent, never as passed.

## 8. Focused delivery sequence and dependencies

| Step / bounded PR | Exit and external dependency |
| --- | --- |
| P0 This PLAN on kaal/ci-gates | Independent Owner review of source authority, App permissions, receipt/schema gaps and explicit enforcement limitations; Markdown only |
| P1 TDD and unwired DO | New auth/acquisition/generation/publication Cases and transport tests; reuse #790; minimal versioned input extension only where real fact shapes require it, preserving existing cases. No credentials, deployment or workflow changes |
| P2 Reviewed setup proposal | Exact App manifest/permissions, repository installation, deployment/source pins, bootstrap policy map, storage/keys, OIDC trust and isolated-probe configuration for Owner action. No inferred administrative access |
| P3 Separately aligned producer receipts | A `.github`-only Change for the accepted immutable attestor/checkout-governance proof, where required; keep assertions, hosts, security controls and existing required checks. Use governed delivery to the branch from which it must actually execute |
| P4 Authorized shadow deployment/campaign | Owner activates only the approved observer and non-required publisher, then S1–S11 using real provider evidence and agreed safety scope. Record incomplete Cases and gaps without claiming enforcement |
| P5 Separate enforcement/migration PLAN | Only after source/provenance/campaign evidence is accepted; unresolved race/fence findings remain explicit blockers. Exact before/after/rollback review, no automatic activation |

Pure code and mocked transport can deliver deterministic identity/normalization,
state mapping, generation registration, stale-writer detection and outbox logic.
Authentic source claims, actual App identity, check replacement semantics,
same-SHA reuse, outage effects and merge blocking require a live App, credentials,
accepted instrumentation and/or administrative probe configuration. They cannot
be certified by fixtures. This session's connector can read checks/runs but is
not the proposed installed Checks-write publisher; readiness is unestablished.

Work on C51 adoption, Change Isolation and Branching 0.0.1 may continue in their
focused collectors. Do not synchronize merely because main advanced. Synchronize
only for a real accepted dependency (such as deployed trusted receipt machinery)
or promotion preparation; no broad Engineering collector import. Each `.github`
Change remains isolated. Promotion and its queue/method are separately governed;
this PLAN neither starts a promotion nor prescribes a new branching model.

## 9. Migration inventory, conditions and rollback proposal

The readable ruleset baseline below was re-fetched, including inherited rulesets.
It is an inventory, not permission to change it. Refresh immediately before any
future migration and obtain administration-visible effective/classic protections:
the main classic-protection endpoint still returns **403**, not evidence of absence.

| Current ruleset | Mandatory checks, all source integration 15368 |
| --- | --- |
| main 24951062, active, default branch, strict/up-to-date, enforce on creation | Change Isolation; Branching; Promotion Source; Hosting Linux/Windows/macOS; Workspaces; Acceptance (Linux); Engineering; CodeQL actions/javascript-typescript: 11 |
| lineage 24952357, active, refs/heads/kaal/*, strict/up-to-date, creation exception | Same named baseline plus Guard Linux/Windows/macOS: 14; this existing ruleset similarity does not define either assurance policy |

Both have no configured bypass actors; require one approving review, stale-review
dismissal and resolved threads, and separately enforce CodeQL high-or-higher
security findings/errors. Main also forbids deletion; both forbid force pushes.
The actual repository Owner-review obligation is not established by a generic
approval count alone. Preserve that independent validation and current merge-method
judgments. The proposed full policies also cover other-host Acceptance, Dependency
Review and Guard's applicable boundary, which the current generic lists omit.

A later migration proposal must name the actual publisher App/installation IDs,
prove source selection and correct tested-SHA attribution, complete every live
Case, resolve the enforcement fence, and export exact current/effective rules,
creation behavior, review and code-scanning settings. No old check is removed on
the strength of an observed GREEN alone. Current GitHub ruleset/source-picker
behavior must be verified in the authorized probe, not assumed from descriptions.

Proposed migration order, only after explicit authorization: add each correct
stable context with its actual trusted source **alongside** all old requirements;
prove actual blocking in the relevant scope; only then remove the individually
enumerated redundant contexts under the accepted fence. Keep Branching/Change
Isolation obligations within the full policy and independent review/code-scanning
controls. No interval may have neither old nor new requirements.

Rollback must be pre-approved with a concrete before/after artifact. On a false
GREEN, missing coverage, stale-source/race finding or publisher outage, stop the
trial/migration. Restore the complete individual check obligations and independent
controls while the aggregate is still required; include accepted stronger host,
Dependency Review and Guard-specific coverage rather than restoring a weaker old
subset. Only then remove the broken aggregate under that decision and verify
effective blocking on current open heads. A publisher kill switch does not revoke
already published GREEN by itself. Reconcile/revoke App checks where possible,
investigate affected integrations and obtain fresh full evidence; no automatic
revert, publication, bypass or blanket disabling of requirements.

## References and evidence boundaries

Repository evidence: [approved #790](https://github.com/Kai-Hacks-AI/KAAL/pull/790),
[PLAN #776](https://github.com/Kai-Hacks-AI/KAAL/pull/776),
[#773 replay](https://github.com/Kai-Hacks-AI/KAAL/blob/72fa700be1af7d6de75ab893c396fdc64168c959/engineering/impact-ci/evidence/README.md),
[#792 live observation](https://github.com/Kai-Hacks-AI/KAAL/pull/792#issuecomment-6558569755),
[main ruleset](https://github.com/Kai-Hacks-AI/KAAL/rules/24951062),
[lineage ruleset](https://github.com/Kai-Hacks-AI/KAAL/rules/24952357).

Primary GitHub documentation checked 2026-11-01. These describe platform APIs;
they do not demonstrate this repository's live configuration or race closure.

- D1: [Check runs: creation, update, permissions and status fields](https://docs.github.com/en/rest/checks/runs).
- D2: [Required-check troubleshooting, commit attribution and source binding](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).
- D3: [Webhook validation/delivery practices](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks).
- D4: [Failed deliveries and redelivery](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries).
- D5: [Workflow events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) and [webhook payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads).
- D6: [Workflow run APIs](https://docs.github.com/en/rest/actions/workflow-runs).
- D7: [Workflow job and attempt APIs](https://docs.github.com/en/rest/actions/workflow-jobs).
- D8: [OIDC claims](https://docs.github.com/en/actions/reference/security/oidc).
- D9: [OIDC with reusable workflows](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-with-reusable-workflows).
- D10: [Merge queue constraints and events](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue).
- D11: [Pull request/merge API](https://docs.github.com/en/rest/pulls/pulls).
