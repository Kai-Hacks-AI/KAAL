# Nodes as a structure: Intent

This is `graph/C14`, a PLAN Change. It ships no code. `graph/C15` is the DO Change that turns its planned test GREEN. Like `graph/C12` (witness paths, #967) it adds to Graph and changes nothing that exists, and it does not touch the Graph 0.0.1 release candidate (C5, C6), which waits on Hosting.

Graph has two halves that do not meet:
- The Node half: `Graph` holds Nodes and their Edges and answers `out`, `in`, `typed`, `edges` and `traverse`.
- The structural half: `reach`, `reverse`, `cycles` (and `path`, planned in `graph/C12`) work on a plain relation from identity to identities.

A caller who holds a `Graph` of Nodes and wants a cycle report, a reverse reach or a witness path over, say, its `Serves` Edges must today write the bridge itself: walk every Node, take its Edges of one type, drop the targets that do not resolve, and build a Map. Each caller writes it differently, and the portfolio's traceability chain (Intent → Requirements → Architecture → Graph via `Serves` → Testing → Evidence) needs exactly this in several places:
- Core's cycle declarations (core/A27) compare reported cycles with owners' declarations.
- Intent and Requirements traceability (#892, #893, `Serves` in #942) ask which Intent a Requirement chain reaches.
- Engineering's reverse-traceability impact (engineering/C11, #739) follows incoming traces transitively.

- **graph/I11. A Graph's Nodes are a structure Graph's own mechanics accept.** From a `Graph`, a caller gets, in one call, the relation among its Nodes that `reach`, `reverse`, `cycles` and `path` take, for all Edges or for one Edge type, with the same rules `traverse` already applies. Graph still gives no Edge type a meaning.

As with `graph/C12`, this is only started if a consumer confirms the need (graph/Q2).
