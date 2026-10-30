# A Control has its Intents: Testing

`controls/C7` writes these Test Cases first. Each sits at the level where its claim is made, and decides one thing.

## Package: Controls' own rules (`test/controls.test.mjs`)

| Test | Checks |
| --- | --- |
| controls/T8: the payload is `Controls`, `Control`, `Has`, `VARISC`, `HAPTIC` and `CATCH ME IF YOU CAN`. `Realized by` is gone, and a fresh Engine admits the whole payload | controls/F10, controls/F13, controls/A5 |
| controls/T9: **zero Intents.** A Control with no `Has` Edge is nonconforming, with the reason | controls/F11 |
| controls/T10: **several Intents.** A Control whose `Has` Edge has two Intent targets is conforming, as one Control | controls/F11 |
| controls/T11: **Intent absent.** In a context where Intent's Definition id does not resolve, a well-formed `Has` target is unresolved, reported as an absent complement, and never conforming | controls/F12, controls/N5 |
| controls/T12: **Intent present, typed target.** With Intent's Definition admitted, a target typed by it resolves, and the Control is conforming | controls/F12 |
| controls/T13: **Intent present, wrong target.** A target typed by another Definition, or one that resolves to no admitted Node, is nonconforming | controls/F12 |
| controls/T14: **malformed.** A `Has` Edge not in the Edge form is nonconforming, with or without Intent | controls/F12, controls/N5 |
| controls/T15: **no shortcut.** A Control with any outgoing Edge other than `Has`, such as one to a capability's Node, is nonconforming, even if it also has an Intent | controls/F13 |
| controls/T17: **run result.** One owner's run over a mixed context is failed when any Control is nonconforming, unknown when the rest are unresolved, and verified only when all are conforming. Each result has a distinct exit status, and a context with an unassessed Control is unknown, never verified | controls/N5, controls/F14 |
| controls/T18: **Core absent.** The fixtures of controls/T9–controls/T15, supplied as plain contexts, give the same outcomes as through the adapter, and the result states its Nodes were supplied. `kaal-controls/conformance` imports no module of Core, Graph, Testing or Intent | controls/N6, controls/F17 |
| controls/T19: **Core present.** Through the adapter, a Core Engine's admitted Nodes give outcomes per named owner, and the result states they were admitted. A Control that Core admitted but that falls in no named context is unresolved and unattributed, and is never omitted | controls/N6, controls/F16 |
| controls/T20: **cross-owner conflation.** In one report, owner A has a nonconforming Control and owner B only conforming ones. A's run is failed and B's verified, and neither result changes the other. The summary across owners is not verified. A Control claimed by both A and B is unresolved, names both owners, and counts toward neither | controls/F16, controls/N5 |
| controls/T21: **unassessable Control, no false GREEN.** An owner context holding a Control whose input is incomplete, such as a missing type id, gives that Control unresolved and the owner's run unknown, never verified. The same holds where a context holds more Controls than were assessed | controls/N5, controls/F14 |
| controls/T22: **unresolved optional Intent.** A `Has` target typed by a Node named `Intent` whose id is not the id the suite holds is unresolved, never conforming. That covers both a stale id and an imitation | controls/F12, controls/N5 |
| controls/T3, revised: the ids of `VARISC`, `HAPTIC` and `CATCH ME IF YOU CAN` unchanged, and `Control`'s and `Has`' pinned to their new ids | controls/A5 |

controls/T12 and controls/T13 need Intent's Definition admitted. Under decision 2A, the test supplies a Node with the id the suite holds. That Node is a byte-for-byte copy of Intent's Definition from `kaal/intent`, kept as test data and never in the payload. When Intent publishes, the copy is replaced by the installed package at the boundary (controls/T16).

## Boundary: the installed package (`test/acceptance/controls.test.mjs`)

| Test | Checks |
| --- | --- |
| controls/T16: the packed package installs into a fresh project with no Intent package, and `assess` runs there with no Core installed. It holds `payload/Has.md` and no `Realized-by.md`, and `kaal-controls/conformance` imports and returns unresolved for a Control with an Intent target. The installed Engineer Skill finds the Agent Skill conformant. With Intent's package also installed, the same Control is conforming. That half is **blocked** until Intent can be installed, and is reported as blocked, not counted | controls/N4, controls/N5, controls/F14 |

## Engineering and end to end: Engineering's, not Controls'

Engineering's structural test (#585) runs Controls' suite over Engineering's own context, as their owner, and reports each outcome. It walks the later chain links only through their owners' traces, reporting each missing typed trace as unresolved. Those cases are Engineering's to plan and keep. Controls' Test Cases make no claim about Engineering's Controls, and Engineering's make none about Controls' rules.

## Meaning

controls/F12's boundary sentences and controls/F13's statement about deployed mechanisms are about meaning. The Owner validates them by reading `controls/C7`'s Nodes and Agent Skill. No check is invented to look as though it decides them.

## Observed state at `controls/C6`

Verified first: the payload on `kaal/controls` holds `Realized-by.md` and no `Has.md`, and the package exports no `conformance`. So controls/T8–controls/T22 would fail, each by a missing module or Node. Those are blocked REDs, not discriminating ones. `controls/C7` records each case's discriminating RED against a deliberately broken fixture before making it GREEN.
