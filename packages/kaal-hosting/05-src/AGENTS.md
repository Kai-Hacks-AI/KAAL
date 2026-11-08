# Hosting: agent instructions

Hosting is the KAAL Extension that crosses the host boundary: paths, bytes and commands on Linux, Windows and macOS. Use its public API (`@kaihacksai/kaal-hosting`); do not reach for the operating system yourself when Hosting offers the operation.

- Read the `kaal-hosting` Skill (`skills/kaal-hosting/SKILL.md`) before choosing an operation, recovering from a refused or stale one, or interpreting a boundary result.
- Hosting knows paths, bytes and commands only. What a file means is KAAL Core's concern.
- A failure carries a `HostingError` code. Keep it and any recovery evidence; do not retry around a refusal.
- To verify an installation: `npm explore @kaihacksai/kaal-hosting -- npm test`. The result is `verified`, `failed` or `cannot verify`; it is evidence of that run, not provenance.
