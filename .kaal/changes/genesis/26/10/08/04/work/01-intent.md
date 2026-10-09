# Intent — BRAIN and kaal-learning

Establish BRAIN — Be Right And Improve Network — as KAAL's persistent network of learning, and `kaal-learning` as an optional KAAL Skill for establishing reusable understanding from experience.

KAAL should learn from its own work and make that learning available to future work, rather than repeatedly discovering the same problems.

BRAIN existed previously in KAAL-genesis. That experience contributed to the development of KAAL Core. The objective is not to restore the previous implementation, but to build on KAAL's current architecture and capabilities.

## BRAIN

BRAIN is a collection of immutable Learning Nodes.

Each Node represents established understanding. Learning can evolve through additional Nodes without rewriting previously established understanding.

BRAIN must have an explicit location.

Its location must not be implicitly determined by the location of the KAAL Engine, a Change, or the repository being worked on.

The architecture must establish how BRAIN is located, how its Nodes are identified and how its integrity is maintained, using existing KAAL capabilities wherever applicable.

A KAAL instance may need to work with learning beyond its own repository. Do not assume a universal BRAIN directory, a central registry, or remote synchronization.

## `kaal-learning`

Establish an independent, optional KAAL Skill that enables learning from experience.

Potential sources include:

* Change retrospectives
* Review findings
* Incidents and Requests
* Implementation and testing experience
* Operational experience
* Existing Learning Nodes

The Skill should help identify what was learned, distinguish reusable understanding from observations, and establish appropriate immutable Learning Nodes in BRAIN.

Learning is not equivalent to collecting information. A retrospective is evidence of experience; a Learning Node represents understanding established from that experience.

Multiple observations may support one learning, and one experience may produce several learnings.

The Skill should also support discovering relevant existing learning before establishing new understanding, so that knowledge can accumulate rather than merely proliferate.

## Architectural boundaries

Use KAAL as it exists today.

In particular:

* Reuse KAAL Core's existing Node model and identity semantics.
* Reuse KAAL Sealing rather than inventing another protection mechanism.
* Preserve the independence of optional Skills.
* Do not make Learning a mandatory gate in Changing KAAL.
* Do not introduce new governance roles or approval authority.
* Do not conflate BRAIN's location with its identity or meaning.
* Do not automatically turn every retrospective finding into a Node.

Determine whether Learning Nodes require a distinct Node type or whether existing KAAL semantics already support them.

Investigate whether relationships between Learning Nodes are needed, and whether KAAL Core already provides the necessary semantics. Do not recreate the original BRAIN graph model by default.

## First practical exercise

Use the recent KAAL Changes, particularly PRs #62–#71 and their retrospectives, as initial evidence.

Identify recurring learning concerning:

1. Premature architectural decisions.
2. Missing negative and refusal tests.
3. Repeatedly rediscovered capability dependencies.
4. Integration boundaries discovered late.
5. Governance and Reviewer independence.
6. Learning recorded but not applied in subsequent Changes.

Determine which observations justify reusable Learning Nodes, and demonstrate how future Work could discover and use them.

## Expected Work

Investigate the current KAAL architecture and the historical BRAIN implementation in `Kai-Hacks-AI/KAAL-genesis`.

Establish Requirements and Architecture for BRAIN and `kaal-learning`, including:

* BRAIN location and resolution.
* Learning Node representation and immutability.
* Node identity and sealing.
* Relationships between learnings, if justified.
* Establishing learning from evidence.
* Discovering and using existing learning.
* Compatibility with KAAL's Engine, Record and Subject separation.
* Portability across embedded and external KAAL operation.

Prefer the smallest coherent architecture. Distinguish what already exists from what is genuinely missing.

Do not implement until the architectural direction has been reviewed.

## Success criterion

KAAL can learn something from completed Work, establish that understanding as an immutable Node in an explicitly located BRAIN, and make the learning available to future Work without changing previously established knowledge.

The purpose is not to accumulate Nodes. It is to improve subsequent decisions through retained understanding.
