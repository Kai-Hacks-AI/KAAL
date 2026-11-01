# Engineering PLAN: adopt Testing timing and redesign evidence

## Intent, authority and boundary

Engineering should learn from actual CI observations which Cases merit redesign, using Testing's `profile`, `skew`, `candidates` and independent `refactored` evidence. The outcome is advice for the Case/suite owner alongside the existing CI result. Timing establishes neither a defect's cause nor permission to omit a check.

This is one planning Change, proposed from `kaal/engineering`. It changes this document only. It authorizes no DO, runner or workflow change, synchronization, promotion, publication, branch-protection change or selective-CI activation. Every implementation step below needs its own approved Change. #759 and the [authoritative selection adapter PLAN](../impact-ci/authoritative-adapter-plan.md) remain separate: nothing here selects, skips, retries or cancels tests.

The requirement and scenario identifiers in this document are local to this PLAN (`R1`–`R8`, `E01`–`E18`), not allocated Engineering-wide Case identifiers.

## 1. Inspected evidence and availability

Inspection date: 2026-11-01. These are pinned observations, not claims about every branch or future run.

| Source | Pinned revision / state | What is available; limit |
| --- | --- | --- |
| Implementation destination | [`kaal/engineering@6ba3cdb1d7e1cf9893a64cda944799b7c9edb11f`](https://github.com/Kai-Hacks-AI/KAAL/tree/6ba3cdb1d7e1cf9893a64cda944799b7c9edb11f) | Existing lane, coverage-capture and reporting drivers. Neither `lib/timing.mjs` nor `lib/redesign.mjs` is present here. |
| Testing C47 / C53 | [#768](https://github.com/Kai-Hacks-AI/KAAL/pull/768), [#770](https://github.com/Kai-Hacks-AI/KAAL/pull/770), merged in [`kaal/testing@64d823409e033ef1ad779113d1af0ec4560dd08b`](https://github.com/Kai-Hacks-AI/KAAL/tree/64d823409e033ef1ad779113d1af0ec4560dd08b) | Pure timing and redesign interfaces, their requirements and T92–T97 / T110–T115. Availability in that collector does not establish availability on Engineering or main. |
| Guard C129 | [#663](https://github.com/Kai-Hacks-AI/KAAL/pull/663), open at `c85e6b947a443047d5769230fac3fa7d13b7a35d` | Guard-owned suite declarations, `reporter.mjs`, `suites.mjs`, record validation and gate. These files are absent from the inspected Engineering target. This is an unmerged dependency, not the live target's recorder. |
| C129 lane integration | [#665](https://github.com/Kai-Hacks-AI/KAAL/pull/665), open at `a127ba0ade640fbd6e4fce55dfefc9dc5059f8f3` | Engineering-owned workflow proposal, separately governed from Guard's product/record changes. |
| Actual C129 combined trial | [#714](https://github.com/Kai-Hacks-AI/KAAL/pull/714), evidence-only draft at `b9debf0c175a7c12dcfdb5254251e358f58236de`; [run 41226277799](https://github.com/Kai-Hacks-AI/KAAL/actions/runs/41226277799), attempt 1 | Three retained host records were downloaded and inspected. This draft is not a merge candidate or production rollout. Its older applicability treatment differs from current #663; do not substitute one revision's validator for another. |
| Promoted tree | [`main@be3a2d09a386967bd5a1cd4a850f389951bc0796`](https://github.com/Kai-Hacks-AI/KAAL/tree/be3a2d09a386967bd5a1cd4a850f389951bc0796) | Neither new Testing module is present at the inspected paths. Dependency admission remains future work through approved repository flows; this PLAN does not import another collector's Changes. |

Public interface authority: [Testing timing requirements](https://github.com/Kai-Hacks-AI/KAAL/blob/64d823409e033ef1ad779113d1af0ec4560dd08b/packages/skills/kaal-testing/plan/timing/requirements.md) (F79–F83/N17) and [redesign requirements](https://github.com/Kai-Hacks-AI/KAAL/blob/64d823409e033ef1ad779113d1af0ec4560dd08b/packages/skills/kaal-testing/plan/redesign/requirements.md) (F93–F97/N20). Engineering owns only their use and evidence qualification.

### Actual trial records

All three JSON bodies name candidate `c67625f3ec7adc6f3534752005d7c7d53f0d8e6f`, Node `v24.22.1`, and 176 declared Cases. The run API's `head_sha` is instead PR head `b9debf0…`: the recorded candidate is the synthetic checkout used for the PR trial. A future provenance adapter must establish that relationship; simply comparing the two strings would reject legitimate evidence.

| Artifact in run 41226277799 | Artifact id | Host | Passed | Not run |
| --- | --- | --- | ---: | ---: |
| `guard-run-record-Linux` | 13051819335 | `linux` | 175 | 1: guard/T118 |
| `guard-run-record-macOS` | 13051024546 | `darwin` | 175 | 1: guard/T118 |
| `guard-run-record-Windows` | 13053062826 | `win32` | 174 | 2: guard/T118 and an Embedded lifecycle Case |

There are zero failed Cases in these records, but missing executions leave the run non-GREEN. Timing analysis must retain that distinction. Artifact metadata reports expiry at `2027-01-29T17:48:09Z` for all three and supplies artifact digests. That is this run's observed retention, not a newly approved retention period or a guarantee of future availability.

The JSON shape is `{ candidate, host, node, suites, cases }`. Case rows have `{ case, owner, suite, file, outcome, reason? }`. Embedded `case` values are full manifest-defined file/title paths; Engineering/External rows can carry identifiers such as `guard/T118`. `owner` values such as `Embedded` describe the realization, not necessarily the accountable capability or maintainer.

**Missing in these actual records:** per-Case duration, executed file-byte SHA-256, logical run/attempt/job identity inside the body, schema/producer identity, architecture/runner/load configuration and evidence of a RED/GREEN subject matrix. Artifact/job metadata can provide some provenance independently; it cannot recreate a discarded Case duration. No `profile`, `skew`, recurrence or speed claim is justified from these three legacy records. Three hosts are one logical run, not three history samples.

### Existing mechanisms to reuse

- [C129 reporter at the trial revision](https://github.com/Kai-Hacks-AI/KAAL/blob/b9debf0c175a7c12dcfdb5254251e358f58236de/engineering/guard/reporter.mjs) emits terminal test events as file/path/outcome/note, excludes suites, and discards duration. [The suite orchestrator](https://github.com/Kai-Hacks-AI/KAAL/blob/c85e6b947a443047d5769230fac3fa7d13b7a35d/engineering/guard/suites.mjs) matches these events to declarations, aggregates outcomes, and writes one record. Aggregation alone does not prove one timed execution per declared Case.
- [The trial workflow](https://github.com/Kai-Hacks-AI/KAAL/blob/b9debf0c175a7c12dcfdb5254251e358f58236de/.github/workflows/ci.yml) uploads existing host records and downloads the three for the suite gate. It does not declare `retention-days`. Continue using these record artifacts; do not add a competing test recorder.
- [Engineering lane captures](https://github.com/Kai-Hacks-AI/KAAL/blob/6ba3cdb1d7e1cf9893a64cda944799b7c9edb11f/engineering/lanes/evidence.mjs) write immutable, non-overwriting workspace `capture.json` files under Hosting's locking, with `{ commit, run, attempt, platform, arch, node }` provenance and a measurement result. These are coverage/test-status captures, not a demonstrated per-Case timing history. The inspected target CI does not invoke the optional `--evidence` capture path or upload a timing-history artifact.
- [Capture consumption](https://github.com/Kai-Hacks-AI/KAAL/blob/6ba3cdb1d7e1cf9893a64cda944799b7c9edb11f/engineering/report/captures.mjs) already distinguishes absent, wrong-commit and wrong-run/attempt captures from evidence for the current report. Reuse that provenance principle and existing run ownership, without weakening its current-run checks to make historical data pass.
- The comprehensive lane's [suite plan](https://github.com/Kai-Hacks-AI/KAAL/blob/6ba3cdb1d7e1cf9893a64cda944799b7c9edb11f/engineering/lanes/plan.json) and suite discovery own execution coverage. A timing cohort must consume their accepted declarations rather than becoming another scheduling registry.

## 2. Ownership and missing contracts

| Concern | Owner | Proposed obligation / readiness gap |
| --- | --- | --- |
| Case and suite definitions, accountable owner, correction | Owning capability/Case/suite owner | Supply the accepted declaration and any canonical mapping from manifest identities. Do not infer accountability from C129's realization label or title prose. |
| Guard's Case-to-event binding and record schema | Guard, with its record-producing Engineering harness | Extend C129's existing record once, preserving declarations, outcomes, missing-case findings and gate semantics. Agree terminal-event duration and exact executed-file identity before implementation. C129 is still open. |
| Logical run identity, acquisition, retention, cohort and reporting | Engineering | Bind records to independent CI metadata, qualify comparisons, retain source references and publish advisory output. No governed multi-run catalog/order/attempt-selection contract was established by this inspection. |
| Host reads/writes, artifact transport mechanics, host facts | Hosting; existing service adapter for service facts | Perform host operations through Hosting. Hosting supplies applicable host facts and owns confirmed OS-boundary defects; timing skew does not establish one. |
| KAAL byte digests | Foundation | Use the scoped Foundation SHA-256 implementation; no copied digest or direct crypto implementation. An artifact digest is not a Case-file digest or evidence authority. |
| `profile`, `skew`, `candidates`, `refactored` semantics | Testing | Consume the public interfaces and preserve findings/results. Do not duplicate their threshold, window, median or verdict logic in Engineering. Testing remains pure and stateless. |
| Behavioural preservation evidence | Case owner; Engineering associates records | Retain actual before/after Case evaluations, targets and immutable subject identities. A timing run's outcome alone is insufficient. No suitable retained subject matrix was located in the inspected sources. |
| Acceptance and activation | Owner, with affected concern owners | Approve the schema/history policy and planned acceptance boundary before DO; separately approve any later workflow integration. |

A full C11/Graph impact map is not a prerequisite for observing properly identified Case timings. Where `refactored` needs authoritative targets, use the Case owner's accepted declaration through Testing's model/interface; unavailable targets leave preservation unknown. This PLAN does not implement #759's selector or bypass its missing contracts.

## 3. Required observational contract

### R1 — Preserve the original run and execution identity

The source record remains the single outcome record. Its backward-compatible, versioned timing extension must preserve each declared Case, original identity/title path, owner/realization, suite, source file, outcome and reason. Record raw terminal-event duration in milliseconds, units, producer/schema version and an execution occurrence key. Include an actual duration of zero when observed; never substitute zero for absent timing.

Bind a timing sample to the exact Case-file bytes used by that execution, identified by Foundation SHA-256. Check or establish that the source bytes did not change during the run; a post-run hash of an arbitrary checkout is insufficient. Dynamically generated/installed tests require the executed artifact/file identity and a documented owner mapping. Missing identity remains unknown; never guess a source-file hash from a built file or aggregate process time.

No parent/child double counting, summing nested subtests, silently merging duplicates or selecting the fastest retry. Multiple events matched to one declared Case require the owner's explicit occurrence contract, or that sample is unknown. Preserve distinct suite/execution contexts without changing the underlying Case identity. Legitimate repeated contexts do not become extra history runs.

### R2 — Bind provenance independently and qualify cohorts

Engineering associates each existing record with a reference envelope: repository identity; workflow/revision and producer schema; event and branch/PR stream; logical run id, attempt, job/shard; expected hosts and suites; actual checkout/tested revision; PR head/base and synthetic-merge relationship where relevant; package/release-pair identities; Node, OS/architecture, runner class; and material harness, concurrency, instrumentation and test-data configuration. Pin the reviewed producer/schema, declarations, normalizer and cohort policy from a trusted target/release; a candidate must not replace them to certify its own record. The record cannot attest its own authority. Obtain service facts and allowed source selection independently of candidate-authored JSON; a trusted producer/retrieval path and verified binding are still required even when digests match.

Start with one explicitly approved same-repository C129 run family and suite context. Do not combine PR trials, releases, default-branch runs, coverage and ordinary execution, or different runner classes/configurations without an owner-approved comparability policy. Unknown configuration means comparability is not established. Runners may still differ in load; even a qualified skew is evidence for investigation, never a causal proof.

For `skew`, require one coherent run set for the same tested candidate, same Case identities/file versions, declarations, attempt and relevant non-OS configuration across the expected hosts. For history, product candidates may legitimately advance: retain each candidate's provenance and disclose those changes as confounders, while requiring a stable suite/cohort policy and counting each platform separately. Do not require old history to pretend it was captured at the current candidate.

### R3 — Reuse retention, expose gaps, order runs explicitly

Retain raw outcomes/timing in the existing owner-held run record and existing artifact/run storage. Prefer a small derived index of source references and a derived report attached to the same governed run family, not a second raw recorder, database or copied test registry. An index is not a new authority; its entries must be reconciled with independently enumerated expected CI runs and artifacts, including pagination and missing/expired records.

Engineering must propose and obtain approval for the history horizon, artifact retention/pinning, access, deletion and index ownership. It must support the configured last-five window/three recurrences plus retained version-transition and behavioural evidence while a redesign is being assessed. Do not invent a retention duration or promise history after artifact expiry; if existing retention cannot support this, propose the smallest retention extension separately, with a justification rather than an automatic new store.

Order by the service's established logical-run chronology; within one logical run, use its latest applicable attempt once. An incomplete latest attempt cannot silently fall back to an earlier GREEN attempt. Job retries, three platforms, duplicate downloads and repeated analysis do not manufacture independent recurrences. Preserve rejected records and reasons in the report, not as fabricated samples. Missing run enumeration or an expired slot leaves window completeness unknown; never silently close gaps and call the retained subset the last five runs.

Historical applicability and current-report freshness are separate checks. Preserve the current capture reader's commit/run/attempt binding. A missing or stale current observation must not become a current `unchallenged` result through an empty history or fallback to old data. A complete history with only two qualifying runs is insufficient for three recurrences; label that limitation rather than inventing a redesign candidate.

### R4 — Adapt qualified evidence to Testing, without new timing logic

| Interface | Qualified input supplied by Engineering | Reporting obligation |
| --- | --- | --- |
| `profile({ cases: [{ name, ms }] }, options)` | One complete, qualified suite/run distribution with unambiguous Case execution durations | Preserve `result`, challenges and every finding; retain identity/provenance mapping behind each `name`. Never use job/suite wall-clock duration as a Case's time. |
| `skew([{ platform, cases }], options)` | R2's comparable host set, identical Cases and versions | Keep all expected hosts visible. Missing host, mixed attempts/candidates or incomparable settings means skew is unknown before any numeric conclusion. |
| `candidates(history, options)` | Oldest-first qualified logical runs, with `{ platform, cases: [{ name, sha256, ms }] }` | Preserve `seen/of`, signals, median, current version, platform, `unprofiled` and findings. Missing records do not count; do not rebuild the algorithm or silently trim an incomplete population into a concentrated subset. |
| `refactored(before, after)` | R6's independently supported `{ id, version, tests, verdicts }` pair | Retain `kept`, `changed`, `unknown`, differences and findings independently of time. |

Resolve the Case name through an injective owner-qualified identity mapping; keep original ids and title paths intact. Do not extract a convenient `guard/T…` substring and collapse distinct manifest Cases. `host` is normalized to the supported `platform` vocabulary through the accepted host mapping, not an assumption about job display names.

Skipped, todo, missing and not-applicable Cases have no observed execution duration unless the owner contract establishes an actual execution. A skipped runner event's overhead is not Case execution time. Completed failures may retain their observed duration for diagnosis; their failed outcome remains attached. Any partial-population analysis requires an explicitly separate exploratory label and permission; the initial implementation must instead leave the required distribution unknown.

A whole-file hash is not a digest of the Case's entire dependency closure. Keep imported fixture, harness and test-data versions in the comparability evidence. An external fixture change must not silently reuse a cohort whose meaning changed; qualify a new cohort or leave applicability unknown under the approved policy, without inventing a different Testing Case-version scheme.

Keep the exact Testing package/interface and option-policy versions with the derived report. Too-few-case/zero-time inputs remain unprofiled/unknown as Testing reports. A changed whole-file hash resets every Case in that file; the caller must resolve current file versions from the actual current declarations even when a new-version Case did not run. Omitting that new version from history must not let an old version's recurring signals stand for the current Case.

### R5 — Attribute advice, never change assurance

A report carries the original CI result/exit status, completeness and failures unchanged, followed by a separately labelled timing-evidence section with source references, qualified/excluded observations, cohort/window coverage, policy version, challenges and recurring candidates. Attribute concentration to the Case/suite owner, and outliers/skew to the named Case owner. An unresolved accountable owner stays unresolved; do not route everything to Engineering or Hosting by default.

Testing's `refactors` field is labelled **file-version timing comparison** in the report. It is not a list of proven Case refactorings. A new file hash does not prove an individual Case was edited. List historical and current-version evidence separately, with pending/unknown conditions visible.

Timing success, challenge, insufficient data, malformed evidence, analysis failure and artifact/reporting failure must never turn a failed/incomplete original run GREEN, turn a passing test run into a timing failure, change its exit code, or mask a crash. Preserve the underlying runner's exit status exactly. An observational error is reported as unavailable/unknown evidence alongside that status. Existing completeness, release and security gates remain authoritative and untouched. This is not a timing budget gate.

### R6 — Keep timing and behavioural preservation independent

The Case owner's redesign Change supplies before/after Case definitions with exact file-version hashes, accepted target sets and independently captured evaluations on the same immutable subjects. Subjects must identify the tested product/candidate bytes, code-before-change revision, each mutant's actual modified bytes/operator, and relevant test-data/configuration identities. A label such as `mutant 1` alone does not establish that two evaluations used the same subject. Earlier evidence must discriminate both RED and GREEN, and all earlier subjects must be re-evaluated by the new Case version.

Retain this evidence with the existing owning Change/test records and reference it; do not introduce a parallel behavioural recorder or infer verdicts from timing rows. Establish the record's producer/trust and versions before handing its plain data to Testing. Missing targets, missing subjects, untrusted bindings and mismatched subject content remain explicitly unknown rather than a self-asserted `kept` claim.

Associate timing and preservation only for the same repository/owner-qualified Case and exact `from`/`to` file-version pair, retaining the timing platform/cohort. Never borrow a check for another Case in the same file. Display both results side by side:

| Timing evidence | Independent preservation evidence | Meaning |
| --- | --- | --- |
| `faster` | `changed` | Faster, with lost/changed discrimination; not a completed refactoring. |
| `faster` | missing / `unknown` | Timing improvement only; preservation not established. |
| `not faster` | `kept` | Preservation shown within the evaluated subjects; no speed improvement shown. |
| `pending` | `kept` | Behavioural evidence exists; enough later timing observations do not yet exist. |

A Case owner may investigate a demonstrated host-specific cause with Hosting. Neither this join nor `skew` assigns an OS-boundary defect from timing alone.

### R7 — Bound mechanics and authority

Testing receives plain data through its public interfaces and stores nothing. Engineering owns orchestration, trusted source acquisition, normalization, qualification and reporting; host mechanics remain Hosting's and digests Foundation's. Consume accepted producer/schema and declaration interfaces rather than copying Guard's suite parser, Testing's statistics or another capability's identity mechanism.

Before implementation, declare the exact adapter dependency and path boundaries, including all planned tests and fixtures. Mechanically check permitted/prohibited imports and publish undecidable constructs for validation; a helper named "pure" or a candidate-authored status flag establishes nothing.

### R8 — Keep #759 and execution selection separate

No report output or timing-history filter becomes an expected-check selector, test-skipping list, changed-path classifier, gate policy or required-check update. Exercise this separation explicitly. Cross-capability dependency or contract evidence needed for #759 stays in its authoritative adapter PLAN; observation here does not demonstrate that selective CI is safe.

## 4. Planned acceptance and negative scenarios

The expectations below are this PLAN's normative acceptance specification. No executable tests or fixtures are added by this document, and no RED/GREEN or mutation-execution claim is made for Engineering integration. Before DO, a separately reviewed PLAN addendum must bind these scenarios to executable outer tests, owner-supplied fixture bytes/expected values, and an explicit immutable path/dependency boundary. Existing Testing-owned tests are consumed unchanged, not reimplemented exhaustively.

| Scenario | Positive control and discriminating negative | Required observation / trace |
| --- | --- | --- |
| E01: real legacy records | Inspect the three retained C129 records above; inject a duration field without a producer/version binding | Identity/outcomes survive, timing remains unknown; no job-duration or zero backfill. R1–R2. |
| E02: one measured run | Approved terminal-event fixture yields an exact Case identity/file hash and observed `ms`, including true zero; omit timing/hash or change file bytes during execution | Reject the unsupported timing sample; retain the original outcome/reason and source binding. R1. |
| E03: occurrence ambiguity | One declaration maps to one supported occurrence; duplicate terminal event, nested parent/child event, retry or colliding shortened title | No silent merge, double count, fastest retry or lost identity. Ambiguous sample unknown. R1, R4. |
| E04: valid synthetic merge | Independently established PR-head → actual checkout mapping accepts `b9debf0…` / `c67625f3…`; alter repository, checkout, artifact job/run/attempt or rely solely on record claims | Correct binding accepted; stale/untrusted evidence unknown, never current unchallenged. R2–R3. |
| E05: cross-host comparability | Complete same-candidate/Case-version/configuration host set reaches `skew`; drop a host or change version, Node/runner profile, attempt, package pair or instrumentation | Mark skew unknown, preserve each underlying run and the excluded reason. R2, R4. |
| E06: partial population | Full distribution reaches `profile`; omit a slow/failed/skipped Case, use job wall time as its duration, or substitute skip overhead | No concentrated-subset result presented as full-run evidence. Failed/missing outcomes remain visible. R1, R4–R5. |
| E07: one logical run once | Three distinct qualified workflow runs reach history; instead supply three platforms, retries, duplicate artifact downloads or re-analysis of one run | One logical sample per platform/context; no manufactured three-run recurrence. R3. |
| E08: incomplete latest attempt | Complete latest attempt accepted; latest attempt is interrupted while earlier attempt passed | No fallback to older GREEN or old-version candidacy for the current report. R3–R4. |
| E09: retention gaps | Independently enumerated complete retained window; expire/delete one required artifact, omit a page or reorder run timestamps/ids | Coverage and order checked; gaps remain unknown, never zero time, empty unchallenged or an invented last-five window. R3. |
| E10: recurring evidence | Qualified fixed-version history produces Testing's expected named candidate; change cohort/owner or provide only two complete runs | Preserve Testing's result with explicit coverage/insufficient-recurrence labels; no new thresholds or fabricated candidate. R2–R5. |
| E11: whole-file reset | Two Cases share one file; only one is edited and the file hash changes | Both current-version windows reset, untouched Case retained; no per-Case edit/refactoring claim from the hash. R1, R4–R5. |
| E12: behavioural loss | Same Case/version pair is `faster` with preserved targets/subjects; flip a formerly RED mutant to GREEN or drop a target/subject | Show timing separately with `changed` from supported evaluations; never promote speed to `kept`. R6. |
| E13: missing discrimination | Supported RED/GREEN subject matrix exists; remove earlier RED or GREEN, targets, trusted producer or immutable subject mapping | Preservation remains unknown/not assessed; no fabricated evidence. R6. |
| E14: wrong join | Exact Case/from/to/cohort association; substitute another Case in the same file, another version pair, or a reused subject label for different bytes | No association; preserve separate records and expose the mismatch. R6. |
| E15: preserved but not faster | Same subjects/targets give `kept` while time is `not faster` or `pending` | Display both independently; no speed/success claim inferred from preservation. R6. |
| E16: unchanged CI assurance | Base fixtures exit 0, 1 and 2 and have complete/incomplete results; analysis challenges, throws, reads malformed evidence or cannot publish a report | Original result/exit/completeness unchanged in every case; observation status unknown when unavailable. R5. |
| E17: ownership and host cause | Named Case/suite owner present; skew is routed straight to Hosting or realization label is treated as accountable capability | Reject unsupported attribution; investigation stays with Case owner, Hosting involved only for demonstrated host causes. R5–R6. |
| E18: boundaries and selection | Permitted Testing/Hosting/Foundation interfaces; inject duplicate statistics, prohibited host access, undecidable dependency, selector/gate coupling or changed test population | Mechanical breaches fail conformance; undecidable concerns stay unknown for validation; timing never changes #759 selection or executed coverage. R7–R8. |

Acceptance runs against recorded/fixture evidence, not by rerunning expensive product suites merely to reconstruct lost timings. A separately approved live pilot later demonstrates actual capture and fresh-run provenance on supported hosts, retaining failed/interrupted examples. Fixture tests alone do not establish that rollout.

## 5. Bounded implementation sequence

| Step | Bounded Change and integration point | Entry / exit evidence |
| --- | --- | --- |
| 1 — Contract and test readiness | Guard/Engineering agree the C129 timing extension and event binding; Case owners agree identity/accountability; Engineering proposes cohort, provenance, attempt and retention/index contracts. Freeze E01–E18's outer tests and fixture boundary in a PLAN addendum. | C129's current record/gate semantics and applicability defects remain separately governed. Each gap has an owner and accepted contract; no invented data or duplicate recorder. This PLAN alone does not approve that addendum or DO. |
| 2 — Extend the existing source | Owner-approved Guard recorder/harness Change adds durations and executed-file identity to C129's existing record, plus a schema version; Engineering binds existing service provenance. Preserve outcome aggregation, declared population and exits. | Demonstrate unchanged execution/verdicts and exact sample/event mapping, including duplicates, missing events and source mutation. No workflow change combined into the source Change. |
| 3 — Offline qualification and analysis | Engineering adapter reads existing records/captures and independently acquired metadata, maintains a derived reference index under approved retention, and invokes Testing's public interfaces. First run retrospectively from explicit inputs; no autonomous CI scanning job. | Accepted Testing dependency actually available on the Engineering implementation target through separately approved delivery/integration; complete named cohort, no stale/fallback/gap errors; E01–E11/E16–E18 exercised. Do not copy modules from `kaal/testing` into this PLAN or authorize synchronization. |
| 4 — Report and preservation association | Existing Engineering report pipeline gets a separate observational section, including owner attribution, exclusions, comparison coverage and R6's Case-owner evidence links. | Exercise E12–E17, including faster with lost RED and kept without speed improvement. Keep original result/exit unchanged. Review representativeness and remaining unknowns with the Case/suite owner. |
| 5 — Separately reviewed live observation | Only after the offline contract is accepted, propose the minimum `.github`-only integration of capture/upload/history acquisition/report attachment, using existing artifact ownership. | New Owner authorization required for any workflow change. Validate on actual supported-host runs and interruption/expiry cases. No change to check selection, security/completeness gates, required checks, promotion or publication. |

The reusable capture/report hooks are Engineering's `lanes/evidence.mjs` and `report/captures.mjs`; C129's record/emitter is the first producer contract to extend. Reuse does not mean forcing all products into Guard's schema. A later producer may supply its own owner-approved record adapter under the same observational contract, without replacing its outcome authority or copying the capture path.

## 6. Readiness and acceptance of this PLAN

The inspected evidence establishes a real reusable record path and real missing data, not a timing assessment of those historical runs. Present readiness is **blocked for DO** by source/schema and provenance/history contracts, C129 integration, availability of Testing on the implementation target, frozen outer tests, and Case-owner behavioural evidence where preservation is claimed. Observing timing does not require a prior successful redesign; missing preservation evidence must remain a separate unknown.

Owner review should judge whether these boundaries, owners, retention choices and negative expectations are adequate. Guard reviews the proposed extension point, Testing reviews public-interface use, and Case owners validate identity/cohort and behavioural-subject meaning. Mechanical checks can establish document scope, references and branch/isolation conformance; they do not establish actual capture, trusted retention, comparable execution or improved performance.

This PLAN introduces no new recorder, history store, implementation module, test change or workflow. No CI assurance is reduced or redefined by its acceptance.
