# One SHA-256 for Graph: Architecture

- **graph/A15** [graph/F16, graph/F17]: In `node.mjs`, `import { createHash } from "node:crypto"` becomes `import { sha256 } from "@kaihacksai/kaal-foundation/sha256"`, and Graph's own `sha256` function is replaced by `export { sha256 }`. `node.d.ts` keeps its `sha256` declaration. Nothing else in `node.mjs`, `form.mjs`, `edges.mjs` or `structure.mjs` changes.
- Foundation's `sha256` accepts a `Uint8Array` and throws a `TypeError` otherwise. `identify` already passes a `Buffer` (a `Uint8Array`), so its behaviour does not change; the one visible difference is the error type for a non-bytes argument to the public `sha256`, which graph/C17 records if it shows.
- Documents: `package.json`, the shipped Architecture and Operations documents of C5 name the dependency once C5 has landed. Until then `graph/C17` changes only the source, `package.json` and the lock.

## Change graph

| Change | Owner | Waits on |
| --- | --- | --- |
| `graph/C16` PLAN (this): graph/F16, F17, N11 planned, T20 observed RED, T19 GREEN, N7 amended and T14 revised | Graph | — (graph/Q3 answered) |
| Core's byte copy carries the specifier (core/C32 follow-up) | Core | `graph/C17` |
| `graph/C17` DO: graph/A15, T20 GREEN (T14 stays GREEN) | Graph | `graph/C16`; Foundation on a registry or a pin for the lock |
