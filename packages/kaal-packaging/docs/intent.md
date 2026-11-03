# KAAL Packaging: Intent

<!-- Shipped with kaal-packaging. The plan/ documents in the source repository record each Change that set these. -->

Packaging is the KAAL capability for how KAAL's deliverables become packages and what those packages are, in any ecosystem: npm today, others when they arrive. This package, `kaal-packaging`, delivers its first two increments, package size measurement and the generic KAAL Package contract, and holds itself to that contract.

## Package size measurement

- **packaging/I1.** Any KAAL package's delivered size is measured the same way, from the package artifact exactly as it was produced, never from its source directory. This holds whatever the ecosystem.
- **packaging/I2.** Two measurements of the same package can be compared, so growth between versions is visible path by path.
- **packaging/I3.** Packaging measures and reports, and it decides nothing. Each product owns its size constraints and optimization decisions. Engineering owns when measurement runs and whether any result gates anything.

## The KAAL Package contract

Every KAAL package answers to two independently authoritative contracts, both tested against the same installed candidate: the generic KAAL Package contract, which is Packaging's, and the package's specific contract, which is its delivering capability's.

- **packaging/I4.** Every KAAL package keeps the same promises to its consumer about what it is, what it ships, how it is verified once installed, and what that verification leaves behind. They are stated once, by Packaging, and each package's own contract adds only what is specific to it.
- **packaging/I5.** Conformance to those promises is decided by reusable cases run against the installed artifact. A file that exists, a source test that passed, or CI GREEN never stands for conformance.
- **packaging/I6.** Packaging references what other capabilities own and does not restate it. Testing owns the installed run, results and evidence. Hosting owns host compatibility. Each delivering capability owns its product's guarantees and acceptance. Engineering owns orchestration, gate evaluation and evidence reporting. The Owner owns release acceptance.

## Packaging as a capability

- **packaging/I7.** Packaging holds itself to the contract it enforces. Installed, `kaal-packaging` passes its own `conform` on every Requirement it can decide. It is usable by an agent without writing JavaScript, through a skill, commands and instructions, and no file in it decides anything by operating system. Hosting stays the only place that may (hosting/F36, testing/F67).
