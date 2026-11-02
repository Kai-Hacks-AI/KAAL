# General package engineering — PLAN (follow-up to packaging/C12 distribution, Option C)

Plans how Packaging's reusable package-engineering knowledge and tools could become independently usable outside KAAL, as the Owner accepted in Option C (`plan/release-0.0.1/distribution.md`, #850). It changes no runtime file, publishes nothing and authorizes no merge, SYNC, promotion or publication. `kaal-packaging` 0.0.1 stays private.

## Intent

An external, non-KAAL repository can use Packaging's general capability for its own package, without importing KAAL's internal orchestration or joining the KAAL repository: measure a delivered artifact, verify a package as a consumer installs it, and have an agent judge its boundaries, its own Test Plan and its evidence. KAAL-specific contracts and governance stay KAAL's.

## What is general, and what is not

From the distribution decision, with the evidence of running `measure` and `conform` on non-KAAL `is-number@7.0.0`:

| Layer | Content | Status today |
| --- | --- | --- |
| 1. Practice and BASS-guided judgment | Measure the artifact not the source; verify an installed copy in a fresh consumer; manifest hash check; exact Case accounting; registry-resolved exact dependencies; behavior-not-presence probe; boundary, Test Plan and evidence judgment (F25) | General. The Skill is worded for KAAL packages and cites KAAL identifiers and owners. |
| 2. Technical APIs and scripts | `measure`, `attribute`, `compare`, `write`, `read`, `report`; `conform`'s mechanics | `measure` usable as is. `conform` judges the KAAL contract, so its overall verdict misleads an outside package. |
| 3. KAAL-specific | F8's six named documents, F11's `test/verify.json` shape, F13's Testing model, F12's Hosting OS boundary, the shared verifier result line, ownership claims, Engineering's release engine | Not general. |

## Proposed Changes (provisional numbering)

1. **General profile of conformance.** Split `conform`'s findings into those a non-KAAL package can meet and KAAL-only ones. The result states which profile was judged and never presents a KAAL-only finding as a defect of a general one. The KAAL profile is unchanged, including F7 (A2).
2. **General Skill.** The layer 1 guidance and the F25 procedure, written without KAAL identifiers, plus a separate KAAL layer pointing at the KAAL contract. Include the three gaps reported by the independent trials: a route for an account with no installed copy; how to treat two conflicting obligations; how to treat an explicit self-narrowed claim. Also add: state the claim being judged when the account gives none, and how to treat a stand-in the Case's own author controls. A new independent trial covers any changed judgment.
3. **Coupling.** The general commands currently depend on `kaal-hosting` and `@kaihacksai/kaal-foundation`. Either those are public first, or the general commands do not need them. Decide before any publication.
4. **Package boundary.** Either one public package holding both profiles, or a distinct general package with `kaal-packaging` remaining the KAAL-specific one.
5. **External evidence.** Run the general profile and Skill on at least two real non-KAAL packages and record what an external author could use unaided.

## Options for item 4

- **A (recommended): profile first, extract later.** Do items 1 and 2 inside the private package, prove them on external packages (item 5), then decide whether the general part becomes its own package. No new package is made before there is evidence it stands alone.
- **B: new general package now.** Faster to a public artifact but extracts before the split is proven, and risks a second package that duplicates the first.
- **C: publish `kaal-packaging` with both profiles.** Needs items 1 to 3 anyway and mixes KAAL governance into a public package.

## Sequencing and dependencies

- Items 1 and 2 need nothing from `main`, so no SYNC is needed for them.
- Item 3 and any publication depend on Hosting and Foundation being on a registry, which is outside Packaging.
- Packaging's 0.0.1 promotion (#686) does not wait for this PLAN.

## Open points for the Owner

- Option A, B or C for item 4.
- Whether the package name and namespace follow the existing `@kaihacksai` scope.
- Whether the general capability needs its own Intent and Requirements documents or extends Packaging's.

## Not decided here

Hosting's publication, Engineering's trusted migration admission, dependency traceability (#746) and the rest of C14.
