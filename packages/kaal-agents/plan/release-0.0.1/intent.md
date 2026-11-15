# Agents 0.0.1: Intent

This is `agents/C4`, a PLAN Change. It ships no code. It fixes the consumer contract of `kaal-agents` 0.0.1, the release you set on #613. The DO Changes after it turn the planned tests GREEN, one Change at a time (see the Change graph in `architecture.md`).

For reference, the earlier Agents Changes, which carried no identifiers when they merged, are recorded here as:
- `agents/C1`: the capability (#278);
- `agents/C2`: NEW (#563);
- `agents/C3`: PREACH (#613).

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

  The bar is `@kaihacksai/kaal-guard`, which the package meets or exceeds.
- **agents/I5. Boundary.** Agents owns readiness and operational collaboration, and nothing beyond it:
  - What a KAAL Agent is, and its registration and discovery, stay Core's.
  - HAPTIC stays Controls'.
  - The meaning of the work an Agent takes up stays with its owners.
  - Decisions stay with the accountable people.

  PREACH's association with HACKS is context, not ownership. Nothing here becomes a central registry or a new universal semantic owner.
