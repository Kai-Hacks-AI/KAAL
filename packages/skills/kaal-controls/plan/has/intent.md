# A Control has its Intents: Intent

This is `controls/C6`, a PLAN Change. It ships no Node, code or test. `controls/C7` realizes it once the Owner has aligned it.

The Owner has aligned what a Control is (#585, #619): a bounded, enduring concern that has one or more Intents. It is comparable to a Change, but differs in purpose. A Change delivers an Intent once and is done. A Control has its Intents for as long as the concern lasts. The capability that owns the source of an outgoing trace owns its meaning, so Controls owns `Control Has Intent`.

Today a Control says where it is realized, through `Realized by`, and not why it exists. That Edge is a shortcut: it jumps from a Control straight to a mechanism, past everything that would show the mechanism answers the concern. A mechanism that exists is not evidence that a Control is effective.

- **controls/I3**: A Control has one or more Intents, and Controls states that as its own Edge, `Has`. A Control without an Intent is incomplete.
- **controls/I4**: A Control's realization is shown only through the trace chain Control → Intent → Requirements → Architecture → Test Cases and Defects → Code → deployed realization. Controls owns the chain's first link, and each later link stays with the capability that owns its source. Controls no longer offers a direct Edge from a Control to a mechanism.
- **controls/I6**: Ownership is distributed. Controls owns the generic model, meaning `Control`, `Has`, the cardinality and the conformance rules. Every KAAL capability defines, manages and verifies its own Controls for its concerns, and so does every consumer repository. Using Controls transfers no Control, Intent or evidence to Controls. Engineering's Controls (#585) stay Engineering's.
- **controls/I5**: Controls stays usable on its own. Intent is an optional complement: where it is present, a Control's Intents are checked against Intent's authoritative type; where it is absent, that check is reported as unresolved, never as passing. Controls never redefines what an Intent is. The same holds for Core: Core is preferred for discovery, admission and composition where it is present, but Controls' conformance works without a Core Engine.
