# Live CI reuse qualification — CHECK and next PLAN

Owner: Engineering, coordinating with the Case/suite owner, Testing, Hosting and Guard. Delivery target: `kaal/ci-execution`, after #799 at `8ec786f0bc6126c2d1c0ec84aba8d1ae04cfb69f`. Testing C51 is already on main through #796. This Change contains this PLAN and a read-only inspection snapshot. It adds no provider, recorder, runner, executable acceptance Case, activation, benchmark, dependency or workflow change. The accepted E-D01–E-D16 boundary remains unchanged.

## Result and coverage

**No eligible live reuse group was established. Preserve current execution.** The inspection covers all 11 job logs in completed [main CI run 41321727424](https://github.com/Kai-Hacks-AI/KAAL/actions/runs/41321727424), attempt 1, `.github/workflows/ci.yml`, source `dd39d3be7b3d51b47658c7fdafa1b7b3799f3e44`. Its source is the currently inspected main and includes C51/C136. The matching source, entrypoints, existing records and repeatability contracts were inspected. `inspection.json` pins job URLs, checkout lines, reported summaries/skips, visible repeated-label locations, dependency heads and 23 Git/source digest bindings. These source digests identify inspected bytes; **none is a runtime loaded-byte receipt**.

The expanded coverage is one run's Linux Workspaces/Engineering and three-host Hosting/Acceptance/Guard, rather than the three selected Linux jobs in the earlier `plan/candidates.json`. The snapshot supplements that historical evidence; it does not rewrite it. It is neither an execution recorder nor an authoritative Case inventory. Nested child streams are sometimes captured rather than printed; no visible repeated label is not proof that no child repeated work. The snapshot's exact-label scan is an inspection aid, not an execution equality algorithm or qualification decision.

| Observed overlap | Evidence and disposition |
| --- | --- |
| Five Core boundary Case labels in publisher and standalone execution | Workspaces log lines 247–251 and 544–548; the owner runner declares both paths. Accepted D1 on #787 preserves both. No suppression or new Core redesign is proposed. |
| Core boundary suite title appears twice | Lines 252/549 are suite aggregates, not a sixth Case. |
| Three Core/Graph Form labels | Lines 258/259/261 and 649/650/653; source files are `packages/kaal-core/test/core.test.ts` and `packages/skills/kaal-graph/test/graph.test.mjs`. Package/subject and test responsibilities differ. Equal text cannot qualify sharing. |
| Generic “undecidable” boundary label appears three times | Lines 249/546 belong to Core; line 770 belongs to Testing's own package boundary. Different inspected module populations; Core repetitions retain D1. |
| Foundation/Core structured results and human-readable output | Workspaces lines 173/183/558 and their verifier sources. A summary and its presentation can describe one observation; they cannot be counted as two executions. Publisher, embedded and fresh-installed verification also retain their own subject/context. |
| Repeated Guard clean-consumer diagnostics | `whole()` already retains one full observation under C136. `repeated()` deliberately performs two reduced-consumer verifications for T106. Failure/mutation consumers and lifecycle checks have different obligations. C136 savings are excluded. |
| Same tests on different hosts/jobs, or different fresh consumers | Independent assurance contexts. No cross-job, cross-host, cross-attempt or installation cache. |

The exact-label scan found nine repeated presentation labels within Workspaces, including a suite row; no repeated label within the other ten jobs' scanned spec/TAP output. That is a statement about those presentation rows only, not nine duplicate Cases or an exhaustive child-execution result. Structured records and Guard diagnostics were separately inspected. No row is suppressed.

## Findings and assurance limits

**Verified failure:** this investigation establishes no deterministic production performance defect. A repeated title or an opaque runner is not one. Existing CI success is not proof of execution equivalence.

**Potential defect:** an unobserved redundant child may exist, but these logs do not establish one. The visible Core overlap remains excluded by D1. No positive savings target or defect-correction claim follows.

**Architectural concern:** a second event recorder, private loader implementation in Guard, copied Testing identity algorithm or candidate-authored authorization would create competing authority. This is a design concern to avoid, not an attestation that a future provider is sound. Existing owner interfaces and records remain the proposed route.

**Unknown:** loaded source and consistency across the final loader chain; complete hidden-child occurrence inventory; independently approved wider configuration/lifecycle equivalence; supported original-observation transport; and the future production authorization scope. Existing skips remain unknown assurance: Guard Windows has one, Hosting Windows two, Acceptance Windows one and Acceptance macOS two, with original names/reasons retained in the snapshot. No skipped Case is treated as passed or a candidate for removal. Existing Acceptance unknowns concerning physical host containment and unrecorded installations remain unresolved.

No benchmark was run and no extra suite was executed for this inspection. Current live execution reduction and demonstrated incremental CI wall-clock/summed-Case savings are **zero**. Expected benefit for a future eligible group is **unknown**, pending actual qualification and matched measurement. Job duration, inclusive parent time or `wastedMs` must not be relabelled as saved CI wall-clock time.

## Exact dependencies and ownership

| Concern | Available or pending state | Required boundary |
| --- | --- | --- |
| Public scheduling and duplicate analysis | `kaal-testing@0.0.1`, `kaal-testing/duplicates`, main #796 at `dd39d3b` | Reuse `schedule()` and `duplicates()` unchanged. No new algorithm. |
| Engineering orchestration | #799, collector `8ec786f`; adapter digest `3e15b54e084f96f8599da8b3f337e62d969d0f3341dc8fd96a58c41abd1b4826` | E-D01–E-D16, seven additional tests, eight mutations and packed three-host fixtures are component evidence. They authorize no production provider or sharing. |
| Host operations and digests | Existing `kaal-hosting@0.0.1`; `@kaihacksai/kaal-foundation@0.0.1`, public `/sha256` | Hosting owns host/load mechanics. Foundation owns digests. A file hash or before/after equality alone does not prove what a loader executed. |
| Current production Guard and coverage capture | `@kaihacksai/kaal-guard@0.0.4` runner reports check exits; `engineering/lanes/evidence.mjs` optionally retains coverage/run provenance | Neither inspected interface supplies the complete per-Case loaded-byte/occurrence/equivalence proof required for sharing. Existing coverage capture is not a replacement timing recorder. |
| Existing richer producer route | Guard #780 PLAN merged into `kaal/guard-release`, reviewed head `40c9be5415131632f86de4e393865ce0b1e19140`; proposed `guard-run-timing/1` | Reuse C129's existing declaration/matching/record ownership. PLAN G2/G4/G5/G7 requires unique event/worker/invocation binding, actual supported loaded source/consistency, independent authority and unchanged original records/exits. Its fixture projection is not the host capture mechanism. |
| Unfinished producer and lane | #663 remains open at `5a961d16de0611db6d608246f5f5596697d80612`; #665 remains open at `a127ba0ade640fbd6e4fce55dfefc9dc5059f8f3` | Separate owner-reviewed Changes. Their current heads are inventory, not approved dependencies to transplant. No code from either is imported here. Any required delivery must be narrowly inventoried and use normal collectors/main/SYNC. |
| Live group and original entrypoint/observation contract | Not established | The Case/suite owner must identify which observation may satisfy which required requests and why that loses no independent assurance. No fixture domain or measurement label grants authority. |

The C129 route is the existing Guard-backed evidence proposal, not a declaration that all future candidates must belong to Guard. An alternative owner producer needs its own concrete contract, evidence and justification; this PLAN does not authorize a competing generic recorder. Timing/refactoring statistics from other Testing collectors are not dependencies of this negative qualification result and are not imported.

## Next executable boundary, before provider/CLI DO

The next implementation boundary must be tied to a **concrete live group and admitted owner interfaces**. With neither yet established, this Change defines the following review obligations; it supplies no pretend executable GREEN, synthetic production receipt or DO activation request.

| Boundary to freeze with fixtures and expected assertions | Required discrimination |
| --- | --- |
| Owner qualification and independent context source | Missing/refused authority, self-claimed qualification, copied domain/producer label and another job/attempt/host/consumer/run cannot enable sharing. Preserve the actual original entrypoint, flags, cwd, setup/teardown and ordering. |
| Supported loaded-byte and event acquisition | Same title in different files, two instances/workers, ambiguous/absent terminal events, unsupported transforms, duplicate loads, changed dependency/fixture/configuration, and before=A/load=B/after=A remain unqualified. Pin the supported loader chain and consistency mechanism; the mechanism must pass through the original load result/error. |
| Original owner observation and actual CLI exit | Preserve all required Case identities/outcomes/reasons/provenance, including failed/unknown/incomplete/skipped/cancelled/missing observations and real exits 0/1/2. Acquisition/evaluation errors never exit GREEN, required later work survives, completed failures/unknowns are not retried. Establish any cross-process transport with its owner rather than serializing private evidence by assumption. |
| Advisory acquisition, retention and publication | Instrumentation failure cannot replace the base outcome record or exit. Capture once during the original run; no suite rerun to produce telemetry. Retain the existing producer/history, with service run/attempt/job/checkout binding and artifact evidence independent of candidate labels. Multiple output representations/readers are not more event occurrences or timing samples. |
| Provider-to-adapter public interfaces | Preserve the frozen E-D boundary; call Testing's real public APIs on admitted requests. Mock other owners' interfaces in implementation tests and separately test their installed integration. Qualifiers and activation providers must have independently accepted production evidence; port fixtures alone do not supply it. |
| Original-path shadow and measured experiment | Keep production behavior authoritative until independently approved activation. At least three matched before/after pairs per Linux/Windows/macOS; exact required population, outcomes/failures/unknowns and contexts retained. Separate wall-clock from summed non-overlapping Case work and disclose overhead/spread. Test actual CI paths with RED/GREEN and assertion-killed mutations, not only the comprehensive local runner. |

Before DO, convert these obligations into an executable, independently reviewed, digest-bound Case/fixture boundary for the admitted interfaces and named candidate. Run independent behavioural RED before implementation; preserve those assertions through GREEN and mutations. Continue the existing three-host assurance without adding skips or weakening any gate. A workflow change, if actually needed, travels alone under Change Isolation. This document does not admit a workflow or require Priority 3/4 work.

## Bounded sequence and decision requested by this PLAN

1. Independently review this expanded negative qualification finding and source/dependency inventory. Continue every existing execution; do not implement a speculative live provider simply to give the inactive adapter a consumer.
2. Obtain an owner-reviewed live group, or report that none has emerged. For the existing producer route, the owner-controlled C129/load-source/context prerequisites must be established through their own focused deliveries. No unrelated collector promotion and no new parallel recorder.
3. With a concrete group and interfaces, freeze the executable provider/CLI boundary above before DO; establish real original-path observation and equivalence without suppression. Missing prerequisites retain original execution and visible unknown findings.
4. Only after those contracts, DO and actual-path assurance are reviewed, perform the matched performance experiment. Return all pairs, original outcomes and uncertainties for a separate Owner activation decision. If no safe positive benefit is demonstrated, retain original execution.

This PLAN may land by **squash** into `kaal/ci-execution` after independent Owner review and required CI. It authorizes no provider DO, suppression, measurement campaign, main promotion, npm publication or assurance-policy change. The inactive adapter can be considered for a separate normal focused promotion; such promotion does not remove the qualification prerequisites or demonstrate performance savings. Any required development/main SYNC uses a **merge commit**; promotion uses **squash**, after freshness and promotion-order review. No hotfix is demonstrated.
