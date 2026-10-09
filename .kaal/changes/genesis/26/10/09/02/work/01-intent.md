# Intent — Finding Judgment and Governed Disposition

KAAL — Briefing: Finding Judgment and Governed Disposition (Kai, 2026-10-09)

## Intent

Establish a reusable approach to handling findings across KAAL's six Ds, distinguishing two independent judgments:

1. Validity: Is the finding correct?
2. Disposition: If valid, should it be addressed now or later?

A valid finding does not automatically authorize changing the current Work.
Findings must remain preserved and traceable, including those deliberately deferred.

## Architectural context

The six Ds provide the context:

* D1 — Describe Intent: Establish intended outcomes.
* D2 — Define Requirements: Establish what must hold.
* D3 — Design Architecture: Establish structural decisions.
* D4 — Develop Code: Realize the agreed architecture.
* D5 — Do IT: Execute, exercise and experience the result.
* D6 — Detect Defects: Investigate observed deviations and establish reproducible defects.

D5 provides experience against which D6 can identify defects. D6 can reveal problems in results established during any earlier D.
The discovery of a defect does not itself authorize revisiting those results.

## Finding judgment

1. Validity

A finding is a claim requiring examination against the relevant established contract and evidence.
A confirmed defect should retain:

* The claim and affected artifact identity.
* The violated expectation or contract.
* Reproduction conditions.
* A failing test or equivalent executable evidence demonstrating the deviation.
* The validity judgment and supporting evidence.

Preserve rejected and disputed findings with their disposition as well. Do not silently erase them.

2. Now or later

For a valid finding, determine whether addressing it belongs to the currently authorized Work.
Consider scope, established boundaries, priority, dependencies and available authority.
Now: The correction belongs to the current Work and is authorized.
Later: Preserve the confirmed finding for future governed Work without expanding the current Change.
If a defect makes current Work unsafe, impossible or unable to meet its established requirements, the Process must not blindly continue. Escalate when the necessary decision exceeds delegated authority.

## Sealing and phase boundaries

Investigate how Sealing can preserve agreed results between the six Ds.
For example:

* D3 establishes an architectural result.
* D4 develops against that result.
* D5 exercises the implementation.
* D6 confirms an architectural defect through a reproducible red test.
* The defect is preserved without silently modifying the established D3 result.
* A subsequent governed Change may authorize architectural correction.

Sealing preserves what was agreed. Defect evidence establishes what later experience revealed.
Do not assume that every activity or every D requires a new seal. Investigate where an authoritative boundary genuinely benefits from immutable identity.

## Autonomous review and HOW

Apply these principles to the Inner Loop under development in PR #75.
An independent Reviewer provides findings, not instructions that automatically expand Work.
The Worker must be able to investigate, challenge and disposition findings without treating Reviewer suggestions as orders.
Autonomous agreement must not depend on implementing every valid finding.
When validity, scope or authority cannot be resolved within the granted Process, escalate to HOW — Human Observes Work.
Human direction may return the Work to autonomous execution.

## Investigation

Examine the existing responsibilities of:

* `kaal-review`
* `kaal-sealing`
* Requests and Incidents
* Work selection (PR #42)
* Process agency (PR #73 and PR #75)
* BRAIN and Learning (PR #72)

Determine where validity judgments, confirmed Defects, disposition decisions and future Work belong.
Avoid duplicating responsibilities or introducing a generic findings registry where established capabilities suffice.

## Minimum 0.0.1 demonstration

Demonstrate the following scenario:

1. An Agent develops code against an agreed architectural result.
2. Execution exposes a deviation from that architecture.
3. An independent review confirms the finding with a reproducible failing test.
4. The finding is judged valid but outside the authorized implementation scope.
5. The confirmed Defect and its red test are preserved.
6. The established architecture remains unchanged.
7. Current Work continues where legitimate, or escalates to HOW if blocked.
8. A later governed Change can discover the Defect and decide whether to address it.

Also demonstrate a valid in-scope finding that is corrected within the current Work, and an invalid finding that is rejected with its reasoning preserved.

## Acceptance criteria

A fresh Agent can distinguish:

* Finding from confirmed Defect.
* Validity from authorization.
* Review from Work selection.
* Current scope from future Work.
* Evidence preservation from defect correction.
* Autonomous judgment from decisions requiring HOW.

The Agent must not silently discard valid findings, implement unauthorized changes or modify previously established results merely to satisfy a Reviewer.

## Expected outcome

Recommend the smallest coherent allocation of responsibilities across existing KAAL capabilities and identify what is missing for 0.0.1.
This briefing is architectural input, not authorization to implement a new Defect Skill, redefine the six Ds or reopen converged Changes.
Governing principle: Validity determines what holds. Authority determines what may be done. Preservation ensures that valid findings are not lost merely because now is the wrong time.
