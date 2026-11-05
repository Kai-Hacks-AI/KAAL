# Hosting starts processes cheaply and prepares consumers once (hosting/C108, PLAN)

PLAN only. It writes no code, edits no Case and authorizes no merge, SYNC, promotion or npm publication. Provisional Change id; it may move if another Change takes it first.

## Intent

Hosting owns infrastructure access, and starting `npm`, `git` and `node` is infrastructure access. On Windows every such start costs about eight times what it costs on Linux, and a package's tests start them hundreds of times. Owner ruling (Kai, 5 Nov, option A): Hosting 0.0.1 provides (1) a process start that does not wrap `npm` in `cmd.exe`, and (2) a prepared-consumer facility: build a disposable fixture once, hand every test case its own independent copy. Hosting's own suite uses both, and Guard's tests use them after Hosting 0.0.1 is on main. Nothing a consumer imports today changes behaviour.

## Evidence (CI logs of the Hosting sync PR, head c761cc2)

| Part of the Hosting suite | Linux | Windows |
| --- | --- | --- |
| Installed-package suite (`hosting/C10`, run last by `test:publisher`) | 60s | 155s |
| Everything else in `test:publisher` (195 Cases) | n/a | 58s |

The installed-package suite creates 13 fresh consumers, each by its own `npm install` of the same packed tarball, and about 9 of them run `npm explore -- npm test`, which runs the installed verification in full. Slowest on Windows: T31 40s, T30 34s, T27 17s, T24 14s. Every start of `npm` on Windows passes through `cmd.exe` (a `.cmd` shim). The CI-speed work measured the same shape on Guard (41 per-case installs and git setups, run serially). Not yet measured: the share of the Windows time that is `cmd.exe` and the share that is the installs; the DO records both, before and after, per CI job.

## Interface (proposal, to be agreed with the Guard-side work)

All additions to the root export; no existing export changes its contract.

1. `execute(command, args, { cwd, env })` — same contract (arguments passed exactly as given, no shell, resolves with status, rejects when the command cannot start). Change: when the command is `npm` or `npx` on a host that installs them as shims, Hosting resolves the package manager's own script beside the running Node and starts `node <script> <args>` directly, so no `cmd.exe` is involved. If the script cannot be found it falls back to today's start. Observable result is identical.
2. `executeSync(command, args, { cwd, env, input, timeout })` — the same start and contract as `execute`, synchronous, for harnesses that need it. Result: `status`, `stdout`, `stderr` and `output` (stdout then stderr, concatenated), as UTF-8 strings, with a large output limit. `env` is merged over `process.env`, never replacing it, and Hosting neither strips nor adds a variable. Standard input is empty and closed by default (a child that reads it sees end of input and never inherits the terminal); `input` supplies text instead. A nonzero status does not throw; a child ended by a signal or by `timeout` resolves with `status: null` and the `signal`; a command that cannot start throws `HostingError` `NOT_STARTED`. `execute` gains `output` and the same `env` merge rule, additively, and keeps rejecting on a signal as today.
3. `isolatedEnvironment(dir, base?)` — the environment for a process that must not read or write the user's configuration: private `HOME`, `USERPROFILE`, `XDG_CONFIG_HOME`, `npm_config_cache` under `dir`, `GIT_CONFIG_NOSYSTEM=1` and `GIT_CONFIG_GLOBAL` pointing into `dir`, merged over `base` (default `process.env`).
4. `prepare(build, options?)` — runs `build(dir)` once in a fresh scratch directory and resolves with `{ dir, copy(), dispose() }`. `copy()` resolves with a new independent directory holding a recursive copy of `dir`: symbolic links kept verbatim and never followed out of the tree, file modes kept (an executable file stays executable), names listed in `options.exclude` left out, safe to call concurrently, and a change in one copy is visible in no other copy and not in `dir`. `dispose()` removes the prepared directory and every copy it made, reporting a failed removal as `SCRATCH_LEFTOVER` as `scratch` does.

What stays on the caller's side: what goes into the fixture (Guard's git remote and files, a packed tarball), rewriting a copied git remote path (a `git remote set-url` through `execute`), and splitting files so `node --test` runs them in parallel. Hosting does not learn git or npm semantics; it supplies the process start, the environment, and the copy.

## Cases (outer loops, written first; RED before the code)

Cost is not a wall-clock assertion. Each Case states a countable property:

- C-a: with a shim named `npm` placed first on `PATH` that records its start, `execute("npm", ["--version"])` runs the package manager and leaves the shim unstarted; it applies where the host uses shims (Windows), is declared not applicable elsewhere with the usual evidence, and arguments with spaces, quotes and `%` pass exactly as given.
- C-b: `executeSync` and `execute` return equal results for the same command (status, stdout, stderr, output), including a nonzero status and a command that cannot start; a child reading standard input sees end of input; `input` reaches it; a child ended by `timeout` resolves with `status: null`; the caller's environment variables arrive unchanged.
- C-c: `isolatedEnvironment` leaves no variable pointing at the user's configuration, and a `git config --global` and an `npm config set` run under it change nothing outside `dir`.
- C-d: `prepare` runs `build` once for any number of `copy()` calls; copies are independent of each other and of the prepared directory; links are kept verbatim; `exclude` is honoured; concurrent copies do not collide; `dispose` removes everything and reports a leftover.
- C-e: the Hosting installed-package suite installs once and copies per case (a Case asserting exactly one `npm install` in the suite's source of record, not its time).

Immutable Cases are not edited; if one names behaviour this Change alters, a successor Case supersedes it, listed old and new side by side.

## Acceptance of the Change (Check)

- RED then GREEN for C-a to C-e.
- Hosting's own suite uses `prepare` and the no-`cmd.exe` start in its installed-package Cases.
- Windows before and after timing per job (Hosting, Guard unchanged for now), taken from CI jobs on the Change's head versus c761cc2, recorded in the DO record. The aim is a clear reduction of the installed-package suite; no figure is promised before it is measured.
- Dependency contract unchanged (no new runtime dependency), architecture and requirements updated, boundary check and the consumer contract unchanged, three-host CI and installed-consumer acceptance green.

## Order and cost to the release

feature Change into `kaal/hosting`; ledger entry; ledger promotion; SYNC; refresh of the return PR. The sync for the previous round is held until this Change lands, so the ledger is derived once from the final head. Guard consumes the facility only after Hosting 0.0.1 is on main; its own plan is revised by the Guard side to depend on Hosting.

## Decisions

None open for the Owner (option A is chosen). Open for the CPO: the interface above, and whether `executeSync` belongs in 0.0.1 or stays Guard-side; recommendation: in, so Guard does not keep a second `cmd.exe` path.
