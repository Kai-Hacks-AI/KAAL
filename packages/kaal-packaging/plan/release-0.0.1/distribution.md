# Packaging distribution — decision PLAN (packaging/C12 amendment)

Decides one question for the Owner: how is Packaging distributed? It changes no runtime file. It amends no identifier. It authorizes no merge, SYNC, promotion or publication, and keeps F7's registry-dependency conformance intact (A2) unless a separately reviewed contract change justifies otherwise.

## The Owner's criterion (revised after review on #850)

The criterion is **generally reusable engineering knowledge and capability**, not whether Packaging has a non-KAAL importer today. Internal KAAL orchestration does not justify its own published package. General engineering knowledge delivered as a capability deserves independent distribution consideration. A lack of JS imports is not a lack of agent-facing utility.

The question is therefore whether an external, non-KAAL repository can meaningfully use Packaging's installed Skill and deterministic tools for its own package, without importing KAAL's internal orchestration or joining the KAAL repository.

## What Packaging holds, in three layers

| Layer | Content today | General? |
| --- | --- | --- |
| **1. General package-engineering practice and BASS-guided agent judgment** | Measure the artifact, never the source directory (I1). Verify an *installed* package in a fresh consumer. Hash-check the installed files against a manifest. Count exact declared Cases. Resolve dependencies from the install record, with the registry distinguished from provenance (F19). Pin exact versions (F7). Leave the consumer unchanged (N7). Prove a verifier tests behavior, not presence (N9). Inspect boundaries and judge test adequacy (F25, planned in C13). | **Yes.** None of these needs KAAL. |
| **2. Reusable technical APIs and scripts** | `measure`, `attribute`, `compare`, `write`, `read`, `report` (ecosystem-neutral, npm first). The `conform` engine's mechanics: install-record reading, hash comparison, scratch-directory behavior probe. | **Partly.** `measure` is general. `conform`'s mechanics are general, but its findings are bound to layer 3. |
| **3. KAAL-specific contracts, identities and release governance** | F8's six named documents and README link. F11's `test/verify.json` shape. F13's Testing model through Testing's `check`/`tested`. F12's Hosting OS boundary. F10's shared verifier result line. KAAL identifiers (`packaging/F…`) throughout the Skill. The Capability Node, ownership claim, and Engineering's release engine consuming `conform`. | **No.** |

## What is usable today by an external repository

I ran the collector's own commands, unmodified, against a non-KAAL package, `is-number@7.0.0`, with Node 24.22.1 and npm 11.21.0.

- **`measure` works as is.** It printed `is-number@7.0.0 (npm), described by npm 11.21.0`, packed 3730 bytes, unpacked 9615, four files, exit 0. This is layer 2 and meaningful to anyone.
- **`conform` runs but judges the KAAL contract, not a general one.** It verified F7, F12, F13, N7 and N8, which are layer 1 practices. It failed F8 ("docs/intent.md is not shipped" for six KAAL documents) and F9 and F10 (the package has no KAAL Embedded verifier, so the installed `npm test` printed nothing). F11 and N9 were unknown. Overall: `failed`, exit 1. An external author would read that as "my package is bad", when most of it means "not a KAAL package". That is misleading, not useful.
- **The Skill is not usable outside KAAL as written.** It is addressed to KAAL packages, cites KAAL identifiers and owners (Testing, Hosting, Engineering), tells the reader to supply Testing's model functions, and says the package is private and must be run by path.
- **Packaging cannot be installed alone.** It depends on `kaal-hosting` and `@kaihacksai/kaal-foundation` for process execution, file reading and SHA-256. Both would need to be public first. Hosting's scoped publication is not done.

So the general value is real, but it is only partly deliverable today, and what is deliverable (`measure`) is a small part.

## What would need a separate Change

None of these is assumed to exist. Each needs its own PLAN and Owner review.

1. **A general conformance profile.** Split `conform`'s findings into those a non-KAAL package can meet (layer 1) and those that apply only to KAAL packages (layer 3), with a result that says which profile was judged. F8, F11 and F13 would stay KAAL-only. Does not weaken the KAAL contract.
2. **A general Skill.** Layer 1 guidance (and C13's F25 judgment procedure) written without KAAL identifiers, plus a separate KAAL layer pointing at the KAAL contract.
3. **Shedding or publishing the coupling.** Either publish Hosting and Foundation, or make the general commands independent of them.
4. **A package boundary.** Either publish Packaging with both profiles, or move layer 1 and `measure` into a distinct general package and leave `kaal-packaging` as the KAAL-specific one. That choice is for the Owner after items 1 to 3 exist.

## Options

### Option A (recommended): private workspace delivery for 0.0.1, and a separate PLAN for the general capability

`kaal-packaging` 0.0.1 stays `private`, unscoped, with Engineering and agents in this repository. It is the KAAL-contract package. Its general content (layers 1 and 2) is recognized as worth independent distribution, and a separate PLAN, opened after the Owner decides, defines items 1 to 4 above.

Why: publishing the current package would present a mixed package. An external author gets a working `measure`, a misleading `conform` verdict, and a KAAL-addressed Skill. Distribution decided on what is usable today fails the criterion for the package as a whole, though not for its general content.

### Option B: publish `@kaihacksai/kaal-packaging@0.0.1` as C12 planned

Delivers `measure` and the KAAL `conform` to outside users as they are. Requires Hosting's scoped publication first. The misleading verdict above ships with it unless items 1 and 2 are done first, which makes B a larger Change than C12 describes.

### Option C: hold 0.0.1 private now, and make the general split the next Change before any publication

Same delivery as A, but names the split (items 1 to 4) as the required next Change before Packaging is considered for npmjs. This is A with the follow-up pre-committed, instead of left to a later decision.

## What changes under each option

| Step | Option A or C (private) | Option B (publish) |
| --- | --- | --- |
| C13, C14 | Unchanged. C13's F25 judgment guidance is written so its layer 1 content can later lift out. | Unchanged. |
| C15 scoped delivery | **Replaced** by a small compatibility Change: keep the name and `private: true`, and migrate only what Hosting's own scoping forces, through the owners and Engineering's admitted route. | As written: scoped name, public metadata, scoped Hosting dependency. |
| C16 acceptance | Source, normal pack, inventory, clean consumer, negatives and three hosts stay. F7 self-conformance still waits for Hosting on a registry (A2). | As written, with registry-resolved F7. |
| SYNC and promotion | Unchanged. This ends the 0.0.1 path. | Unchanged. |
| Step 7, npmjs | **Dropped for 0.0.1.** Reconsidered after the general-split PLAN. | As written. |
| #686 hold | Its full-F7 hold stays, since F7 is not relaxed. Packaging promotes once Hosting is on a registry. | Unchanged. |

## Recommendation

Option C. It follows the revised criterion: the general capability deserves distribution consideration, but today's package is not the right artifact to publish, and it is not yet usable outside KAAL beyond `measure`. F7 stays intact. C13 and C14 continue and are not affected.

## Not decided here

Whether the general capability becomes a separate package or a profile of this one, Hosting's publication, Engineering's trusted migration admission, and dependency traceability (#746).
