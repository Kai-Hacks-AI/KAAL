# Packaging Readiness (LOVE): Intent

This is `architecture/C2`, a PLAN Change. It ships no code and no test file. It plans what Architecture needs before it can be offered as a reusable, independently versioned package: Lifecycle, Ownership, Verification and Encapsulation (LOVE). Core manages structure, composition, installation and lifecycle. Architecture owns only its semantics: architectural decisions and their grounds, and URBAN. Readiness is not authorization to publish. Publishing, and any package name or registry it needs, is a separate Owner decision.

`architecture/C1` delivered `kaal-architecture`: the Node `Architecture`, the Definition `URBAN`, an Agent Skill and their tests. Measured against LOVE, it stands as follows:

| | Today | Gap |
| --- | --- | --- |
| Lifecycle | `npm install` and `kaal register` add it. There is no installer-neutral statement of what an installation is, so nothing can upgrade or remove it | no Installation Contract instance |
| Ownership | the package is claimed by name and id. The Node bounds Architecture against Engineering and Testing | `Architecture` is typed `KAAL Skill`, but it is a responsibility that overlaps no other, which Core defines as a `KAAL Capability`. Its boundary with Requirements is not stated |
| Verification | its own unit tests, and an Acceptance scenario that installs the packed package | nothing checks the package against Core's Installation Contract or Agent Realization |
| Encapsulation | consumers see two Nodes and an Agent Skill. The package exports nothing else | nothing checks that an agent receives the Agent Skill as the package ships it |

**The Owner's decision on the type (#274, 2026-10-26): option (a).** Architecture owns architectural decisions and their grounds, so it is a `KAAL Capability`, with its own Capability identity and ownership claim. It is retyped in this LOVE path, in `architecture/C5`, and `architecture/C1` stays as scoped. The Agent Skill stays a distinct, consumable instruction surface, and `URBAN` stays a Definition. Nothing here authorizes packaging or publication.

**Amended in `architecture/C7` (the Owner's review on #485, 2026-10-26).** Engineer Skill owns the Skill format and how `SKILL.md` is read, and Core deploys a Skill's files with the bytes the Capability ships. Architecture owns its canonical Agent Skill and its Installation Contract, not a Core-rendered variant, so its catalogue holds the shipped bytes once.

- **architecture/I1.** Any installer that realizes Architecture's Installation Contract, Core or another, can install, upgrade and remove it, and every installation states its version.
- **architecture/I2.** Architecture is one Capability whose responsibility overlaps no other: it decides and grounds, Requirements states what must hold, Engineering realizes, and Testing designs the tests and judges their evidence.
- **architecture/I3.** A consumer reaches Architecture only through its Nodes and its Agent Skill. An agent of every provider the consumer declares reaches the Skill as Core realizes it.
