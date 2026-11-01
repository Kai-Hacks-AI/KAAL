# PLAN addendum: timing observation contracts and executable acceptance boundary

## Status and scope

This proposes the contract-and-test addendum requested after [#773](https://github.com/Kai-Hacks-AI/KAAL/pull/773) merged. The accepted [parent PLAN](plan.md), R1–R8 and E01–E18 remain unchanged. This Change adds proposed schemas, executable outer tests, synthetic fixtures, a source-inspection summary and an acceptance-boundary declaration. It adds no adapter, recorder, CLI, history service, scheduled scan, workflow, npm-script change, dependency change, synchronization, promotion or publication.

Engineering's implementation target for this proposal is `kaal/engineering@3c5905a4a81445bf3bb41d3c3017d563f74a558b`. The parent PLAN's pinned source inspection remains historical evidence. No newly captured CI timing is claimed here.

**Concern ownership stays separate.** Engineering may propose the consumer contract; it cannot approve Guard's producer extension, a Case owner's subject matrix, or a retention policy for another owner. Approval of this addendum freezes its Engineering acceptance boundary. It does not establish those owner approvals, authenticate service inputs, admit the Testing dependency or authorize DO. The parent PLAN's missing prerequisites remain gates for implementation and live adoption.

## 1. Proposed interfaces and trust boundary

The future subject is `engineering/timing/analyze.mjs`, exporting:

```js
analyze(observations, authority, testing) // synchronous or Promise of a structured analysis
observe(original, { analyze, publish }) // Promise of an observational report
```

`testing` supplies only the public `profile`, `skew`, `candidates`, `refactored` interfaces. The owner-approved caller supplies these ports from the accepted Testing package. Engineering's analyzer delegates timing/window/verdict calculations; it implements only identity/provenance qualification, input projection, result association and reporting. The pure analysis subject imports no external module or host builtin. The observational wrapper invokes caller-supplied callbacks and performs no host operation itself. Real acquisition/publication belongs to separately implemented Hosting/service adapters.

`observations` contains `{ records, preservation }`. A record is `{ ref, digest, body }`; `ref` is an opaque source locator, not authority. Its decoded body remains visible in the output even when it cannot support timing. Source claims such as `verified: true` have no authority.

`authority` is a separate, trusted-caller input. It is never loaded from a candidate's record or accepted merely because a JSON property says "trusted". It contains the current report context, target-owned policy, independently enumerated runs/attempts, authoritative Case declarations and independently bound acquisition/evaluation metadata. Its fixtures model that boundary; they do not implement its trust establishment.

A live reader must independently establish the service identity, permissions, producer/workflow revision and tested checkout relationship, verify the artifact/raw bytes through Foundation, bind the decoded payload to those bytes, and preserve that binding into analysis. The analyzer must receive the trusted reader's actual result, not a status copied from a source record. A matched digest string or `integrity` fixture enum alone proves none of this. If the caller cannot establish the boundary, evidence is unknown before analysis; no pure function in this proposal authenticates a caller or the service.

### Authority data contract

| Field | Required meaning |
| --- | --- |
| `current { run, attempt, candidate }` | Actual logical run/attempt and tested candidate, including synthetic checkout identity where applicable. |
| `policy` | Versioned target-owned repository/workflow/event/stream allowlist; approved producer schema/revision; ordered expected hosts, suite/cohort, allowed common configuration and per-host runner/architecture; Testing timing and redesign options. No selection policy. |
| `enumeration { first, pages }` | Complete independently acquired run listing for the approved history horizon. Each page has an identity, run ids and next cursor; the chain must terminate, contain no gaps/cycles/duplicate run ids, and reconcile with `runs`. |
| `runs[]` | Logical-run id, unique strictly ordered ordinal, latest applicable attempt, actual tested candidate and PR head/base relationships. Historical candidates may advance legitimately. |
| `definitions[]` | Injective owner-qualified `key`, original `id`, suite/file, current whole-file version, accountable owner and Case-owner targets. Identity mapping is declared, not extracted from bracket prose. |
| `bindings[ref]` | Independent repository/workflow/event/stream, run/attempt/job/host, actual candidate/head/base, artifact id/digest, producer, cohort, configuration and run-specific expected Cases/file versions. It also carries the trusted reader's integrity/expiry result. |
| `preservationBindings[ref]` | Case-owner evaluation producer and integrity result; exact Case/from/to/cohort; separate before/after target declarations; immutable subject identities. The source record cannot create its own binding. |

Configuration includes Node, instrumentation, concurrency, test-data and imported-fixture versions; per-host policy supplies the expected runner class and architecture. OS/runner differences that policy explicitly authorizes may vary; an arbitrary unknown or changed configuration must not be treated as comparable. Source record Node/host must agree with their independent binding.

The original CI verdict is a separately captured caller result, not an inference from timing. `observe` receives it directly; `analyze` does not decide or amend it. `authority.original` in fixtures is a test convenience, not a source-record verdict override.

## 2. Proposed C129 timing extension — Guard review required

Preserve C129's existing `{ candidate, host, node, suites, cases }` record and every original Case identity, realization owner, suite, file, outcome and reason. Propose top-level `schema: "guard-run-timing/1"` and `producer: { revision }`, with each measured Case carrying:

```js
timing: {
  ms, unit: "ms", scope: "case", event, occurrences: 1,
  fileVersion: { before, executed, after }
}
```

This is a proposed producer/consumer contract, not an Engineering replacement for Guard's recorder. The three file identities are Foundation SHA-256 strings; the accepted producer must establish their relation to the actual executed bytes, not populate them by copying a post-run checkout hash. `before`, `executed`, `after` must agree for a qualified sample. The independently bound run declaration must identify the same file version. For an unexecuted Case, retain its outcome and declared current version in the declaration/binding; do not call that version an observed execution or invent a timing event.

`event` names the specific terminal Case execution; the producer contract must establish its unique mapping to the authoritative Case. The analyzer requires one supported occurrence, a unique event, a complete declared Case population and `scope: "case"`. It must not add nested subtest times, use job/suite elapsed time, merge duplicate Cases or choose a retry. A real measured zero is valid input; absent/non-finite/negative timing is not zero. Final statistical readability remains Testing's concern.

Completed failed Cases may retain observed timing without changing their outcome. Skipped, todo, missing or merely not-applicable Cases do not acquire execution time from runner overhead. Legacy C129 records remain usable as original outcome evidence but do not support timing when these fields are absent. No historical duration is reconstructed from a CI job's elapsed time.

The source-inspection summary in `test/plan/fixtures/source-evidence.json` records #773's observations of run 41226277799. It is not a raw-history archive. All positive proposed-schema records in `fixtures.mjs` are explicitly synthetic: literal hashes and reader results describe fixtures, not real capture, integrity or provenance proofs.

## 3. History and qualification decisions

1. Reuse owner-held record artifacts. This proposal defines no new raw store. A later derived index holds references/digests and completeness information and must reconcile with independent service enumeration.
2. Follow established run ordinals and the policy's host order. Source download order is irrelevant. Duplicate identical references are visible and deduplicated; conflicting copies are unknown, never extra samples.
3. Select each logical run's latest applicable attempt once per host/context. An incomplete latest attempt never falls back to an older complete attempt. Different platforms, retry jobs and repeated analysis are not separate recurrences on one platform.
4. A complete two-run history can be analyzed, but cannot establish three recurrences. Report availability `pending` with Testing's raw result retained. A missing/expired run or incomplete page chain is `unknown`, not an artificially shortened window.
5. Preserve candidate provenance in history while candidates advance. Cross-platform skew requires the same tested candidate, Case set/versions, attempt and approved comparable configuration. Missing one required host prevents a skew call.
6. Resolve the current Case version from independent declarations even when that Case did not execute. A changed shared file resets every Case in it. Imported-fixture/configuration changes qualify a new approved cohort or remain unknown; do not invent a new Testing version algorithm.
7. Call `profile` only for a complete qualified current suite/host distribution, `skew` only for the complete qualified current host set, and `candidates` only for a reconciled qualified history. Do not silently omit an invalid Case or history slot. Unsupported channels remain unknown with named exclusions.
8. Use the exact normalized identity from declarations as Testing's `name` and the accepted file version as `sha256`. Retain original source identities in `sources`. No owner, version, duration or Case identity is defaulted from an unrelated source.

This proposes logical history semantics, not an approved artifact TTL. Before DO/live retention, Engineering must record the allowed source family, history horizon, retention/pinning/deletion/access decisions and the owner of the derived index. The horizon must support the configured recurrence window and retained version-transition/evaluation evidence. An expired artifact is an explicit gap, even if it once existed.

## 4. Structured analysis and report contract

`analyze` returns `{ sources, profiles, skew, history, comparisons, advice, findings }`.

| Field | Contract |
| --- | --- |
| `sources[]` | Each source's `ref`, unchanged `body`, qualification `availability` and reasons. Retain unsupported rows/outcomes; never present them as qualified timing. Identical downloads may share one source entry if their duplication remains explicit. |
| `profiles[]` | Current run/attempt/platform/suite plus `availability` and Testing's unchanged `value` for each qualified profile. No partial distribution. |
| `skew` | `availability` and optional unchanged Testing `value`; unknown when the expected current host set is unqualified/incomplete. |
| `history` | `availability`, unchanged Testing `value` when called, and explicit coverage/exclusions. Preserve candidate counts, version/platform, `refactors`, `unprofiled` and all findings; no algorithm duplication. |
| `comparisons[]` | Exact Case/from/to/platform/cohort, original timing row and a separate preservation `{ availability, value? }`. Label timing rows as file-version timing comparisons. |
| `advice[]` | Owner-qualified Case/suite advice, retaining kind, version/platform and source references. `accountableOwner` comes from accepted declarations, never C129's realization label. Unknown accountability stays unresolved. |
| `findings[]` | Structured `{ code, ...context }` findings; each names the affected source, channel, Case or contract as applicable. No unknown is silently converted into unchallenged. |

Availability is a closed vocabulary: `available`, `unknown`, `pending`; preservation also permits `not assessed` when no matching evaluation was provided. These are wrapper states, not replacements for Testing's own result vocabulary. An owner's `unknown` result remains unknown and its findings are retained. Unexpected owner result/kind/ownership vocabulary is an interface finding, never a default pass or an automatic assignment to Hosting.

Testing ports are called through their public signatures: `profile({cases}, timingOptions)`, `skew(platformRuns, timingOptions)`, `candidates(oldestFirstHistory, {...timingOptions, ...redesignOptions})`, `refactored(before, after)`. Values returned by the owner are retained without recomputing thresholds, medians, recurrence or behavioural verdicts.

`observe(original, ports)` calls the bound analysis operation once and publishes one observational report, including when acquisition/analysis failed. It returns `{ original, observation, delivery, findings }`. The captured original verdict, exit code, Case counts and completeness are unchanged. Analysis exceptions give observation availability `unknown` and `analysis-unavailable`; publication exceptions give delivery availability `unknown` and `publication-unavailable`. Neither exception may replace the original verdict/exit or suppress its failures. A separately approved CLI/workflow must actually return the saved original exit; this unit contract does not claim that workflow integration already exists.

No output is a check selector, skip list, required-check update, impact classification or assurance verdict. Reject a selection policy with `selection-out-of-scope`; never call a selector or change the executed population.

## 5. Independent preservation evidence

A preservation source has `{ ref, case, from, to, cohort, before, after, subjects }`. `before`/`after` use Testing's `{ id, version, tests, verdicts }` shape. Independent bindings identify the producer/integrity, exact Case/version pair, before/after target declarations, and actual immutable subjects behind each label: bytes, mutant operator where applicable and test-data/configuration identity. The record's own `verified` field is ignored.

Only an exact Case/from/to/cohort match is joined to a timing row, retaining the timing platform. Another Case sharing its file supplies no check. A missing binding, unestablished producer, missing target declarations, or a reused subject label bound to different bytes is unknown before calling Testing. Missing earlier RED or GREEN discrimination is Testing's `unknown`, retained unchanged. A known, identified earlier subject that the later Case did not judge is passed as missing verdict evidence to `refactored`; its `changed` is not confused with an unidentifiable subject.

Targets or verdicts that demonstrably changed are complete negative evidence, not missing provenance: pass the supported before/after definitions to Testing and retain its `changed`. `faster` never implies `kept`; `kept` may accompany `not faster` or `pending`. With no matching behavioural record, preservation is `not assessed`. The source matrices and timing examples remain distinct observations.

## 6. Required finding codes and scenario trace

The code is part of this proposed consumer interface; findings may include additional detail. A failure can give multiple findings, but must preserve the required distinguishing code.

| Codes | Established scenario / meaning |
| --- | --- |
| `timing-absent`, `file-version-conflict` | E01–E02: no measured timing or no supported stable executed-file identity. |
| `execution-ambiguous`, `population-incomplete`, `execution-missing` | E03/E06: duplicate/nested/aggregate observation, missing declared Case or no actual execution. |
| `provenance-conflict`, `producer-unknown`, `source-integrity` | E04: source claim conflicts with independent metadata or lacks established producer/integrity. |
| `host-missing`, `configuration-conflict` | E05: no complete comparable cross-platform set. |
| `duplicate-source`, `current-attempt-incomplete` | E07–E08: repeated download is visible; latest attempt cannot borrow earlier evidence. |
| `source-expired`, `history-gap`, `history-pagination`, `history-chronology` | E09: incomplete or unordered history cannot become a full last-five window. |
| `cohort-conflict`, `current-version-unobserved` | E10–E11: incomparable cohort or a missing current-version execution. |
| `preservation-untrusted`, `preservation-join`, `preservation-subject-conflict` | E13–E14: absent independent evidence, wrong Case/version pair or conflicting subject identity. |
| `analysis-unavailable`, `publication-unavailable` | E16: observational work failed; original CI remains unchanged. |
| `owner-unknown`, `owner-unsupported`, `testing-contract`, `selection-out-of-scope` | E17–E18: missing accountability, unsupported owner/result vocabulary or attempted selector coupling. |

The acceptance file has one named test per parent-PLAN scenario, E01–E18, traced to R1–R8. Each uses explicit positive controls and negative perturbations. E16 covers original exits 0, 1 and 2 independently of observational exceptions. E18 checks permitted/prohibited/undecidable module imports with Hosting's conformance interface. Semantic duplication of Testing statistics cannot be established from an import check alone: concerned owners must validate that separately, and the findings/report must not claim mechanical proof of its absence.

## 7. Frozen acceptance boundary and verification status

The proposed declaration is `acceptance-boundary.json`, owned by Engineering, in Testing boundary's existing `{ concern, owner: { kind, name }, paths }` form. Extra metadata records the subject and explicit external dependencies; it is not a second boundary mechanism. It includes this addendum, the accepted parent PLAN, the declaration itself and the entire `engineering/timing/test/plan/` tree, including fixtures/helpers/expected values and any added descendants. DO/CHECK may not edit these to make a candidate pass. The future subject `engineering/timing/analyze.mjs` is explicitly outside that boundary because it is the implementation being judged.

External dependencies are declared, not silently discovered: Node 24's runner/assert APIs, the target-owned Hosting conformance interface for E18, and the pinned Testing interface contracts. These tests use explicit Testing-port doubles and do not depend on the missing Timing modules being installed. A later source/consumer integration check must demonstrate use of the real admitted Testing package; doubles do not demonstrate that. Guard's producer/event binding, raw-byte integrity verification, live service enumeration, real retention and actual workflow exit preservation likewise require their own owner/integration evidence.

The declaration supplies no self-issued Seal or trusted attestation. Its baseline must be the actual Owner-approved immutable merge revision, selected and attested by the repository's trusted authority. This candidate cannot declare itself approved or unchanged. Later `interpret`/boundary-verdict consumption must use the actual trusted anchor, not working-tree bytes or a candidate label.

Explicit commands (not added to npm scripts or CI):

```sh
node --input-type=module -e "import {checkFixtures} from './engineering/timing/test/plan/fixtures.mjs'; checkFixtures()"
node --test engineering/timing/test/plan/acceptance.test.mjs
```

At PLAN time `analyze.mjs` does not exist. Running the acceptance file discovers all 18 Cases; each is blocked before behavioural assertion by the absent adapter. This is not clean behavioural RED, GREEN, tested negative discrimination or evidence of integration. Fixture construction and JavaScript syntax were checked independently. A separate scratch-only inert substitute was rejected by all 18 Cases on assertions, with no TypeError/ReferenceError/SyntaxError. That probe shows rejection of absent behaviour, not successful execution of the negative branches, a working adapter or mutation coverage. No substitute is added to this repository. The addendum is not implementation-ready solely because its tests can be discovered: the record, trust, history/retention and dependency prerequisites still apply.

Before DO, establish the intended module boundary without changing planned tests, run the Cases, and demonstrate failures on their intended behavioural assertions. Then implement and show positive/negative discrimination, mutation challenges and the real owner-interface integration, reporting any remaining unknowns. A defect in these planned tests goes back through ACT/new PLAN rather than being repaired during DO.
