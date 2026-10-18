# Reference: Edges

Edges are the `edges` key of a Node's frontmatter: a sequence of groups. Each group is a mapping of exactly `type` and `targets`.

```
edges:
  - type:
      name: <name of the Node defining the relationship>
      id: <its id>
    targets:
      - name: <target name>
        id: <target id>
      - name: <another target>
        id: <its id>
```

- `type` is exactly one reference: `name` and a lowercase hex SHA-256 `id`.
- `targets` is a nonempty sequence of references, with no target twice.
- A Node has at most one group per `type`.
- Every reference resolves to a Node that is present, by `id`, with its `name` matching.
- A reference's `name` and `id` are YAML strings. Frontmatter is YAML 1.2, so quote one that YAML would read as another type: an `id` of digits only, or digits with one `e`, is a number unless quoted.

A Node whose `edges` break any of these rules is reported, never repaired, and none of its Edges is used. A Node without `edges` has no outgoing Edges.
