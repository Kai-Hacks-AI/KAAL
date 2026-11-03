# Review External acceptance: Architecture

- The declaration is one Markdown file inside the Skill, `references/standalone.md`, one level below `SKILL.md`. It ships with the Skill, so it travels with the text an outside consumer reads and is versioned with it. No new Node, package, workflow or policy.
- The scripts already import only Node built-ins and `record.mjs`. E3 asks for a deterministic test that keeps it so.
- The acceptance trial is not code in this package. Its scenario and evidence belong to Testing; its subject is the text at a stated commit. This plan supplies Review's claims and its declaration, nothing more.
- Reachability and versioning for outside consumers stay open in #978 (Owner territory where it touches promotion). Nothing here decides them.
