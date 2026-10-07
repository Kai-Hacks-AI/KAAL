# Architecture

Everything is in `engineering/kaal-install` (repository engineering, not shipped) plus one root script line. No `kaal-core`, no `.github`, no Node, no sealed byte.

**Selection.** `delivery(target, root, select)` takes the exact Node IDs to select. Each must be the ID of a Node some package carries whose type refers, by the exact ID of Core's `core/Skill.md` or `core/Extension.md`, to Skill or Extension; the kind is decided by that reference, not by name or by where the package keeps the Node. Anything else is refused before any write: a name or unknown ID ("no package carries a Node with the exact ID"), or a package Node that is neither ("not a Skill or Extension Node"). A selected Node joins the Skills Core already reports as installed, and then takes the same path as one: the delivering package is found by exact Node ID, and its contribution is registered through Core's `registerSkill()` / `registerExtension()` into the throwaway KAAL the delivery is built in. Core's admission decides validity. The installer projects the result into the host with the append-only rules it already had.

**Selection is not stored.** The registered Node under `.kaal/skills/<capability>/` and its seal are the record; `installedSkills()` reads them next time. `install-kaal` with no selection reproduces the installation.

**Discovery.** `list-kaal-capabilities` prints kind, capability, Node name, exact ID and installed state for each Skill or Extension Node the packages carry. It lists only.

**Composition.** The whole `compatibility` scalar of each wanted package's Agent Skill is read (the key's line and its indented continuation lines, so plain, folded, literal, quoted and multi-line forms are all read; nothing of it is interpreted but the names). Every capability name it mentions (whole words beginning with the instance's effective `capability-prefix` from `.kaal/core/config`, else Core's default; Core's own package `kaal-core` excluded) that is neither the Skill itself nor installed or selected is unmet. It stays unmet whether or not a package of the delivery carries it: with a Node, the message names the exact ID that selects it; without one (package absent, or without a built payload), it says there is no exact ID to select, and still refuses. `install()` refuses, writing nothing, if anything is unmet; `check()` reports it. Dependencies are never added for the caller. This reads an existing declaration and defines no new one.

**Agent wiring and checks** are unchanged and separate: `wire-kaal-agent`, `check-kaal-install`, `check-kaal-agent`, `check-kaal-config`.

**Host-agnostic.** The host is any directory. The installer writes only `.kaal/`, the `skills/<capability>/` of capabilities it delivers, and (by the separate wiring command) the marked fragment of `AGENTS.md`. It reads nothing of the host.
