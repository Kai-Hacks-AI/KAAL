# Engineering's Boundary Test Plan

> PLAN (engineering/C10): nothing below exists yet. The Owner's alignment on #641 (comment 6510155607) asks for an Engineering-owned Boundary Test Plan, built on Testing's existing model and not on a new framework. This is a bounded Engineering Change, separate from engineering/C7 (#641), the consumer-verification conformance PLAN, which it leaves unchanged. Approving this PLAN authorizes only its DO, on `kaal/engineering`, and only once the prerequisites below are on `main`.

## Who owns what

| Concern | Owner |
| --- | --- |
| A boundary definition, and the reusable Boundary Test Suite that tests it | The Capability whose boundary it is. Hosting is the first provider: host and OS coupling, in production code and test code (#641, comment 6510106826) |
| Strategy, Plan, Suite, Case, Run, result and applicability semantics | Testing: testing/F24–F33, planned in testing/C14 and delivered by testing/C15 (#630) |
| The Boundary Test Plan: which Suites apply to which targets, in which execution contexts, with which evidence | Engineering, in this Change |
| Correcting a finding | The target Capability, in its own Change |

Engineering adds no boundary rule of its own, and decides no finding.

## The Plan, in Testing's terms

- **engineering/F12. One Plan.** The Boundary Test Plan is a Testing Plan (testing/F25). It names each provider's Boundary Test Suite by its identity. Engineering defines none of the Suites' Cases.
- **engineering/F13. The applicability matrix.** The Plan enumerates, explicitly, every KAAL Capability package as a target against every Boundary Test Suite. Each cell is one of:
  - **applies**, with its execution contexts: the platforms it runs on and the sources it inspects, production code and test code (publisher-only tests, scripts, fixtures and helpers included) unless the cell says otherwise;
  - **excluded**, with a reason and the evidence for it. Within a Plan Run, an excluded cell's Cases are declared inapplicable before the run, as testing/F26 defines, and an observed outcome is never hidden by the declaration.

  The matrix is written once, in the Plan, and nowhere else.
- **engineering/F14. Omission is a finding.** A Capability package that is not a row of the matrix, a provider's Suite that is not a column, and a cell with neither "applies" nor "excluded" are each a finding, naming what is missing. None counts as compliant. The Plan Run is then `unknown`, as testing/F27 gives for an unknown Case.
- **engineering/F15. Runs and reports.** Engineering discovers the targets and the providers' Suites, runs each applying cell in its contexts, and reads every result through Testing (testing/F26–F31). It reports per target Capability. Each finding names:
  - the source location, file and line;
  - the rule, and the **boundary owner**, which is the Suite's provider;
  - the target Capability, which owns the correction.

  A finding is for review, not an automatic failure, when the provider's Suite says so. Its resolution, validated with who judged, what and where, or visibly unresolved, follows Testing's terms and never counts as passing.
- **engineering/N8. Deterministic.** The same matrix, Suites and sources always give the same findings, in the same order.
- **engineering/N9. Unsupported exclusions.** An exclusion without a reason, or without evidence, is a finding, and its cell is treated as applying. Hosting is the expected exclusion from its own host-coupling Suite. That exclusion too is written in the matrix with its reason, and is not implied.

## Today's evidence, enumerated

Core (`packages/kaal-core/test/boundary.test.ts`), Testing (`packages/skills/kaal-testing/test/boundary.test.mjs`) and Engineering (`engineering/boundary.test.mjs`) each run Hosting's existing conformance inspection, `kaal-hosting/conformance`, on their own declaration. The DO lists them in the matrix as they are. Every other Capability's cell starts as a finding, never as passing, until its owner declares a boundary or the Plan records a justified exclusion.

## Dependencies

| Prerequisite | Owner | Kind | State |
| --- | --- | --- | --- |
| Plan, Suite, Case, Run and inapplicability semantics | Testing | Technical: the DO evaluates the Plan with `kaal-testing`'s model. Order prerequisite | Planned in testing/C14, DO in testing/C15 (#630) |
| Hosting's Boundary Test Suite for host and OS coupling, with its positive and negative fixtures, a T114-like OS-specific skip among them | Hosting | Technical: the first column of the matrix. Order prerequisite | To be planned in Hosting's own Change. Engineering asks for it and writes nothing in Hosting's tree |
| How a provider declares its Suite so Engineering can find it | Each provider, first Hosting | Semantic reference | Named in Hosting's Change. Engineering follows it |
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
| engineering/T26 | The same input gives the same findings in the same order | One that orders findings by arrival |

The numbers follow engineering/T16–T20, which engineering/C9 (#648) plans.

## Not in this Change

- engineering/C7 (#641): consumer-verification conformance of the packed artifact.
- engineering/C9 (#648): cross-platform inventory parity, and accountable "not applicable".
- Any provider's boundary definition or Suite, any target's correction, and any workflow job, ruleset or required check.

Approving this PLAN authorizes the engineering/C10 DO only, after its prerequisites are on `main` and a synchronization is authorized. It authorizes no synchronization, promotion or publication, and no Change in another Capability's tree.
