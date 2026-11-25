# Installation Integrity: Requirements

Each Requirement names, in brackets, the Intents it serves, and says what verifies it. Contract decisions that are still open are marked `open` and listed in `architecture.md`.

## Nonfunctional

- **core/N28** [core/I33]: Independent. The integrity module names no entity, holds no inventory or asset path, imports no capability, and uses only what Core already depends on. Verified by core/T113.
- **core/N29** [core/I34]: Pure. The verdict is a function of the data it is given and gives the same result for the same input. Reading an installed location is the caller's, through Hosting, as Core's realization already does. Verified by core/T110.

## Functional

- **core/F100** [core/I32]: The verdict. For an expected set and an observed set, each a map from a repository-relative path to the SHA-256 of its exact bytes, the result lists the `missing` assets (expected, not observed), the `unexpected` ones (observed, not expected) and the `modified` ones (at the same path, other bytes), in path order. The status is `aligned` when the three lists are empty and `differs` otherwise. The same bytes at another path are one missing and one unexpected. A filename never decides on its own. Verified by core/T110.
- **core/F101** [core/I34]: No self-authority. A verdict whose expected set has no stated origin, or whose origin is the installation under judgement or its own record, is `unknown` and says why. It is never `aligned`. Verified by core/T111.
- **core/F102** [core/I32, core/I34]: A named comparison. The result names the entity (its kind and name), the selected version, the kind of source and the origin of the expected set. Compared with another version's expected set, the same installation gives that version's differences, and nothing from the first. Verified by core/T112.
- **core/F103** [core/I32, core/I33]: Kind-agnostic. The same call judges the assets of a Capability, an Agent, a Skill, an Extension and an entity Core has never heard of, with no rule of its own for any of them. Verified by core/T113.
- **core/F104** [core/I35]: Detective first. The exit status of a result is 0 for `aligned` and for `differs`, 1 for `differs` only when enforcement is requested, and 2 for `unknown`, which is never clean. Verified by core/T114.
- **core/F105** [core/I36]: Variants. An expected asset set supplied by the owning entity for a variant is an authoritative set like any other, selected for a location. A set supplied by anyone else is refused, and a location matches the set it was selected for. `open`: how the owner states a variant (D2).
- **core/F106** [core/I34, core/I35]: The three comparisons are uses of the verdict, with the expected set taken from the artifact and tag of the selected published version, the N+1 package, or the selected source. `open`: how each source is supplied and read (D1, D5).
- **core/F107** [core/I33]: Reuse and discovery. An entity's identity, version and expected assets are taken from the existing Installation Contract, record, ownership declaration and registration, and a registered entity's installation location can be found and verified. `open`: whether the existing contracts suffice (D1, D3, D4).

## Amended

None. The Installation Contract's and record's rules stand. If a decision adds a member to either, that is its own amendment, planned before it is made.
