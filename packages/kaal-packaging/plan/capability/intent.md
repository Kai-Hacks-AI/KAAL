# Packaging as a capability: Intent

packaging/C8 is this PLAN. It answers the peer review of the promotion #686 (review 5722927885) against the capability bar the Owner set on 2026-10-31. Every KAAL capability ships at least one skill, scripts that help an agent, and agent instructions, and every package eats its own dogfood. Packaging enforces the generic KAAL Package contract on everyone else, but meets none of this itself. Run on its own installed package, its suite reports `failed`.

- **packaging/I7.** Packaging holds itself to the contract it enforces. Installed, `kaal-packaging` passes its own `conform` on every Requirement it can decide. It is usable by an agent without writing JavaScript, through a skill, commands and instructions, and no file in it decides anything by operating system. Hosting stays the only place that may (hosting/F36, testing/F67).

This PLAN changes no product. Foundation's shipped manifest (packaging/F11) remains Foundation's to close, in its own Change.
