# P2 unwired DO: durable producer facts

Implements the source increment approved in [#807](https://github.com/Kai-Hacks-AI/KAAL/pull/807),
[review 5729815295](https://github.com/Kai-Hacks-AI/KAAL/pull/807#pullrequestreview-5729815295).
The PLAN merged by squash at `84fccd9873f21dc4c02ff7a3e2021814c57e6968`,
tree `4173d5a265c14d23304c55ed7db8e961395bb6be`. P1/#803 is retained. This
increment installs/activates nothing and exposes no HTTP listener or publisher.

## What the source now provides

| Interface | Contract and evidence |
| --- | --- |
| `createAuthenticator(...).nativeReceipt` | Optional, independently pinned native Branching profile. Shares P1 RS256/issuer/time/key verification; native jobs do not invent reusable-workflow claims. Audience binds server nonce and Foundation proof digest. Repository/workflow/ref/run/attempt/original check identity are checked. Default profile remains disabled. |
| `createNativeProvider` | Read-only PR/repository and exact original Branching job/check attribution, including suite, App, host and SHA. Reuses P1 fixed-origin reader and #790 complete-page contract. All matching native runs remain visible; ambiguity on later pages blocks. Independent context/Git and assignment loaders are still trusted ports. |
| `createProducerService` | Provisional registrations, stable cohort/nonce before complete population, atomic nonce/JTI/fact commit, immutable population seal and persisted retirement records. A population seal is not an assurance pass. Any later completeness judgment still belongs to #790. |
| `createFactSealer` | Ed25519 signature over a domain-separated Foundation fact digest. Read-only verification works without a signing key. Unknown/corrupt/revoked seals and explicitly revoked issuer IDs cannot mint a verified fact capability. Keys are injected; no generation/loading/secrets in production modules. |
| `createGitSourceVerifier` | Reads actual committed workflow, driver, checker and dependency-source pins and actual tested Git tree through existing Hosting/Git input. Compares declared before/after source captures and complete job/subject bindings. Actual runtime capture remains conditional on the separately accepted producer described below. |
| `createSqliteStore` | Private Engineering schema using Node's installed SQLite driver through Hosting `execute`. Serializable compare-and-swap retries, persistent state, rollback journal and verified `synchronous=EXTRA`. Real child processes are killed around commit boundaries; nonce/JTI/fact remains entirely old or entirely new. |

`readCommitObject` and `readCommittedFile` extend the existing Git adapter, sharing
its raw commit-header parser rather than inventing another tree/parent judge.
P1 acquisition exposes its existing reader for reuse. No full-matrix policy,
job inventory, selection/completeness algorithm or required check changes.
P1's reusable authentication API and all 273 existing cases are retained.

## Evidence and authority flow

1. Trusted context/source loaders supply current repository, PR, target, revisions,
   expected workflow bytes and approved evaluator/native source pins. The service
   obtains policy membership from #790, never a candidate job list.
2. `open` registers a provisional cohort. `register` reads a producer independently;
   late registrations do not change earlier nonce audiences. A changed member
   retires the entire old cohort and records invalidation; it never unions attempts.
3. `challenge` issues a scoped, expiring nonce for the original native Branching
   job only. Production nonces must use a trusted CSPRNG. Regex shape validation
   does not establish entropy; fixture counters are explicitly synthetic.
4. The future approved driver captures execution proof and requests OIDC for
   `audience/native/<nonce>/<proofDigest>`. `ingest` authenticates the signed
   identity and independently validates source proof before signing the fact.
5. Nonce, JTI and sealed fact commit in one storage transaction. Repetition of
   the exact accepted token/proof acknowledges that fact idempotently, even after
   token expiry. That ACK carries no authority capability. Changed replay fails.
6. `read` verifies current seal/issuer policy, cohort/subject/producer/source and
   time, then mints an opaque immutable execution-fact handle. JSON cloning cannot
   forge one. It rechecks after asynchronous source work. Consumers must re-read
   at finalization; the handle is no indefinite merge authorization.
7. `seal` requires a completely registered immutable producer population and
   rechecks after source reads. It returns #790's authority plus
   `assurance: not-evaluated`. The demonstrated missing-execution case still
   receives #790 **pending**, never GREEN. This pilot cannot authenticate the
   other producers and cannot publish either aggregate.

Observed changes retire facts permanently within the retained registry, including
a retarget followed by a return to the old target. Source/evaluator versions and
each policy's own digest remain bound. Registration retirement is a durable
invalidation intent, **not** acknowledgement that GitHub revoked any check.

## Concrete storage candidate and limits

Propose one protected, local-disk SQLite database on a single trusted host, Node
24 with `node:sqlite`, journal mode DELETE, synchronous EXTRA, busy timeout 5s.
The SQL schema/transaction meaning is Engineering-owned; Hosting launches the
installed runtime and SQLite supplies file/locking mechanics. No new generic
Hosting package or filesystem transaction is claimed. SQL values are parameterized.
Only public proof metadata, signatures and token digests cross child arguments;
raw JWTs and keys do not enter those arguments or the database.

The private adapter bounds serialized requests at 24,000 characters and contention
at 24 compare-and-swap attempts. Capacity, malformed state, unavailable database,
unknown acknowledgement or unsupported runtime fail closed. Nothing truncates,
prunes accepted evidence or falls back to memory. Transaction callbacks must be
synchronous, side-effect free and safe to rerun after a compare-and-swap conflict.
This is deliberately a bounded pilot backend; larger archives need a separately
reviewed transport/backend rather than raising limits blindly.

Tests establish behavior under actual process termination and fresh database
connections on this Linux host. They establish neither power-loss durability,
filesystem/controller flush guarantees, multi-host/network-filesystem locking,
anti-rollback after operator restore, nor macOS/Windows operation. Production
storage/ACL/backup/restore/key management remains an Owner setup decision. The
trusted registry must be protected from candidate access; fact signatures do not
turn an arbitrary restored registry snapshot into current generation authority.

Lost **local fact** commit acknowledgement can be reconciled by the same consumed
nonce and signed fact after restart. This does not clear or retry P1's uncertain
**GitHub publication** outbox. GitHub offers no equivalent transaction here;
all its unknown-write restrictions remain.

## Concrete P3 driver proposal, still blocked

Retain `.github/workflows/lineage-synchronization.yml` and its exact Branching
job/check identity. A separately reviewed pinned capture driver must run the
existing Guard/Branching helper with independently supplied facts, retaining its
exit status. It must not execute/install/check out candidate code or expose an
App key. Give OIDC permission only to this trusted job in the separate workflow
Change; current workflows are untouched.

The driver must capture actual loaded helper/driver/dependency/runtime bytes,
the command and environment scope, and all immutable Git refs actually used,
including refs fetched inside `branching.sh`. A Node loaded-module trace and
independently verified installed-source/runtime manifest are a concrete proposed
mechanism, **not implemented or accepted runtime instrumentation**. Before/after
file hashes and `package-lock.json` alone do not establish a complete loaded-byte
closure. Any gap/drift must yield unresolved; never replace it with a boolean.

The Git verifier proves the committed/tree portion and checks the declared
capture against trusted pins. Authentic execution of that capture depends on
the native source profile's independently reviewed, candidate-free producer.
Current required workflows emit no such receipt. No fixture proves isolation,
actual issuer claim availability or original check-name preservation on GitHub.
These are explicit P3/live blockers, not silently completed by this DO.

Before installation, Owner still needs exact App/installation identity, TLS
receipt endpoint, deployment/source artifacts, complete driver/runtime manifest,
credential broker, issuer/service keys, retention and storage failure model.
The read-only App proposal in the PLAN stays disabled; Checks-write, live pilot,
full shadow and migration remain separate decisions. A future P1-acquisition
bridge must consume verified facts with current complete generation binding;
this increment does not wire receipt facts into a production publisher.

## Verification and interpretation

```sh
node --test engineering/impact-ci/github/p2/architecture.test.mjs
node --test engineering/impact-ci/github/p2/acceptance.test.mjs
node --test engineering/impact-ci/github-p2.test.mjs
node engineering/impact-ci/github/p2/mutations.mjs
node engineering/impact-ci/github/mutations.mjs
npx --no kaal-guard run --check Engineering --github
```

The root wildcard discovers `github-p2.test.mjs` without any workflow/package
edit. The acceptance loop combines real local SQLite and Git with synthetic
provider/OIDC/runtime-capture inputs. It retains a failed job's original failure,
recovers a sealed fact after JWT expiry and emits no check write or passing gate.
It is repository acceptance, not fresh-installed product or live shadow assurance.

Architecture inspection covers direct module imports and undecidable host lookup.
Manual judgment: the static SQLite child program owns only the private SQL protocol;
no candidate string becomes executable code, and Hosting owns process mechanics.
Inspection cannot prove injected-port isolation or the future driver's runtime
capture. Those validation items remain explicit, rather than mechanical passes.

`do-verification.json` records actual runs, source digests, initial denial REDs,
later discriminating RED/GREEN fixes and mutations. Provider/source adapter
scaffolding preceded some tests; not all code is claimed strictly test-first.
No original assertion was weakened. Mutation success requires assertion failure,
not an import/syntax/startup error. All live L1–L3 and #800 S1–S11 remain unrun.

Owner review concerns this source-only increment. Existing mandatory checks,
independent Owner review, CodeQL finding enforcement and P1's stale-GREEN,
same-SHA and asynchronous publication limitations remain authoritative. No
selective CI, activation, main promotion, synchronization or npm publication.

Primary backend references: [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html),
[SQLite synchronous modes](https://www.sqlite.org/pragma.html#pragma_synchronous),
[Node SQLite](https://nodejs.org/api/sqlite.html). Platform descriptions are not
evidence that this host satisfies every storage assumption.
