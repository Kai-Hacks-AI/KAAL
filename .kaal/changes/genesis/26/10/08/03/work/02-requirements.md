# Requirements

What must hold for `01-intent.md` to be answered. They say what, not how; the how is `03-architecture.md`.

## Held state, offline

- R1. An instance can say what it holds using only its own `.kaal/`: its installed Skills and Extensions as `{name, id}`. No network, registry or checkout of KAAL's engineering repository is read.
- R2. Everything the instance already holds keeps working without any source being reachable.

## Discovery

- R3. Given a source, an instance can list the capabilities that source offers. Each offer is identified by the exact ID of its Node, with the Node's name, and says whether the instance already holds it.
- R4. Listing selects, acquires and installs nothing, and writes nothing to the instance.
- R5. What counts as installable is read from the Nodes an offer carries (a Node typed by Core's `Skill` or `Extension` Node, by name and ID). No list, lock file or registry of capabilities is consulted for that meaning.

## Acquisition

- R6. An instance can acquire a chosen offer's bytes from a source without installing them. What it acquires is the same shape a package delivers today: Nodes and their seals, and the Agent Skills where there are any.
- R7. A source is chosen by the caller for each use. A source may be a local directory, a local archive, or a remote one; nothing remembers the choice.
- R8. Acquisition is checked against the exact Node ID asked for. Bytes that do not hash to the ID requested are refused, whatever the source says they are.

## Installation

- R9. Installation of an acquired capability goes through Core's registration, so Core's admission decides. A sealed byte is never given other bytes; changed bytes are another Node.
- R10. A capability is selected by the exact ID of its Node. A name, or an ID that is not offered, is refused.
- R11. A capability that declares it needs a sibling capability which the instance does not hold is refused with nothing written, naming what is missing, as the installer does today.
- R12. Installing the same capability again changes nothing.

## Verification and control

- R13. After installing, an instance can verify what it holds against what it acquired, naming each difference. Verification never repairs.
- R14. The instance's composition can be read from the instance itself. Nothing is added that was not chosen, and nothing remembers a selection outside the installed state.

## Independence

- R15. The meaning of a capability and the identity of its Node are the same whichever source supplied the bytes. A Node never names a source, a package or a location.
- R16. Discovery, acquisition and installation are three separate acts that can be used, tested and replaced separately. No single interface or registry is the meaning of all three.
- R17. The whole of this runs from inside the host: no checkout of KAAL's engineering repository is needed.

## Constraints

- R18. A new Core concept is added only if a requirement above cannot be met without it.
- R19. Core's existing sealed Nodes, seals and public API are not changed by this Change. If Core must change, that part is its own Change and travels alone.
- R20. Enercon is not modified.

## What these requirements do not decide

The interface (a CLI or something else), where it lives, which sources exist, how a remote source is listed, and whether the first acquisition of the tool itself needs a source. Those are `03-architecture.md`'s to investigate.
