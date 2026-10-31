# AGENTS.md

This repository is governed by KAAL.

- `packages/` holds distributable capabilities.
- `engineering/` holds engineering and acceptance work.
- The KAAL Engine for this repository is `.kaal/`. Start with `.kaal/AGENTS.md`.

## Packaging

Use Packaging, through the `kaal-packaging` skill (`packages/kaal-packaging/skills/kaal-packaging/SKILL.md`) and its commands, before publishing or promoting a KAAL package and whenever what a package delivers changes. `kaal-packaging measure <artifact>` measures a packed artifact; `kaal-packaging conform <installed-dir>` decides the generic KAAL Package contract against a packed-and-installed candidate. Packaging decides that generic contract and nothing else: a package's own cases, what results mean, and operating-system differences belong to their owners.
