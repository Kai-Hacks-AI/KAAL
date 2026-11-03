# Agents: Intent (why)

This is the product contract of `kaal-agents`: what the package promises, in six parts.
- [Intent](intent.md) says why.
- [Requirements](requirements.md) says what.
- [Architecture](architecture.md) says where each function lives.
- [Operations](operations.md) says how to install, run and verify it.
- [Limitations](limitations.md) says what it does not establish.
- [Testing](testing.md) says how each promise is checked, and where.

How an Agent uses the package is in its Skill, `skills/kaal-agents/SKILL.md`.

Every identifier is written as `agents/<type><number>`: Intent (I), Requirements, Functional (F) and Nonfunctional (N), Architecture (A) and Test Cases (T). Numbers are stable and are never reused.

## Purpose

Agents is the responsibility for an Agent's readiness and operation within KAAL. The package carries two Definitions, NEW (Next Experience Works) and PREACH (Program Reports Errors, Agent Consults Human), and realizes them with two commands and a Skill.

## Intended outcomes

Requirements trace back to these identifiers.

- **agents/I1. Readiness (NEW).** A fresh Agent, with no knowledge from earlier sessions, reconstructs its operating context from durable sources alone:
  - the setting it works in;
  - what is settled;
  - what is in flight;
  - where its instructions and authority are recorded.
- **agents/I2. Discovery is not authorization.** The Agent can see where its authority may be stated, and what is unresolved. Repository state, instruction files, ownership claims and Core's catalog are sources it reads. They do not establish the authority to act. Missing or unverified authority stays unresolved, and is never accepted silently. The Agent acts only where the authority is clear, and otherwise consults under PREACH.
- **agents/I3. Escalation (PREACH).** When a program reports something it cannot resolve, the report reaches the Agent as facts and candidates:
  - The Agent resolves it only under authority it can cite.
  - Otherwise it consults the accountable person.
  - Nothing is equated, merged, chosen or suppressed silently.
  - Candidates that share a term keep their distinct scoped identities.
- **agents/I4. Consumer self-sufficiency.** A consumer without a KAAL source checkout can do everything from the installed package alone:
  - install it, understand it and use it;
  - verify it, with an honest result: verified, failed or cannot verify. Zero tests is never verified.
- **agents/I5. Boundary.** Agents owns readiness and operational collaboration, and nothing beyond it:
  - What a KAAL Agent is, and its registration and discovery, stay Core's.
  - HAPTIC stays Controls'.
  - The meaning of the work an Agent takes up stays with its owners.
  - Decisions stay with the accountable people.

  PREACH's association with HACKS is context, not ownership. Nothing here becomes a central registry or a new universal semantic owner.
