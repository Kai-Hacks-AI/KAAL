# The KAAL Package contract: Intent

This is `packaging/C4`, a PLAN Change. It ships no code. A later DO Change, authorized on its own, writes the conformance cases and turns them GREEN.

The Owner asked on #610 (comments 6529592861 and 6529734792) for a discoverable, testable minimum package-release baseline. Every KAAL package answers to two independently authoritative contracts, and both are tested against the same exact installed candidate. The first is a **generic KAAL Package contract**, owned by Packaging. The second is each package's **specific contract**, owned by its delivering capability. `packaging/C3` set Packaging's seat: it owns KAAL packages' semantics, contents and delivery contracts. The generic contract is that delivery contract. Packaging's "decides nothing" (`Packaging.md`) concerns size constraints, and it stands.

Today no generic contract exists. Each product states the same promises for itself: Guard in its shipped `docs/`, Hosting in #629, Core in #622, Graph in #627 and Change in #636. `engineering/research/release-baseline.md` (engineering/C5, #610) traces them line by line. It finds that 18 of the Owner's 20 candidates are generic and stated only per product, with seven conflicts among them.

- **packaging/I4.** Every KAAL package keeps the same promises to its consumer about what it is, what it ships, how it is verified once installed, and what that verification leaves behind. They are stated once, by Packaging, and each package's own contract adds only what is specific to it.
- **packaging/I5.** Conformance to those promises is decided by reusable cases run against the installed artifact. A file that exists, a source test that passed, or CI GREEN never stands for conformance.
- **packaging/I6.** Packaging references what other capabilities own and does not restate it. Testing owns the installed run, results and evidence. Hosting owns host compatibility. Each delivering capability owns its product's guarantees and acceptance. Engineering owns orchestration, gate evaluation and evidence reporting. The Owner owns release acceptance.

**Boundaries.** The contract binds KAAL's own packages. It binds no consumer, and it makes no package depend on Packaging at runtime: a package conforms by its shape and behaviour, and Packaging's cases test it from outside. Producing and publishing packages stay where they are, with Engineering and with the Owner.
