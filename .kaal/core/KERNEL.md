# Kernel

This file is the genesis of KAAL. It is not a Node. It is the minimum needed to bring the first Nodes into being, in this order, and it fixes no schema a Node may not later outgrow.

## Node

Node 1 is `Node`, handcrafted. A Node is a unit of meaning in one Markdown file. It knows nothing of where it is stored. Node 1 is the genesis exception: it cannot refer to itself, so it declares no type.

## Immutability

Seal Node 1. To seal a Node is to take the SHA-256 of its exact bytes: that hash is the Node's ID, and a record of it admits that exact Node. A seal does not make a file a Node; Form does. A sealed Node never changes; to change a meaning, birth a new Node.

## Form

Form is how the next Node is handcrafted. A Node is a Markdown file that begins with YAML frontmatter declaring `name`, its own name, and `type`, a reference to the Node that defines what a Node is. A reference to a Node is a pair of `name` and `id`: the id is the identity, and the name can be checked by resolving that exact Node. A Node never contains its own ID or any location. Later Nodes may supersede this Form; the Kernel does not.

## Edge

Node 2 is `Edge`, handcrafted through Form with Node 1 as its type, then sealed. With both sealed, the bootstrap is complete.
