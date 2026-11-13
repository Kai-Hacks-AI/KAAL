# Composing reach, reverse and cycles: Architecture

- **graph/A9** [graph/F4, graph/I7]: `normalize` in `structure.mjs` reads any iterable `successors` that has an `entries()` method through `entries()`: a `Map`, the relation `reverse` returns, or a caller's own read-only Map. It reads anything else through `Object.entries`, as it reads a plain object today. A plain object is not iterable, so it is never mistaken for a relation. The module still imports nothing, and every result, cost bound and export stays as it is (graph/N2, graph/N3).

## Change graph

| Change | Owner | Waits on |
| --- | --- | --- |
| `graph/C8` PLAN (this): graph/F4 restated, graph/T16 planned and observed RED, which establishes graph/D1 | Graph | — |
| `graph/C9` DO: graph/A9, graph/T16 GREEN, which records graph/D1 as corrected | Graph | `graph/C8` |

The release Changes (`graph/C5`, #659, and `graph/C6`) carry the correction into Graph's shipped documents and embedded cases when they meet it on `kaal/graph`.
