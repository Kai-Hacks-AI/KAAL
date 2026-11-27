# Setup independence: Intent

This is `core/C162`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN. The id is provisional until Release confirms it.

The CPO asked Core to define setup independence: what it takes for a capability package to install and run without other KAAL packages. Today the rule exists only per package. Review's product contract says a delivered package needs no other KAAL package, and Core's own standalone Change says it of Graph, each proved by its own harness. Nothing states it once, for every capability. Kai's layering holds: platform mechanics belong to Hosting, and Foundation holds shared KAAL semantics above the hosting abstraction. So the two shared packages are the only permitted ones.

- **core/I44.** Core states, once and generically, what setup independence is: a capability package's runtime needs name no KAAL package except the shared ones, Foundation and Hosting. Core judges what a package declares. The isolated installation that proves it stays with the capability's own acceptance harness, as in Review's.

Not in this Change: a command, a control, a baseline of today's offenders, any wiring, the isolated-install harness, and the dependency direction between Foundation and Hosting, which are those packages'. `core/C162` names the adopting control and the baseline in its change graph and does none of them.
