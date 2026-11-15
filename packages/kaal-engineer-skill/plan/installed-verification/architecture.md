# Installed Verification: Architecture

Each element names, in brackets, the Requirements it answers.

- **engineer-skill/A3** [engineer-skill/F8–engineer-skill/F10, engineer-skill/N2]: `test/verify.mjs` reads `test/verify.json`, checks the SHA-256 of each installed file against the manifest with Node's built-in digest, lists the package directory, and prints `verified`, `failed` or `unknown`. It follows `packages/kaal-foundation/test/verify.mjs`.
- **engineer-skill/A4** [engineer-skill/F9, engineer-skill/F11]: `test/publisher/manifest.mjs` generates `verify.json` from the pack inventory at publish time. The `scripts` become `test` (consumer), `test:embedded` (verify only), `test:publisher` (the current `node --test` list) and `manifest`.

Open for the CPO: whether Foundation's `kaal-foundation sha256` must produce the manifest digests (as AGENTS.md prescribes for KAAL digests) while the verifier stays dependency-free, as Foundation's own verifier does.

## Sequence

PLAN (this Change) -> DO turns T370-T373 GREEN -> ACT. Later increments: the shipped inventory and pack check, the scoped identity coordinated with Engineering, then the version sequence. Publishing is a separate step that needs the Owner's go.
