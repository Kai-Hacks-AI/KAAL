# Reference: a Skill Node

```
---
name: <Node name>
type:
  name: KAAL Skill
  id: <id of Core's KAAL Skill Node>
---

# <Node name>

<What the capability means to KAAL, and its scope.>
```

The frontmatter follows the Kernel's Form exactly: a `---` line, `name: `, then `type:` with the indented `  name: ` and `  id: ` lines, and a closing `---`. Use LF line endings and UTF-8. The `id` is the id of Core's `KAAL Skill` Node.

Whether a Node is in Form, what its id is, whether its type resolves, and whether an Engine admits it as a Skill are all Core's to decide. Ask Core with `kaal identify`, `kaal resolve` and `kaal register`, as the Engine's `AGENTS.md` and `KAAL-KERNEL.md` describe. Do not restate or re-check those rules elsewhere.
