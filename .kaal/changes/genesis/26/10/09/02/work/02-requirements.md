# Requirements

What must hold for `01-intent.md` to be answered. They say what, not how; the how is `03-architecture.md`.

## Identity and the one answer

- R1. A capability's identity is its Node's `{name, id}`, as Core answers it for Nodes typed by Core's `Skill` or `Extension` Node. Nothing derives or stores a capability's identity from a package name, a directory name, a delivery name, an Agent Skill name, a source location or a list.
- R2. Whatever says what an offer carries asks Core, so an offer and an installed capability are described by the same answer. No second answer is kept.
- R3. No registry of capabilities is introduced, in an instance, a tool or a source.
- R4. Core's existing enumeration (`installedSkills()`, `installedExtensions()`) is shown sufficient or insufficient for what follows before anything is added to Core (R25).

## The four responsibilities, kept apart

- R5. **Installed capability discovery**: which Skills and Extensions an instance holds. Core's, from its admitted Nodes.
- R6. **Source discovery**: which capabilities a source offers. A source may be local or remote. What a source says is verifiable and never establishes meaning.
- R7. **Acquisition**: obtaining a chosen capability's bytes from a source. It does not redefine identity.
- R8. **Installation**: verifying acquired bytes and making them available to an instance, through Core's admission, existing Node identities and the host's configuration.
- R9. Each can be used, tested and replaced without the others. No single interface, registry or manifest is the meaning of all four.

## Offline

- R10. An instance says what it holds, and keeps working with it, using only its own installed state: no network, central registry, engineering repository or particular LLM provider.
- R11. Acquiring more is a separate operation from using what is held.

## Source discovery and acquisition

- R12. Given a source, listing its offers selects, acquires and installs nothing, and writes nothing to the instance. Each offer is shown by the `{name, id}` Core gives it and whether the instance already holds it.
- R13. A source is chosen by the caller for each use. Nothing remembers the choice.
- R14. Acquisition is checked against the exact Node ID asked for. Bytes whose Node does not have that ID are refused, whatever the source says.
- R15. The first source mechanism is the smallest useful one. A remote source is added only if shown necessary.

## Installation and delivery

- R16. A capability is selected by the exact ID of its Node. A name, or an ID not offered, is refused.
- R17. Installation goes through Core's registration. A sealed byte is never given other bytes; changed bytes are another Node. Installing again changes nothing.
- R18. A capability that declares a need for another which the instance does not hold is refused with nothing written, naming what is missing.
- R19. Delivery (where Agent Skills and the entrypoint land) is separate from capability identity and can differ by host.
- R20. After installing, an instance verifies what it holds against what it acquired, naming each difference. Verification never repairs.

## Trust

- R21. Matching a requested content identity proves the bytes are those of that identity. It does not authenticate the source, nor that the identity is the capability the caller meant. The two are distinguished wherever verification is described, and what is not provided is stated.

## Modes

- R22. Engineer, Embed and External use the same capability meanings and the same Core answer. They differ in where the Engine, the Record and the Subject are, not in what a capability is.
- R23. In External, composition acts on the Engine, never on the Subject. The Subject acquires no KAAL artifact because KAAL operates on it.
- R24. Engine, Record and Subject locations are never derived from one another, as settled by Change `08/03`.

## Constraints

- R25. A new Core concept or API is added only if a requirement above cannot be met without it, and the smallest missing mechanism is shown first.
- R26. Packaging is not implemented here. A future packaging capability asks Core what is available; package identity, capability identity, delivery naming and Agent Skill naming stay distinct.
- R27. Core's sealed Nodes, seals and public API are not changed by this Change. If Core must change, that is its own Change and travels alone.
- R28. Enercon is not modified.

## 0.0.1

- R29. The first realization is the minimum that shows, offline and end to end, listing what is held, listing what a local directory of packages offers, and installing one chosen capability by its exact Node ID, with the refusals in R14, R16 and R17, and with the Subject untouched in External.
- R30. It prefers a demonstrable minimum over a comprehensive implementation, and reports decisions that need the Owner before implementation.
- R31. It keeps this Change's Intent and Change `05/04`'s separate: capability identity is Core's, package or source identity is the source's and proved by hashing, and delivery naming and placement are the instance's.

## What these requirements do not decide

The interface (a CLI or otherwise), where the mechanism lives, which source adapters exist beyond the first, and how a remote source would be listed or authenticated. `03-architecture.md` investigates and recommends.
