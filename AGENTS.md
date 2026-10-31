# AGENTS.md

This repository is governed by KAAL.

- `packages/` holds distributable capabilities.
- `engineering/` holds engineering and acceptance work.
- The KAAL Engine for this repository is `.kaal/`. Start with `.kaal/AGENTS.md`.

## Packaging

Use Packaging (`packages/kaal-packaging`) to measure a package artifact's delivered size, or to decide the generic KAAL Package contract against a packed-and-installed candidate. Read its skill first: `packages/kaal-packaging/skills/kaal-packaging/SKILL.md`.

Run the commands by their path, never through a registry lookup such as a bare `npx kaal-packaging`: Packaging is private, and its unscoped name is not Packaging's on any registry.

- `node packages/kaal-packaging/bin/kaal-packaging.mjs measure <artifact>` prints the measurement record of a tarball.
- `node packages/kaal-packaging/bin/kaal-packaging.mjs conform <consumer>/node_modules/<name> --testing <module>` decides packaging/F7–F13 and N7–N9 against an installed package, and exits 0 (verified), 1 (failed) or 2 (unknown). `--testing` names a module file that exports Testing's model functions, `check` and `tested`. Without it, packaging/F13 is not judged for a package that ships a model, and the run is not a complete conformance judgement.

Packaging decides the generic contract and measures bytes, and nothing else. A package's own guarantees are its capability's, results are Testing's, hosts are Hosting's, and whether anything gates a release is Engineering's and the Owner's.
