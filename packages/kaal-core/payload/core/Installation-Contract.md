---
name: Installation Contract
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Installation Contract

An Installation Contract states what an installation of one Capability is, in one installer-neutral JSON document that names this Definition as its format. It names the Capability and its version; lists the assets, each with its source in the package, its target in the repository, its kind and, for an asset installed only when a consumer opts in, its `surface`; carries the catalogue of every content each target has had in a published version; names the record its lifecycle keeps; states the runtime it needs; and lists the Skills an agent must reach, never where they are.

The lifecycle rules are the format's and the same for every asset: install only where absent, keep a modified file and report it, remove only an unmodified file, and prune the directories a removal empties. Any installer that realizes a contract, the Capability's own or Core, leaves a repository the other can upgrade and remove.

The record is a JSON object whose `assets` member maps the repository-relative path of every file the Capability owns in the repository to its `sha256` and the `version` that wrote or last confirmed it. Every other member belongs to the Capability. An installer that is not the Capability's own lifecycle keeps those members unchanged and adds none of its own. It registers each file it writes, and only those: a file it finds at a target is not registered, even when its bytes match the catalogue. Every file has one record. A Skill a contract delivers is the Capability's at its canonical location, and another installer's own record holds only the deployments it makes from it. No installer but the Capability's own lifecycle installs an asset marked with a `surface`.
