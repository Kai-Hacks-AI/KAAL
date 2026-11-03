# Typed Artifacts and Type States: Intent

This is `core/C9`, a PLAN Change. Since `core/C5`, KAAL has two kinds of file that begin with frontmatter. A Node is in the Kernel's Form, and its `type` is a `{name, id}` reference. A typed artifact names its Type as `<Capability>/<Type>` (`core/F6`), for example a Guard declaration with `type: Guard/Check`. Core's Engine admission predates that distinction and rejects every typed artifact as "not in Form". This Change states how an Engine tells the two apart, and what Core can say about a typed artifact's Type. It ships no code. A later DO Change turns the planned tests GREEN.

There is one type system. A Type is a Definition Node that its Capability owns and ships. An artifact refers to that Definition by name, and its owning Capability validates it (`core/F8`).

The ownership this Change establishes is first-stage. Core resolves a Type Definition's `capability: {name, id}` reference and checks that the Capability's name matches the Type's prefix, and it does nothing more. That is not a globally enforced, exclusive claim on the Capability's namespace. Full namespace registration, collision detection and global graph integrity belong to Core's future Capability registration machinery, which `core/C9` does not supply.

- **core/I6.** An Engine tells a typed artifact from a Node by a positive signal in the frontmatter, never by where the file is. Nothing that begins with frontmatter is skipped silently, and a mis-authored Node still fails Form.
- **core/I7.** Every typed artifact's Type is in one precise state: registered, unregistered, unknown or invalid. A missing registration is a remediable finding, not proof that the contents are wrong.
- **core/I8.** Registration and Type integrity can be checked afterwards. A repository may start with Capability-local validation, and once a Type is registered, Core resolves and checks the same artifacts without changing them or how their Capability runs them.
