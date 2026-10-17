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

## The three loops

**Architecture conformance.** The capability declares its boundaries as its own data, such as the host modules it may use directly. Check them with the most exact mechanism available, and demonstrate three cases:

- **permitted**: the delivered code inside its declaration yields no violation;
- **prohibited**: an injected breach of the declaration must fail the check, with its location;
- **undecidable**: a construct the check cannot decide must surface for validation, never pass silently and never count as a violation.

Record each judged validation item with its judgment, and make an unjudged one fail, so the list stays exact. Review what no mechanism can see, such as a responsibility duplicated in other words, and record that review as validation, not as a passing test.

**Capability acceptance.** Exercise the capability as it is delivered, installed fresh, on each host it supports, through its public interface only. Include the failures its contract promises to handle, such as a refused input leaving state unchanged.

**Implementation.** Write the smallest test that fails for the right reason, make it pass, then refactor with every test green. Test behaviour, not structure.

## Reporting

Report findings in four kinds, never merged: verified failure, potential defect, architectural concern, unknown. The form for each, and how to state a clean result, is in [references/findings.md](references/findings.md).

## Rules

- A passing check shows only what it covers. Say "no violation found within this coverage", never "correct" or "compliant".
- Never weaken a test, a check or its declaration to make it pass. Fix the cause, or report the finding.
- A skipped or unrun test is not a passing one. Report it as unknown.
- Keep verification and validation apart: never present a judgment as a check result, or a check result as a judgment.
- When a claim concerns the assurance a check or a gate gives, use the Controls Skill if the Engine has it.
