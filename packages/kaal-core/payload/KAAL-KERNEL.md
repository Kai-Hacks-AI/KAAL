# KAAL Kernel

This file is the bootstrap of KAAL. It is not a Node. It is the minimum needed to bring the first Nodes into being, in order, and it fixes no schema a Node may not later outgrow.

## Form

A Node is a Markdown file in UTF-8 that begins with YAML frontmatter in exactly this form: a line `---`, a line `name: ` followed by the Node's own name, optionally a line `type:` followed by the indented lines `  name: ` and `  id: `, and a closing line `---`. `type` is a reference to the Node that defines what this Node is. A reference is a pair of `name` and `id`: the id is the identity, and the name is checked by resolving that exact Node. A Node never contains its own id or any location.

## Identity

A Node's id is the SHA-256, in lowercase hexadecimal, of its exact bytes. The same bytes are the same Node wherever they are stored, and other bytes are another Node. Filenames and locations are not part of identity.

## Genesis

Node 1 is `Node`, handcrafted. It cannot refer to itself, so it declares no type, and it is the only Node that may. Every other Node is admitted when its type resolves, by id with the name checked, to a Node already admitted.

## Foundation

Through Form, handcraft `KAAL Definition` with `Node` as its type, then `KAAL Skill` and `KAAL Extension`, each with `KAAL Definition` as its type. With these four admitted, the bootstrap is complete.
