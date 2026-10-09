# Intent — Process Composition and Review Lenses

Establish the architectural direction for KAAL Processes as the mechanism that composes independent Skills and Extensions into purposeful Ways of Working, including their relationships, feedback loops and targeted review lenses.

The immediate motivation is the distinction between what a Skill knows and how a Process uses that Skill in relation to other capabilities.

Prepare a design Change and PR for review. Do not implement or rename existing capabilities.

## Architectural principles

KAAL Core provides the deterministic backbone through which capabilities are identified, discovered and used.

Skills provide independent Ways of Working. Extensions provide additional capabilities.

Processes compose those capabilities for a particular purpose.

BRAIN provides relevant established knowledge and learning without redefining capability meaning.

An Agent uses KAAL across its knowledge and capabilities.

Preserve these responsibilities rather than distributing process-specific dependencies into individual Skills.

## Process composition

Investigate a Process capability that can establish:

- Which Skills and Extensions participate.
- Their relationships and dependencies.
- Desired flows and feedback loops.
- Review positions and lenses.
- The boundaries within which those relationships apply.

A Process must not redefine the capabilities it composes.

Consider whether "kaal-changing" is already an instance of this concept, and whether a name such as "kaal-process-change" better expresses its responsibility.

Treat naming as an architectural question, not authorization to rename existing sealed Nodes, packages or Skills.

Do not introduce a general-purpose workflow engine or mandatory sequence of activities.

## Review lenses

Review is an independent KAAL capability.

A Process determines how Review is applied to the results and relationships relevant to that Process.

A review lens is a targeted composition of:

1. A review subject.
2. The relevant Skill's Way of Working.
3. The Process-defined relationship or expectation.
4. The "kaal-review" discipline.

The Process should define the relationship, not duplicate the Skill's Way of Working or implement another Review mechanism.

Distinguish targeted reviews from the authorized independent review and convergence required by Changing KAAL.

A targeted review may produce useful findings without itself establishing Change convergence.

## Initial example: Intent

Use the existing "kaal-intent" and "kaal-review" Skills to investigate two review positions within a Change Process.

Internal review — Intent adequacy

Examine an Intent against the Way of Working established by "kaal-intent".

Question: Is the Intent correctly described?

External review — Intent fulfillment

Examine another result against the established Intent.

Question: Does the delivered result fulfill the Intent?

These positions belong to the Process, not to "kaal-intent".

Neither review is automatically mandatory. Internal and external describe the review's position relative to the subject, not the Agent's operating mode or the Reviewer's independence.

## Further examples

Investigate, without implementing, how a Change Process might compose:

- Requirements reviewed against Intent.
- Architecture reviewed against Requirements.
- Requirements examined from an Architecture perspective.
- Delivered Code reviewed against Architecture.
- Operational results examined against Requirements.
- Testing and Defects informing Requirements or Architecture.

These examples illustrate relationships, not a prescribed six-stage pipeline.

The six Ds are useful perspectives, but must not become a fixed process sequence.

## Existing KAAL architecture

Examine the current implementation and sealed meanings of:

- KAAL Core and its Node relationships.
- "kaal-changing".
- "kaal-intent".
- "kaal-review".
- ROWING and Reviewer authority.
- Existing Change Work and review artifacts.
- The BRAIN / "kaal-learning" architecture being investigated in PR #72.

Do not assume that a new Process type, Node Form extension, relationship model or package is required.

Determine what existing KAAL semantics already support and identify only genuine gaps.

## Evidence

Use the recent experimental Codex review of PR #72 as evidence.

Codex was asked to review the Change's Intent using "kaal-intent" and "kaal-review", without acting on findings.

It produced a targeted finding concerning process instructions appearing inside the Intent.

Examine what this demonstrates about composing Skills for Review, and what remains unproven.

In particular, distinguish explicit instructions supplied in a GitHub comment from a Process making the appropriate lens discoverable to an Agent.

## Expected Work

Prepare a PR containing:

- Intent.
- Investigation of current KAAL capabilities.
- Requirements.
- Architecture.
- Evidence supporting the proposed composition and review-lens model.
- Explicit architectural questions requiring Owner decisions.

Keep the Change within its own bounded Work directory and follow the existing Changing KAAL lifecycle.

Do not implement a Process engine, change "kaal-changing", modify existing sealed Nodes, or establish new review governance.

## Success criterion

Demonstrate an architectural model in which independent KAAL Skills can be composed by a Process to guide targeted Review, including internal and external review positions, without embedding dependencies on other Skills into the individual Ways of Working.

The same Skills must remain reusable in different Processes and across Engineer, Embed and External KAAL operating modes.

The Process owns the relationships. The Skills own their Ways of Working. Review owns examination.
