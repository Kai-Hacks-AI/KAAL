---
name: Node
---

# Node

A Node is a unit of meaning, written as one Markdown file whose frontmatter declares its name and, except for this Node, its type. It refers to other Nodes only by name and id, never by location, and it knows nothing of where it is stored.

This Node is the genesis exception: it cannot refer to itself, so it declares no type. Every other Node declares `type`, a reference to the Node that defines what it is, and every chain of types ends here.

A Node's id is the SHA-256 of its exact bytes, so the same bytes are the same Node wherever they live, and different bytes are a different Node.
