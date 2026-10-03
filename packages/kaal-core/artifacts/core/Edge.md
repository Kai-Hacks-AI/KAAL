---
name: Edge
type:
  name: Node
  id: f1146d78698d82a2934e5e58f623723bf22db6e92f8c6959fbc07f36c52a5eca
---

# Edge

An Edge is a pointer from one Node to others. The Node that declares it is the source. It points only to Nodes that are already sealed, and it refers to each by a pair: its name and its immutable ID. The ID is the identity, and the name can be checked by resolving that exact Node. An Edge never refers to where a Node is stored, and nothing is changed in the Nodes it points at.
