# Capability identity and delivery identity: requirements

What the design must satisfy. Each requirement is stated so an outer test can be written for it before implementation.

## Questions the design must answer

1. What existing Node represents the authoritative identity of a delivered capability?
2. Does that Node already contain enough to determine its delivery identity?
3. If not, is a new explicit property justified?
4. Is delivery identity itself sealed, or only some relationship to it?
5. What exactly does `capability-prefix` configure?
6. Given a sealed capability identity and an instance prefix, can the expected delivery directory be determined mechanically?
7. Should registration accept an arbitrary delivery name, or eventually verify it against sealed authority?
8. Should the configuration checker eventually compare actual delivery locations with expected ones?
9. What happens when an instance changes its prefix?
10. Can a capability be moved to another delivery location with its Node identity and seals unchanged?
11. How does this interact with packages, Agent Skills, engineering directories and the installed projections?
12. Is "capability" represented clearly enough, or are Skill, package and delivery directory being conflated?

## Requirements

**R1. One authority for what a capability is.** Exactly one sealed thing answers "which capability is this". Nothing read from a delivery directory name answers it.

**R2. Delivery location is never identity.** No check, registration or discovery may learn a capability's identity from the name of the directory it is in. Discovery already finds Skills by Node type wherever stored; that stays true.

**R3. Sealed authority is explicit, never interpreted.** If delivery identity needs sealed authority, it is stated, not computed from a human-readable name. No slugging, stop-word or normalisation rule may be introduced to obtain it.

**R4. A smallest-addition rule.** A new property or Node is admitted only if R1 to R3 cannot be met without it. The Node Form is `name` and `type`; widening it is a change to Core's bootstrap and is the most expensive option, so it must be justified against alternatives that do not touch it.

**R5. Retrofit.** A sealed Node never changes. Any approach must say how the three capabilities that already exist (Changing KAAL, Engineering Skill, Sealing) acquire whatever authority is required, without a byte of their sealed Nodes changing, or say that they cannot and what follows from that.

**R6. Placement is checkable without deriving it.** The checker's verdict is a function of the admitted graph, the instance configuration and the files, with no judgement. Where no sealed authority supplies a capability portion, the design says so and does not invent one; if it did, the expected name would be the prefix followed by that portion by concatenation and nothing more.

**R7. Prefix stays instance-owned.** Changing `capability-prefix` changes verdicts only. It touches no Node, ID or seal. The configuration stays plain, unsealed and human-editable.

**R8. Migration without identity change.** Moving a capability to another delivery name, by editing the prefix and relocating, leaves its Node bytes, IDs and seals identical, and relocation is an explicit act, never performed by a check or by registration.

**R9. Registration stays an observer of configuration.** Registration does not read or enforce the prefix. Whether it should verify a delivery name against sealed authority is decided here; if it does, it is a verification of the name it is given, not a source of names.

**R10. Source-side names are separate from delivery names.** The name of a capability's package, its engineering directory and any published name are source-side identities. The design states which of them, if any, the instance prefix governs. The default is that it governs only the instance's own delivery directories.

**R11. The Agent Skill is named by its standard.** The Agent Skills standard requires a skill's `name` to equal its directory name. The design states how the delivery name of the Agent Skill relates to the delivery name of the KAAL contribution, and what an instance prefix change means for it, without KAAL defining a competing format.

**R12. Typed discovery is the one source of what is held.** What an instance holds is answered by Core's typed discovery, by Node, and a future tool maps those identities to deliverable bytes through its source, proved by hashing. No delivery name, package name or directory is consulted to learn it.

**R13. No Core growth beyond need.** Core gains no knowledge of any particular capability. Any generally useful definition it needs is stated once, generally.

**R14. No Git, GitHub or host concepts** in any artifact of this Change.

## Acceptance sketch (outer, before implementation)

- A delivery directory renamed, with nothing else touched, leaves every Node ID and seal and the set of held Skills and Extensions unchanged, and changes only the checker's verdict.
- Two directories holding the same Node are reported; a directory holding no typed Node is reported; neither depends on the directory's name.
- A tool that is asked what is held, and what a source offers, never reads a package or directory name to decide either.
- No test depends on any name being derived from a Node's human-readable name, and none requires a sealed delivery stem.
