# Branching: Intent

## branching/I1 — Governed integration

Enable an agent to establish branches, engineer bounded Changes, synchronize accepted state, promote accepted work and audit actual results through deterministic operations. The product applies the consuming repository's explicit policy and does not invent policy when facts, permission or configuration are missing.

## branching/I2 — Reusable product

Branching is a KAAL capability with its own requirements, architecture, Cases and delivery lifecycle. Engineering implements it and consumes it while engineering KAAL. Engineering does not acquire product ownership by implementing it.

KAAL's names, collector structure, permitted integration methods, hold authority and required checks are consumer declarations. Another repository can choose different names and supported transactions without a Branching code fork.

## branching/I3 — BASS

Bare reasoning is no assurance mechanism. Agent instructions route work to the installed Skill. The Skill describes the operational interface and delegates deterministic decisions and operations to its scripts. Those scripts and enforcement invoke one authoritative policy implementation.

## branching/I4 — Evidence across modes

Embed and External apply the same semantics. Embed can obtain facts from a local clone; External must obtain them through authorized target interfaces. Neither the controlling repository, its policy nor its credentials stand in for the governed target.

A prepared PR, accepted API request, passing package test and successful integration are different facts. Report only what the collected evidence establishes.

## branching/I5 — Initial release

0.0.1 is an installable Agent Skill package, a validated initial KAAL consumer configuration and a governed migration of KAAL's existing enforcement. It preserves existing accepted Branching behavior while exposing the boundaries explicitly.

Included: Establish, Engineer, Synchronize, Promote, Audit; strict configuration and trust handling; Package/Configuration/Boundary verification; installed public-interface acceptance; supported Embed and External operations.

Excluded: arbitrary Git workflow languages, arbitrary regex matching, additional Git hosts, automatic conflict resolution, remote synchronization-commit creation, autonomous destructive repair, force-push, protection or review bypass, rewriting unrelated collector history, npm publication without release approval. Unsupported operations fail explicitly. Future support requires new approved requirements and Cases.

## Responsibilities

| Owner | Responsibility |
| --- | --- |
| Branching | Transaction classification, configuration interpretation, branch lifecycle and freshness semantics, product-specific Cases and verification obligations |
| Product Owner | Capability purpose, scope, acceptance and release decisions |
| Engineering | Implementation, KAAL's consumer integration, delivery and operational evidence |
| Consuming repository | Branch role assignments, permitted transactions, methods, trust anchors and governance requirements |
| Testing | Test semantics, multi-loop methods and evidence contracts; Branching consumes public Testing interfaces |
| Hosting | Filesystem, process, Git transport and GitHub mechanics, permission and API outcomes |
| Core / Engineer Skill | Node identity/admission and Agent Skill conformance respectively |
| Change / Guard | Change semantics and numbering / execution and reporting of the consumer's checks |

Dependencies remain owner contracts. Branching does not reimplement Testing, Change numbering, Guard execution, Core admission or Hosting primitives.
