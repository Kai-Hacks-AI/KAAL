# Stating what a Change depends on

State a dependency only when the Change fails without its predecessor delivered. Order of work, priority and shared files are not dependencies.

In the Change's record, list each hard predecessor under `succeeds` with three parts:

- `change`: the predecessor's identity, `<namespace>/C<n>`.
- `pin`: the SHA-256, lowercase hexadecimal, of the exact bytes of the predecessor's record file.
- `because`: one line saying what fails without it.

Keep three questions apart. Which Change is depended on is the identity. Which version it was written against is the pin. Whether it is delivered is neither: unchanged bytes can sit on work that never merged, and delivered work can differ from the bytes pinned.

When a predecessor's record is edited, every Change that pins it must be read again and pinned anew; nothing does that for you. Do not state successors or overlapping files: both are derived from the other records.

`readSuccession(records, { pinOf })` from `@kaihacksai/kaal-change/succession` returns the valid edges and the findings for the records it is given.
