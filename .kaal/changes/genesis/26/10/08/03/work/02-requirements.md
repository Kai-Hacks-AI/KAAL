# Requirements

What must hold for `01-intent.md` to be answered. They say what, not how; the how is `03-architecture.md`. Revised after the Owner's architectural input on the PR (2026-10-09): four things are kept apart, and Core's answer is the one answer.

## The four things, kept apart

- **Enumeration**: which capabilities an instance holds. This is Core's, and only Core's.
- **Offers**: which capabilities a source has. A source's.
- **Acquisition**: getting a chosen offer's bytes from a source.
- **Delivery and installation**: registering the bytes through Core and projecting them into the host.

## One answer, no parallel identity

- R1. A capability's identity is its Node's `{name, id}`, as Core answers it for the Skills and Extensions typed by Core's `Skill` and `Extension` Nodes. Nothing here derives or stores a capability's identity from a package name, a directory name, a delivery name or a list.
- R2. Whatever says what an offer carries asks Core, so that an offer and an installed capability are described by the same answer. Nothing keeps a second answer.
- R3. No registry of capabilities is introduced, in the instance or in a tool.

## Held state, offline

- R4. An instance says what it holds using only its own `.kaal/`: its Skills and Extensions as `{name, id}` from Core. No network, source or engineering checkout is read.
- R5. Everything it holds keeps working with no source reachable.

## Offers

- R6. Given a source, an instance can list the offers that source has. Each is identified by the `{name, id}` Core gives for its Node, and says whether the instance already holds it.
- R7. Listing selects, acquires and installs nothing, and writes nothing to the instance.

## Acquisition

- R8. An instance can acquire a chosen offer's bytes from a source without installing them. They have the shape a package delivers today: Nodes and seals, and Agent Skills where there are any.
- R9. A source is chosen by the caller for each use and may be local or remote. Nothing remembers the choice.
- R10. Acquisition is checked against the exact Node ID asked for. Bytes whose Node does not have that ID are refused, whatever the source says.

## Delivery and installation

- R11. Installation goes through Core's registration, so Core's admission decides. A sealed byte is never given other bytes.
- R12. A capability is selected by the exact ID of its Node. A name, or an ID not offered, is refused.
- R13. A capability that declares a need for another which the instance does not hold is refused with nothing written, naming what is missing.
- R14. Installing the same thing again changes nothing.
- R15. The host projection (where Agent Skills and the entrypoint land) is separate from enumeration and from acquisition, and can differ by host without changing what a capability is.

## Control and verification

- R16. After installing, an instance verifies what it holds against what it acquired, naming each difference. Verification never repairs.
- R17. Nothing is added that was not chosen, and nothing remembers a selection outside installed state.

## One meaning in every mode

- R18. Engineer (the source repository), Embed (an instance in a host) and External use the same capability meanings and the same Core answer. They differ in where the source is and where the projection lands, not in what a capability is or how it is identified. The instance works offline in each.

## Constraints

- R19. A new Core concept is added only if a requirement above cannot be met without it, and the smallest missing mechanism is shown before anything is added.
- R20. Core's sealed Nodes, seals and public API are not changed by this Change. If Core must change, that part is its own Change and travels alone.
- R21. Enercon is not modified.

## What these requirements do not decide

The interface (a CLI or something else), where it lives, which sources exist, and how a remote source is listed. Those are `03-architecture.md`'s to investigate.
