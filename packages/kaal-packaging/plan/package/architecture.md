# The KAAL Package contract: Architecture

- **packaging/A7** [packaging/F7–F14, packaging/N7–N10]: **A reusable conformance suite, run from outside.** Packaging ships `kaal-packaging/conformance`: parametrized cases that take the location of an installed KAAL package and decide each generic Requirement against it. No KAAL package imports it. Engineering runs it against the packed-and-installed candidate and reports its result next to the package's own, on the same artifact identity (engineering/C5, engineering/F17–F19). This is how Core's conformance cases are reused (engineering/C4, #607).
- **packaging/A8** [packaging/F10, packaging/N10]: **References, not copies.** The suite checks a package's result line against Testing's verifier contract (testing/C29, #639) as Testing publishes it. Until that contract is approved, the suite checks only the three results and exit codes that every product already agrees on (`reconciliation.md`). Packaging defines no result semantics and takes no runtime dependency on Testing (packaging/A1).
- **packaging/A9** [packaging/F11]: **Identity.** The suite reads the installed files and compares them with the manifest. Packaging's `measure` gives the packed artifact's SHA-256 (packaging/F4). That is the identity Engineering records for the candidate.
- **packaging/A10** [packaging/F12]: **Ecosystem-neutral wording, npm first.** The contract is stated for any ecosystem. Its first realization reads npm's `package.json` fields (`name`, `version`, `dependencies`, `engines`, `scripts.test`). Another ecosystem adds a realization and leaves the contract unchanged (packaging/A5).

- **packaging/A11** [packaging/F9, packaging/F14]: **`npm test` depends on its context** (the Owner's D1, #658). Which tests apply follows the realization whose contract is verified, not only where the command runs:
  - **The KAAL repository root.** `npm test` orchestrates every applicable Engineering, Embedded and External Test Suite from the declared Plans. It reports separate results and shows missing or unresolved coverage honestly. This is Engineering's (engineering/C6).
  - **A package's source workspace.** `npm test` follows that workspace's declared Test Plan (packaging/F14).
  - **An installed KAAL package.** `npm test` executes the package's Embedded verification contract against the installed artifact (packaging/F9). This is Packaging's generic Embedding contract.
  - **An external repository.** `npm test` is that repository's own entrypoint and policy. External means a KAAL-loaded agent applying KAAL knowledge to serve another repository, not direct package consumption, and the external repository owns its semantics, adapted or not.

  Engineering builds KAAL, Embedding delivers it, and External applies its knowledge through an agent. Packaging owns only the Embedding contract. It states nothing about Engineering's or External tests.

## Owner alignment, decided on #658

The Owner decided both on #658 (comment 6530188315). The text below records what each replaced.

- **D1, decided: no universal rule, `npm test` depends on its context** (packaging/A11). The binary choice it replaced:
  - **A: comprehensive.** Source `npm test` runs every `test:<name>` suite the package declares, the publisher's included. This is foundation/F9 and core/F75, both citing the convention the Owner set on #625.
  - **B: consumer-only everywhere.** Source `npm test` also runs only the consumer entry, and the publisher's suites run under `test:publisher`. This is hosting/F20 and graph/F6. engineering/C6 cites a later #625 comment (6510333640) as superseding the comprehensive reading.
  - Under A11, both readings remain legitimate source-workspace plans (packaging/F14). The root stays comprehensive, and an installed package stays independently verifiable.
- **D2, decided: A.** `docs/operations.md` is the authoritative shipped Operations document, and the README links to it (packaging/F8). The options it chose between:
  - **A (recommended): `docs/operations.md`,** beside the other shipped documents, as Foundation, Core and Graph plan it (foundation/F7, core/F69, graph/F5). It also already carries their shipped-files list (packaging/F11). The README keeps the overview and points to it.
  - **B: the README,** as Guard, Hosting and Change do (guard/F37, hosting/F18, change/F21).

Two more conflicts are not Packaging's. Packaging follows whatever their owners decide:

- whether a tampered installed file is failed or unknown. That is Testing's: graph/F6 says failed, testing/F43 says unknown, and Testing proposes unknown on #610;
- which evidence counts toward a release, registry or packed candidate. That is the Owner's: guard/N9 against core/F72 and hosting/A9.

## The DO, and what follows it

The Owner chose **baseline first** (#658): the generic contract, Testing's semantics and Engineering's dual conformance come before the first 0.0.1 publication. The sequence, each step its own reviewed Change:

1. **packaging/C4 PLAN** (this Change). D1 and D2 are decided.
2. **packaging/C5 DO, the conformance suite.** It covers `kaal-packaging/conformance` with packaging/T15–T26 and their fixtures, RED first. It touches only `packages/kaal-packaging/`, depends on nothing beyond Hosting and Foundation, and changes no product. It is bounded to the Requirements above.
   - **packaging/C6, a bounded correction of step 2** (the Owner's review on #686). packaging/F12 decides platforms through Hosting's OS boundary (hosting/F36, hosting/F39), not through a manifest `os`. It covers T20's new version, and touches only `packages/kaal-packaging/`.
   - **packaging/C7, a bounded correction of step 2** (the Owner's review on #686). packaging/F13 reads the traces a package ships through Testing's model (testing/F25, testing/F66), not through a coverage registry. It covers T21's new version, adds `kaal-testing` as a dependency for `kaal-testing/model`, and touches only `packages/kaal-packaging/` and the root lockfile.
3. **Testing**, in parallel with step 2: testing/C29 (#639) for the verifier contract, and the coverage PLAN Testing proposed on #610, on the Owner's go. Until they land, the suite reports what depends on them as unknown, never GREEN.
4. **Engineering's dual conformance**, engineering/C5's release-readiness DO (#610, engineering/F17–F19). It runs step 2's suite and each product's own suite on one packed-and-installed candidate. It waits for step 2 and for the C5 PLAN's approval.
5. **Each product's alignment**, by its owner, in the runtime-dependency order the Owner set: Foundation, Hosting, Graph, Core. Each closes the gaps `reconciliation.md` lists for it. Hosting and Change also move Operations into `docs/operations.md`, and Guard does the same in a later release of its own. Packaging edits no product.
6. **Each release candidate.** Engineering reports both results on the exact candidate. The Owner's recorded authorization accepts it, and publication stays the Owner's.

Approving this PLAN authorizes step 2 only.
