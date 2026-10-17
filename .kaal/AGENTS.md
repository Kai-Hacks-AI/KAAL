# AGENTS.md

The directory holding this file is a KAAL Engine. These notes help an Agent find its way in it. They add no meaning and grant no authority beyond what the Engine's Kernel and Nodes define.

- Read `KAAL-KERNEL.md` first. It says what a Node is, how a Node is identified, and how Nodes are admitted.
- The Core Nodes are `Node`, `KAAL Definition`, `KAAL Capability`, `KAAL Agent`, `KAAL Skill`, `KAAL Extension` and `CASE`. As installed, they are in `core/`.
- Skills and Extensions are the Nodes typed by `KAAL Skill` or `KAAL Extension`. As registered, they are under `skills/` and `extensions/`.
- Nodes are identified by their exact content, not by filename or location. If files have been moved, find Nodes by their frontmatter.
- With the `kaal` command from `kaal-core`, run `kaal verify --engine <this directory>` to check the Engine and `kaal list --engine <this directory>` to see its Skills and Extensions.
