# KAAL Kernel

This is the bootstrap of KAAL. It is not a Node.

## Form

A Node is a UTF-8 Markdown file that begins with frontmatter: a line `---`, YAML, and a closing line `---`, with LF line endings. The frontmatter is one YAML 1.2 mapping, read with the core schema, whose keys are strings and never repeat, with no anchor, alias or merge key and no tag outside the core schema. Its `name` is the Node's name, read as written, on one line without surrounding whitespace. Its `type` is a mapping of exactly `name` and `id`, read as written, that references the Node's type; every Node has one except the genesis `Node`. Any other key belongs to the capability that defines it, and the Kernel gives it no meaning. A Node contains neither its own id nor any location.

## Identity

A Node's id is the SHA-256, in lowercase hexadecimal, of its exact bytes. Filename and location are not part of identity. A reference is a `name` and an `id`: it resolves to the Node with that id, whose name must match.

## Genesis

`Node` is the first Node and the only one without a type. Every other Node is admitted when its type resolves to an admitted Node.

## Foundation

`KAAL Definition` is typed by `Node`. `KAAL Capability`, `KAAL Agent`, `KAAL Skill` and `KAAL Extension` are typed by `KAAL Definition`. A Node typed by one of them is, respectively, a Capability, an Agent, a Skill or an Extension. With these six admitted, the bootstrap is complete.
