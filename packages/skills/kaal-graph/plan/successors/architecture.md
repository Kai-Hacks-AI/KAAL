# Nodes as a structure: Architecture

- **graph/A14** [graph/F14, graph/F15, graph/N10]: `successors` is a method of `Graph` in `edges.mjs`. It builds a `Map` of held Node id to target ids from the same `#out` index and the same resolve rule `traverse` uses, then returns it through the read-only relation `structure.mjs` already builds for `reverse` (exported for `edges.mjs`, still not part of the public surface). `edges.d.ts` declares `successors(options?: { type?: string }): ReadonlyMap<string, readonly string[]>`. `structure.mjs` still imports nothing.
- Documents: `graph/C15` adds `successors` to the shipped documents of `graph/C5` once C5 has landed. Until then it changes only the source and the planned test.

## Change graph

| Change | Owner | Waits on |
| --- | --- | --- |
| `graph/C12` PLAN (#967): witness paths | Graph | a consumer's confirmation |
| `graph/C14` PLAN (this): graph/F14, F15 planned and observed RED | Graph | a consumer's confirmation (graph/Q2) |
| `graph/C15` DO: graph/A14, the planned test GREEN | Graph | `graph/C14`; its shipped-document updates wait on C5 |
