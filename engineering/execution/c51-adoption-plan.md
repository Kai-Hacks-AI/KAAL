# Engineering PLAN: adopt Testing C51 for execution reuse

Owner: Engineering. Testing owns duplicate identity, planning and evidence semantics. This is a PLAN for a focused delivery through `kaal/ci-execution`, established from `main`; it does not add work to `kaal/engineering`. The capability owner and the delivery branch are distinct.

## Objective and boundary

Consume Testing's public `duplicates()` and `schedule()` to remove demonstrated redundant Case execution within one execution and one qualified set of conditions. Preserve the complete applicable Case population, original verdicts, owner attribution and provenance. Prove actual CI savings against the current baseline before enabling suppression.

This Change adds this document only. No runner, package script, test, workflow, required check, dependency, publication or promotion changes. Approval of this PLAN is not approval to activate deduplication. Subsequent contract/Cases, implementation and any workflow integration travel as bounded, independently reviewed Changes.

## Pinned inspection

Inspected promoted baseline: `be3a2d09a386967bd5a1cd4a850f389951bc0796`. Testing C51 is integrated into `kaal/testing` at `79524490a219b9f622052047d891f2bd30e631b6` through [#781](https://github.com/Kai-Hacks-AI/KAAL/pull/781). It is not on the inspected main baseline. No Testing collector contents are imported here.

| Path at the promoted baseline | Observed behavior | Consequence |
| --- | --- | --- |
| `engineering/lanes/suites.mjs` | `covers()` recognizes literal `npm run`, identical commands or an equal-preamble file superset. An opaque runner remains uncovered and its suite runs separately. | Conservative today; relaxing the parser without authoritative execution evidence risks omissions. |
| `engineering/lanes/comprehensive.mjs`, `engineering/lanes/plan.json` | Root `npm test` orchestrates Engineering, package and External suites; owner results remain separate, and an unaccounted External context remains unresolved. | Preserve all three contexts and the unresolved state. Root comprehensive is not the present CI Workspaces command. |
| `engineering/lanes/workspaces.mjs` | CI Workspaces runs each non-Hosting workspace's own `npm test`, failing on a missing entrypoint. Optional evidence mode captures coverage while running, without an extra test run. | Adopt at one declared execution boundary; do not count different CI jobs as duplicates. |
| `engineering/lanes/evidence.mjs` | Captures workspace status/coverage with commit, CI run/attempt, platform, architecture and Node, refusing overwrite. | Reuse existing record ownership. It does not yet establish per-Case timing or loaded-file receipts. |
| `engineering/lanes/acceptance.mjs`, `engineering/delivery/pack.mjs` | Packs once, installs scenarios fresh, records their results and checks unchanged packed/build bytes. | Fresh consumers, scenario environments and package identity must survive. Packing once does not prove that separate consumer runs are redundant. |
| `.github/workflows/ci.yml` | Runs Workspaces and Engineering on Linux, and Acceptance, Hosting and Guard across the supported hosts. | The complete applicable matrix stays required. No cross-host/job reuse. |
| `engineering/guard/acceptance/package.test.mjs` | C136 shares its full clean-consumer run; T106 intentionally performs a second reduced-consumer run to test repeatability. | The intentional second execution is assurance, not an optimization candidate. |

### Candidates, not yet measured CI defects

Foundation's source `test/run.mjs` invokes its declared publisher and embedded suites. The comprehensive runner sees `test = npm run test:all`; it marks `test:all` covered but cannot prove the opaque runner covers publisher/embedded, so it can invoke them again. Core's source `test/run.mjs` similarly invokes its declared suites, which the comprehensive runner cannot infer from `test = node test/run.mjs`.

Separately, Core's `test:publisher` and `test:boundary` name `dist-test/boundary.test.js`. Core's own source runner invokes both suites. This is a static indication of overlap on a path that CI Workspaces reaches, not proof of the same loaded bytes, subject, conditions or an unnecessary execution. Builds, preambles and independent assurance obligations must be established with Core before any sharing.

These are two distinct investigations: comprehensive orchestration overhead and a package-owned potential duplicate in live CI. An optimization demonstrated only in local comprehensive `npm test` cannot be advertised as a CI speedup. Engineering does not rewrite a package's scripts or reinterpret the package's test obligations to obtain savings.

The earlier Guard full-suite duplication was corrected by C136 and promoted in [#763](https://github.com/Kai-Hacks-AI/KAAL/pull/763). Its reported Windows 15m28s saving is not a C51 adoption estimate. **Current measured incremental saving from this PLAN: none; C51 alone still changes no live lane.**

## Ownership and dependencies

| Concern | Owner / prerequisite |
| --- | --- |
| Equality, waste, pure `duplicates()` / `schedule()` behavior | Testing F89–F92 and N19, accepted in C50/C51. Consume public interfaces; do not copy their algorithm into Engineering. |
| Complete required suite population and orchestrating those suites | Engineering, using the existing accepted Test Plan and each owner's declared contract. Requester labels are attribution, never independent proof of coverage. |
| Whether two package-owned invocations may share one observation | Owning capability plus Engineering integration review. Core and Foundation are consulted for the candidates above. A declared independently required run is kept. |
| Execution boundary, config equivalence, acquisition, reporting and original exits | Engineering. Guard supplies its established record and matching mechanism where applicable. |
| Executed-byte identity and host operations | Hosting's supported operations/receipts and Foundation's public SHA-256. Read-back equality alone does not prove which bytes a loader executed. |
| Case-event matching / C129 record extension | Guard. Reuse the approved timing producer contract from #780 and Engineering's accepted timing contracts (#773/#775) where those channels apply; their collectors/unfinished implementations are not imported. C129 #663 and lane integration #665 remain separate dependencies if this work uses them. |
| Testing delivery into this target | Not satisfied by C51's collector merge. Before live DO, use a separately approved governed Testing promotion and main synchronization, or obtain explicit review of a narrowly inventoried dependency transfer from main. Do not merge `kaal/testing` into this collector or silently cherry-pick C51 and its accumulated dependencies. |
| Installed Testing verifier and final publisher/consumer layout | C38 #718 remains separate release work. A source-workspace green result or direct packed API exercise is not installed `npm test` release readiness. |

C51's module imports nothing, but its package and integration prerequisites still exist. Inventory the exact target lockfile, public package identity, export and available packaged bytes before selecting the dependency route. No npm publication is authorized by this PLAN. The existing focused-collector pattern does not authorize dependency promotion automatically.

## Proposed integration contract

1. **Establish one execution domain.** Include authoritative candidate/subject, required suite population, file versions, platform, Node, architecture, loader/flags, relevant environment/fixtures/seeds, dependency/packed bytes, coverage mode, cwd and setup/teardown obligations. Testing's tuple alone does not prove all these equal. Partition independent or unequal domains into separate calls; do not invent Testing identity fields or overload a digest to hide uncertainty.
2. **Retain the canonical source of requests.** Derive requests from accepted suite declarations and their supported execution contracts. Do not infer that arbitrary shell scripts, dynamic globs or nested runners are equivalent. An opaque or unknown obligation runs normally and is reported as unresolved for optimization; it is never considered satisfied by another run. Preserve the original assurance verdict separately from this optimization status.
3. **Call `schedule(requests)` before a qualified group executes.** Pass exact file paths, file-byte SHA-256, subject and conditions, with unique requester identities. Retain its full `{ runs, reads, findings }`. A finding must not become a successful empty job: do not suppress any affected original request. Execute the original path for an unsupported/invalid optimization group and disclose it; never use fallback to hide a failed required run.
4. **Preserve lifecycle and observation identity.** Execute each scheduled file once within its established domain and bind every `reads[].run` to the exact original observation. Both a failed and an unknown run fan out unchanged to all requesters. No retry-to-green, fastest-observation selection, fabricated per-owner verdict, cross-process serialization of private evidence, or claim that a schedule is evidence. Use only an accepted original-observation transport; without one, keep executions separate.
5. **Keep each assurance result.** Preserve Case identity, file version, owner, suite/context, event occurrence, original outcome/reason and completeness. A failed or unknown observation cannot satisfy an independently required later run. A missing expected Case, missing entrypoint, interrupted child, changed bytes, unsupported loader or unbound observation remains visible and prevents claiming complete shared assurance. Preserve the original lane's nonzero/unresolved behavior and run-to-end obligations.
6. **Call `duplicates(execution)` after observation.** Supply actual per-Case events including nested occurrences and their initiating `by`, with observed duration and loaded-file binding. Reuse existing Guard/run evidence rather than another test recorder. Preserve Testing's result and findings unchanged, and name owners for action. An advisory duplicate challenge never chooses the verdict. Missing timing/identity is unknown, not zero waste or unchallenged. Intentional repetition stays declared and executed; describe it separately without changing Testing's duplicate semantics.
7. **Do not share across CI checks.** Separate job, attempt, workflow, platform, fresh consumer, RED/GREEN subject, mutation, repeatability step and independently required context are separate domains. The full required matrix remains. This is execution reuse within qualified work, not impact selection, job aggregation, a cache or artifact-based reuse across runs.
8. **No shell surgery.** Engineering preserves package-owned entrypoints, cwd and lifecycle hooks. Directly scheduling files from an opaque `npm test` requires an owner-approved execution contract proving equivalence and retaining its setup, teardown and summary semantics. Otherwise leave the script intact and report the candidate. Any required owner-side change has its own bounded PR.

## Required acceptance scenarios for the next contract/Cases Change

These are proposed scenarios, not executable GREEN or behavioural RED claims. Establish immutable tests and their fixtures/helpers in a separately reviewed boundary before DO.

| Scenario | Required observation |
| --- | --- |
| Two qualified requesters, identical file/subject/conditions | One actual child/file execution and two readers bound to its original observation; complete Case inventory retained. |
| Shared execution fails or is unknown | Every reader keeps that failure/uncertainty; no rerun, success substitution or erased diagnostic; original exit/completeness retained. |
| Each identity dimension or relevant configuration changes | Separate executions; prove file path, bytes, subject, platform, Node, arch, flags, cwd, dependencies, fixtures and coverage-mode isolation. |
| Separate required context with an identical Testing tuple | Separate scheduling calls and actual executions; no retained cache. Include Guard T106's intentional repetition. |
| Invalid request beside valid requests | No affected original run is suppressed; findings remain visible; invalid empty plan cannot yield false completion. |
| Opaque runner, dynamic file list, lifecycle setup or teardown | Original script runs unchanged unless its owner-approved execution contract establishes equivalence. |
| Duplicate events, ambiguous title matching or missing loaded-byte receipt | Optimization remains unqualified; no event is picked as authoritative because it is faster or GREEN. |
| Missing, skipped, cancelled, incomplete or substituted Case | Same original failed/unresolved assurance, never a complete shared run. Required population is established independently of the candidate's claims. |
| Multiple requesters/owners, arbitrary request order | Deterministic scheduling through Testing and separate attribution to the same original observation; no merged owner verdict. |
| Distinct attempts, platforms, clean installations and RED/GREEN mutants | Every required execution survives. A same-title/same-candidate label cannot collapse its provenance. |
| Wrong adapter mutations | Killed by behavioral assertions: duplicated execution, lost requester, overwritten failure, omitted Case, changed entrypoint, dropped isolation dimension and accidental cross-job reuse. Missing export/import errors are blocked evidence, not a behavioral kill. |
| Complete unchanged matrix | Existing reference-host and Linux/macOS/Windows acceptance, Hosting and Guard assurance remain; no workflow/check or applicability weakening. |

Keep orchestration tests isolated through Testing's public ports and Hosting execution seams. Also establish real-interface contract/packed integration tests; mocked ports cannot prove real provenance, loader behavior or lane activation. Case assertions supplied by other owners are not edited by this DO.

## Performance experiment and activation criteria

First observe the current actual CI path after C136. Identify at least one redundant occurrence by Case, exact loaded bytes, qualified domain and requester. Obtain the owning capability's decision that it is not independent assurance. If none is established, report no eligible optimization and do not activate suppression or invent a savings target.

For the first admitted candidate, record matched baseline/candidate measurements on Linux, macOS and Windows, with at least three independent before/after pairs per host and alternating order where practical. Each measurement is its own execution. Pin runtime/dependencies, candidate and Case/test-data versions, supported runner/image/configuration, applicable inventory, command and setup/coverage mode; record any residual difference and keep cold/warm states distinct. The performance comparison may change adapter bytes only; all other differences must be controlled or disclosed. Use CI's job/step evidence and established terminal-event timing/loaded-byte binding, not elapsed time invented from Case totals.

Report, per host and pair: original and shared execution counts, unchanged required inventory and outcomes, removed redundant occurrences, wall/step time, timed Case work, adapter/setup overhead and qualified/unknown coverage. Present all pairs and medians, absolute and relative deltas, spread and measurement limitations. Never equate `wastedMs` with critical-path saving where Cases run concurrently, or attribute previously promoted C136 savings to this Change. Do not claim statistical certainty from three pairs.

Before activation, require measured positive benefit in the affected live CI path, complete negative/mutation discrimination, preserved owner results/provenance and unchanged required checks. A slower or unqualified host remains an explicit limitation requiring review, never a skip. The Owner reviews the actual evidence and activation scope separately. Until then the existing execution path is authoritative; observational shadow is advisory and must not rerun the suite merely to collect timing.

## Delivery sequence and merge methods

1. Review this bounded PLAN on `kaal/ci-execution`. Land by **squash** after independent Owner review and required CI. No auto-promotion.
2. Establish an owner-reviewed first candidate and its baseline; resolve Testing/producer/observation prerequisites. If a dependency must cross collectors, inventory it and review the governed route first. Do not transplant unrelated Engineering timing, selective-CI, stable-gate or unfinished Testing work.
3. Establish the executable acceptance boundary, then implement the reusable Engineering adapter and its real-interface integration test-first. Work through the focused collector. A required `.github` integration remains a separate Change under Change Isolation.
4. Validate shadow and the matched performance experiment with the full matrix; propose activation only for the demonstrated domain. This PLAN authorizes no immediate live suppression.
5. Any later main synchronization lands by **merge commit**; a separately authorized focused collector promotion to `main` lands by **squash**, subject to freshness and promotion order. Delete/re-establish the collector under the existing lifecycle after promotion. No npm publication is implicit.

PLAN verification is limited to pinned source inspection, source/dependency attribution, an Engineering-only Markdown diff, trusted Branching/Change Isolation judgments and repository CI. It is not proof that a live adapter exists or that any execution has been saved.
