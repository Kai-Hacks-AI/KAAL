# Package size measurement: Intent

This is `packaging/C1`, a PLAN Change and Packaging's first. It ships no code. `packaging/C2`, a DO Change, writes the package and turns the planned tests GREEN.

Guard measured its own package by hand in `guard/C117` (#579): packed and unpacked bytes, which paths grew, and how much each version added. The Owner chose no reduction. He asked that measurement of that kind become reusable, so that every KAAL package is measured the same way. Engineering invokes it, and each product keeps its own size constraints and decisions. Today no Capability owns it. Packing is Engineering's (`engineering/delivery/pack.mjs`), and Testing's boundary leaves what a package delivers to the caller. The Owner's direction on #579 is that Packaging may own reusable size measurement separately. This PLAN proposes the smallest Packaging that does.

- **packaging/I1.** Any KAAL package's delivered size is measured the same way, from the package exactly as it is packed, never from its source directory.
- **packaging/I2.** Two measurements of the same package can be compared, so growth between versions is visible path by path.
- **packaging/I3.** Packaging measures and reports, and it decides nothing. Each product owns its size constraints and optimization decisions. Engineering owns when measurement runs and whether any result gates anything.
