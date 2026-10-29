# Platform Coupling Conformance: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **hosting/F27** [hosting/I8]: **What is read.** `couplings(files, options)` reads every JavaScript and TypeScript source among `files` (`.js`, `.mjs`, `.cjs`, `.ts`, `.mts`, `.cts`; not `.d.ts`), taking `files` as `read` returns them. Comments do not count. Each file is in scope `production` or `test`. A file is `test` when its path has a `test`, `tests`, `__tests__`, `fixtures` or `scripts` segment, or its name has `.test.` or `.spec.`; everything else is `production`. `options.test(path)` replaces that rule. Files that are not sources are listed as skipped, with the reason. The same input always gives the same report.
- **hosting/F28** [hosting/I8]: **What is found.** An identifier bound in the same file to a platform query or a platform literal, such as `const WINDOWS = process.platform === "win32"`, is found where it is bound and wherever it is used. Each finding names its `rule`:
  - `platform-query`: the host is asked which platform it is: `process.platform`, `process.arch`, `os.platform()`, `os.type()`, `os.arch()`, `os.release()`, `os.version()`, `os.EOL`, `path.sep` and `path.delimiter`, `path.win32` and `path.posix`, through any import or destructuring of `node:os`, `os`, `node:path`, `path` or `process`.
  - `platform-literal`: a string literal naming a platform or OS family (`win32`, `darwin`, `linux`, `freebsd`, `openbsd`, `sunos`, `aix`, `android`, `cygwin`, `netbsd`, `windows`, `macos`).
  - `host-api`: a host-specific mechanism that Hosting mediates or that only some hosts have. These are `shell: true` and a literal `cmd`, `cmd.exe`, `.cmd`, `.bat`, `powershell`, `sh`, `/bin/sh` or `mkfifo` command given to `spawn`, `spawnSync`, `exec`, `execSync`, `execFile`, `execFileSync`, `fork` or Hosting's `execute`; `net` listening on anything but a numeric port; a literal mode (`0o…`) passed to `chmod`, `chmodSync`, `mkdir` or `writeFile`; `symlink` with `"junction"`, `"dir"` or `"file"`; `process.getuid`, `process.getgid`, `process.geteuid`; `os.homedir`, `os.userInfo`; and environment variables that are host-specific (`PATHEXT`, `ComSpec`, `SystemRoot`, `USERPROFILE`, `APPDATA`, `HOME`).
- **hosting/F29** [hosting/I8]: **How a finding is classified.** Each finding has one `kind`:
  - `coupling`: any finding in production scope.
  - `registration`: in test scope, a platform finding decides whether a test is registered or run. That covers a `skip`, `todo` or `only` option or call (`it.skip`, `t.skip()`, `{ skip: … }`), a test or suite registered inside a branch, and an early `return` from a test.
  - `dilution`: in test scope, a platform finding decides what is asserted. That covers an assertion inside a platform branch, and a platform-dependent expected value or argument to an assertion (`assert.*`, `t.assert.*`, `expect(…)`).
  - `setup`: in test scope, any other platform finding, such as a fixture built differently per host with the same assertions afterwards.

  A finding that is both `registration` and `dilution` is reported as `registration`. Each finding carries its file, 1-based line and column, scope, rule, kind, and the construct as written.
- **hosting/F30** [hosting/I8]: **Review, not verdict.** A finding is evidence for review. `couplings` never turns one into a pass or a fail, and it never drops one. A capability may acknowledge a finding with a comment, `// kaal-hosting: platform <reason>`, at the end of the finding's line or on the line just above it. The finding then carries `acknowledged` with that reason, and it is still reported. An acknowledgement with no reason does not count. Whether a finding is resolved, and what that means for a Run, is Testing's and Engineering's to say (testing/C29 on #639, engineering/C9 on #648).
- **hosting/F31** [hosting/I8]: **The reusable suite.** `boundarySuite({ name, root, builtins, test })` registers one `node:test` suite for a capability named `name`, whose sources are under `root`, read through Hosting's `read`. `builtins` are the host modules the capability declares it may import, as `inspect` takes them, and default to none. `test` is passed to `couplings`. The suite has one case. It inspects the sources with `couplings`, and with the existing `inspect` against `builtins`. Every finding and every violation is emitted as a diagnostic, and the whole result is written as one line `kaal-hosting-boundary {…}`, carrying the capability's `name`, `findings`, `violations`, `validation`, `outside`, `skipped`, `coverage` and `exclusions`. With that line, Engineering can report per capability without rules of its own.

  A finding or a violation never fails the case. The case fails only when the inspection cannot complete, for example when `root` is not a directory or a source cannot be read.

  The suite can also be called on its own, without any capability importing Hosting. `node packages/extensions/kaal-hosting/conformance/boundary.mjs --name <name> --root <dir> [--builtin <module>]…` runs the same suite and prints the same line. In Testing's Plan → Suite → Case model, this is a Suite, and each capability inspected is one Case. The Plan that runs it belongs to Engineering.
- **hosting/F32** [hosting/I8]: **Stated coverage.** The report carries `coverage` and `exclusions`, as `inspect` does. A report with no finding means none was found within that coverage, never that the capability complies.

## Nonfunctional

- **hosting/N5** [hosting/I8]: The suite is tested with positive and negative fixtures. Each rule and each kind has at least one fixture that must be found and one similar one that must not. A T114-like OS-specific skip is among them.

## Limits

- The suite reads code; it does not run it. A platform decision reached through data it cannot see, such as a value read from a file or passed in from outside the inspected sources, is not found. `exclusions` say so.
- Hosting is exempt: it is the one capability that realizes host differences. The suite is for every other capability, and Hosting's own sources are not its subject.
- Hosting defines what is found. Which findings a capability must correct, and when, is decided in review, with each capability correcting its own code.
