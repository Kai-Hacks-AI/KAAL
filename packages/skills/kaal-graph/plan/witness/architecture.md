# Witness paths: Architecture

- **graph/A13** [graph/F13, graph/N9]: `path` lives in `structure.mjs` beside `reach`, shares `normalize`, and imports nothing. It is a breadth-first walk from `from` that records, for each identity, the identity it was first discovered from, and stops when `to` is discovered. It then follows the recorded parents back and reverses the result. `edges.mjs` re-exports it and `edges.d.ts` declares `path(successors: Successors, from: string, to: string): readonly string[] | undefined`.
- Documents: `graph/C13` adds `path` to the shipped Requirements, Architecture and Operations documents of `graph/C5` once C5 has landed, so the delivered contract and the embedded case list stay in step. Until then it changes only the source and the planned test.

## Change graph

| Change | Owner | Waits on |
| --- | --- | --- |
| `graph/C12` PLAN (this): graph/F13 planned and observed RED | Graph | a consumer's confirmation (graph/Q1) |
| `graph/C13` DO: graph/A13, the planned test GREEN | Graph | `graph/C12`; its shipped-document updates wait on C5 |
