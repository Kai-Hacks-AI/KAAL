---
name: Agent Realization
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Agent Realization

Agent Realization makes each installed Skill reachable by the agents of every provider a repository declares, from the Skill's one canonical source. Where a provider discovers or invokes a Skill only from its own location, Core deploys a copy it generates from that source; where a pointer gives the provider the same behaviour, Core proposes the pointer instead, for the instruction file's owner to adopt.

Core claims only what it deployed. It keeps its own record, rewrites a deployed file only while it is unmodified, prunes only what it deployed, and keeps and reports anything else at a deployment target. It never writes an instruction file, and it governs no location for any deployment but its own.
