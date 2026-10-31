# kaal-packaging: Intent

Assembled from the PLANs under `plan/` by `test/publisher/build.mjs`; edit those, not this file.

## Measurement

This is `packaging/C1`, a PLAN Change and Packaging's first. It ships no code. `packaging/C2`, a DO Change, writes the package and turns the planned tests GREEN.

Guard measured its own package by hand in `guard/C117` (#579): packed and unpacked bytes, which paths grew, and how much each version added. The Owner chose no reduction. He asked that measurement of that kind become reusable, so that every KAAL package is measured the same way. Engineering invokes it, and each product keeps its own size constraints and decisions. Today no Capability owns it. Packing is Engineering's (`engineering/delivery/pack.mjs`), and Testing's boundary leaves what a package delivers to the caller. The Owner's direction on #579 is that Packaging may own reusable size measurement separately. The Owner's alignment on #596 sets Packaging's long-term scope: Packaging owns the broader packaging concern, and measurement is only its first bounded increment.

**Packaging, long term.** Packaging owns how KAAL's deliverables become packages and what those packages are, across ecosystems such as npm and NuGet. It may come to comprise several independently consumable packages, with semantics in common where warranted and an ecosystem-specific realization where needed. Producing and assembling packages can move to Packaging from Engineering, but only through later Changes, each authorized on its own. Until then, Engineering invokes the current packer and owns the integration gates.

**This increment.**

- **packaging/I1.** Any KAAL package's delivered size is measured the same way, from the package artifact exactly as it was produced, never from its source directory. This holds whatever the ecosystem.
- **packaging/I2.** Two measurements of the same package can be compared, so growth between versions is visible path by path.
- **packaging/I3.** Packaging measures and reports, and it decides nothing. Each product owns its size constraints and optimization decisions. Engineering owns when measurement runs and whether any result gates anything.

**Amended in `packaging/C3` (the Owner's review on #614).** Packaging is the capability for KAAL packages: their semantics, structure, contents, delivery contracts and lifecycle. It is not a compression or archive library. How an artifact is laid out on disk, as gzip, tar or zip, belongs to its ecosystem and that ecosystem's own tooling. Packaging states what a KAAL package is and holds, in terms that are the same for every ecosystem. Hosting owns how a command runs on a host and knows nothing of any package ecosystem.

## Package

This is `packaging/C4`, a PLAN Change. It ships no code. A later DO Change, authorized on its own, writes the conformance cases and turns them GREEN.

The Owner asked on #610 (comments 6529592861 and 6529734792) for a discoverable, testable minimum package-release baseline. Every KAAL package answers to two independently authoritative contracts, and both are tested against the same exact installed candidate. The first is a **generic KAAL Package contract**, owned by Packaging. The second is each package's **specific contract**, owned by its delivering capability. `packaging/C3` set Packaging's seat: it owns KAAL packages' semantics, contents and delivery contracts. The generic contract is that delivery contract. Packaging's "decides nothing" (`Packaging.md`) concerns size constraints, and it stands.

Today no generic contract exists. Each product states the same promises for itself: Guard in its shipped `docs/`, Hosting in #629, Core in #622, Graph in #627 and Change in #636. `engineering/research/release-baseline.md` (engineering/C5, #610) traces them line by line. It finds that 18 of the Owner's 20 candidates are generic and stated only per product, with seven conflicts among them.

- **packaging/I4.** Every KAAL package keeps the same promises to its consumer about what it is, what it ships, how it is verified once installed, and what that verification leaves behind. They are stated once, by Packaging, and each package's own contract adds only what is specific to it.
- **packaging/I5.** Conformance to those promises is decided by reusable cases run against the installed artifact. A file that exists, a source test that passed, or CI GREEN never stands for conformance.
- **packaging/I6.** Packaging references what other capabilities own and does not restate it. Testing owns the installed run, results and evidence. Hosting owns host compatibility. Each delivering capability owns its product's guarantees and acceptance. Engineering owns orchestration, gate evaluation and evidence reporting. The Owner owns release acceptance.

**Boundaries.** The contract binds KAAL's own packages. It binds no consumer, and it makes no package depend on Packaging at runtime: a package conforms by its shape and behaviour, and Packaging's cases test it from outside. Producing and publishing packages stay where they are, with Engineering and with the Owner.

## Capability

packaging/C8 is this PLAN. It answers the peer review of the promotion #686 (review 5722927885) against the capability bar the Owner set on 2026-10-31. Every KAAL capability ships at least one skill, scripts that help an agent, and agent instructions, and every package eats its own dogfood. Packaging enforces the generic KAAL Package contract on everyone else, but meets none of this itself. Run on its own installed package, its suite reports `failed`.

- **packaging/I7.** Packaging holds itself to the contract it enforces. Installed, `kaal-packaging` passes its own `conform` on every Requirement it can decide. It is usable by an agent without writing JavaScript, through a skill, commands and instructions, and no file in it decides anything by operating system. Hosting stays the only place that may (hosting/F36, testing/F67).

This PLAN changes no product. Foundation's shipped manifest (packaging/F11) remains Foundation's to close, in its own Change.
