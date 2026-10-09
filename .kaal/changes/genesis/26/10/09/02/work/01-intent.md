# Intent — Inner Loop and HOW Escalation

KAAL — Briefing: Inner Loop and HOW Escalation

## Intent

Establish a reusable Process pattern in which an Agent performs Work through an autonomous inner loop with targeted independent Agent review, seeking agreement before proceeding.
When the inner loop fails defined criteria, the Process escalates to HOW — Human Observes Work.
The Agent must not independently determine its authority to continue, conclude or escalate. Those decisions belong to deterministic Process mechanisms.
Initial application: Describe Intent

1. A Worker Agent describes or revises an Intent using `kaal-intent`.
2. The Worker invokes `@codex review` with targeted instructions, using the Intent and its established Way of Working as the review standard.
3. The Worker receives findings, addresses them and requests another targeted review where necessary.
4. The inner loop repeats until agreement is reached or a defined escalation condition occurs.
5. If escalation is required, the Process presents the unresolved Work and evidence to HOW.
6. Human direction can return the Work to the inner loop.

## Architectural requirements

* The inner loop operates without routine human intervention.
* The reviewer remains independent of the Worker.
* Review instructions identify the subject, standard and expected examination.
* Agreement must be recognizable through explicit evidence.
* The Process determines continuation, convergence and escalation.
* Escalation criteria must be deterministic, inspectable and testable.
* HOW may involve Agents assisting the human; human participation is the defining distinction.
* Review history and escalation reasons remain traceable.
* The pattern must be reusable beyond Intent without coupling individual Skills to each other.

## Investigation

Determine the smallest mechanism needed to answer:

* What constitutes agreement between Worker and Reviewer?
* What constitutes failure of the inner loop?
* How is progress distinguished from stagnation or oscillation?
* Which conditions require escalation to HOW?
* How does human direction return authority to the inner loop?
* How can deterministic Process scripts consume review evidence without interpreting free-form Agent judgments as authority?
* What can be reused from `kaal-review`, `kaal-intent` and the Process architecture established by PR #73?

Do not assume that a fixed review-round limit alone establishes convergence or failure.

## Scope for 0.0.1

Demonstrate the smallest working Process using Describe Intent ↔ Review Intent.
Show three outcomes:

1. Autonomous convergence without human intervention.
2. Continued autonomous iteration after review findings.
3. Escalation to HOW when an established failure criterion is met.

Do not implement D2 or create a general-purpose orchestration framework merely to demonstrate this pattern.

## Acceptance criterion

A fresh Agent can discover and execute the Process, invoke targeted Codex review, respond to findings and continue autonomously while authorized.
When the inner loop fails its defined criteria, the Process deterministically requires HOW rather than allowing the Agent to continue indefinitely or invent its own authority.
The result must be demonstrable without the Owner reconstructing the procedure manually.
