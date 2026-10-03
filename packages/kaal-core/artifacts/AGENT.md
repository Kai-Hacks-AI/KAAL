# KAAL: how to enter

You are reading the entrypoint of a KAAL directory. It only tells you how to enter KAAL and navigate its Nodes. The Nodes teach KAAL; what they mean is stated there, not here.

KAAL's meaning lives in Nodes. A Node is a file that begins with front matter naming it and, unless it is the first Node, naming its type. A Node's ID is the SHA-256 of its exact bytes, so it is immutable: changed bytes are another Node. A Node is sealed when `seals/<ID>` exists for its ID. Nodes refer to one another by name and ID together, never by where they are stored, so do not look for Nodes by crawling the files: follow references.

Navigation begins in `core/`. Read `core/KERNEL.md`, where KAAL begins; it is genesis and not itself a Node. Then read the Nodes it bootstraps, and the KAAL Definitions there: the Nodes whose type refers to the `KAAL Definition` Node. From Core, follow references to whatever else KAAL offers, wherever its Nodes are stored. To follow a reference, find the Node whose ID it gives and check that its name matches.
