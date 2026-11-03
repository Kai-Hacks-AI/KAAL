# Packaging as a capability: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **packaging/F15** [packaging/I7, packaging/I4]: **Dogfood.** `kaal-packaging` is a KAAL package under packaging/F7–F14 and N7–N10. It ships the six documents of packaging/F8, linked from its README. It ships its own Embedded Test Cases in `test/embed/` (testing/F76), its verifier, and `test/verify.json` with digests, delivered cases and its Testing `model` (packaging/F11, packaging/F13). Its source `npm test` follows a declared Test Plan with `test:embedded` and `test:publisher` (packaging/F14). Installed, its `npm test` runs `test:embedded` only. Being private is no exemption. The publisher's planned tests leave `test/plan/` for `test/publisher/`. `test/plan/` is legacy (#702).
- **packaging/F16** [packaging/I7]: **Commands.** The package declares a `bin`, `kaal-packaging`, with two commands:
  - `measure <artifact> [--work <dir>]` prints the measurement record of packaging/F1–F6;
  - `conform <installed-dir> [--consumer <dir>] [--work <dir>]` prints the conformance report of packaging/F7–F13 and N7–N9, and ends on one result line in Testing's form (packaging/F10).

  The exit statuses are 0 for verified, 1 for failed and 2 for unknown or cannot run. Both commands are thin: they parse arguments and call the exported functions, and they decide nothing the functions do not.
- **packaging/F17** [packaging/I7]: **Skill.** The package ships one skill, `skills/kaal-packaging/SKILL.md`, in the shared skill format. It tells an agent when to measure an artifact, when to run the generic contract against a packed-and-installed candidate, how to read each finding and the three results, and which questions belong to another owner rather than to Packaging. Graph's and Testing's skills are the shape to follow.
- **packaging/F18** [packaging/I7]: **Agent instructions.** The repository's agent instructions name Packaging. They say when to use it, through the skill and the commands, and that Packaging decides the generic contract and nothing else. The skill ships, so an agent in a consumer can read it.
- **packaging/F19** [packaging/I4]: **F7 decides the registry, not the syntax.** packaging/F7 verifies a runtime dependency only when the consumer's install shows that it resolved from a registry: the installed lockfile's `resolved` for that dependency is a registry tarball URL with an `integrity`. A `file:`, `link:`, Git or path resolution fails F7. A dependency the install records no resolution for is `unknown`, never `verified`, because a version pinned in syntax alone may name a package nobody published, which is open to dependency confusion.

## Nonfunctional

- **packaging/N11** [packaging/I7, packaging/I6]: **No OS knowledge, in tests either.** No file in Packaging, tests included, branches on `process.platform`, writes an OS-specific launcher, or passes `shell` by platform. Every process Packaging or its tests start goes through Hosting's `execute`. A stand-in npm is a Node script that a caller gives to `measure` and `conform` (packaging/A13), never a launcher put on `PATH`. A platform-scoped not-applicable outside Hosting is a violation (testing/F67).
- **packaging/N12** [packaging/I7, packaging/I3]: **The commands decide nothing new.** What `measure` and `conform` decide stays in the library and its Requirements. A command adds argument parsing, printing and exit statuses only.

## Not in this Change

- Foundation's `test/verify.json`. packaging/F11 is not relaxed for it.
- Publishing Packaging. It stays private, and so does its version.
- Any gate. When conformance gates a release stays Engineering's and the Owner's (engineering/C5).
