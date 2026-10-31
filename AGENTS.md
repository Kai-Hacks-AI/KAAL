# AGENTS.md

This repository is governed by KAAL.

- `packages/` holds distributable capabilities.
- `engineering/` holds engineering and acceptance work.
- The KAAL Engine for this repository is `.kaal/`. Start with `.kaal/AGENTS.md`.

## Packaging

Use Packaging (`packages/kaal-packaging`) to measure a package artifact's delivered size, or to decide the generic KAAL Package contract against a packed-and-installed candidate. Read its skill first: `packages/kaal-packaging/skills/kaal-packaging/SKILL.md`.

- `npx kaal-packaging measure <artifact>` prints the measurement record of a tarball.
- `npx kaal-packaging conform <consumer>/node_modules/<name>` decides packaging/F7–F13 and N7–N9 against an installed package, and exits 0 (verified), 1 (failed) or 2 (unknown).

Packaging decides the generic contract and measures bytes, and nothing else. A package's own guarantees are its capability's, results are Testing's, hosts are Hosting's, and whether anything gates a release is Engineering's and the Owner's.
