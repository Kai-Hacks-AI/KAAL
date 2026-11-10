# Graph: Limitations

What `@kaihacksai/kaal-graph` does not establish. The obligations these concern are in [Requirements](requirements.md).

- **Meaning.** Graph gives no relationship a meaning, and applies no cardinality or other constraint beyond the structure of Edges. What an Edge means is stated by the Node its `type` references.
- **Admission.** Graph reads any Node in Form. Which Nodes an Engine admits is Core's decision, never Graph's, and so is which Node is a root.
- **Resolved Edges.** Queries answer with Edges as declared. A reference may resolve to no Node present, or to a Node of another name. Only `check()`, and the command's `check`, report that, so run it first when you need resolved Edges.
- **Permitted cycles.** `cycles` reports cycles. Whether one is permitted is for whoever owns the meaning.
- **Writing.** `createNode` returns bytes and writes nothing. Publishing them is the caller's.
- **Cost.** graph/N2's bound is stated, not measured. The embedded cases show termination without recursion at scale, not asymptotic cost.
- **Installing from the registry.** Neither `@kaihacksai/kaal-graph` nor Hosting's package has been published yet, so `npm install @kaihacksai/kaal-graph` works only once both are.
- **What `verified` does not establish.** `verified` says the shipped files match the manifest that ships with them, and that the embedded cases passed here. It is consistency evidence, not provenance of the installed bytes. It says nothing about behaviour no case covers, or about your own integration.

## Defects in published versions

None. No version of `@kaihacksai/kaal-graph` has been published.
