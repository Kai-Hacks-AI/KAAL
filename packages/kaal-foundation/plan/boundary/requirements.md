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

  `boundary` reports its two observations separately, and only the ones it made:
  - `resolution` (foundation/I1) is the resolved copy's own result from step 3;
  - `digests` (foundation/I2) is foundation/F22's result over the supplied lists, or `not checked` when no list is supplied.

  `scope` names the observations that ran: `["resolution"]` without a list, and `["resolution", "digests"]` with one. The overall `result` covers `scope` only:
  - `verified` (0) when every observation in scope is `verified`;
  - `failed` (1) when any of them is `failed`;
  - `cannot verify` (2) otherwise.

  So `boundary <consumer>` with no list never reports, implies or counts digest agreement. Its human summary line says `digest agreement: not checked`. The last line is `kaal-foundation-boundary {json}`. The JSON holds:
  - `result`, `exit` and `scope`;
  - `observations`, with `resolution` and `digests`;
  - `consumer`, its `name` and `version` as declared;
  - `resolved`, the resolved copy's `version` and the directory it was resolved to, relative to the consumer;
  - `check`, foundation/F22's JSON, or `null`;
  - `causes`.

  **What `verified` means, and what it does not.** `boundary` checks two things only: that the Foundation copy the consumer resolves verifies, and that the digests the consumer supplied are Foundation's. It does not establish:
  - that the consumer conforms to anything;
  - that the consumer uses Foundation correctly, or at all, in its code;
  - that the supplied lists cover every digest the consumer computes or states.

  The same holds for `check`: it vouches only for the lines it read. The human summary line of both commands says this, and so do `docs/limitations.md` and the skill.
- **foundation/F24** [foundation/I9, foundation/I7]: **Documented for agents.** The installed `docs/operations.md`, the skill (foundation/F15) and the repository's `AGENTS.md` Foundation section (foundation/F16) name both commands and state the limits of `verified` in foundation/F23. They tell a consumer to produce its own list from the digests it already states, in the form of foundation/F22, at the time it states them. Each command is invoked by the scoped package's own bin path (foundation/F18).

## Non-functional

- **foundation/N13** [foundation/I9]: **Outer loop only.** The boundary reads nothing of the consumer except three things: its `package.json`, the path Node's resolution returns, and the files its lists name. It never imports, requires or runs consumer code, scripts or tests. It never scans consumer source, never reads a consumer's manifest format (a KAAL `test/verify.json` included), and never infers how the consumer computes a digest. So a consumer that keeps its own SHA-256 and states the same digests passes foundation/F22. Whether a consumer keeps its own implementation is that consumer's Architecture, not Foundation's.
- **foundation/N14** [foundation/I9, foundation/I1]: **No new reach.** Both commands use only Node's built-in modules and Foundation's own `lib/sha256.mjs`. They touch no network, install nothing, write no file, and make no decision by operating system (foundation/N7). The package still declares no dependency (foundation/N2). `lib/` is unchanged (foundation/N9).
