---
name: Installation Contract
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Installation Contract

An Installation Contract states what an installation of one Capability is, in one installer-neutral JSON document that names this Definition as its format. It names the Capability and its version; lists the assets, each with its source in the package, its target in the repository and its kind; carries the catalogue of every content each target has had in a published version; names the record its lifecycle keeps; states the runtime it needs; and lists the Skills an agent must reach, never where they are.

The lifecycle rules are the format's and the same for every asset: install only where absent, keep a modified file and report it, remove only an unmodified file, and prune the directories a removal empties. Any installer that realizes a contract, the Capability's own or Core, leaves a repository the other can upgrade and remove.
