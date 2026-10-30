# The KAAL Package contract: Requirements

Each Requirement names, in brackets, the Intents it serves. Where another capability owns the meaning, the Requirement references it and does not restate it. "A KAAL package" is any workspace package this repository delivers.

## Functional

- **packaging/F7** [packaging/I4]: **Identity.** A KAAL package states one name, one exact version, and every runtime dependency at an exact version that installs from its registry. It names no workspace, file or Git dependency. Which namespace a package takes is the Owner's per-package decision (#622).
- **packaging/F8** [packaging/I4]: **Shipped documentation.** A KAAL package ships its own Intent, Requirements, Architecture, Testing and Limitations documents and its Operations guidance, all at stable paths. Their content is the package's own. Where Operations guidance lives is Owner decision D2.
- **packaging/F9** [packaging/I4, packaging/I5]: **Installed verification entrypoint.** Once installed, a KAAL package's `npm test` runs its Embedded Test Cases against that installed copy. It needs no checkout of this repository and runs no publisher test. The installed run and its meaning are testing/F11–F12's. What a package's `npm test` runs in the source workspace is Owner decision D1.
- **packaging/F10** [packaging/I4, packaging/I6]: **Result.** That entrypoint reports Testing's result for the run, with cause and evidence (testing/F13–F14), on a single line that a caller can read. Its form is the shared verifier contract's, which hosting/F26 assigns to Testing (testing/C29, #639). Packaging requires conformance to it and defines no result of its own.
- **packaging/F11** [packaging/I4, packaging/I5]: **Shipped manifest.** A KAAL package ships a manifest of every delivered file with its SHA-256 and every Embedded Test Case it declares. Its verification compares the installed files with the manifest and runs exactly the declared cases. Under testing/F14, consistency with a shipped manifest is not provenance.
- **packaging/F12** [packaging/I4, packaging/I6]: **Declared platforms and runtime.** A KAAL package declares its supported runtime and platforms. What host compatibility means, and how a platform difference is tested, is Hosting's, with not-applicable cases governed by testing/F47.
- **packaging/F13** [packaging/I4, packaging/I5]: **Coverage.** Every Requirement a package ships is traced to an applicable case or to an explicit allocation elsewhere. A Requirement with neither is reported unresolved. What covered, allocated and unverified mean belongs to Testing, and that gap is returned to Testing (`engineering/research/release-baseline.md`).

## Nonfunctional

- **packaging/N7** [packaging/I4]: **Intact consumer.** Verification writes only in a scratch space it removes. It leaves the consumer's project, dependencies and configuration as they were, as testing/F15 states.
- **packaging/N8** [packaging/I4]: **Self-contained verifier.** The installed verification needs only the runtime and the package's own declared runtime dependencies. It depends on neither Testing nor Guard at runtime.
- **packaging/N9** [packaging/I5]: **Behaviour, not presence.** Every case decides its Requirement from the installed package's behaviour or bytes. A case that passes merely because a file exists, or that reads this repository's checkout, is itself a defect.
- **packaging/N10** [packaging/I6]: **No restatement.** No Packaging Requirement restates a meaning another capability owns. Each one references it by ID, and if that meaning changes, the reference follows.

## Not in this Change

- Any package's specific contract, and any product's acceptance.
- Producing, packing and publishing packages, which stay Engineering's and the Owner's. Repeatable publication and binding the exact artifact (candidate F10) are returned to Engineering and the Owner.
- Determinism of outcomes (candidate N5). testing/F15 promises none, and Packaging does not contradict it.
- Gating anything. Engineering decides how conformance is used (engineering/C5, engineering/F17–F19).
