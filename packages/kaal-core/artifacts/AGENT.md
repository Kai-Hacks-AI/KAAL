# KAAL: how to enter

You are reading the entrypoint of a KAAL directory. It only tells you how to reach and read KAAL's Nodes. The Nodes teach KAAL; what they mean is stated there, not here.

KAAL's meaning lives in Nodes. A Node is a Markdown file under `core/` that begins with front matter naming it, and, unless it is the first Node, naming its type. A Node's ID is the SHA-256 of its exact bytes, so it is immutable: changed bytes are another Node. A Node is carried here when `seals/<ID>` exists for its ID. `core/KERNEL.md` is where KAAL begins; it is genesis and not itself a Node.

Nodes refer to one another by name and ID together, never by where they are stored. To follow a reference, find the Node whose ID it gives and check that its name matches.

To start, read `core/KERNEL.md`, then the Nodes it bootstraps. The Nodes that give KAAL's own vocabulary a shared meaning are the KAAL Definitions: the Nodes whose type refers to the `KAAL Definition` Node. Read those, and follow their references to learn the rest.
