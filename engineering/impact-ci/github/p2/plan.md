# P2 PLAN: durable producer authority before shadow publication

Owner continuation, 2026-11-01. Collector: `kaal/ci-gates`. Continues #800 after
independently approved #803. This Change contains a PLAN and read-only provider
observations, not an implementation or activation. Approval of this document
permits only the separately scoped source TDD/DO described below. App registration,
installation, credentials, deployment, workflow instrumentation, live experiments,
promotion and ruleset changes each retain their existing decision boundaries.

## Confirmed P1 integration

#803 landed by squash at `ed0de65b688053dfc62617f216da214761ac0fcd`, tree
`42d97430d339448e6e669becb16cba126289a87f`. ChBrain's independent approval is
[review 5729755035](https://github.com/Kai-Hacks-AI/KAAL/pull/803#pullrequestreview-5729755035).
All 11 jobs of [CI 41336427897](https://github.com/Kai-Hacks-AI/KAAL/actions/runs/41336427897)
completed successfully; Engineering reported 501 passed, none skipped. CodeQL,
Dependency Review, Change Isolation and Promotion Source passed. The later
[Branching run](https://github.com/Kai-Hacks-AI/KAAL/actions/runs/41339305929)
passed after squash auto-merge was enabled. The earlier failed Branching run is
retained in `provider-observation.json`; it is not erased or combined into a
synthetic aggregate certificate.

This verifies P1's integration and existing check outcomes. It does not establish
live #790 full-generation assurance. #803 is closed, so current PR acquisition
cannot treat it as an open applicable PR. The historical pre-merge tested object,
executed sources and complete generation were not independently reconstructed
here. No live S1–S11 Case is counted as passed.

Main is `9a9e89699aed7969281dcd1017882fd0bc4e3edc` after #804. Before a future
promotion, the collector needs a governed SYNC and renewed verification against
the then-current main. No other workstream is synchronized or accumulated here.

## Smallest useful next increment

Deliver an **unwired durable execution-fact ingress and source-proof contract**,
first scoped to the existing candidate-free Branching producer. Then propose one
separately approved workflow-only instrumentation Change and a read-only live
pilot. This makes one real execution attributable and recoverable before granting
any publisher Checks-write credential. It does not authorize partial GREEN.

P1 is intentionally unwired. Its fixture-based interfaces expose three practical
integration gaps that must be resolved rather than hidden by installing an App:

| Observed interface/source gap | Required next decision and behavior |
| --- | --- |
| `auth.mjs` requires reusable `job_workflow_ref`/`job_workflow_sha`; current required jobs are ordinary jobs without `id-token: write` | Propose a tightly scoped native-policy-producer authentication profile, or prove an alternative preserving the actual required job identity. No missing claims are fabricated. |
| `acquire.mjs` authenticates a token on every reconciliation; `auth.mjs` rejects consumed JTI and current expiry | Authenticate once at ingress while valid, persist a sealed execution fact, then revalidate its provenance/current binding on later reconciliation. Job completion cannot be assumed to provide fresh tokens indefinitely. |
| The audience is the complete context digest, including producer populations that can register at different times | Define trusted provisional registrations and immutable generation sealing. A candidate cannot choose registrations, population or authority. Any population/context change invalidates the old certificate even before the replacement is complete. |

These are production-readiness concerns in the accepted P1 seam, not false-GREEN
incidents demonstrated against GitHub. The existing code still refuses missing
proof. This PLAN does not silently relax its contracts.

An extra receipt-only job is not a drop-in fix: P1 joins the attestor check to
the same producer's jobs, while #790 rejects unexpected jobs. A separate reusable
workflow's token cannot impersonate the original required job. Moving required
jobs into reusable workflows can also affect provider check identities; preserve
and independently verify the exact existing names before any such proposal.

## Proposed source trust profile

Recommend `trusted-native-policy-producer/v1` **only** for workflow 384461082,
`.github/workflows/lineage-synchronization.yml`, job `lineage-synchronization`,
check `Branching`, event `pull_request_target`. It already treats candidate commits
as Git data and executes trusted default-branch code. This is a proposal, not a
profile enabled in P1. P1's reusable profile and all its rejection cases remain.

The future trusted loader selects this profile by an independently approved
workflow ID/path/source pin. A JWT, PR input or candidate workflow cannot select
it. Authenticate issuer/key/algorithm, nonce audience, validity, repository ID,
workflow ref/SHA, run/attempt, event/ref/target and the **original job's**
`check_run_id`. Native jobs must not invent reusable-workflow claims. Native
acceptance must additionally prove the exact pinned workflow/receipt driver and
its candidate-free execution boundary. Unsupported sources remain unresolved.

The driver must run the existing Guard/Branching helper, not implement a second
Branching judge. Capture actual loaded checker/command/dependency bytes and Git
facts used, including moving refs fetched inside `engineering/github/branching.sh`.
Startup HEAD or `workflow_sha` alone cannot prove those facts. Candidate Git data
must never be checked out, installed, executed or allowed to control environment,
caches, hooks or receipt inputs. If loaded-byte/ref attribution is undecidable,
emit unresolved and retain the finding. A failing checker still fails its job;
receipt delivery must not rewrite the original verdict.

Granting OIDC access to candidate-executing CI jobs is outside this pilot. Their
eventual proof/isolation architecture requires its own accepted design. Success
for Branching establishes **one producer**, not Hosting, Acceptance, Guard,
Engineering, Workspaces, Dependency Review or CodeQL assurance.

## Durable receipt and generation contract

The ingress obtains a short-lived server-issued nonce for an independently read
subject/producer registration. A signed JWT authenticates identity; an isolated
driver's independently verified source/Git proof supplies execution facts. Neither
alone suffices. The audience binds the server registration, not a caller-supplied
verdict or a guessed future full-population digest.

Atomically consume nonce/JTI and persist verification time, issuer key ID,
repository/source repository, PR/event/target, head/base/tested commit/tree,
workflow/source/checker/command/dependency pins, run/attempt, job/check/suite IDs,
proof digest and registration reference. Seal the canonical fact with a trusted
service key. No raw JWT in logs/check summaries. Access, retention, key rotation,
revocation and crash recovery require explicit operational review; an in-memory
map or successful mock transaction proves no production durability.

On restart, verify the seal and ingress provenance, then requery provider facts
and the current subject/registration before binding to a complete generation.
Token expiry after accepted ingress is not a new authentication event and does
not authorize different execution. A repeated JWT may acknowledge the already
accepted fact idempotently; it cannot create another fact or acquire new authority.
Expired-on-arrival JWTs remain refused. Tampered/unsealed facts, unknown keys,
wrong registrations and incompatible reruns remain unresolved.

TDD must define provisional registration → immutable generation sealing, including
late producers. No implicit carry-forward across changed head, target, policy,
workflow/checker source or run attempt. Any permitted association of an unchanged
fact with a sealed population needs explicit, tested provenance rules; ambiguity
blocks. No required execution is skipped or borrowed from an incompatible earlier
attempt. Existing execution-deduplication activation is outside this workstream.

The durable fact authenticates evidence. #790 still establishes the independent
expected full matrix and makes the sole completeness verdict. No new successful
job counter, completeness evaluator or shared policy authority is introduced.

## Setup proposal and external prerequisites

`setup-proposal.json` pins the accepted P1 source and the independent Main/Lineage
policies. It proposes a selected-repository, read-only acquisition App initially:
Metadata, Contents, Actions, Checks and Pull requests **read**. No Checks-write,
merge, review, workflow, status or administration write. First pilot uses bounded
explicit reconciliation; webhooks are disabled in this proposal. An ingress
endpoint is still needed for receipts. App keys stay outside candidate runners.

The JSON is **not** a registrable manifest/deployable configuration: App and
installation IDs, TLS receipt origin, deployment artifact, credential broker,
storage backend/failure model, sealing key and final driver SHA are unresolved.
No arbitrary endpoint, secret, service or App identity is assumed. P2 DO must
provide the concrete storage/driver realization and failure evidence before
asking Owner to approve installation. Host mechanics use Hosting interfaces;
an unavailable durable-storage capability is a dependency to resolve, not a
reason to call filesystem replacement a distributed transaction.

A later publisher permission proposal upgrades Checks to write and isolates the
writer credential from ingress/acquisition. It must name the real App ID and
deployment source, and still publishes neither gate successfully without the
entire corresponding independent full policy. App registration/installation,
permission upgrade and activation are separately recorded Owner actions.

## Focused delivery sequence

| Change | Concrete exit; separately required alignment |
| --- | --- |
| This P2 PLAN | Owner reviews native-profile recommendation, durable-fact semantics and bounded pilot. Three documentation/data paths only. |
| P2 TDD/DO | Unwired ingress/proof interfaces, versioned authentication profile, immutable registration/sealing, restart/replay failure behavior and recorded RED/GREEN/mutations. Preserve all 273 P1/offline cases; no workflow/deployment changes. Concrete storage/driver proposal and remaining unknowns are reviewable. |
| Focused source promotion | Independently accepted source only; SYNC with current main by merge commit, trusted Branching/Change Isolation/freshness, complete new-head CI and Owner review. Promote by squash. No claim of active checks. |
| P3 instrumentation proposal | `.github`-only Change for the accepted native Branching driver, original check name/outcome preserved; OIDC permission only on this trusted job. Owner aligns exact workflow/source pins and delivery to its actual execution branch. Engineering policy anchors change in a separate reviewed source Change; none are bypassed. |
| Read-only live pilot | Separate Owner approval for the exact App/receiver/store/keys and disposable PR scope. Capture one genuine producer receipt and provider joins; no check writes. No existing gate weakened. |
| Full shadow/publication | Resolve remaining producers' source proofs, all full-policy profiles/hosts/Guard boundary, real publisher identity and #800 S1–S11. Separate authorization for Checks-write/non-required publication. No migration. |

Source promotion is useful before installation: main can hold the accepted
immutable implementation that trusted workflow instrumentation will pin. It
does not waive source/host verification or imply that main now has stable checks.
C11/#769 selection is not required. No broad Engineering or other collector work.

## Planned TDD and live Cases

| Loop / Case | Discriminating evidence required |
| --- | --- |
| Architecture A1–A3 | Permitted injected host/storage ports; prohibited candidate-code/credential access located; undecidable moving-ref/loaded-byte proof surfaced for judgment. Sole #790 completeness path retained. |
| Acceptance R1 | Native trusted Branching execution joins its actual provider job/check and preserves its real verdict; no reusable claims fabricated. |
| Acceptance R2 | Accepted ingress survives restart and reconciliation after token expiry; corrupted seal, revoked key and expired-on-arrival token do not. |
| Acceptance R3 | Replay acknowledges only the same immutable fact; altered PR/target/head/run/attempt/App/job/source or audience cannot reuse it. |
| Acceptance R4 | Late/missing/competing producers never authorize a complete certificate. A changed population invalidates earlier assurance before replacement sealing. |
| Implementation I1 | Atomic nonce/JTI plus fact commit; crashes before/after each write, duplicate ingress and simultaneous consumers. Record real storage failure tests separately from fakes. |
| Implementation I2 | Driver source/ref drift, trusted-native profile applied to candidate-running job, same-App forged check, wrong issuer/key/algorithm and checker failure. Each designated mutant must fail a behavioral assertion. |
| Live L1 | Separately aligned disposable ordinary Lineage PR: fresh real Branching receipt, actual issuer claims, provider/check joins and captured source/Git proof. Observer credential read-only. No experiment merges. |
| Live L2 | Same-head rerun/new attempt, receipt redelivery/expiry/restart and a source-binding negative challenge in an isolated approved scope; retain both original and replacement evidence. |
| Live L3 | Main/Guard contexts and all three hosts remain unproved by this one-producer pilot; complete #800 campaign before full-shadow acceptance. |

Any required workflow check rename, missing proof/claim, unsafe candidate access,
ambiguous registration, receipt/store failure or unexplained provider mismatch
stops the pilot. Missing setup marks a Case blocked, not passed. Preserve existing
CodeQL finding enforcement and independent Owner review throughout.

## Limitations and Owner decisions

No observer design makes asynchronous registration, same-SHA reuse or GitHub
check publication atomic with merge. P1's unknown-write outbox stays blocked;
this receipt work provides no automatic clear/retry of uncertain success writes.
A future acknowledgement can be lost after GitHub applied GREEN; compensation
can arrive after a merge. A deadline does not expire a remote check by itself.
These remain explicit full-shadow/migration limitations, even if the pilot passes.

Owner review now concerns the native Branching-only source approach and durable
receipt/generation contracts. Infrastructure, App installation, P3 workflow
changes and live experiment/activation are later concrete decisions. A P2 PLAN
approval is not any of those approvals. Existing mandatory checks remain the
integration authority. No ruleset or branch protection changes are proposed.

Primary platform references, checked 2026-11-01; these specify APIs, not live proof:
[OIDC claims and permission](https://docs.github.com/en/actions/reference/security/oidc),
[reusable workflow identity](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-with-reusable-workflows),
[App manifest registration](https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest).
