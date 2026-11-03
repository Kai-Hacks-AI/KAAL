# AGENTS.md

The directory holding this file is a KAAL Engine. These notes help an Agent find its way in it. They add no meaning and grant no authority beyond what the Engine's Kernel and Nodes define.

- Read `KAAL-KERNEL.md` first. It says what a Node is, how a Node is identified, and how Nodes are admitted.
- The Core Nodes are `Node`, `KAAL Definition`, `KAAL Capability`, `KAAL Agent`, `KAAL Skill`, `KAAL Extension` and `CASE`. As installed, they are in `core/`.
- Capabilities, Agents, Skills and Extensions are the Nodes typed by `KAAL Capability`, `KAAL Agent`, `KAAL Skill` or `KAAL Extension`. As registered, they are under `capabilities/`, `agents/`, `skills/` and `extensions/`.
- Nodes are identified by their exact content, not by filename or location. If files have been moved, find Nodes by their frontmatter.
- Follow the applicable repository instructions. Locate Core's installed package and read its `skills/kaal-core/SKILL.md` before operating Core. The intended public package is `@kaihacksai/kaal-core`; the current unpublished tarball candidate is still named `kaal-core`. Confirm the actual installed name and version; do not fetch the unscoped name from a registry.
- From the controller installation, use that package's own `dist/cli.js`: `node <core-cli> verify --engine <this directory>` checks this Engine, and `node <core-cli> list --engine <this directory>` lists its admitted Capabilities, Agents, Skills and Extensions. The Skill explains the public API and other commands. Do not use `npx kaal` or `npm exec` to select Core.
- Discovering a Skill, installing its package, registering a contribution, admitting it and an agent actually using it are distinct. Reading this navigation grants no write authority. Installation, import and inspection do not initialize an Engine; follow the Skill's current initialization limits and obtain explicit authority for writes.
