# Reference: a KAAL Skill's contribution

## A Skill Node

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

The frontmatter is exactly this Form: a `---` line, `name: `, then `type:` with the indented `  name: ` and `  id: ` lines, and a closing `---`. LF line endings, UTF-8. The id is 64 lowercase hex characters, the SHA-256 of the exact bytes of Core's `KAAL Skill` Node. A Node's own id is the SHA-256 of its own exact bytes, so any changed byte makes it another Node.

A contribution may carry more than one Node. At least one must be typed by `KAAL Skill`, none by `KAAL Extension`, and every Node's type must resolve, by id with the name checked, against the Engine and the contribution together.

## What registration requires

`kaal register skill <capability> <dir>`, or `registerSkill(engine, capability, files)` from kaal-core, accepts a contribution only as a whole. Every file is a Node in Form at a relative `.md` path, so `package.json`, scripts or the Agent Skill never belong in `payload/`. All checks run before anything is written. Registering the identical contribution again changes nothing, and a capability already registered with other content is refused.
