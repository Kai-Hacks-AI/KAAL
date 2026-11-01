# Guard PLAN: C129 timing producer and event binding

## Decision proposed to Guard's owner

Adopt the **wire contract** proposed by Engineering [#775](https://github.com/Kai-Hacks-AI/KAAL/pull/775), building on [#773](https://github.com/Kai-Hacks-AI/KAAL/pull/773), as an additive observation contract on C129's existing run record. Keep Case identity, outcome aggregation, applicability, suite completeness and gate/exit semantics unchanged. This is Guard's proposed producer decision; Engineering's approval of its consumer PLAN is not Guard approval, and this proposal does not attest its own acceptance.

This branch starts at `kaal/guard-release@9a3276f4ac1f4f1d586fad79f6658e2fc6642d0e` (Guard C136). It adds this PLAN, synthetic producer-binding fixtures, twelve planned outer Cases and their boundary declaration. It changes no product, C129 implementation, existing test, script, workflow, dependency, release version or gate. No DO, conflict repair of #663, synchronization, promotion or publication is authorized. Producer Cases have local P01–P12 identifiers, not newly allocated Guard-wide T numbers.

## Evidence and integration position

| Source | Inspected state | Consequence |
| --- | --- | --- |
| [C129 DO #663](https://github.com/Kai-Hacks-AI/KAAL/pull/663) | Open at `c85e6b947a443047d5769230fac3fa7d13b7a35d`; conflicts with its collector | Resolve C129 in its own Change. This PLAN neither imports its pending code nor resolves those conflicts. |
| [C129 reporter](https://github.com/Kai-Hacks-AI/KAAL/blob/c85e6b947a443047d5769230fac3fa7d13b7a35d/engineering/guard/reporter.mjs) | Serializes terminal file/path/outcome/note, excluding suites, and discards duration and instance identity | Extend this producer, not a second recorder. A terminal report event is not automatically an executed, uniquely identified Case. |
| [C129 outcome matching and record](https://github.com/Kai-Hacks-AI/KAAL/blob/c85e6b947a443047d5769230fac3fa7d13b7a35d/engineering/guard/suites.mjs) | Matches declarations; multiple matching events can yield one passed/failed Case outcome; stores candidate/host/Node and all Cases | Preserve the outcome rule. Add a stricter, separate timing binding; ambiguity leaves timing unknown rather than changing that outcome. |
| [Engineering lane proposal #665](https://github.com/Kai-Hacks-AI/KAAL/pull/665) | Still open, separately owns workflow changes | C129 and its lane prerequisites remain independently governed. No workflow change is carried here. |
| [Accepted consumer addendum](https://github.com/Kai-Hacks-AI/KAAL/blob/862b4508438e48013c22f412c3974cc7410c322e/engineering/timing/contract-addendum.md) | Engineering #775 is merged; it requires actual file-version/event binding and independent authority | Its E02–E06/E11/E16 depend on this producer contract; consumer tests do not prove the recorder captures real events or loaded bytes. |
| Foundation on the Guard target | `packages/kaal-foundation/`, `@kaihacksai/kaal-foundation/sha256` | Reuse Foundation's one SHA-256. Do not introduce a copied digest or direct crypto implementation. Publication is not implied by presence here. |

C129's current head treats every skip as `not run` and rejects `not applicable` claims until authoritative Hosting/Testing binding exists. This remains intact. Timing does not resolve guard/T118's release-pair prerequisite, the Windows skip, the scheduling gap or any applicability issue.

## G1 — One existing record, additive timing only

The record retains `{ candidate, host, node, suites, cases }`, every Case's original `case`, realization `owner`, `suite`, `file`, `outcome` and `reason`, and every suite's fields/status. Add:

```js
schema: "guard-run-timing/1",
producer: { revision },
// on a qualified Case only:
timing: {
  ms, unit: "ms", scope: "case", event, occurrences: 1,
  fileVersion: { before, executed, after }
}
```

The existing record may carry a `timingEvidence` section referencing the terminal events, their Case bindings, load receipts and timing findings, so an event locator remains resolvable in the same retained artifact. These are support for the existing record, not a new history recorder or store. Retain source/proof identities and digests, not duplicate raw source-file contents.

A legacy or unqualified Case has no fabricated timing. Emit a named timing finding, preserve the original outcome, and leave Engineering to report the observation unknown. Additional timing validation must not become a new release/CI gate or change C129's outcome validation. Contradictory execution evidence is also a producer defect to investigate, not permission to repair an outcome by changing telemetry.

## G2 — Exact execution occurrence, not a title match alone

Keep Node's terminal instance id, worker/process identity and suite invocation, along with file, path/hierarchy, event kind and outcome. An event reference is unique across invocation + worker + instance; an instance id or a title alone is insufficient across workers/runs. The trusted bootstrap assigns invocation/worker identity. Do not accept a test-authored string as that authority.

Reuse C129's owner declarations and matching relationship. Establish a separate binding from the existing `(suite, original Case, file)` row to terminal event references. Exactly one eligible instance must bind to a timed Case, and the same event cannot time two Cases. Preserve the original manifest identity and full path; do not shorten it to a convenient `guard/T…` substring. Repeated matching events may still be aggregated by the unchanged outcome rule, but have **unknown timing**, never summed, averaged, or selected by speed.

A declared Case's inclusive time can include implementation-only subtests when they are not separately included Cases. If a declared parent and declared descendant are both in the timing population, their overlapping times are unqualified until the Case/suite owner supplies a non-overlapping cohort decision. Do not silently drop either declared outcome or sum the two. Missing/unresolvable hierarchy is a timing limitation, not inferred independence.

## G3 — Duration and outcome eligibility

Copy a finite nonnegative duration from the eligible terminal event in milliseconds. Preserve an observed zero. Missing/non-numeric/non-finite/negative values are unavailable, not zero. The duration field's units and pinned runner schema must be established before capture admission; no wall clock, job/suite elapsed time or child-time sum substitutes for it.

A completed `pass` or `fail` event can carry timing. Keep a completed failure failed, including its original reason. A skip/todo, suite aggregate, missing event, unsupported kind or a Case that did not execute supplies no Case duration. Node can report a duration even for a skip; that value is not execution evidence. A contradictory Case outcome/event gets a timing finding and stays unchanged as an outcome record; address the producer defect separately.

## G4 — Executed-file version, not equal read-back hashes

The three SHA-256 values describe the declared file before loading, the actual source supplied for evaluation, and the file after the invocation. Multiple Cases in one file may share that file's supported load identity while retaining distinct event references. Require a unique supported load for that file/worker/invocation, matching the event and the independently established candidate context. Before/loaded/after identities must agree for this initial schema's qualified sample.

An observed load of B between before=A and after=A is unknown for the A sample. Never manufacture `executed` by copying before, after, Git's blob id, or a post-run file hash. Equal read-back hashes alone prove neither the loaded source nor absence of intermediate changes.

**Proposed mechanism to qualify before DO:** a Hosting/Engineering-owned, pinned Node preload observes the source returned through the final approved loader path for direct JavaScript test modules; Foundation hashes exactly those source bytes. The approved chain must identify or exclude other transforms, eval/VM sources, repeated loads and unsupported formats. Guard consumes this evidence; it does not add a private host/file loader implementation to its package.

The pinned loader/source mechanism must also establish the source-consistency scope required by #775. Any detected mutation or unestablished consistency remains unknown. A receipt label alone is not proof. The initial local probe below observes only one ESM load; it does not establish a final complete loader chain, absence of intervening writes, cross-host source consistency or a security boundary against arbitrary test code. Hosting/Engineering must provide and demonstrate the supported mechanism before real samples qualify; otherwise omit timing and report that limitation.

## G5 — Independent context and receipt binding

A reviewed bootstrap supplies allowed producer revision, candidate, host, Node, invocation and supported receipt references independently of record claims. Event and load context must agree. A Case cannot qualify using another worker's load, another invocation, another host/candidate, an unreviewed producer, an unsupported transform chain, a post-test read-back or an arbitrary receipt copied into JSON.

A receipt identifies file/worker/invocation, loaded digest, approved mechanism/chain and source-consistency evidence. It is a reference to an actually established owner result, not a new self-attesting Guard certificate. The pure binding tests model that trusted input only. They do not implement receipt authentication, artifact integrity or Hosting source capture. Engineering still independently binds the resulting artifact to service run/attempt/job and tested synthetic checkout metadata, as #775 requires.

The Case-file digest is a conservative version proxy, not the whole dependency closure or proof that a particular Case was edited. Imported fixture/harness versions belong in Engineering's comparability evidence. Neither a new hash nor a faster duration proves successful behavioural refactoring.

## G6 — Proposed projection seam and ownership

The future `engineering/guard/timing.mjs` exposes:

```js
attachTiming(outcomeRecord, evidence, authority)
// -> { record, findings }
```

It is a pure, additive projection over already captured plain evidence. `evidence` contains context/producer, terminal `events`, declaration-to-event `bindings` and file `loads`; independent `authority` supplies the allowed context/producer and established receipt results. The test fixtures define the exact proposed input shape. The projection neither authenticates that authority nor creates a receipt. It preserves every original input and outcome field, adding only qualified timing and its support/diagnostics. It imports no host mechanics, computes no timing statistics, and does not decide original process exits.

| Concern | Owner / obligation |
| --- | --- |
| Case declarations, original identity, outcome matching, new binding projection and record serialization | Guard's existing C129 producer/harness. Reuse its declarations/matcher; do not copy a second suite parser. |
| Node/file/load mechanics and established source-consistency evidence | Hosting/Engineering through an approved reusable mechanism; demonstrate the exact supported chain and unknown paths. No private Guard OS implementation. |
| Byte digests | Foundation only. |
| Trusted workflow/job/candidate context, retained artifacts and history | Engineering, independently of candidate record labels. |
| Timing statistics, recurrence and behavioural preservation | Testing's public interfaces, called by Engineering. No such algorithms are added to Guard. |
| Whether the proposal and readiness evidence are accepted | Owner and affected concern owners. This PLAN cannot attest its own acceptance. |

## G7 — Preserve execution, completeness and exits

C129 records every declared Case as before. No new skip, prerequisite, applicability rule, filtering, retry or suite rerun is introduced for timing. Capture failures must retain the original record and original runner exit; the approved capture mechanism passes through the original loader's result/error and never transforms source or turns a failed run GREEN. Timing capture diagnostics remain observational.

The real integration must demonstrate that the original C129 validator/gate and exit calculation produce the same results with telemetry removed or present, including original 0/1/2 exits, missing Cases and failed runners. Projection tests establish preservation of record content only; they do not prove those process/workflow properties. A timing instrumentation error must not prevent the base outcome record from being produced. Preserve an actual underlying runner/load error rather than swallowing it as "telemetry unavailable".

## Planned producer checks and acceptance boundary

`producer.cases.mjs` is explicitly invoked, not a newly admitted C129 suite. The non-discovery filename avoids silently changing C129's test population during PLAN. A later approved integration must explicitly schedule these cases; passing repository CI now does not mean they ran.

| Local Case | Discriminating expectation | Consumer concern |
| --- | --- | --- |
| P01 | One bound terminal event gives exact ms/true zero and file-version identity. | Engineering E02 |
| P02 | No fallback for missing/negative/non-finite/non-numeric duration. | E01/E02/E06 |
| P03 | Skip/todo/suite/missing event is untimed, with original outcome preserved. | E06/E16 |
| P04 | Duplicate instances, duplicate event ids and one-event/two-Case ambiguity are refused. | E03/E07 |
| P05 | Declared parent/child overlap is untimed; both outcomes remain. | E03/E06 |
| P06 | Before/load/after mismatch, including A→B→A at load, is unavailable. | E02/E11 |
| P07 | Read-back-only, missing receipt, unreviewed chain or unknown consistency does not establish executed bytes. | E02/E04 |
| P08 | Host/candidate/invocation/worker/file bindings must agree. | E04/E05 |
| P09 | Completed failure can have duration and remains failed, with its reason. | E06/E16 |
| P10 | Event/outcome contradiction is a producer finding, not a timing repair. | E06/E16 |
| P11 | Shared loaded-file identity supports distinct Cases; duplicate loads are unestablished. | E03/E11 |
| P12 | The source record cannot establish its own producer authority. | E04/E13 |

Required distinguishing findings are `duration-unavailable`, `execution-unavailable`, `event-ambiguous`, `timing-overlap`, `file-version-unavailable`, `load-binding-unestablished`, `binding-conflict`, `outcome-conflict`, `producer-unestablished`. Each names its affected Case/file/context. A qualified Case's timing object exactly matches #775's proposed shape; none is emitted for an unqualified Case.

`boundary.json` uses Testing's existing `{ concern, owner, paths }` declaration and freezes this whole PLAN directory, including fixtures and this document, after actual Owner-approved integration. The future projection module is the judged subject outside the boundary. Only a trusted authority may select/attest the immutable baseline; this candidate issues no Seal, attestation or unchanged verdict. DO/CHECK must not edit the planned cases, fixtures or declaration to make them pass.

```sh
node --check engineering/guard/plan/timing-producer/producer.cases.mjs
node --test engineering/guard/plan/timing-producer/producer.cases.mjs
```

Current evidence: syntax checks pass; twelve cases are discovered, each blocked before behavioural assertion by the absent `timing.mjs`. This is not clean RED, GREEN or tested negative discrimination. A scratch-only inert substitute is rejected by all twelve on assertions, without TypeError/ReferenceError/SyntaxError; this validates rejection of absent behaviour, not execution of every negative branch. No substitute is committed. Synthetic receipts/hashes are not source capture. The producer DO must establish intended behavioural RED with this boundary intact, then GREEN and mutation/negative discrimination, before claiming the projection works.

### Node probe and its limits

A scratch-only Node `v24.22.1` probe with a direct ESM test file observed seven terminal events: pass, nested child/parent, skip, failure and two same-title instances. All seven carried numeric `details.duration_ms`; the skipped event also did. The repeated title had distinct instance ids 5 and 6. A preloaded synchronous load hook observed source bytes for that one ESM test file. The intentionally failed Case preserved exit 1.

This establishes runner event observations for the probe only. It implements no Guard producer, produces no SHA/file-binding receipt and proves no cross-host/transform/concurrency support. No probe module or recorder is added to the repository. [Node 24 test-event documentation](https://nodejs.org/download/release/v24.18.0/docs/api/test.html#event-testpass) and [Node 24 module-hook documentation](https://r2.nodejs.org/docs/latest-v24.x/api/module.html#customization-hooks) are API references; they do not replace evidence for the pinned runtime/capture chain.

## Bounded sequence and readiness

1. Review this Guard-owned acceptance of the #775 wire shape, event/loaded-source obligations, separate ownership and planned boundary. This is the next proposed decision; it is not already an approved producer contract.
2. Resolve/admit C129 #663 through its own reviewed branch flow, preserving T134/T137 and current applicability refusals. Its current conflicts, release-pair/skip findings and #665 lane integration stay separately governed; this PLAN is not their repair or waiver.
3. Hosting/Engineering establish the supported loaded-source/consistency mechanism and reviewed producer context. Guard then implements the pure projection and minimal extension of its existing reporter/record path, after separate DO authorization. No second recorder or private OS mechanism.
4. Demonstrate real capture against the admitted C129 implementation: same original records/verdicts/exits, unique event mapping, load-source proof and unknown failure paths. Cover supported hosts, symlink paths, concurrent tests, multiple files/workers, loader transformations, interruption and capture failures. The small local probe and pure fixtures do not satisfy these integration checks.
5. Return the accepted producer/schema and real evidence to Engineering's #775 readiness ledger. Engineering still owns source acquisition/history/retention and actual Testing dependency readiness before its separate offline DO. Workflow activation, selection changes, synchronization, promotion and publication remain outside this sequence's authorization.

All producer prerequisites remain open until their evidence and owner approvals exist. Accepting this PLAN can freeze Guard's contract/tests; it does not establish Hosting receipts, admit C129, or turn Engineering's unknown observations into timing evidence.
