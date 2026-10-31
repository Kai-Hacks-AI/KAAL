# Packaging as a capability: Architecture

- **packaging/A12** [packaging/F15, packaging/F16, packaging/F17]: **Layout.** The package ships `lib/`, `bin/kaal-packaging.mjs`, `skills/kaal-packaging/SKILL.md`, `docs/`, `capability/`, `test/embed/`, `test/verify.mjs` and `test/verify.json`. `test/publisher/` holds the publisher's suites today in `test/plan/`, and does not ship. `test/verify.json` is build output, written by a script under `test/publisher/` from npm's own pack list, as Core and Guard write theirs.
- **packaging/A13** [packaging/N11]: **npm is given, not found by platform.** `measure` and `conform` take an optional `npm`, the path of a Node script that behaves as npm. When it is given, they run it as `process.execPath <script> …` through Hosting's `execute`. When it is not, they run `npm` through Hosting, as today. The tests give their stand-in this way, and run every real npm through Hosting's `execute`.
- **packaging/A14** [packaging/F19]: **Registry resolution is read, not fetched.** F7 reads the consumer's install record, `node_modules/.package-lock.json` (or the consumer's `package-lock.json`), for each runtime dependency of the package under test. It makes no network request, so its result does not depend on a registry being reachable.

## Sequence

1. **packaging/C8 PLAN** (this Change). It also aligns `plan/package/reconciliation.md`'s F11 row with the code: the manifest is `test/verify.json`, and a list in `docs/operations.md` without digests leaves F11 `unknown`.
2. **packaging/C9 DO.** packaging/T27–T34, RED first, then the layout, commands, skill, F7 resolution and the OS-free tests. It touches `packages/kaal-packaging/`, the repository's agent instructions for F18, and the root lockfile only if `bin` requires it.
3. **#686**, the promotion, re-reviewed on C9's head, as the Owner decides on #686.
