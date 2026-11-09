# General package engineering — PLAN (follow-up to packaging/C12 distribution, Option C)

> Amendment 1: Option A accepted (#888). Items 1, 2 and 5 below are now planned as C17 to C19 with identifiers and Test Cases; items 3 and 4 stay Owner decisions. See "Amendment 1" before "Open points".

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

## Amendment 1: Option A, planned as Changes

Option A is accepted. Everything below happens inside the private `kaal-packaging`, on `kaal/packaging`, needs nothing from `main` and authorizes no SYNC, promotion or publication. Identifiers avoid those reserved for C10 (#746): F20 to F24, A15 to A18, I8, N13, N14, T37 to T50, C11. Numbers are provisional until the DO PRs.

| Change | Delivers | New identifiers |
| --- | --- | --- |
| **C17** General conformance profile | The conformance command takes a profile, `kaal` (default, behavior unchanged, including F7) or `general`. The result record names the profile judged. | packaging/F26, packaging/A20, T55 to T57 |
| **C18** General Skill | The layer 1 guidance and the F25 judgment procedure in KAAL-free wording, plus a short KAAL layer pointing at the KAAL contract. Carries the trial-reported gaps listed in item 2. | packaging/F27, packaging/A21, T58, T59 |
| **C19** External evidence | The general profile and Skill run on two real non-KAAL packages, recorded with what an external author could use unaided. | packaging/F28, T60 |

### Requirements (draft wording)

- **F26** A `general` profile judges only what a package outside KAAL can meet: exact registry-resolved runtime dependencies (the F19 rule), the consumer left unchanged (N7), the installed manifest hash check when the package ships one, and the behavior probe. A KAAL-only finding (F8, F9, F10, F11, F12, F13) is reported as "not part of this profile", never as failed, and never counted toward the verdict. The record names the profile, and an unknown stays unknown.
- **F27** The general Skill names no KAAL identifier, owner or private path, tells the agent that scripts give observations and the agent's judgment is separate and never a proof, and ends with one pointer to the KAAL layer. It states the claim being judged when an account gives none, and how to treat a stand-in the Case's author controls.
- **F28** Each profile and Skill claim for outside use rests on a recorded run against a real non-KAAL package, not a synthetic one.

### Architecture (draft)

- **A20** One judgment engine. A profile is a table that selects findings and sets how each counts. It adds no second engine, so the KAAL verdict cannot drift from the general one.
- **A21** The general Skill is the base text. The KAAL Skill layers over it by reference and does not copy it.

### Test Cases (draft)

| Case | Judges |
| --- | --- |
| T55 [F26] | `kaal` profile output is byte-identical to today's on the existing fixtures (no regression). |
| T56 [F26] | On a package with no KAAL files, `general` does not fail on F8 to F13 and names them "not part of this profile"; the same package fails `kaal`. |
| T57 [F26, A20] | A real defect (a file dependency, a changed shipped file) fails `general`; an unreadable install gives cannot judge, not failed. |
| T58 [F27] | The general Skill text contains no KAAL identifier or private path. |
| T59 [F27] | An independent trial with neutral accounts, as in T51/T52, includes an account with no installed copy and one with conflicting obligations. Recorded, same rules as the first trial. |
| T60 [F28] | The C19 records exist for two named non-KAAL package versions and name what failed or was unusable. |

### Order and gates

C17 before C19. C18 may run beside C17. C19 last. C19 gives the Owner the evidence to decide item 4 (extract or stay). Item 3 (publish or shed the Hosting and Foundation coupling) is decided before any publication and is not part of C17 to C19. The release-practice idea (pack once, verify, publish the exact tarball) from the portfolio scan is a candidate for the C18 text, as practice and not as the Engineering release engine.

### What this amendment does not do

No runtime file, no package rename, no publication, no change to F7, and no change to #686.

## Open points for the Owner

- Option A, B or C for item 4.
- Whether the package name and namespace follow the existing `@kaihacksai` scope.
- Whether the general capability needs its own Intent and Requirements documents or extends Packaging's.

## Not decided here

Hosting's publication, Engineering's trusted migration admission, dependency traceability (#746) and the rest of C14.
