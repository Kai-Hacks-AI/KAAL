# Intent elements as Nodes: Testing

The cases go in `packages/skills/kaal-intent/test/intent.test.mjs` with `intent/C2`. Each is first observed RED against the deliberately wrong state named, and a RED that shows only a missing file or export counts as blocked.

| Test | Checks | Deliberately wrong state that makes it RED |
| --- | --- | --- |
| intent/T1 | An Intent element Node written in the form of `references/intent.md` is identified by Graph's `identify`, its name `<capability>/I<n>`, its type the `Intent` Definition by name and id | The reference without the Node form |
| intent/T2 | A name that does not follow intent/F2, such as `graph/F4` or `I7`, is refused by the identification rule, naming it | A rule that accepts any valid Node name |
| intent/T3 | With a fixture Requirement Node whose Edge, typed by a fixture `Serves`, targets an Intent Node, Graph's `traverse(intentId, { direction: "in" })` reaches the Requirement. Re-identified after an edit to the Intent, the Edge reads as pinned to the earlier version in `check()` | An Intent Node that carries its own Edges to Requirements |
| intent/T4 | `ownership.kaal.json` claims exactly `packages/skills/kaal-intent/` and names `Intent` by the id of `payload/Intent.md` | No claim |

intent/T3 uses a fixture `Serves`, never Requirements' own Definition, so Intent's tests do not depend on Requirements' package.
