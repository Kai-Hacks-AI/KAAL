# Identity and numbering: Intent

This is `core/C164`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN. The id is provisional until Release confirms it.

The Owner decided that identity belongs to Core: Core owns identity and uniqueness for Capabilities, Agents, Skills and Exchanges and for the instances they hold, and each capability claims its namespace and its ids against Core. The trigger is practical. Case ids clashed across capabilities three times, and Change, Controls and Release each renumbered by hand. Three retros ask for a finder of the next free id, owned by nobody. The CPO's review of the first version adds the cut that makes renumbering safe: a human-facing id is not the thing's identity.

Core already holds the base. A holder claims one scope (core/F49), an instance's identity is opaque text unique in its scope (core/F48), and every claim is a file, a Registration (core/F47). What is missing is a grammar for the id a person reads, a stable identity under it, and a judgment on a proposed id.

- **core/I46.** An instance has two identities that are never confused. Its **technical identity** is opaque, immutable and never reused. Its **identifier**, the one a person or an agent reads and writes, is qualified by its namespace (`core/C164`), follows its kind's numbering, and may be renumbered without changing the technical identity.
- **core/I47.** Core owns two contracts over the claims it is given, and holds no registry of its own. `nextID` proposes the next identifier of a kind in a namespace. `checkID` verifies that a proposed identifier is valid and held by one technical identity alone. A proposal reserves nothing, so a competing claim is found at integration, where `checkID` is judged again on the union of the claims.
- **core/I48.** A reference survives a renumbering, and an identity that exists today is adopted without renumbering anything.

Not in this Change: a command, a control, any wiring, reading the claims from files, from open branches or from a merge queue (Hosting supplies them, and Engineering and Release put `checkID` into CI), moving a capability's own claim check onto Core (Branching's Change-number claim, Testing's catalog duplicate check). Those are other capabilities' Changes. `core/C164` names each in its change graph and does none of them.
