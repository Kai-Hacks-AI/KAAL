# Hosting: Architecture (where)

Architecture places Hosting's functions, gives each one positive ownership, and fixes its boundaries, relationships and dependencies. Each element names, in brackets, the [Requirements](requirements.md) it serves. How each function is implemented is the code's.

## Operations

- **hosting/A21** [hosting/F45–hosting/F54, hosting/N7]: Every operation is exported from the package's main entry, `@kaihacksai/kaal-hosting`, built from TypeScript to `dist/index.js`. All file access goes through [`graceful-fs`](https://www.npmjs.com/package/graceful-fs), which on Windows retries renames blocked by antivirus or indexing. Writers are serialized with [`proper-lockfile`](https://www.npmjs.com/package/proper-lockfile), a lock directory beside the target, `<dir>.lock`, with stale-lock recovery, taken on the directory's canonical path. Commands are started with [`cross-spawn`](https://www.npmjs.com/package/cross-spawn), which on Windows finds `.cmd` shims through `PATHEXT` and escapes their arguments. Writes are staged beside the directory, never inside it, and renamed into place, so the directory and its parent must be on one filesystem. Hosting's Extension Node is carried in `payload/Hosting.md`.

## Guarded file reconciliation

- **hosting/A1** [hosting/F1, hosting/F9, hosting/F10, hosting/F11, hosting/F12]: `reconcile` is exported from the package's main entry, beside `update`, with its types `Reconciliation` (the input) and `Reconciled` (the report). `HostingError` gains the code `STALE`, carrying the failing entries as `findings`, each with its `path`, `expected` and `found`. It also gains the code `UNRESTORED` (hosting/F11), carrying the recovery location as `kept` and the original failure as `cause`. A new exported type, `Leftover` `{ path: string; error: unknown }`, describes a directory left beside the root (hosting/F12). `Reconciled` gains an optional `leftovers?: Leftover[]`, and `HostingError` gains the same optional `leftovers`. A rejection with an error that is not a `HostingError` carries `leftovers` as a property added to that same error.
- **hosting/A2** [hosting/N2, hosting/F6, hosting/F11, hosting/F12]: It reuses what `update` already relies on. It takes the same lock (`proper-lockfile` on the root's canonical path), stages beside the root, reads back to confirm the host holds the staged files exactly, and does all file access through `graceful-fs`. Files are put in place and kept aside by renames, so the root and its parent must be on one filesystem, as for `update`.
- **hosting/A3** [hosting/F4, hosting/F5, hosting/F13]: A reconciliation never walks the whole root. A directory turned into a file is the one subtree it reads in full, to check that nothing under it would stay. A root is typically a repository, which can be large. Collisions with what is present are checked against the entries of each directory on an entry's path, and links and non-directories are found by looking at each segment without following it.
- **hosting/A4** [hosting/F2]: Hosting computes the SHA-256 of present bytes with the host's own (`node:crypto`). Hosting is the host layer, so this is the host's primitive, not a KAAL implementation competing with Foundation's. The digest is standard SHA-256, so it equals what Foundation, Graph and Core compute for the same bytes. Hosting takes no dependency on Foundation, and Foundation none on Hosting.
- **hosting/A5** [hosting/I3, hosting/F7]: What `executable` means on each host is decided only inside Hosting. Callers state the mark, and no caller branches on the OS.
- **hosting/A6** [hosting/F14]: `Reconciliation` gains an optional `expect: Expectation[]`, where `Expectation` is a new exported type `{ path: string; expect: string }`. Because it is optional, every existing caller and every existing report is unchanged. Expected paths go through the same path checks and the same per-path read (`present`) as writes and removals, and they never enter the apply, the rollback or the report.

## The package and its verification

- **hosting/A9** [hosting/F18, hosting/F19, hosting/F20, hosting/N4]: Product and publisher stay apart inside the package directory.
  - **What ships.** `docs/` is the authoritative product contract. `test/embed/` holds every shipped case: one file per outer loop (`intent`, `requirements`, `architecture`), the Code loop in every other case file, and a harness that resolves the package under test by name. `test/verify.mjs` is the entry and `test/verify.json` the manifest the publisher generates, when it packs the package, from the cases' titles and the tables in [Testing](testing.md).
  - **What does not ship.** The TypeScript source, the publisher's change records and the publisher's own tests (the tests of the verification itself and of the conformance suite) stay outside the shipped paths.
  - **Scripts.** `test` runs `node test/verify.mjs` in both places (hosting/F20). `test:publisher` builds the package and runs the publisher's own tests and the delivered cases from the source tree. In source, `npm test` runs it through the verification entry, so anything that runs Hosting's `npm test` in its directory runs it all.
  - **Lanes.** The publisher packs the candidate and runs the consumer verification in a fresh consumer on Linux, Windows and macOS, so a release candidate is verified on all three hosts before it is published.
- **hosting/A10** [hosting/N4, hosting/F21–hosting/F25]: Hosting realizes the verification in its own `test/verify.mjs`, from Node's built-ins, with the same three results, summary line and manifest shape as Guard's. It copies no Guard file at run time and depends on no Guard or Testing package.

### The package interface

- **hosting/A15** [hosting/F35]: Hosting's package interface is the table below, between the `kaal-hosting:interface` markers. It is the one authoritative declaration of the package's shape. `Target` is the default condition of an export or the path of a command; an export may also name `types`, which must then ship as well.

<!-- kaal-hosting:interface -->
| Kind | Entry | Target | Status |
| --- | --- | --- | --- |
| export | `.` | `./dist/index.js` | delivered |
| export | `./conformance` | `./dist/conformance.js` | delivered |
| export | `./package.json` | `./package.json` | delivered |
| export | `./boundary` | `./dist/boundary.js` | delivered |
| export | `./fixtures` | `./dist/fixtures.js` | delivered |
| bin | `kaal-hosting-boundary` | `bin/kaal-hosting-boundary.mjs` | delivered |
| files | `dist` |  | delivered |
| files | `!dist/.tsbuildinfo` |  | delivered |
| files | `payload` |  | delivered |
| files | `docs` |  | delivered |
| files | `test/embed` |  | delivered |
| files | `test/verify.mjs` |  | delivered |
| files | `test/verify.json` |  | delivered |
| files | `bin` |  | delivered |
| files | `skills` |  | delivered |
<!-- /kaal-hosting:interface -->

## The conformance suite

- **hosting/A12** [hosting/F27, hosting/F28, hosting/F29, hosting/F30, hosting/F32]: `couplings` and its types (`CouplingReport`, `Finding`) join `inspect` in `@kaihacksai/kaal-hosting/conformance`, the separate entry point that production code never loads. It reads sources with a scanner that knows JavaScript and TypeScript comments, strings and template literals, so a mention in a comment is never a finding. It decides `kind` from the enclosing test registration call, `if`, conditional expression or assertion call. It takes no new runtime dependency.
- **hosting/A13** [hosting/F31, hosting/F34]: the suite ships, beside the inspection, with its command and its review instructions.
  - `boundary` and `boundarySuite` live in `src/boundary.ts`, built to `dist/boundary.js` and exported as `@kaihacksai/kaal-hosting/boundary`. It is the only entry that imports `node:test`, and only a runner loads it.
  - The command is `bin/kaal-hosting-boundary.mjs`, declared in `bin`. It calls `boundary` without `node:test`, so a consumer runs it with `npx` and no test framework.
  - The review instructions are `skills/kaal-hosting-boundary/SKILL.md`, in the shape of kaal-guard's Skill: Bare first, then the judgment per `kind`.
  - `bin` and `skills` join `files`. Hosting's tests of the suite, with their fixtures, stay in `test/` and are not shipped.
  - No inspected capability imports Hosting or `node:test` to be inspected. The runner (Engineering, a consumer repository, an agent workflow or release acceptance) depends on Hosting, as a development dependency or through `npx`.
- **hosting/A14** [hosting/F33]: the result keeps two channels apart. `result` and `cases` are deterministic and use Testing's vocabulary (testing/F13: verified, failed, unknown). `reviews` and `review` are requests for judgment, which Review owns, with agent → human escalation through PREACH. Hosting never reads a judgment back into `result`. Review's judgment record cites a request by its `id` and the rule by its owned id. A review request is not itself a PREACH report: PREACH, KAAL Agents' escalation, is where an unresolved request escalates, from an agent to a human. A runner that wants to gate on judgment does so through Review's record, not by treating a review request as passed or failed. The command's exit code 3 lets a runner tell "verified, review requested" apart from both a pass and a failure.
- **hosting/A16** [hosting/F36]: `OS_BOUNDARY` and `osBoundary` join `couplings` and `inspect` in `@kaihacksai/kaal-hosting/conformance`, which never loads `node:test`. The list is code, not configuration: a package becomes the boundary only through a new version of Hosting.
- **hosting/A17** [hosting/F37, hosting/F38]: `facts` and `specialEntries` live in `src/fixtures.ts`, built to `dist/fixtures.js` and exported as `@kaihacksai/kaal-hosting/fixtures`. It is test support that other capabilities' tests load, never their production code, and it never loads `node:test`. It is the one module in KAAL that makes a FIFO (through Hosting's `execute`) or a Unix-domain socket (through `node:net`). `facts()` establishes each fact once per process, in a temporary directory it removes.
- **hosting/A18** [hosting/F39, hosting/F40]: `portability` and `portabilitySuite` live beside `boundary` and `boundarySuite` in `src/boundary.ts` (hosting/A13), and the command gains `--applicability`. `portability` composes `boundary`; it does not change its result or its three cases. The classification of a conditional that picks a registration function is `couplings`' (hosting/A12).
- **hosting/A19** [hosting/F41]: `HOSTS.md` ships in `skills/kaal-hosting-boundary/`, which `files` already ships (hosting/A13). Its host table is machine-read by Hosting's own tests in every lane, so the guide is evidence each host checked, not prose.

## Agent-facing use

- **hosting/A23** [hosting/F57, hosting/F58, hosting/F61]: **Agent-facing adapter.** `skills/kaal-hosting/SKILL.md` carries a concise procedure and references inside `skills/kaal-hosting/references/`. One operations reference holds the selection guide, recovery guidance and executable examples; avoid copies of the authoritative five product documents. The procedure explains how to locate those documents from the installed package. The existing `skills/kaal-hosting-boundary/` remains separate; a sibling-relative link is not portable. The existing `payload/Hosting.md` remains unchanged.
- **hosting/A24** [hosting/F58, hosting/F59, hosting/F60, hosting/F61]: **One implementation of host behavior.** Bare consumers and agent examples use the same named public exports. The Script realization is the existing library, verifier and boundary command; this Change adds no general filesystem CLI or runtime wrapper. A consumer supplies the working directory and authorized operation. Fixture setup may use Node built-ins in tests; the demonstrated operation itself must use Hosting. Installed verification remains self-contained and depends on neither Core nor Engineer Skill. The Engineer Skill checker is a publisher tool, never a runtime dependency.
- **hosting/A25** [hosting/F62, hosting/N8]: **Test placement.** Delivered usage Cases join `test/embed/` in the appropriate outer/code loops, preserving the current runner and manifest format. Publisher-only relocation/standard checks and negative challenges live under the publisher tests and are selected by `test:publisher`. Reuse Hosting's fresh packed-consumer fixtures and Testing's existing acceptance/once-pack facilities where already available; do not add a parallel release or acceptance system. Exercise examples from the actual installed resources. Authoritative docs and README gain the new product contracts, traces and discovery pointers when the Skill is delivered; the existing `skills` and `test/embed` package file entries already admit these resources.
