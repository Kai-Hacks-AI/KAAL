# The KAAL Package contract: Architecture

- **packaging/A7** [packaging/F7–F13, packaging/N7–N10]: **A reusable conformance suite, run from outside.** Packaging ships `kaal-packaging/conformance`: parametrized cases that take the location of an installed KAAL package and decide each generic Requirement against it. No KAAL package imports it. Engineering runs it against the packed-and-installed candidate and reports its result next to the package's own, on the same artifact identity (engineering/C5, engineering/F17–F19). This is how Core's conformance cases are reused (engineering/C4, #607).
- **packaging/A8** [packaging/F10, packaging/N10]: **References, not copies.** The suite checks a package's result line against Testing's verifier contract (testing/C29, #639) as Testing publishes it. Until that contract is approved, the suite checks only the three results and exit codes that every product already agrees on (`reconciliation.md`). Packaging defines no result semantics and takes no runtime dependency on Testing (packaging/A1).
- **packaging/A9** [packaging/F11]: **Identity.** The suite reads the installed files and compares them with the manifest. Packaging's `measure` gives the packed artifact's SHA-256 (packaging/F4). That is the identity Engineering records for the candidate.
- **packaging/A10** [packaging/F12]: **Ecosystem-neutral wording, npm first.** The contract is stated for any ecosystem. Its first realization reads npm's `package.json` fields (`name`, `version`, `dependencies`, `engines`, `scripts.test`). Another ecosystem adds a realization and leaves the contract unchanged (packaging/A5).

## Owner alignment required before the DO

These are conflicts among the products' current statements; `reconciliation.md` gives every line. Packaging owns the conventions, so each is Packaging's to propose and the Owner's to decide. **The DO does not start until both are decided**, and it never picks one silently.

- **D1. What a package's `npm test` runs in the source workspace.** Everyone agrees that the installed `npm test` runs the consumer verification only.
  - **A: comprehensive.** Source `npm test` runs every `test:<name>` suite the package declares, the publisher's included. This is foundation/F9 and core/F75, both citing the convention the Owner set on #625.
  - **B: consumer-only everywhere.** Source `npm test` also runs only the consumer entry, and the publisher's suites run under `test:publisher`. This is hosting/F20 and graph/F6. engineering/C6 cites a later #625 comment (6510333640) as superseding the comprehensive reading.
  - Packaging has no recommendation of its own: the two readings both cite the Owner. Either way, Engineering's lane runs every declared suite by name (engineering/C6), and a missing entrypoint is never verified.
- **D2. Where Operations guidance lives.**
  - **A (recommended): `docs/operations.md`,** beside the other shipped documents, as Foundation, Core and Graph plan it (foundation/F7, core/F69, graph/F5). It also already carries their shipped-files list (packaging/F11). The README keeps the overview and points to it.
  - **B: the README,** as Guard, Hosting and Change do (guard/F37, hosting/F18, change/F21).

Two more conflicts are not Packaging's. Packaging follows whatever their owners decide:

- whether a tampered installed file is failed or unknown. That is Testing's: graph/F6 says failed, testing/F43 says unknown, and Testing proposes unknown on #610;
- which evidence counts toward a release, registry or packed candidate. That is the Owner's: guard/N9 against core/F72 and hosting/A9.

## The DO, and what follows it

The Owner chose **baseline first** (#658): the generic contract, Testing's semantics and Engineering's dual conformance come before the first 0.0.1 publication. The sequence, each step its own reviewed Change:

1. **packaging/C4 PLAN** (this Change), with D1 and D2 decided.
2. **packaging/C5 DO, the conformance suite.** It covers `kaal-packaging/conformance` with packaging/T15–T25 and their fixtures, RED first. It touches only `packages/kaal-packaging/`, depends on nothing beyond Hosting and Foundation, and changes no product. It is bounded to the Requirements above.
3. **Testing**, in parallel with step 2: testing/C29 (#639) for the verifier contract, and the coverage PLAN Testing proposed on #610, on the Owner's go. Until they land, the suite reports what depends on them as unknown, never GREEN.
4. **Engineering's dual conformance**, engineering/C5's release-readiness DO (#610, engineering/F17–F19). It runs step 2's suite and each product's own suite on one packed-and-installed candidate. It waits for step 2 and for the C5 PLAN's approval.
5. **Each product's alignment**, by its owner, in the runtime-dependency order the Owner set: Foundation, Hosting, Graph, Core. Each closes the gaps `reconciliation.md` lists for it, against D1 and D2. Packaging edits no product.
6. **Each release candidate.** Engineering reports both results on the exact candidate. The Owner's recorded authorization accepts it, and publication stays the Owner's.

None of these steps is authorized by approving this PLAN, except step 2, once D1 and D2 are decided.
