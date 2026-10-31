# Intent elements as Nodes: Intent

> PLAN (`intent/C1`). This is Intent's part of prerequisites P2 and P3 of `engineering/C11` (`engineering/change-isolation/traceability.md`, "Prerequisites, each its owner's"), after the Owner chose Option B on #716. Nothing below exists yet.

- **intent/I1.** A Change's impact must reach every Requirement that serves an Intent the Change alters, by Graph traversal, not by reading prose. Today the trace from a Requirement to the Intent it serves exists only as bracket text, such as `**x/F3** [x/I1]`, so nothing can traverse it. Intent supplies the target side: each Intent element must be a Node that a Requirement's Edge can name by name and id.
- **intent/I2.** Every path under Intent's own location must be attributable to Intent, so Change Isolation reports none of it as unattributed.

Requirements owns the relationship itself, the Definition `Serves`, and its Edges from a Requirement Node to the Intent Nodes it serves. The relationship belongs to Requirements because the Requirement Definition already states that a Requirement "may name an Intent it traces to". Intent owns what an Intent is, and how one is identified.
