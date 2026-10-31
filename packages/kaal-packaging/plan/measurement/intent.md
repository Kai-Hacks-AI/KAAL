# Package size measurement: Intent

This is `packaging/C1`, a PLAN Change and Packaging's first. It ships no code. `packaging/C2`, a DO Change, writes the package and turns the planned tests GREEN.

Guard measured its own package by hand in `guard/C117` (#579): packed and unpacked bytes, which paths grew, and how much each version added. The Owner chose no reduction. He asked that measurement of that kind become reusable, so that every KAAL package is measured the same way. Engineering invokes it, and each product keeps its own size constraints and decisions. Today no Capability owns it. Packing is Engineering's (`engineering/delivery/pack.mjs`), and Testing's boundary leaves what a package delivers to the caller. The Owner's direction on #579 is that Packaging may own reusable size measurement separately. The Owner's alignment on #596 sets Packaging's long-term scope: Packaging owns the broader packaging concern, and measurement is only its first bounded increment.

**Packaging, long term.** Packaging owns how KAAL's deliverables become packages and what those packages are, across ecosystems such as npm and NuGet. It may come to comprise several independently consumable packages, with semantics in common where warranted and an ecosystem-specific realization where needed. Producing and assembling packages can move to Packaging from Engineering, but only through later Changes, each authorized on its own. Until then, Engineering invokes the current packer and owns the integration gates.

**This increment.**

- **packaging/I1.** Any KAAL package's delivered size is measured the same way, from the package artifact exactly as it was produced, never from its source directory. This holds whatever the ecosystem.
- **packaging/I2.** Two measurements of the same package can be compared, so growth between versions is visible path by path.
- **packaging/I3.** Packaging measures and reports, and it decides nothing. Each product owns its size constraints and optimization decisions. Engineering owns when measurement runs and whether any result gates anything.

**Amended in `packaging/C3` (the Owner's review on #614).** Packaging is the capability for KAAL packages: their semantics, structure, contents, delivery contracts and lifecycle. It is not a compression or archive library. How an artifact is laid out on disk, as gzip, tar or zip, belongs to its ecosystem and that ecosystem's own tooling. Packaging states what a KAAL package is and holds, in terms that are the same for every ecosystem. Hosting owns how a command runs on a host and knows nothing of any package ecosystem.
