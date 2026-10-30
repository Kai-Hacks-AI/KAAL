# The KAAL Package contract: Architecture

- **packaging/A7** [packaging/F7–F13, packaging/N7–N10]: **A reusable conformance suite, run from outside.** Packaging ships `kaal-packaging/conformance`: parametrized cases that take the location of an installed KAAL package and decide each generic Requirement against it. No KAAL package imports it. Engineering runs it against the packed-and-installed candidate and reports its result next to the package's own, on the same artifact identity (engineering/C5, engineering/F17–F19). This is how Core's conformance cases are reused (engineering/C4, #607).
- **packaging/A8** [packaging/F10, packaging/N10]: **References, not copies.** The suite checks a package's result against Testing's shared verifier contract by calling Testing's published checks. Packaging defines no result semantics, so it depends on Testing only through that contract, and only in its conformance suite.
- **packaging/A9** [packaging/F11]: **Identity.** The suite reads the installed files and compares them with the manifest. Packaging's `measure` gives the packed artifact's SHA-256 (packaging/F4). That is the identity Engineering records for the candidate.
- **packaging/A10** [packaging/F12]: **Ecosystem-neutral wording, npm first.** The contract is stated for any ecosystem. Its first realization reads npm's `package.json` fields (`name`, `version`, `dependencies`, `engines`, `scripts.test`). Another ecosystem adds a realization and leaves the contract unchanged (packaging/A5).

## Owner decisions

These are conflicts the trace found among the products' current statements. Packaging owns the convention, so each is Packaging's to propose and the Owner's to decide.

- **D1. What a package's source `npm test` runs.**
  - **A (recommended):** the package's own suites, Embedded and publisher, as engineering/C6 runs them, with the installed `npm test` consumer-only. This matches #625's later direction, and it is what Hosting and Graph already do (hosting/F20, graph/F6).
  - **B:** source `npm test` is also consumer-only, and every publisher suite runs under `test:publisher`.
  - Core's core/F75 differs from both and would follow the decision.
- **D2. Where Operations guidance lives.**
  - **A (recommended):** `docs/operations.md`, beside the other shipped documents, as Core and Graph plan it (core/F69, graph/F5). The README keeps the overview and points to it.
  - **B:** the README, as Guard, Hosting and Change do (guard/F37, hosting/F18).
  - Either way, every package ships the same set.

Two more conflicts are not Packaging's. Packaging follows whatever their owners decide:

- whether a tampered installed file is failed or unknown, which is Testing's (graph/F6 against testing/F43);
- which evidence counts toward a release, registry or packed candidate, which is the Owner's (guard/N9 against core/F72 and hosting/A9).
