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

## Tests planned before the code

Intent, Requirements and Architecture establish their tests in PLAN. In DO and CHECK, never change a planned test, or the fixtures, expectations, configuration and helpers that give it its meaning, for any reason. Your own implementation tests may change with the design, but never so that they weaken what the planned tests demand.

- **Before coding**, run the planned tests and confirm each fails for the intended missing behaviour. A failure from a missing import, a fixture or a typo is not clean RED. If clearing it would touch a planned test or what gives it its meaning, report it as a planning defect.
- **At GREEN**, say that the planned tests pass within their coverage, never that the outcome is achieved.
- **If a planned test is wrong**, stop and report it as a planning defect for ACT. Do not correct it yourself.

## Tracing each test: TEST A FINDING

**To Enhance Systematic Testing: Architecture, Functional requirements, Intent, Nonfunctional requirements, Defects — Inform Next Generation.**

A Test Case normally traces to one specific target, according to its loop and purpose. TEST A FINDING names the permitted target kinds:

- Architecture;
- Functional requirements;
- Intent;
- Nonfunctional requirements;
- Defects.

Additional traces require justification. Name the target in the test's title, such as `core/T37 [core/F37]`, and in the PLAN's testing table. Inform Next Generation is the feedback of evidence into the next PLAN, not another trace target.

## Running acceptance

Keep a capability's acceptance scenarios in its own workspace, under `test/acceptance/`. Run them with `accept` from `kaal-testing/acceptance`, against a manifest of tarballs packed once by the caller. In a scenario, get packages only through `install`, never by building or packing. Report each ledger finding with its kind. State host containment and unrecorded installations as unknown, never as passed.

## Measuring coverage

To measure which delivered code a capability's own tests execute, use the `kaal-testing` package's `cover` from `kaal-testing/coverage`. Pass the workspace and the files it delivers. Report a delivered file never executed by name. Report a coverage figure as executed code within that run, never as correctness.

To relate coverage to ownership, use `report` from `kaal-testing/report`. A delivered file counts toward an owner only by its exact tracked path. A built file has no tracked identity, so leave it unreconciled rather than mapping it to a source. Report non-blank text lines and executed lines side by side, never as one ratio.

## Reporting

Report findings in four kinds, never merged: verified failure, potential defect, architectural concern, unknown. The form for each, and how to state a clean result, is in [references/findings.md](references/findings.md).

## Making a product verifiable by its consumers

When a product is to be verifiable by the people who install it, follow the `Testing` Node's section "Consumer verification" for what it means. In short:

- Deliver only the product's own acceptance or conformance cases, kept apart from engineering-only tests, and declare which cases they are.
- Document one entry point. Locate the installed product by resolution, never by a source path, and fail closed: fewer cases executed than declared is unknown, never verified.
- Give exactly one result per run: failed, unknown or verified, each with its own exit status and summary.
- Name what was exercised: name, version, install location, and byte identity where the installation records one.
- Work outside the consumer's content, leave it unchanged, and show that it is unchanged. Keep the procedure repeatable, and report each run's observed outcome, evidence and conditions faithfully. Never promise the same result from the same installation.
- Report conformance and integration as separate verdicts.
- Treat a consumer's result as the consumer's own observation, never as evidence Testing observed.

Realize this in the product's own code and cite the contract ids. Do not depend on a Testing package for it.

## Rules

- A passing check shows only what it covers. Say "no violation found within this coverage", never "correct" or "compliant".
- Never weaken a test, a check or its declaration to make it pass. Fix the cause, or report the finding.
- A skipped or unrun test is not a passing one. Report it as unknown.
- Keep verification and validation apart: never present a judgment as a check result, or a check result as a judgment.
- When a claim concerns the assurance a check or a gate gives, use the Controls Skill if the Engine has it.
