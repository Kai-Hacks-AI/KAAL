# Consumer boundary: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **foundation/F22** [foundation/I9, foundation/I2]: **Digest agreement: `kaal-foundation check [<list>…]`.** Each list holds lines `<digest>  <file>`, the exact form `kaal-foundation sha256` prints (foundation/F14) and `sha256sum` prints. With no list, or with `-`, it reads standard input. A file is resolved against the current directory, as `sha256sum -c` does. For each line, Foundation's own `sha256` hashes the file's bytes, and the result is compared with the stated digest. The check ends in one result:
  - `verified` (0): at least one line was read, and every stated digest equals Foundation's;
  - `failed` (1): a stated digest is well formed, and it differs from Foundation's digest of the same file's bytes;
  - `cannot verify` (2): no line was read, a line is not in the form, a digest is not 64 lowercase hexadecimal digits, a file cannot be read, or a list cannot be read.

  `failed` outranks `cannot verify`. The last line of standard output is `kaal-foundation-check {json}`. The JSON holds `result`, `exit`, `checked` (the number of lines compared) and `causes`. Each cause is a `{ file, cause }`, where `cause` is `differs`, `unreadable` or `malformed`.
- **foundation/F23** [foundation/I9, foundation/I1]: **Resolution: `kaal-foundation boundary <consumer> [<list>…]`.** `<consumer>` is a directory that holds a `package.json`. The check:
  1. reads the consumer's `package.json`, which must declare `@kaihacksai/kaal-foundation` in `dependencies`. A package that does not declare it is not a consumer: the result is `cannot verify` with the cause `not a consumer`, and nothing else is checked.
  2. resolves `@kaihacksai/kaal-foundation/package.json` from the consumer's directory, by Node's own module resolution. A declared dependency that does not resolve is `cannot verify` with the cause `unresolved`.
  3. runs the resolved copy's own `bin/kaal-foundation.mjs verify` (foundation/F12), under the running Node, and takes the result from that copy's last line. The resolved copy decides its own verification, not the copy that runs the boundary.
  4. if lists are given, runs foundation/F22 on them, with the consumer's directory as the current directory.

  The result is `verified` (0) only if the resolved copy is `verified` and every list is `verified`. Otherwise it is `failed` (1) if any part is `failed`, and `cannot verify` (2) if not. The last line is `kaal-foundation-boundary {json}`. The JSON holds `result`, `exit`, `consumer` (its `name` and `version` as declared), `resolved` (the resolved copy's `version` and the directory it was resolved to, relative to the consumer), `verification` (the resolved copy's result), `check` (foundation/F22's JSON, or `null`) and `causes`.
- **foundation/F24** [foundation/I9, foundation/I7]: **Documented for agents.** The installed `docs/operations.md`, the skill (foundation/F15) and the repository's `AGENTS.md` Foundation section (foundation/F16) name both commands. They tell a consumer to produce its own list from the digests it already states, in the form of foundation/F22, at the time it states them. Each command is invoked by the scoped package's own bin path (foundation/F18).

## Non-functional

- **foundation/N13** [foundation/I9]: **Outer loop only.** The boundary reads nothing of the consumer except three things: its `package.json`, the path Node's resolution returns, and the files its lists name. It never imports, requires or runs consumer code, scripts or tests. It never scans consumer source, never reads a consumer's manifest format (a KAAL `test/verify.json` included), and never infers how the consumer computes a digest. So a consumer that keeps its own SHA-256 and states the same digests passes foundation/F22. Whether a consumer keeps its own implementation is that consumer's Architecture, not Foundation's.
- **foundation/N14** [foundation/I9, foundation/I1]: **No new reach.** Both commands use only Node's built-in modules and Foundation's own `lib/sha256.mjs`. They touch no network, install nothing, write no file, and make no decision by operating system (foundation/N7). The package still declares no dependency (foundation/N2). `lib/` is unchanged (foundation/N9).
