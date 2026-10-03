---
name: Node
---

# Node

A Node is a unit of meaning, written as one Markdown file whose YAML frontmatter declares it a Node. It refers to other Nodes only by name and immutable ID, never by location, and it knows nothing of where it is stored.

Node 1 is the genesis exception: it cannot refer to itself, so it declares no type. Every later Node declares `type`, a reference to the Node that defines what a Node is.

Once sealed, a Node never changes. Its ID is the SHA-256 of its exact bytes, so the same bytes are the same Node wherever they live.
