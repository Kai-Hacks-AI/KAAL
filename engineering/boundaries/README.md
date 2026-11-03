# Engineering's Boundary Test Plan

> PLAN (engineering/C10): nothing below exists yet. The Owner's alignment on #641 (comment 6510155607) asks for an Engineering-owned Boundary Test Plan, built on Testing's existing model and not on a new framework. It is revised to the Owner's alignment on #649 (comment 6516997200): Boundary Test Suites are capability-owned, shipped, reusable assurance assets, and Engineering is one consumer of them. This is a bounded Engineering Change, separate from engineering/C7 (#641), the consumer-verification conformance PLAN, which it leaves unchanged. Approving this PLAN authorizes only its DO, on `kaal/engineering`, and only once the prerequisites below are on `main`.

## Who owns what

| Concern | Owner |
| --- | --- |
| A boundary definition, and the Boundary Test Suite that tests it. The Suite ships with the provider's package as a reusable asset: executable checks, and review instructions for judgments a check cannot establish deterministically | The Capability whose boundary it is. Hosting is the first provider: host and OS coupling, in production code and test code (#650) |
| Strategy, Plan, Suite, Case, Run, result and applicability semantics | Testing: testing/F24–F33, planned in testing/C14 and delivered by testing/C15 (#630) |
| Validation judgments and their evidence | Review |
| Escalating a judgment from an Agent to a human, when one is needed | PREACH |
| Engineering's Boundary Test Plan: which Suites, targets, execution contexts and review obligations apply, with explicit exclusions | Engineering, in this Change. Consumer repositories and agent workflows may compose Plans of their own from the same Suites |
| Correcting a finding | The target Capability, in its own Change |

Engineering adds no boundary rule of its own, owns none of a provider's semantics, and judges no finding.

## The Plan, in Testing's terms

- **engineering/F12. One Plan.** The Boundary Test Plan is a Testing Plan (testing/F25). It names each provider's Boundary Test Suite by its identity, and selects the review obligations that the provider's review instructions attach to it. Engineering defines none of the Suites' Cases and writes none of their instructions.
- **engineering/F13. The applicability matrix.** The Plan enumerates, explicitly, every KAAL Capability package as a target against every Boundary Test Suite. Each cell is one of:
  - **applies**, with its execution contexts and review obligations: the platforms it runs on, the sources it inspects, production code and test code (publisher-only tests, scripts, fixtures and helpers included) unless the cell says otherwise, and the provider's review instructions that apply to its findings;
  - **excluded**, with a reason and the evidence for it. Within a Plan Run, an excluded cell's Cases are declared inapplicable before the run, as testing/F26 defines, and an observed outcome is never hidden by the declaration.

  The matrix is written once, in the Plan, and nowhere else.
- **engineering/F14. Omission is a finding.** A Capability package that is not a row of the matrix, a provider's Suite that is not a column, and a cell with neither "applies" nor "excluded" are each a finding, naming what is missing. None counts as compliant. The Plan Run is then `unknown`, as testing/F27 gives for an unknown Case.
- **engineering/F15. Runs and reports.** Engineering discovers the targets and the providers' Suites, runs each applying cell in its contexts, and reads every result through Testing (testing/F26–F31). It reports per target Capability. Each finding names:
  - the source location, file and line;
  - the rule, and the **boundary owner**, which is the Suite's provider;
  - the target Capability, which owns the correction.

  A cell's Case results are the provider's own. For Hosting's suite, each entry of the line's `cases` is one Case, with its result as given: verified, failed or unknown, in Testing's terms. The command's exit status must agree with the line, and a disagreement is a finding. Exit 3, verified with review requested, is not a failure. Engineering checks the line's `sources` against the cell: a cell that applies to test code with no test-scope source read, or to production code with none of that scope, is a finding.
- **engineering/F16. Review obligations stay distinct.** Each entry of the provider's `reviews`, a finding and its question, opens a **review obligation**. A cell that is verified with review requested is recorded as both: its Cases verified, and its obligations open beside them. An obligation is not a Test Case: it is never converted into a Case verdict, never counted as `passed` or `failed`, and never folded into the Plan Run's result. The report shows the Plan Run's result and the open obligations side by side, per target Capability.
  - An obligation stays **unresolved** until a validation judgment, held by Review with its evidence, resolves it. Engineering cites that judgment and records none of its own.
  - An unresolved obligation keeps the Plan from being reported as clean, even when every Case passed. An acknowledged finding still opens one, and is not excused.
  - Where an Agent's judgment needs a human, escalation is PREACH's. Engineering shows the obligation as unresolved meanwhile.
- **engineering/N8. Deterministic.** The same matrix, Suites and sources always give the same findings, in the same order.
- **engineering/N9. Unsupported exclusions.** An exclusion without a reason, or without evidence, is a finding, and its cell is treated as applying. Hosting is the expected exclusion from its own host-coupling Suite, by hosting/C13's rule that Hosting realizes host differences. That exclusion too is written in the matrix, citing that rule, and is not implied.

## Today's evidence, enumerated

Core (`packages/kaal-core/test/boundary.test.ts`), Testing (`packages/skills/kaal-testing/test/boundary.test.mjs`) and Engineering (`engineering/boundary.test.mjs`) each run Hosting's existing conformance inspection, `kaal-hosting/conformance`, on their own declaration. The DO lists them in the matrix as they are. Every other Capability's cell starts as a finding, never as passing, until its owner declares a boundary or the Plan records a justified exclusion.

## Dependencies

| Prerequisite | Owner | Kind | State |
| --- | --- | --- | --- |
| Plan, Suite, Case, Run and inapplicability semantics | Testing | Technical: the DO evaluates the Plan with `kaal-testing`'s model. Order prerequisite | Planned in testing/C14, DO in testing/C15 (#630) |
| Hosting's Boundary Test Suite for host and OS coupling, with its positive and negative fixtures, a T114-like OS-specific skip among them | Hosting | Technical: the first column of the matrix. Order prerequisite | Planned in hosting/C13 (#650, 81ff7fc), shipped with Hosting's package. Engineering calls it through the `kaal-hosting/boundary` entry (`boundary()`, `boundarySuite()`) or the `kaal-hosting-boundary` command, never by a repository path. It reads the `kaal-hosting-boundary` line from the run's own output, never from a TAP rendering: `result`, `cases` (the deterministic Cases), `review` and `reviews` (each a finding and its question), `failures`, `summary` and `sources`. Engineering writes nothing in Hosting's tree |
| How a provider declares its Suite so Engineering can find it | Each provider, first Hosting | Semantic reference | Hosting's is its shipped `kaal-hosting/boundary` entry. The matrix names each provider's Suite by its entry, so a provider not named there is a finding |
| Validation judgments and their evidence, which resolve a review obligation | Review | Semantic reference: F16 cites a judgment and records none. Order prerequisite for resolving obligations, not for running cells | Not yet defined. Review's Definition today states that a review reports what was observed and its evidence, and grants no authority. Engineering asks Review for a judgment record it can cite. Until one exists, every obligation shows as unresolved |
| Agent → human escalation | PREACH | Semantic reference | Engineering only shows the obligation as unresolved while it is escalated |
| Per-platform execution | Engineering's lanes, in CI | Delivery: running cells on three platforms is a `.github/` Change of its own | Not in this Change |

**Runs of one Suite over many targets, as Testing answered.** One Suite runs over many targets, and Testing's model admits it as it is (testing/F30, F31; `lib/model.mjs` on `kaal/testing`):

- The Plan Run encompasses one Suite Run per applying cell, several of the same Suite among them. Each has its own identity, unique within the Plan Run.
- The target is not a Run key. The Plan declares one Test Data item per target and execution context, for example `target/kaal-core/linux`, and each Suite Run records its own in `data`. Provenance and current evidence then compare it like any other Test Data.
- The Plan Run's result aggregates every target, so it passes only when every applying cell passes.
- The per-Capability report reads each Suite Run on its own, with `results(model, suiteRun)`.

No Testing Change is needed.

## Test Cases

These go in `engineering/boundaries/boundaries.test.mjs`, on fixture Capabilities and fixture Suites in a scratch directory. Each is first observed RED against a deliberately wrong implementation. A RED that shows only a missing module counts as blocked, not as evidence.

| Test | Checks | Deliberately wrong implementation that makes it RED |
| --- | --- | --- |
| engineering/T21 | A fixture Capability package missing from the matrix is a finding naming it, and the Plan Run is `unknown` | One that runs only the listed targets and passes |
| engineering/T22 | A provider's Suite missing from the matrix, and a cell with neither "applies" nor "excluded", are each a finding | One that treats an empty cell as excluded |
| engineering/T23 | An exclusion without a reason, and one without evidence, are each a finding, and the cell runs as applying | One that accepts any exclusion |
| engineering/T24 | A justified exclusion declares its Cases inapplicable before the run, and an outcome observed for them anyway is still reported | One that drops the excluded cell's outcomes |
| engineering/T25 | Each finding names file, line, rule, boundary owner and target Capability, and appears under that target only. A cell over test sources finds a fixture OS-specific skip | One that inspects production sources only, or reports one merged list |
| engineering/T27 | A cell's Case results follow the line's `cases` only: a line with findings and verified `cases` gives verified Cases and keeps every finding reported, an acknowledged dilution stays a review obligation, an exit status that disagrees with the line is a finding, and a cell whose `sources` show no test-scope file is a finding | One that fails on any finding, trusts the exit status alone, or drops acknowledged findings |
| engineering/T26 | The same input gives the same findings in the same order | One that orders findings by arrival |
| engineering/T28 | A cell that exits 3, `result` verified with `review` requested, is recorded as an unresolved obligation and never as complete success (the Owner's condition on #650, review 5711843534). With every Case passed and one unjudged finding, the report shows the Plan Run `passed` and one unresolved review obligation beside it, and never reports the Plan as clean. The obligation is neither a Case result nor counted in one. Given a fixture judgment record, it shows as resolved, citing the record | One that turns the finding into a failed Case, or one that reports the Plan clean when every Case passed |

The numbers follow engineering/T16–T20, which engineering/C9 (#648) plans.

## Not in this Change

- engineering/C7 (#641): consumer-verification conformance of the packed artifact.
- engineering/C9 (#648): cross-platform inventory parity, and accountable "not applicable".
- Any provider's boundary definition, Suite or review instructions, any validation judgment, any target's correction, and any workflow job, ruleset or required check.

Approving this PLAN authorizes the engineering/C10 DO only, after its prerequisites are on `main` and a synchronization is authorized. It authorizes no synchronization, promotion or publication, and no Change in another Capability's tree.
