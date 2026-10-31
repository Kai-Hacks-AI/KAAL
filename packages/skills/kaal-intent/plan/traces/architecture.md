# Intent elements as Nodes: Architecture

- **intent/A1. The type is the existing Definition** [intent/F1, intent/F2]. No new Definition is added. `Intent-Definition.md` gains one paragraph stating intent/F2's identification, and the reference `references/intent.md` gains the Node form of an Intent element: frontmatter `name: <capability>/I<n>`, `type: Intent` by name and id, and the Intent's text as body. The Definition's id changes with that paragraph, so the DO re-pins every reference to it in Intent's own package.
- **intent/A2. Edges point from Requirement to Intent** [intent/F1, intent/F5]. `Serves` Edges go out from a Requirement Node, as Requirements defines them. Intent adds no Edge and no reverse index. Impact from an Intent is `traverse(id, { direction: "in" })` in Graph, as `engineering/C11` already plans.
- **intent/A3. The claim** [intent/F6]. `ownership.kaal.json`: `{ "owner": { "kind": "capability", "name": "Intent", "id": <sha256 of payload/Intent.md> }, "paths": ["packages/skills/kaal-intent/"] }`.
- **intent/A4. The other locations this thread owns are already claimed** [intent/I2]. Graph (`packages/skills/kaal-graph/ownership.kaal.json`) and Agents (`packages/skills/kaal-agents/ownership.kaal.json`) each claim their package directory today. No change is planned for them.

## Change graph

| Change | Owner | Waits on |
| --- | --- | --- |
| `intent/C1` PLAN (this) | Intent | — |
| `intent/C2` DO: intent/A1, intent/A3, with intent/T1–intent/T4 | Intent | `intent/C1` |
| Requirements' `Serves` PLAN and DO | Requirements | coordinated with `intent/C1`, which it cites |
| `engineering/C11` DO | Engineering | P1–P3, including `intent/C2` |

Converting a capability's own Intent elements to Nodes stays that capability's, under intent/F4, starting with its first Change that states one as changed.
