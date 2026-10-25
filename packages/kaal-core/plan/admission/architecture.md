# Typed Artifacts and Type States: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A10** [core/F23–core/F25, core/N8]: Recognition is Core's Engine rule in `engine.ts`, not the Kernel's: the Kernel defines what a Node is, and Core decides which files claim to be one. `evaluate(files, { types })` returns `{ nodes, rejected, artifacts }`. Each artifact is `{ path, type, state, findings }`, where `state` is `registered`, `unregistered`, `unknown` or `invalid`. `types` is optional and has `core/C6`'s shape. Frontmatter is read with Graph's Form reader (`kaal-graph/form`). Core parses no YAML itself.
- **core/A11** [core/F26–core/F31]: Resolution is a name lookup among the admitted Nodes with Graph's `named`, then a `{name, id}` resolution of the Definition's `capability` reference. It is not a Kernel reference and adds no reference kind to Graph. Validation is `core/C6`'s `validate`, given only the supplied schema for that Type.
- **core/A12** [core/F32]: `verify` and `kaal verify` report the artifacts beside the Nodes. The existing line `ok: <n> Nodes admitted` keeps its form, so existing evidence still reads it.
- **core/A13** [core/F26]: A Type Definition is typed by `KAAL Definition`. This Change adds no `KAAL Type` Definition and no Foundation Node. A Capability ships its Type Definitions as part of its contribution (`register`), and Guard's `Guard/Check` Definition is a later Guard Change.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C9` PLAN, this Change | Core | `core/C5` |
| `core/C11` DO: recognition, states and `verify` | Core | `core/C9`, `core/C6`, graph/C1 |
| a Guard Change shipping the `Guard/Check` Type Definition | Guard | `core/C11` |

`core/C10` is reserved for the Installation record and Hosting application PLAN proposed on #357.
