# What a Change Changes, and Its Selected Scope: Architecture

Each element names, in brackets, the Requirements it answers.

- **change/A17** [change/F33–change/F37, change/N8]: **Two more outgoing statements, read like `requires`.** `assess` reads `alters` and `scope` from each walked Change Node's frontmatter, checks only their form, and adds the views and exchange members of change/F36. It imports nothing new. Graph still represents the Nodes, and Change still owns every finding.
  - **Identities, not Edges.** An element is stated by its owner's identity, as a required Case is (change/F15). Today the elements are rows in their owners' Markdown, not Nodes, so there is nothing to pin. When an owner makes its elements Nodes (prerequisite P2 of `engineering/C11`), a later Change of Change's own can add an Edge type for them, as Succeeds and Delivers are. Until then, the tracer resolves an identity to a Node by name.
  - **The forms.** An element identity is `^[a-z][a-z0-9-]*\/[A-Z]+[1-9][0-9]*$`. A capability name is `^[a-z][a-z0-9-]*$`, the namespace of change/F2.
  - **Who reads them.** Engineering's `check.mjs` reads the Change Node on the target, through `exchange()` or the views, and computes impact and judges paths itself (`engineering/C11`). Neither capability imports the other's meaning.

## Ownership

| Who | Owns |
| --- | --- |
| Change | the `alters` and `scope` statements, their forms, and their findings |
| Each element's owner | what its element is, its identity, and its traces (prerequisite P2) |
| Engineering | impact by reverse traceability, the isolation verdict, and its defaults (`engineering/C11`) |
| Testing | the ownership claim format that attributes paths to capabilities (prerequisite P3, `testing/C24`) |
| Core | Capability registration, which says who owns a namespace (`core/C24`) |

## Change graph

| Change | Owner | Succeeds |
| --- | --- | --- |
| `change/C9` PLAN, this Change | Change | `change/C1` |
| DO of `change/C9`: change/A17, change/T36–change/T40 GREEN | Change | `change/C9`, and `change/C8`, the DO of `change/C1` (#662) |
| `engineering/C11` DO, reading `alters` and `scope` | Engineering | the DO of `change/C9`, and prerequisites P2 and P3 |
