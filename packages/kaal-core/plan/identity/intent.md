# Identity and numbering: Intent

This is `core/C164`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN. The id is provisional until Release confirms it.

The Owner decided that identity belongs to Core: Core owns identity and uniqueness for Capabilities, Agents, Skills and Exchanges and for the instances they hold, and each capability claims its namespace and its ids against Core. The trigger is practical. Case ids clashed across capabilities three times, and Change, Controls and Release each renumbered by hand. Three retros ask for a finder of the next free id, owned by nobody.

Core already holds the base. A holder claims one scope (core/F49), an instance's identity is opaque text unique in its scope (core/F48), and every claim is a file, a Registration (core/F47). What is missing is that an id has no grammar, so Core cannot say what the next free one is.

- **core/I46.** An id a kind numbers has one grammar, stated once by the kind's owner and checked by Core in every scope. Identity is the pair of the holder's scope and the id, so one number in two scopes is two identities and cannot clash.
- **core/I47.** Core answers once, from the claims it is given, what the next free id of a kind is in a scope, so no capability counts by hand and a gap is never reused by a guess.

Not in this Change: a command, a control, any wiring, reading the registrations from files or from open branches (Hosting reads, and Engineering assembles at merge time), moving a capability's own claim check onto Core (Branching's Change-number claim, Testing's catalog duplicate check), and any renumbering: every id that exists keeps its spelling. `core/C164` names each adopter in its change graph and does none of them.
