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
| `reconcile(root, { write, remove })` | Brings individual files under an existing directory, such as a repository, to a planned state, as its only Hosting writer. Each write (`{ path, expect, bytes, executable? }`) and each removal (`{ path, expect }`) is guarded by `expect`: the SHA-256 of the bytes the caller expects at its path now, or `"absent"`. Every precondition is checked before anything is touched. If any fails, nothing changes, and the refusal (`STALE`) lists every failing path in its `findings`, with what was expected and what was found. Paths get `update`'s portability refusals, collisions with names already present included, and nothing is reconciled through a link. The new bytes are staged beside the directory and read back, and replaced and removed files are kept aside. A failure Hosting observes while applying is rolled back and rethrown as it was: every path the reconciliation touched then holds the same kind of entry as before (a file, a directory or nothing), each file with the same bytes and, where the host has the mode, the same executable mark. Nothing more is promised: timestamps, ownership, other permissions, extended attributes and file identity may differ, and a pruned directory put back is a new one. If the host refuses the rollback too, the refusal is `UNRESTORED`, never the original failure (that is its `cause`). The directory may then be partly applied, and every file the reconciliation displaced and could not put back is kept, with its bytes, at its own relative path in `kept`, a `<dir>.aside-*` directory beside it that Hosting never removes. Removing what was staged or kept aside comes after the outcome and never changes it: a directory the host will not let Hosting remove stays beside the directory and is reported as `leftovers` (`{ path, error }`, in path order) on the report, on the original failure, or on `UNRESTORED`, and `leftovers` is absent when nothing is left. Removals prune the directories they empty, never the directory itself. A write marked `executable` is executable where the host has an executable mode, and one without it is not. It resolves with `{ outcomes, pruned }` in path order, each outcome `written`, `removed` or `unchanged`. Its limits: this is rollback on observed failure, not a transaction, and it cannot undo what the host refuses to undo. The lock excludes Hosting's writers only, so a writer that does not use Hosting can change a file between the check and the apply, readers can see a reconciliation half applied, and a reconciliation cut off by the end of the process is not rolled back. |
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

## License

MIT. See `LICENSE`. The license covers this package's contents only.
