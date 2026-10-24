# Deterministic Frontmatter: Architecture

Each element names, in brackets, the Requirements it answers.

- **A1** [F1–F6, N2]: The schema format and the validator are Core's, in `kaal-core`, as the subpath export `kaal-core/frontmatter`:
  - `checkSchema(schema)` returns the schema's findings, empty when the schema is valid;
  - `validate(bytes, schemas)` returns `{ verdict, findings }`. The verdict is `valid`, `invalid` or `unknown`, and each finding names its `key` and its `rule`.
  
  Both are pure: they read nothing from the host and write nothing.
- **A2** [F5, N2]: Reading the YAML frontmatter is Graph's Form reading, not Core's. If Graph offers no reader for an artifact that is not a Node, `core/C6` depends on a Graph Change that adds one, numbered by Graph. Core never parses YAML itself.
- **A3** [N1, N3]: Schemas are JSON, a machine contract. Core owns the schema format. Each Capability owns the schemas of its own artifact kinds, and the artifacts themselves.
- **A4** [N1]: Core decides nothing about when validation runs, or what it gates. Engineering applies validation to Capability-owned artifacts (`engineering/C…`, numbered by Engineering). Testing owns what a finding means as evidence (`testing/C3`).

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C5` PLAN, this Change | Core | none |
| `core/C6` the validator, A1 | Core | `core/C5`, and Graph's reader (A2) if one is needed |
| `testing/C3` conformance findings as evidence | Testing | `core/C5` |
| `engineering/C…` applying validation | Engineering | `core/C6`, `testing/C3` |
| `core/C4` Agent Realization, F7's rendering | Core | `core/C3`, `core/C5` |
| `guard/C24` boundary tests, `guard/C25` implementation | Guard | `core/C5` |
