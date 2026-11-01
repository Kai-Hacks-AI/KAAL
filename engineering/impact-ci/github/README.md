# P1: unwired trusted publication

Implements the source-only P1 increment of [PLAN #800](https://github.com/Kai-Hacks-AI/KAAL/pull/800),
on `kaal/ci-gates` at `fd0a612f15631a65a3e67d55671cbedcdd8a286b`
(tree `5cd0a1bc1ae79bf32515981d7f2e1d1a8a6214f0`). There is no server, installed
publisher, live App, credentials, workflow or protection change. Tests use fake
provider responses and fixture signing keys. No live #800 Case is passed by P1.

## Public boundaries

`createAuthenticator` verifies raw-body HMAC-SHA256 webhooks and narrow RS256
OIDC receipts using injected WebCrypto keys. It pins repository/installation,
issuer, context-specific audience, immutable reusable-attestor identity, time
window, caller workflow/ref/revision, run/attempt and check-run identity. Alternate
algorithms and token-supplied key URLs are refused. Authenticated facts are opaque
capabilities; copied JSON cannot manufacture one. Raw JWTs are not retained in
captures or summaries. WebCrypto performs signature operations only; KAAL record
and source digests use Foundation. Fixture keys are not a GitHub issuer trust root.

`createAcquirer(...).acquire(context,snapshot,startedAt)` independently reads the
repository and PR/main ref, scans all run pages at relevant SHAs, retains competing
runs, reads exact-attempt jobs and their check-run URLs, verifies App/suite/name/
SHA/outcome joins, verifies exact workflow bytes and joins signed attestor identity
to an actual job of that producer. It requires isolated execution-source proof.
Final population/subject/context re-reads detect changes. Captures retain raw
run/job/check/page facts, proof records and receipt references without raw JWTs.
Unavailable proof is unresolved, never filled from fixture constants.

The adapter authenticates facts; it does not count successful obligations or
decide completeness. `judgeFullMatrix` remains the only completeness evaluator.
The two approved policies still own their independent full inventories. No impact
selector, C11 exclusion or second policy is introduced.

`createController(...).reconcile(context,snapshot)` registers the current
certificate, resets the existing check to non-success and confirms reset before
acquisition, calls #790, then publishes and reads back the result. It refreshes
the clock after acquisition and checks context/time again after writing. Only
the evaluator's current `passed` verdict can produce success; it accepts no caller
verdict or required-job inventory. Establishment errors/unsupported retargets
attempt to revoke prior assurance for the authenticated subject. Changed SHA
retires the old check before preparing its replacement.

| Meaning | Check write | Consumer state |
| --- | --- | --- |
| Authentic work unfinished | `in_progress`, `conclusion: null` | pending |
| Current complete assurance passed | `completed`, `success` | green after read-back |
| Required assertion failed or generation expired | `completed`, `failure` | red |
| Missing/ambiguous/unauthenticated/stale evidence | `completed`, `failure`; `UNRESOLVED` summary | unresolved |
| Write/acknowledgement/read-back uncertain | Durable outstanding operation; no automatic retry | unresolved, enforcement gap |

Main PR/push and ordinary/Guard Lineage retain their independent gate, policy,
version and controls. A dedicated positive publisher App ID is required; Actions
App 15368 is refused. Read-back verifies ID, App, SHA, name, external ledger
reference, status and conclusion. The returned capture/audit and evidence digest
support independent replay; the check summary binds that digest, and the journal
records the read-back acknowledgement. P2 must provide a durable capture archive
with retention/access controls; P1 does not silently persist raw provider data.
`external_id` is no provider uniqueness lock
or extra merge predicate. No neutral/skipped/stale conclusion is emitted.

## Trusted ports still requiring realization

Ports belong to trusted composition outside candidate execution. Supplying
arbitrary JavaScript objects to a factory establishes no authenticity/isolation.
The context/snapshot are trusted inputs, not an HTTP request schema. Signed
webhooks are wake-ups, not authorized contexts or expected matrices.

| Port | Required contract; remaining deployment dependency |
| --- | --- |
| Policy/context loader; `readCurrent(context)` | Load immutable approved policy/evaluator bytes. Derive repository/source-repository, PR/event/target, revisions/tree, producer registration, monotonic generation and deadline independently. Main push additionally needs `pushIdentity`, a digest of authenticated push facts, not an unsigned delivery header. Reuse `authorityFromGit`/`readTargetSnapshot` from `../git-input.mjs` through Hosting for Git object/parent/tree/target-source facts. No live loader is installed. |
| Read-only `transport.request` | Authenticated installation reads, fixed repository/API origin, no redirects/credential forwarding. Return `{status,origin,body}`. Adapter-generated paths reject foreign child URLs; the transport must enforce actual TLS/origin, not merely return an origin string. |
| `proofReader.read({context,producer,workflow,claims})` | Isolated driver/Git proof of repository/source-repository, context digest, run/attempt, actual workflow/checker/tested revisions and tested tree. Prove executed commands/dependencies/checker bytes and retain proof references. Neither signed OIDC identity nor candidate assertions prove checkout/execution. P1 has no production proof reader; current moving fetch/checkout needs separately accepted capture/pins. |
| `receiptStore.get(runId,attempt)` | Fresh short-lived receipt from the approved isolated attestor, joined to provider jobs. Requires actual GitHub issuer metadata/keys, exact workflow pins and approved audience issuance. Candidate artifacts/logs/caches are not receipts. A consumed JTI is refused; fixtures mint fresh tokens per acquisition. Reuse/caching requires a reviewed context-bound authentication design. |
| `replay.claim(id)` | Atomic durable one-use claim. Authenticated-body fingerprints prevent changed-header webhook replay; JWT JTIs prevent token reuse. A future ingress must acknowledge authenticated duplicates idempotently, journal deliveries and reconcile periodically; no ingress/scheduler is installed. |
| `store.transaction('kaal-gates/v1',callback)` | Durable serializable transaction; synchronous callback, commit before resolution. Initial record: `{epoch:0,subjects:{},slots:{},operation:null}`. Crash/rollback must preserve atomicity. The in-memory fake is not production durability. |
| Writer `transport.request` | Separate dedicated App Checks-write credential, fixed check-run POST/PATCH/GET paths. No merge/review/ruleset capability. App installation, deployment/source pins and secret management require P2 Owner action. Separate writer from read-only collector. |
| `clock.now()` | Trusted fresh integer milliseconds with regression monitoring. Code deadlines do not automatically expire remote success. |

## Versioned evidence extension

Legacy contexts without `evidenceSchema` retain #790 v1 behavior and all original
tests/policies. Acquisition requires `evidenceSchema: 'kaal.full-evidence/v2'`,
`headRepositoryId`, and `pushIdentity` for main pushes. Each non-null producer
pins run/attempt, `workflowSha`, `governanceSha`, `testedSha`, `testedTreeSha`, `providerRunSha`,
`providerCheckSha`, `attestorCheckRunId` and `ref`.

V2 separates workflow-definition and executed-checker revisions. PR-target policy
producers still test the head and independently prove that head's tree; other
producers test the aggregate tested commit/tree. A head tree cannot be replaced
by the PR merge tree.
These revisions need independent proof, not inferred equality. Runs carry explicit
`terminalObservedAt`, sampled after the terminal API read: an observation upper
bound, not an exact provider completion timestamp. Real job start/completion times
remain unchanged. Success cannot precede any required completion or terminal
observation. `updated_at` is never substituted; v2 cannot downgrade to v1 evidence.

## Generations, outbox and acknowledged races

Slots use repository + publication SHA + gate. Subject history binds the repository
and PR/event with context/policy/matrix/evaluator digests and monotonic generations.
Different subjects sharing a slot remain unresolved; there is no unreviewed
conjunction rule. Retired slots are conservatively retained. Distinct competing
workflow runs remain unresolved; exact attempts must match current provider facts.
There is no automatic old-run disposition or union of partial rerun successes.

The journal uses a repository-wide epoch and one outstanding operation, stronger
serialization than a slot lock. Throughput/pruning are P2 concerns. Writes commit
an outbox record before network I/O. Concurrent callbacks fence local completion;
acknowledged stale writes trigger failure compensation. Unknown writes persist
across restart and block further writes. P1 supplies no automatic clear/retry that
could race a still-live request. Production recovery needs independent remote
reconciliation and proof that an older request cannot later land.

These controls provide no GitHub merge fence. Registration is asynchronous;
unseen reruns/contexts can reuse earlier GREEN. GitHub enforces neither the full
tuple nor the local epoch and offers no check+merge transaction. A write can
complete after context/deadline changed, with compensation after a merge. Applied
but unacknowledged success can remain remotely GREEN while local state is
unresolved. The tests retain this counterexample. `enforcementGap: true` is
reported even for a scoped GREEN.

The fake provider implements resetting completed checks with null conclusions.
Actual GitHub reset/coalescing/required-source/tested-commit semantics, OIDC claim
availability, same-SHA reuse and merge blocking require live experiments. No pure
test establishes those platform guarantees. Existing mandatory checks and review
remain authoritative throughout future shadow verification.

## Verification and review

```sh
node --test engineering/impact-ci/github/architecture.test.mjs
node --test engineering/impact-ci/github/acceptance.test.mjs
node --test engineering/impact-ci/github/{auth,acquire,controller}.test.mjs
node engineering/impact-ci/github/mutations.mjs
npx --no kaal-guard run --check Engineering --github
```

Root `github.test.mjs` registers the loops in existing Engineering discovery;
no package/workflow routing changes. Acceptance uses public factories on this
Linux checkout with fake provider ports, not an installed/published capability.
It covers four profiles, all three host obligations, Guard's boundary and all
66 required instances unfinished individually. It does not execute CI on macOS/
Windows. All live S1–S11 remain unknown.

Architecture inspection covers the three production modules' imports and
undecidable host lookup. Judgment: independent policies own membership, and #790
owns completeness; the adapter authenticates and the controller publishes. Port
implementations, credentials, distributed storage and isolation require live
validation. No inspection claim extends beyond its declared coverage.

`verification.json` records actual RED/GREEN and mutations. Initial controller
seam: two behavior assertion failures and one passing forgery rejection. Auth/
acquisition scaffolding preceded tests; not all P1 was strict test-first. Later
source-drift/unsupported-retarget invalidation and observation-time cases were
added RED before fixes, as was independent PR-target head-tree attribution.
Mutation discrimination requires an assertion failure;
syntax/load failures do not count. Existing assertions remain unchanged.

Independent Owner review concerns source-only P1. P2 proposes exact App/keys,
source/deployment pins, proof realization, storage and recovery. P3 receipts need
a `.github`-only Change. P4 activation/experiments need separate alignment. P5
migration/rollback remains blocked on accepted live provenance and enforcement
findings. Preserve CodeQL finding enforcement, Change Isolation/Branching and
Owner review. C11/#769 selection is not a dependency of this full-matrix source
increment. No synchronization or promotion is requested.
