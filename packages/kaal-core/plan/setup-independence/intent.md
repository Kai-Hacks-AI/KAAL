# Setup independence: Intent

This is `core/C162`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN. The id is provisional until Release confirms it.

The CPO asked Core to define setup independence: what it takes for a capability package to install and run without other KAAL packages. Today the rule exists only per package. Review's product contract says a delivered package needs no other KAAL package, and Core's own standalone Change says it of Graph, each proved by its own harness. Nothing states it once, for every capability. Kai's layering holds: platform mechanics belong to Hosting, and Foundation holds shared KAAL semantics above the hosting abstraction. So the two shared packages are the only ones a setup-independent package may need.

- **core/I44.** Core states, once and generically, what setup independence is: a product property of a capability package. Its runtime needs name no KAAL package except Foundation and Hosting. The property is the package's own and has one definition. No adopter widens it.
- **core/I45.** Core keeps three judgements distinct. A package is **declared** independent when its manifest names no other KAAL package. It is **demonstrated** independent when an isolated installation of the packed package runs without one. A setup **accepts** a dependency when its adopter decides that package is acceptable there. An acceptance can make a setup acceptable. It cannot make the package independent.

Core judges what a package declares and reports the demonstration as unknown, because the isolated installation belongs to the capability's own acceptance harness, as in Review's.

Not in this Change: a command, a control, a baseline of today's offenders, any wiring, the isolated-install harness, and the dependency direction between Foundation and Hosting, which are those packages'. `core/C162` names the adopting control and the baseline in its change graph and does none of them.
