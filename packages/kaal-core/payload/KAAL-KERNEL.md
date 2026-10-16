# KAAL Kernel

This is the bootstrap of KAAL. It is not a Node.

## Form

A Node is a UTF-8 Markdown file that begins with frontmatter: a line `---`, YAML, and a closing line `---`, with LF line endings. The frontmatter is one YAML mapping in which every scalar is a string, with no repeated key, tag, anchor or alias. Its `name` is the Node's name, on one line without surrounding whitespace. Its optional `type` is a mapping of exactly `name` and `id` that references the Node's type. Any other key belongs to the capability that defines it, and the Kernel gives it no meaning. A Node contains neither its own id nor any location.

## Identity

A Node's id is the SHA-256, in lowercase hexadecimal, of its exact bytes. Filename and location are not part of identity. A reference is a `name` and an `id`: it resolves to the Node with that id, whose name must match.

## Genesis

`Node` is the first Node and the only one without a type. Every other Node is admitted when its type resolves to an admitted Node.

## Foundation

`KAAL Definition` is typed by `Node`. `KAAL Skill` and `KAAL Extension` are typed by `KAAL Definition`. A Node typed by `KAAL Skill` is a Skill, and a Node typed by `KAAL Extension` is an Extension. With these four admitted, the bootstrap is complete.
