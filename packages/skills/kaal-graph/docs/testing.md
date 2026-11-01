# Graph: Testing

This is the Product Verification Test Plan of `@kaihacksai/kaal-graph`: the one that ships, and that your installation runs. A case that checks a numbered obligation names it in its title, for example `graph/T1 [graph/F1, graph/F4]`. The identifiers are the trace, and each is defined in [Intent](intent.md), [Requirements](requirements.md), [Architecture](architecture.md) or here.

## Where they run

- **Embedded cases.** They live in `test/embedded/`, and run in your installation through `npm test` ([Operations](operations.md)). Each one creates what it needs in the operating system's temporary directory, and needs only Node and the package's runtime dependencies.
- **The publisher's cases.** Graph's publisher also checks its repository, its packaging and Graph's integration with other KAAL packages. Those cases need the source checkout, and do not ship.

## Embedded cases

| File | Checks |
| --- | --- |
| `graph.test.mjs`: the Form, reading frontmatter, Edges, constructing a Node, the graph, the payload and the `kaal-graph` command, run as installed | the behaviour stated in the [README](../README.md), graph/N3, graph/N4 |
| `structure.test.mjs`: `reverse` and `cycles` cannot be changed, and `reverse` reads like a `Map` | graph/N3 |
| `declarations.test.mjs`: the declarations match what the modules export | graph/A1, graph/N7 |
| `cycles.test.mjs`: graph/T1–graph/T7 below | graph/F1–graph/F4, graph/N1–graph/N3 |
| `composition.test.mjs`: graph/T16 below | graph/F4, graph/I7, graph/F1–graph/F3 |

| Case | Checks |
| --- | --- |
| **graph/T1**: an acyclic structure has no cycles, and a self-edge is a cycle of one | graph/F1, graph/F4 |
| **graph/T2**: A1 → D1 → T2 → A1 is reported with its members sorted. Two disjoint cycles are reported apart and in order, and two cycles sharing a member are one component | graph/F1, graph/I1 |
| **graph/T3**: `reach` yields each identity once, terminates on a cycle, includes `start`, and reaches a successor that is not a key | graph/F2, graph/F4 |
| **graph/T4**: `reverse` derives sorted predecessors, including for a successor that is not a key | graph/F3, graph/F4 |
| **graph/T5**: the same structure in any key and successor order gives the same cycles, reach and reverse | graph/N1 |
| **graph/T6**: a 100 000-member chain and a 100 000-member ring finish without exhausting the stack, and the ring is one cycle | graph/N2, graph/A2 |
| **graph/T7**: the input is unchanged, the results are frozen, and a plain object works like a `Map` | graph/N3, graph/F4 |
| **graph/T16**: the relation `reverse` returns, and a caller's own read-only Map, compose with `reach`, `cycles` and `reverse` with every edge kept; a plain object still works | graph/F4, graph/I7, graph/F1–graph/F3 |

## Corrected defects

**graph/D1:** read-only relations were read as empty objects, silently dropping their edges. Structural normalization now reads their `entries()` (graph/A9). graph/T16 retains the regression exactly once in the embedded inventory.

## Verified by the publisher

- **graph/T8–graph/T12, graph/T14 and graph/T15** check the documents, the `npm test` entry, what ships, the name, `verify`'s three results in a copy of the package, the copyable Form (graph/N7), and that each case runs from exactly one place.
- **graph/T13** installs the packed package and its packed runtime dependencies into a clean directory. There, the installed files are the ones [Operations](operations.md) lists, `npm test` is verified, and the command passes `check` on the shipped payload. It must pass before `@kaihacksai/kaal-graph` 0.0.1 is released.
- **graph/N6**, the same behaviour on Linux, macOS and Windows, is evidenced by the publisher running the cases on each platform.

## Verified by no Test Case

- graph/N2's cost bound is validated by review of graph/A2's algorithm. graph/T6 proves termination without recursion at scale, and does not measure asymptotic cost.
- graph/A3, graph/A5, graph/A6 and graph/A8 are placements and decisions, checked by review, with graph/T9 and graph/T10 for graph/A5.
