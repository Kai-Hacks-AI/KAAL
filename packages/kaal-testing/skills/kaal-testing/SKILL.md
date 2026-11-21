---
name: kaal-testing
description: Design and evaluate tests across composable dimensions (Concern/Claim and Evidence method/boundary), verify test sensitivity and input breadth via Behavioural RED, Targeted Mutation Verification, and Seeded Property & Adversarial Testing, and report calibrated findings without overclaiming. Use when planning, writing, or reviewing tests, deciding what a test must prove, checking test sensitivity or property/invariant coverage, or reporting test results, failures, defects, or coverage.
license: MIT
---

# Testing a capability

What Testing means is stated by the `Testing` Node in a KAAL Engine: read it there, starting from the Engine's `AGENTS.md`. This file tells you how to do the work.

## Before writing a test

1. **Name the contracts and who owns them.** Test an invariant exhaustively in the capability that owns it. Where your capability consumes another's contract, test only that you use it correctly, through its public interface, and do not repeat its cases.
2. **Decide which loop each case belongs to.** Keep each loop's evidence separately runnable, so a reader can tell which loop a result came from.

## Assessing a test against its claim

Testing serves verification: it establishes objectively whether a defined criterion is satisfied. Before designing a Case, trace the claim it would verify back to the concern that owns it: Intent, Requirements, Architecture or a Defect. Then decide, in this order:

1. **Verify.** Is there an observable result and an oracle that is defensible and unambiguous, so that two readers of the claim would accept the same one? A criterion that can be decided objectively can be tested, automated or not. Name the observable and the oracle, and write the Case.
2. **Challenge.** If the claim is too underspecified to decide, and its owner could reasonably make it decidable, put the question to that owner and report the claim as unknown. Recommend; do not rewrite the owner's claim.
3. **Point at judgement.** If the claim is about whether criteria, decisions or outcomes are sound and fit for their purpose, no test can settle it. Say that it can only be judged, name the evidence and who should judge, from a seat that is not the claim's author, and record it as a judgement, never as a passing test.

**Reject a brittle Case.** A Case that checks incidental wording, or an author's preferred answer, instead of the concept, proves nothing. Reject it and say what it should verify or who should judge.

**Never invent.** Never invent an oracle, a threshold or an answer key to obtain GREEN. An author's key is that author's judgment: where an independent answer differs, record both.

For every claim state why, and any unresolved question.

## Testing loops

Compose testing across two dimensions rather than a fixed triad:

- **Concern / Claim:** what expectation is evaluated and who owns it — from implementation internals (`src`) up through architecture, requirements, intent, and any higher concern composed on top. Trace every check back to its owning claim.
- **Evidence method / boundary:** what observation or judgment establishes that claim, preserving distinct assurance boundaries:
  - **Architecture conformance:** declare boundaries as data (such as allowed host modules). Check mechanically where possible and demonstrate three cases: **permitted** (clean code inside declaration passes), **prohibited** (an injected breach fails with its location), and **undecidable** (constructs the check cannot decide surface for validation, never pass silently and never count as a violation). Record each judged validation item, make unjudged items fail, and record uncheckable reviews (such as duplicated responsibility) as validation, not a passing test.
  - **Capability acceptance:** exercise the capability as delivered, installed fresh on each supported host, through its public interface only, including promised failures (such as refused input leaving state unchanged).
  - **Implementation:** write the smallest test that fails for the right reason, make it pass, then refactor with tests green. Test behaviour, not structure, and do not introduce functionality without a justified obligation.
  - **Judgment:** validation when soundness or fitness cannot be settled by an oracle.

**Qualified evidence reuse.** Reuse an observation where its execution conditions and provenance satisfy each supported claim. Keep each inference explicit; do not duplicate runs solely to duplicate labels, and do not reuse evidence where a claim requires an independent execution (for example, a fresh consumer installation versus a workspace run). No concern or method substitutes for another.

**Behavioural RED.** Before implementing, run the loop's tests against an inert stub (or unfixed target) with valid shape returning neutral values while preserving unrelated valid exports and behaviours when testing a focused claim. The run must fail on a behavioural assertion. A missing module, syntax error, or setup failure is **blocked** (`unknown`), never RED evidence.

**Targeted Mutation Verification.** After turning GREEN, challenge tests with targeted mutations tied to authoritative claims and concrete witness inputs. A mutant is **killed** only when the intended behavioural assertion detects the introduced violation — never merely an unrelated error or a broad stub masked by an unrelated check. Classify each challenge as `killed`, `survived`, `invalid`, or `unresolved`, keeping unrelated execution errors separate.

**Seeded property and adversarial testing.** Use when testing pure, algebraic, parser, or validator contracts where hand-picked examples leave input combinations untested (permutations, correspondence or conservation laws, idempotence, non-mutation, or hostile shapes). Keep triggers distinct: Behavioural RED checks before implementation that a test fails on its assertion rather than setup; Targeted Mutation Verification checks after GREEN whether assertions reject selected clause violations; seeded property testing checks input breadth across generated and adversarial cases. Assert real structural, algebraic, or crash-free-refusal laws rather than vacuous setups or copies of production logic. Before running each property, classify it as an **authoritative invariant** (failure can establish a contract breach) or an **exploratory hypothesis** (failure raises an `unknown` question rather than automatically claiming a defect). Always drive generation from an explicit deterministic seed (never unseeded randomness) and shrink failures into minimal reproducible counterexamples (`verified failure`). Route genuine contract breaches as a Defect and a parked RED Case rather than breaking the normal suite or silently patching source under test; add only passing fixed-seed checks and passing regression cases to the normal executed suite, keeping heavy fuzz loops out of routine runs.

**Uncovered behaviour.** When a mutation exposes behaviour not covered by existing tests, establish its contractual basis, necessity, and consumer dependencies before proposing tests, a contract clarification, or removal (check known consumers, and note that finding none locally does not prove no external consumer relies on a public interface). Do not remove behaviour solely because no existing test requires it. Report findings strictly using the four existing kinds in [references/findings.md](references/findings.md) (`unknown` when authority or necessity is unresolved, `architectural concern` when responsibility placement or duplication is suspected, and `potential defect` only for a plausible expectation violation), leaving defect creation, lifecycle, and closure to whoever owns defects, review, and architecture.

## Running acceptance

Keep a capability's acceptance scenarios in its own workspace, under `test/acceptance/`. Run them with `accept` from `kaal-testing/acceptance`, against a manifest of tarballs packed once by the caller. In a scenario, get packages only through `install`, never by building or packing. Report each ledger finding with its kind. State host containment and unrecorded installations as unknown, never as passed.

## Measuring coverage

To measure which delivered code a capability's own tests execute, use the `kaal-testing` package's `cover` from `kaal-testing/coverage`. Pass the workspace and the files it delivers. Report a delivered file never executed by name. Report a coverage figure as executed code within that run, never as correctness.

To relate coverage to ownership, use `report` from `kaal-testing/report`. A delivered file counts toward an owner only by its exact tracked path. A built file has no tracked identity, so leave it unreconciled rather than mapping it to a source. Report non-blank text lines and executed lines side by side, never as one ratio.

## Expected failures

When a register of expected failures is given, run with `kaal-testing run --expect <register.json> <test files>` and report what the `expectations` part lists, next to the observed counts and never in place of them: the expected failures that held, the entries that no longer hold (their owner removes them), the unconfirmed and absent entries with their provisional reasons, and any RED nobody expected. Hand the list on as it stands, complete or not.

## Reporting

Report findings in four kinds, never merged: verified failure, potential defect, architectural concern, unknown. The form for each, and how to state a clean result, is in [references/findings.md](references/findings.md).

## Rules

- A passing check shows only what it covers. Say "no violation found within this coverage", never "correct" or "compliant".
- Never weaken a test, a check or its declaration to make it pass. Fix the cause, or report the finding.
- A skipped or unrun test is not a passing one. Report it as unknown.
- Keep verification and validation apart: never present a judgment as a check result, or a check result as a judgment.
- When a claim concerns the assurance a check or a gate gives, use the Controls Skill if the Engine has it.
