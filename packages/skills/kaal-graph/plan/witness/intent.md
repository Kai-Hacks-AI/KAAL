# Witness paths: Intent

This is `graph/C12`, a PLAN Change. It ships no code. `graph/C13` is the DO Change that turns its planned test GREEN. It adds to Graph's structural mechanics and changes nothing that exists, so it does not touch the Graph 0.0.1 release candidate (C5, C6), which waits on Hosting.

`reach` says *that* an identity is reachable. Consumers of Graph's structure must also say *why*:
- Engineering's reverse-traceability judgement (engineering/C11, #739) computes impact by following incoming traces transitively and must fail a selection "named". Today it can name the unreached capability, but not the chain of traces that does or does not connect it.
- Core compares each reported cycle with its owners' declarations (core/A27). `cycles` names the members, and a reader still has to find a route among them.
- Intent and Requirements traceability (#892, #893) will ask the same question of a one-way trace: which chain leads from this Requirement to that Intent?

A consumer can rebuild the answer from `reach` and `reverse`, but each would write its own walk, with its own order, and the answers would differ. The mechanic is structural, so Graph owns it.

- **graph/I10. Graph can show why an identity is reachable.** For two identities of a directed structure, Graph returns one route between them that a person can read, the same route every time. It judges nothing about what the route means.

This Change adds the mechanic only if a consumer confirms the need. Engineering, Core and Requirements are asked on this PR (graph/Q1 in the Requirements).
