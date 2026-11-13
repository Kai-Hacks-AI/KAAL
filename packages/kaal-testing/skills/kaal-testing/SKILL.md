---
name: kaal-testing
description: Design a capability's tests in three loops (architecture conformance, acceptance of the delivered capability, implementation test-first) and report what they show as calibrated findings. Use when planning, writing or reviewing tests, deciding what a test must prove, or reporting test results, failures, defects or coverage.
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

## The three loops

**Architecture conformance.** The capability declares its boundaries as its own data, such as the host modules it may use directly. Check them with the most exact mechanism available, and demonstrate three cases:

- **permitted**: the delivered code inside its declaration yields no violation;
- **prohibited**: an injected breach of the declaration must fail the check, with its location;
- **undecidable**: a construct the check cannot decide must surface for validation, never pass silently and never count as a violation.

Record each judged validation item with its judgment, and make an unjudged one fail, so the list stays exact. Review what no mechanism can see, such as a responsibility duplicated in other words, and record that review as validation, not as a passing test.

**Capability acceptance.** Exercise the capability as it is delivered, installed fresh, on each host it supports, through its public interface only. Include the failures its contract promises to handle, such as a refused input leaving state unchanged.

**Implementation.** Write the smallest test that fails for the right reason, make it pass, then refactor with every test green. Test behaviour, not structure.

## Running acceptance

Keep a capability's acceptance scenarios in its own workspace, under `test/acceptance/`. Run them with `accept` from `kaal-testing/acceptance`, against a manifest of tarballs packed once by the caller. In a scenario, get packages only through `install`, never by building or packing. Report each ledger finding with its kind. State host containment and unrecorded installations as unknown, never as passed.

## Measuring coverage

To measure which delivered code a capability's own tests execute, use the `kaal-testing` package's `cover` from `kaal-testing/coverage`. Pass the workspace and the files it delivers. Report a delivered file never executed by name. Report a coverage figure as executed code within that run, never as correctness.

To relate coverage to ownership, use `report` from `kaal-testing/report`. A delivered file counts toward an owner only by its exact tracked path. A built file has no tracked identity, so leave it unreconciled rather than mapping it to a source. Report non-blank text lines and executed lines side by side, never as one ratio.

## Reporting

Report findings in four kinds, never merged: verified failure, potential defect, architectural concern, unknown. The form for each, and how to state a clean result, is in [references/findings.md](references/findings.md).

## Rules

- A passing check shows only what it covers. Say "no violation found within this coverage", never "correct" or "compliant".
- Never weaken a test, a check or its declaration to make it pass. Fix the cause, or report the finding.
- A skipped or unrun test is not a passing one. Report it as unknown.
- Keep verification and validation apart: never present a judgment as a check result, or a check result as a judgment.
- When a claim concerns the assurance a check or a gate gives, use the Controls Skill if the Engine has it.
