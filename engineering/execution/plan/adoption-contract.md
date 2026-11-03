# Engineering C51 adoption: executable acceptance contract PLAN

Owner: Engineering. Target: existing `kaal/ci-execution`, based here on merged #785 at `7e2e4dd7d80a5383910850bb6fbab40d376739fd`. Owner decisions D1/D2 and proposed E-D01–E-D16 were accepted on #787; this PR establishes their concrete API and executable Cases for independent review. No `adopt.mjs` implementation, lane/workflow/root-script change or live activation is delivered.

## Public operation proposed for DO

`engineering/execution/adopt.mjs` will export `run(input, ports)` asynchronously. The implementation is deliberately absent. It is a repository Engineering mechanism, not a new package or capability. Testing owns equality, scheduling and duplicate analysis; Core owns its existing invocations.

`input = { requests, context }` is the declared work to preserve. Each request is `{ id, owner, entrypoint, files, subject, platform, node, ... }`; structured file requests use Testing's `{ path, sha256 }` entries. Unknown/opaque entrypoints must remain executable by their original owner path. `context` identifies workflow, run, attempt, job, platform, Node, arch, cwd, loader/flags, dependency/fixture/seed identity and coverage mode, as applicable. Candidate-provided fields are data, not authority. `qualified`, `activated`, `candidateApproved` or a three-platform measurement object cannot grant sharing.

The output is `{ mode, requestResults, executions, verdict, advice, findings }`:

- `mode` is `original` without independent activation authorization and `reuse` only where authorized. Even authorized mode preserves unqualified original invocations.
- `requestResults` has exactly one `{ id, owner, context, observations }` per required request, preserving owner/context attribution. Shared reads reference the original observation object, never a cloned, flattened or recomputed verdict. Input data is not mutated.
- `executions` describes actual scheduled and original work. A read is not another execution or timing sample.
- `verdict` is the very object returned by the caller's existing owner/gate evaluator, including its exit, failure and uncertainty. Duplicate evidence never overrides it.
- `advice.duplicates` retains Testing's result object unchanged. `advice.schedulingFindings` retains invalid-plan findings. `findings` gives structured codes without turning unknown into success.

## Ports and authority boundary

Ports are wired by trusted Engineering integration, independently of candidate data. Tests use explicitly controlled fixture ports; a fixture's `source` text is not proof of live authority.

| Port | Contract |
| --- | --- |
| `authorize(input)` | Establish independently approved activation for this actual context/candidate and its complete measured evidence, or return undefined. An absent/refused authorization preserves every original request. A future real authority must verify at least three matched before/after pairs on every supported host, required Case/outcome completeness, source/run/attempt provenance and Owner activation scope. A record's own boolean/count labels establish none of these. |
| `qualify(request, context)` | Establish the owner-approved execution contract, exact subject/loaded bytes and wider condition equivalence; return `{ domain, request: TestingRequest, ... }` or undefined. `TestingRequest` is the owner's public schedule request with `by` bound to the original id. A `domain` is an opaque independently established equivalence class, not a candidate's chosen string. No local algorithm replaces Testing's identity semantics. |
| `testing.schedule(requests)` | Testing's exact public signature and result `{ runs, reads, findings }`. Forward all admitted fields unchanged. Never perform a second equality/deduplication algorithm before calling it. |
| `execute(run, domain)` | Execute one scheduled file once and return its original owner observation, Case completeness, event rows and provenance. The actual host/runner adapter owns acquisition. Missing loaded-byte/event receipts cannot qualify sharing; qualified execution cannot be silently retried to obtain a different result. |
| `original(request)` | Invoke the unchanged original owner entrypoint once, retaining cwd/lifecycle and its own observation. It handles host execution failures through the owner's existing observation semantics. No substituted script or successful empty run. |
| `evaluate(requestResults, context)` | Call the existing original lane/owner evaluator after all required work; return its verdict object unchanged. Missing/broken evaluation cannot yield GREEN. This PLAN does not introduce a new assurance policy. |
| `testing.duplicates({ runs })` | Testing's public post-observation interface over actual event occurrences, nested initiators included. No observation is counted once per reader; no fabricated duration, version, subject or loaded-byte binding. Retain unknown result/findings. |
| `publish(report)` | Publish advisory results once, after the original verdict is captured. Publication exceptions do not replace the saved verdict or exit. |

Real qualification/activation providers and the supported original-observation transport still need their own established integration evidence; these unit port fixtures are not those providers. Guard's accepted C129/timing contracts may be consumed where applicable, without importing their unfinished implementations or another recorder. Real loaded-byte/configuration equivalence is a prerequisite, not a future assumption hidden by the domain label.

## Required orchestration behavior

1. Establish activation through `authorize`, not request labels. Without it, execute every original request and report `activation-unqualified` (or `activation-unavailable` on an exception). No cache crosses calls or contexts.
2. Where activation is established, independently qualify each request. Unqualified/opaque/independently required requests execute intact. Core's publisher/boundary invocations and Guard T106's intentional repetitions remain separate. Qualifier exceptions produce `qualification-unavailable` and preserve original work.
3. Partition qualified work by the independently established domain before calling Testing. Different arch/cwd/flags/loader/dependencies/fixtures/seeds/coverage mode are separate domains even with the same Testing tuple. Different Testing identity fields remain distinct owner schedule inputs.
4. Use Testing's runs/reads as returned. A nonempty finding list or a scheduling exception cannot count as complete empty work: preserve all affected original requests, report `schedule-unqualified` or `schedule-unavailable`, and retain the findings. Never fallback after a completed failed/unknown execution to rerun it for a different verdict.
5. Respect the accepted original ordering/run-to-end obligations. A qualified domain may share only where its owner contract also establishes that setup/teardown and interleaving remain equivalent; an intervening mutable dependency prevents qualification. Domain work executes at its accepted position, and every required later original request survives an earlier failure or advisory error.
6. Bind every reader to the exact original observation; retain all Case identities, outcomes/reasons, incomplete/skipped/cancelled/missing/substituted findings and provenance. Do not normalize an owner result into a different success/failure vocabulary. Complete the original evaluation exactly once.
7. Analyze actual execution events once with Testing. Analysis exceptions produce `analysis-unavailable` and unknown advice; publication exceptions produce `publication-unavailable`. Retain the captured verdict object and required exit. A later CLI integration must prove that it actually returns that original exit.

Execute/observation acquisition failures must stay failure/unknown under the existing owner semantics; a port exception is never treated as zero Cases passed. Missing required ports or malformed input must be rejected before optimization and must not fabricate a verdict. Additional integration-specific error cases are frozen with their provider/CLI before implementation or activation, rather than inferred from these fixture outputs.

## E-D01–E-D16 executable boundary

Explicit command:

```sh
node --test engineering/execution/test/plan/adoption.case.mjs
```

The 16 Cases and controlled fixtures are adjacent. They are not selected by the current explicit CI/root/package test entrypoints. They test one-execution/two-read binding, original failure and uncertainty, every Testing identity field, wider domain partitioning, independent Core/repeatability invocations, invalid mixed schedules, opaque scripts, missing/ambiguous receipts, incomplete population, context separation, public owner ports, actual Testing exports, preserved exit/run-to-end on exceptions, attribution/permutation and refusal of candidate-self-claimed activation.

E-D04 uses a fixed distinct-plan oracle to check forwarding; it does not reimplement Testing's equality algorithm. E-D12 preserves owner result object identity. E-D13 imports the actual public Testing module, independently of the mocked owner ports. It is not a fresh packed-installation proof: the focused Testing dependency supplies its own once-packed consumer scenario, and later Engineering real-path/CLI acceptance must prove the same wiring on actual installed bytes before activation. Fixtures are never evidence of production provenance or three-host performance.

E-D15 checks lost-reader/attribution/permutation discrimination. During DO, run separate mutation challenges against the real adapter: extra execution (E-D01), erased failure (E-D02), lost reader (E-D15), omitted Case (E-D10), changed entrypoint (E-D08), missing domain partition (E-D04/05), cross-context cache (E-D11) and activation bypass (E-D16). A nonzero exit from a missing module, syntax error, timeout or blocked dependency is not a behavioural kill. Each mutation needs its identified failing assertion; these obligations are not marked complete by an inert substitute.

`boundary.json` inventories the meaning-bearing Case/fixture/contract bytes using Foundation. It is a proposed review boundary, not a self-issued Seal or acceptance attestation. Independent review anchors its accepted commit/version; DO/CHECK then preserve it. Current approved source-contract references are #785, accepted D1/D2/E-D obligations on #787 and the separately reviewed Testing dependency PLAN.

## Observed test-design evidence

Both files pass syntax checks. With no adapter present, all 16 Cases are discovered and blocked before behavioral assertions. A scratch-only callable inert substitute is rejected on assertions by 15 Cases; E-D13 remains blocked by the absent Testing dependency. This shows those entrypoints reach assertions against inert behavior, not that every negative branch is discriminating or that any Case is GREEN. No substitute or implementation is committed. The actual future DO must demonstrate independent behavioural RED/GREEN, the mutation obligations and real-interface evidence.

## Live candidate investigation and sequence

`candidates.json` records the bounded inspection of actual main CI, not another test recorder. Core's five repeated labels are ineligible by accepted D1. Same labels in Graph/Core belong to different source files/package subjects; Guard's repeated diagnostics reuse C136's existing observation. No additional independently qualified redundant group was established within the inspected three Linux jobs. No saving or optimization is claimed; this is not an exhaustive proof about all CI, nested processes or future runs.

Sequence: review the focused Testing dependency PLAN and this acceptance boundary independently; authorize and verify the narrow Testing DO; separately promote that dependency through the normal route; synchronize main into `kaal/ci-execution` by merge commit when separately authorized; implement this accepted Engineering contract test-first; qualify a real candidate with its owner; measure at least three matched pairs on Linux, Windows and macOS; request actual-path activation only after complete assurance and measured benefit. No Priority 3/4, cross-job cache, required-check/ruleset change, broad collector promotion or npm publication is introduced here.
