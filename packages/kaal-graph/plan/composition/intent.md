# Composing reach, reverse and cycles: Intent

This is `graph/C8`, a PLAN Change. It ships no code. `graph/C9` is the DO Change that turns its planned test GREEN.

The Owner found a composition defect on #621 (comment 6535618294). `reverse` promises a read-only relation with Map's reading interface, and its declaration types it as a `ReadonlyMap`. `cycles`, `reach` and `reverse` accept a `Map` or a plain object. Given the relation `reverse` returns, which is neither, they read it as a plain object with no own keys. Every edge is then silently dropped: `reach(reverse(s), x)` yields only `x`, and `cycles(reverse(s))` reports no cycle where `s` has one.

- **graph/I7. Graph's results compose with Graph's functions.** A relation Graph returns is a structure Graph accepts, with every edge kept. A structure is never silently read as empty.
