# Foundation as a capability: Intent

foundation/C7 is this PLAN. On 2026-10-31 the Owner set the bar every KAAL capability meets before it goes to npm. It ships at least one skill, scripts that help an agent with that skill, and agent instructions, and it is a correct package that eats its own dogfood. Foundation publishes first, so it meets this bar first.

Foundation from `main` already ships its documents and a consumer verification. Two checks of Packaging's generic contract (packaging/C4–C7, #686) still come out `unknown`:
- packaging/F11, because no `test/verify.json` gives each shipped file's SHA-256 and the delivered cases;
- packaging/F14, because the source `npm test` does not say which declared suites it runs.

It has no skill, no command and no agent instructions. Its documents define no identifier that a delivered case could trace to.

- **foundation/I7.** Foundation holds itself to the capability bar and to the generic KAAL Package contract. Installed, it passes Packaging's conformance suite on every Requirement that suite decides. An agent can use it without writing JavaScript, through a skill, a command and the repository's agent instructions. It eats its own dogfood: its own SHA-256 writes the manifest of every file it ships, and every installation checks that manifest independently. Nothing in Foundation decides anything by operating system (hosting/F36, testing/F67).

This PLAN changes nothing a consumer computes. `lib/` stays byte for byte the same, so every digest stays the same (foundation/N5).
