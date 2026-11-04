# Installation Contract Conformance Cases: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A31** [core/F62–core/F64, core/N18]: `kaal-core/conformance` is a new export.
  - **What it exports.** `installationConformance(instance, check = checkContract)` returns the four cases' results, in order: `{ id, holds, failures }[]`.
  - **What it imports.** Only `./installation`. It imports no test harness and no host module.
  - **What runs it.** A test runner wraps each result in its own test: Engineering's `engineering/C4` over discovered instances, and Core's own tests over the sample contract. The module itself registers no test.
  - **Production runtime.** No runtime entry point imports it: not `.`, `./installation`, `./agent`, `./realization` or `./frontmatter`, nor the `kaal` bin. It ships in the package so that Engineering can import it from the workspace, and nothing in Core's runtime loads it.
- **core/A32** [core/F65]: Core's sample contract is the core/C3 fixture. `test/plan/conformance.test.mjs` runs the cases against it. `test/plan/installation.test.mjs` stays as it is: its tests are immutable to DO and CHECK, and they remain Core's direct evidence for core/T10–core/T13.

## Ownership

| Who | Owns |
| --- | --- |
| Core | the cases, their mutations, `kaal-core/conformance` and its result shape |
| Engineering (`engineering/C4`, #607) | discovering every tracked `contract.json`, running the cases against each instance, and recording that evidence |
| Each Capability | its own instance |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C31` PLAN, this Change | Core | `core/C3`, `core/C4` |
| `core/C31` DO: `kaal-core/conformance`, with core/T68–core/T71 GREEN | Core | `core/C31` PLAN |
| `engineering/C4` DO: run the cases against every discovered instance | Engineering | `core/C31` DO on `main`, then a sync of `main` into `kaal/engineering` |
