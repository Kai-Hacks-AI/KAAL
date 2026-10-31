# kaal-hosting

KAAL Hosting is the host-facing KAAL Extension: it enables KAAL to operate within its host environment. This first version provides the filesystem operations KAAL needs and the running of installed commands, with the same guarantees on Linux, Windows and macOS. Anything above Hosting states the operation it needs; how the host realizes it is Hosting's concern. Hosting knows paths, bytes and commands only; what the files mean is KAAL Core's concern.

## Guarantees

| Operation | Guarantee |
| --- | --- |
| `read(dir)` | Every file of a tree, keyed by `/`-separated relative path, whatever its name. A missing directory reads as empty. |
| `readFile(path)` | One file's exact bytes. A link to a file reads as that file, as in `read`. A directory, a link to one, a cycle of links, or anything else that is not a file is refused with `NOT_FILE`; a missing path, a dangling link included, with `MISSING`: unlike a tree, a single file has no empty reading. Like `read`, it takes no lock. |
| `kind(path)` | What is at a path: `directory`, `file`, `missing` or `other`. Links are followed as `read` and `readFile` follow them: a link or junction to a directory is `directory`, a link to a file is `file`. Nothing, a path below a file, and a dangling link are `missing`, as for `readFile`. Something that exists but is neither, a cycle of links or a socket, pipe or device, is `other`. A failure to look, such as a denied permission, is thrown as the host reports it, never taken for an answer. It takes no lock. |
| `within(root, candidate)` | Whether `candidate` lies within `root`, by canonical path: the host's native `realpath` of both, with links, junctions, `..` and the host's own spelling resolved, then an exact comparison of path segments. The candidate is within when `root`'s segments are all of its own or an exact prefix of them, so `root` itself is within, and `/repo2` is not within `/repo`. There is no case folding and no string-prefix test. Both paths must exist: a missing path, a dangling link or a cycle of links is refused with `MISSING`, never answered `false`. A failure to resolve, such as a denied permission, is thrown as the host reports it. Its limits: this is canonical-path containment, not physical-object containment, so a bind mount, a hard link or another alias can reach the same object from outside `root`. It is a check, not a lock, so a link changed between the check and a later read is not prevented. |
| `update(dir, plan)` | One writer at a time, across processes. `plan` receives the directory as it is and returns the change to make, or nothing. The change is published all or nothing as a new directory: staged beside the directory, read back to confirm the host holds it exactly, and renamed into place, together with any parent directories it needs. Any failure leaves the directory exactly as it was. |
| `reconcile(root, { write, remove })` | Brings individual files under an existing directory, such as a repository, to a planned state, as its only Hosting writer. Each write (`{ path, expect, bytes, executable? }`) and each removal (`{ path, expect }`) is guarded by `expect`: the SHA-256 of the bytes the caller expects at its path now, or `"absent"`. Every precondition is checked before anything is touched. If any fails, nothing changes, and the refusal (`STALE`) lists every failing path in its `findings`, with what was expected and what was found. Paths get `update`'s portability refusals, collisions with names already present included, and nothing is reconciled through a link. The new bytes are staged beside the directory and read back, and replaced and removed files are kept aside. A failure Hosting observes while applying is rolled back and rethrown as it was: every path the reconciliation touched then holds the same kind of entry as before (a file, a directory or nothing), each file with the same bytes and, where the host has the mode, the same executable mark. Nothing more is promised: timestamps, ownership, other permissions, extended attributes and file identity may differ, and a pruned directory put back is a new one. If the host refuses the rollback too, the refusal is `UNRESTORED`, never the original failure (that is its `cause`). The directory may then be partly applied, and every file the reconciliation displaced and could not put back is kept, with its bytes, at its own relative path in `kept`, a `<dir>.aside-*` directory beside it that Hosting never removes. Removing what was staged or kept aside comes after the outcome and never changes it: a directory the host will not let Hosting remove stays beside the directory and is reported as `leftovers` (`{ path, error }`, in path order) on the report, on the original failure, or on `UNRESTORED`, and `leftovers` is absent when nothing is left. Removals prune the directories they empty, never the directory itself, and come before every write, so one reconciliation can turn a file into a directory of the same name (a removal of `P` with writes under `P/`, each expecting `"absent"`) or a directory into a file (a write of `P` expecting `"absent"` with removals of everything under `P/`; a directory holding anything else is found `"not a file"`). Any other path under another in one reconciliation is refused (`INVALID_PATH`). An optional third list, `expect` (`{ path, expect }`), names files the caller relied on and leaves alone, such as files it read to verify a plan. Each is checked with the writes and removals, under the same lock and in the same `STALE` refusal, and is never written, removed or changed in mode, and it has no outcome in the report. An expected path that repeats, is also written or removed, or has another path of the reconciliation above or below it is refused (`INVALID_PATH`). A write marked `executable` is executable where the host has an executable mode, and one without it is not. It resolves with `{ outcomes, pruned }` in path order, each outcome `written`, `removed` or `unchanged`. Its limits: this is rollback on observed failure, not a transaction, and it cannot undo what the host refuses to undo. The lock excludes Hosting's writers only, so a writer that does not use Hosting can change a file between the check and the apply, readers can see a reconciliation half applied, and a reconciliation cut off by the end of the process is not rolled back. |
| `initialize(dir, files)` | Populates a missing or empty directory as its only writer. A missing directory appears complete or not at all; an existing empty one (the current directory, say) is filled in place, never removed or replaced. Anything else is refused. |
| `execute(command, args, { cwd, env })` | Runs an installed command, named on the PATH or by path, however the host realizes it (an executable, or on Windows a `.cmd` shim such as npm installs). Arguments reach the command exactly as given; no shell interprets them. Resolves with the exit status and everything written to stdout and stderr; rejects when the command cannot be started. |
| `contribution()` | Hosting's own Extension Node, `Hosting.md`, for admission by KAAL Core. |

Paths are refused before anything is written when they would not be held faithfully on every supported host: names Windows cannot hold (reserved characters, a trailing dot or space, device names such as `con`), and distinct paths that collapse into one where names are compared without case or Unicode normalization (`A.md` and `a.md`, `café.md` in NFC and NFD). The rule is the same on every host, so what is written on one stays portable to the others.

Hosting stages its writes beside the directory, never inside it, so the directory only ever holds published content. That requires the directory and its parent to be on one filesystem, as renaming into place does anyway.

A link to a file reads as that file. A link to a directory is refused, by `read`, `readFile` and `update` alike: Hosting neither reads nor publishes through one, so nothing it reads or writes lies outside the directory.

Writers are serialized with [`proper-lockfile`](https://www.npmjs.com/package/proper-lockfile) (a lock directory beside the target, `<dir>.lock`, with stale-lock recovery). The lock is taken on the directory's canonical path, so every path that names one directory shares one lock. Commands are started with [`cross-spawn`](https://www.npmjs.com/package/cross-spawn), which on Windows finds `.cmd` shims through `PATHEXT` and escapes their arguments. File operations go through [`graceful-fs`](https://www.npmjs.com/package/graceful-fs), which on Windows retries renames blocked by antivirus or indexing.

The API is asynchronous: both guarantees above depend on it.

## Boundary conformance

`kaal-hosting/conformance` lets a capability gather evidence about whether its own code stays inside the Hosting boundary it declares. It is a separate entry point: importing `kaal-hosting` does not load it.

`inspect(files, { builtins })` reads the JavaScript modules among `files` (as `read` returns them, for example from the directory a package ships). It checks them against the Node builtins that the consumer declares its code may import directly. Hosting knows only what a host module is. Which host modules are acceptable, and what a capability's boundary is, are the consumer's to declare. The same input always gives the same report.

The report keeps three kinds of finding apart:

| Kind | Meaning |
| --- | --- |
| `violations` | Mechanically verified: a static import, an export-from, or an `import()` with a literal specifier names a builtin that was not declared. Each carries its file, line, column, specifier and the builtin's `node:` name. |
| `validation` | Undecidable mechanically, so for an Agent or a person to judge: `import()` with a computed specifier, `process.getBuiltinModule`, `process.binding`, `process._linkedBinding`, `process.dlopen`, `eval`, `new Function`, and any file that cannot be read as a module. These may over-report, since they ask for judgment and claim nothing. |
| `outside` | Packages imported from outside the inspected files. Their own host access is not inspected here. |

Every report also carries `coverage` and `exclusions`, a fixed statement of what was and was not examined. The exclusions include other global access, CommonJS, native and other indirect loading, TypeScript sources, and whether relative imports resolve. A report without violations means that none was found within that coverage. It is never a statement that the code complies with its boundary.

The parser is [`es-module-lexer`](https://www.npmjs.com/package/es-module-lexer).

## Platform coupling conformance

Hosting is the one KAAL capability that realizes host differences. Every other capability leaves the host to Hosting, in its production code and in its tests. `couplings(files, { test })`, also from `kaal-hosting/conformance`, finds where the JavaScript and TypeScript sources among `files` couple to a particular platform. Comments do not count. It finds three things: code asking which platform it is (`platform-query`), string literals naming a platform (`platform-literal`), and host-specific mechanisms such as `shell: true`, `mkfifo` or a literal file mode (`host-api`). An identifier bound to one of these in the same file is found wherever it is used.

Every source is either production or test code: paths under `test`, `tests`, `__tests__`, `fixtures` or `scripts`, and `.test.`/`.spec.` files, are test code. Each finding in production code is a `coupling`. In test code, a finding has one of three kinds:

- `registration`: it decides whether a test runs;
- `dilution`: it decides what is asserted;
- `setup`: anything else.

A `// kaal-hosting: platform <reason>` comment marks a finding `acknowledged`. That is evidence for a reviewer, never an approval.

The suite runs it for one capability, which never depends on Hosting to be inspected:

- `boundary({ name, root, builtins })` and `boundarySuite(options)`, from `kaal-hosting/boundary`, the only entry that loads `node:test`.
- The command `kaal-hosting-boundary --name <name> --root <dir> [--builtin <module>]…`.

Each writes one `kaal-hosting-boundary {…}` line. Three deterministic cases (`inspection completes`, `host modules are declared`, `production code leaves the host to Hosting`) give `result` as `verified`, `failed` or `unknown`. Every other finding is a review request with a stable `id`, for Review to judge. The command exits 0, 1, 2, or 3 (verified with a review requested). `skills/kaal-hosting-boundary/SKILL.md` tells a reviewer what each case and kind asks.

## Portability across capabilities

Hosting is KAAL's one operating-system boundary. `OS_BOUNDARY` and `osBoundary(name)`, from `kaal-hosting/conformance`, say which package that is, and a package's own claim never makes it one. When a case in another capability genuinely needs something only some hosts have, it names a host fact instead of a platform: `{ host: ["kaal-hosting/special-entries"], reason, evidence }`.

`kaal-hosting/fixtures` provides `facts()`, which establishes each fact on the running host by trying it. It also provides `specialEntries(dir)`, which makes a FIFO and a listening Unix-domain socket where that fact holds and nothing where it does not.

`portability(options)`, `portabilitySuite(options)` and the command's `--applicability <file>` audit a capability's declarations with two more deterministic cases:

- `applicability is not scoped by platform` checks that no `platforms` declaration, and no manifest `os` or `cpu`, appears outside the boundary.
- `host exceptions are well-formed` checks for a known fact, a reason, `https` evidence and a registered case.

Every host exception is put to review. `challenged` names the cases a platform decision selects or weakens. `skills/kaal-hosting-boundary/HOSTS.md` gives each fact per host with evidence, and the review guide.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
