# KAAL Kernel

This is the bootstrap of KAAL. It is not a Node.

## Form

A Node is a UTF-8 Markdown file that begins with this frontmatter: a line `---`, a line `name: ` followed by the Node's name, optionally a line `type:` followed by the indented lines `  name: ` and `  id: ` that reference its type, and a closing line `---`. A Node contains neither its own id nor any location.

## Identity

A Node's id is the SHA-256, in lowercase hexadecimal, of its exact bytes. Filename and location are not part of identity. A reference is a `name` and an `id`: it resolves to the Node with that id, whose name must match.

## Genesis

`Node` is the first Node and the only one without a type. Every other Node is admitted when its type resolves to an admitted Node.

## Foundation

`KAAL Definition` is typed by `Node`. `KAAL Skill` and `KAAL Extension` are typed by `KAAL Definition`. A Node typed by `KAAL Skill` is a Skill, and a Node typed by `KAAL Extension` is an Extension. With these four admitted, the bootstrap is complete.
