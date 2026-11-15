# @kaihacksai/kaal-hosting

```
npm install @kaihacksai/kaal-hosting
```

KAAL Hosting is the host-facing KAAL Extension: it enables KAAL to operate within its host environment. It provides the filesystem operations KAAL needs and the running of installed commands, with the same guarantees on Linux, Windows and macOS. Anything above Hosting states the operation it needs; how the host realizes it is Hosting's concern. Hosting knows paths, bytes and commands only; what the files mean is KAAL Core's concern.

Hosting is also KAAL's one operating-system boundary. It ships a conformance suite that finds where any other capability's code or tests couple to a particular platform instead of going through Hosting.

It needs Node 24 or later.

## What it provides

| Entry | What it gives you |
| --- | --- |
| `@kaihacksai/kaal-hosting` | `read`, `list`, `scratch`, `readFile`, `kind`, `within`, `digest`, `update`, `reconcile`, `initialize`, `execute`, `executeSync`, `startPlan`, `isolatedEnvironment`, `prepare`, `contribution` and `HostingError` |
| `@kaihacksai/kaal-hosting/conformance` | `inspect`, `couplings`, `OS_BOUNDARY` and `osBoundary`: inspections of another capability's sources. Importing the main entry does not load it. |
| `@kaihacksai/kaal-hosting/boundary` | `boundary`, `boundarySuite`, `portability` and `portabilitySuite`: the conformance suite, the only entry that loads `node:test` |
| `@kaihacksai/kaal-hosting/fixtures` | `facts` and `specialEntries`: host facts established by trying them, and the fixture that needs one |
| `kaal-hosting-boundary` | the suite as a command: `kaal-hosting-boundary --name <name> --root <dir> [--builtin <module>]… [--applicability <file>]` |
| `kaal-hosting-boundary --target` | the Boundary Check scan: `kaal-hosting-boundary --target <path>… [--base <dir>] [--name <name>]` lists where a file or folder decides by platform, one finding per source line, as evidence and never as a verdict |
| `dist/skills/kaal-hosting/references/` | `boundary-result.md`, the reading instructions for what the suite puts to judgment, and `hosts.md`, the per-host guide |

## Agent guidance

The package ships `dist/skills/kaal-hosting/`: a general Agent Skill for selecting operations, preserving failures and recovery evidence, and interpreting installed verification. Its references carry executable examples exercised by the delivered Cases. It accompanies Hosting as an Extension; Core continues to consume the existing API. Boundary review is in the same Skill: its Boundary Check section, and its `references/boundary-result.md` and `references/hosts.md`.

## The product contract

What Hosting promises is in the package's `dist/docs/`, and its limits are the Limitations section below:

- [Intent](dist/docs/intent/intent.md): why Hosting exists and the outcomes it intends.
- [Requirements](dist/docs/requirements/functional/requirements.md): what each operation and the suite guarantee, with every error code.
- [Architecture](dist/docs/architecture/architecture.md): where each function lives, and the package's interface.
- [Testing](dist/test/package-check/testing.md): how each promise is checked, and where.

## Verifying your installation

The package carries its own Test Cases. One command runs them against the copy you installed, on your host:

```
npm explore @kaihacksai/kaal-hosting -- npm test
```

It needs only Node 24 or later and npm, works in its own temporary directories, and leaves your project as it was. It ends in one of three results, on a last line that starts with `kaal-hosting-verification ` and carries the details as JSON:

| Result | Exit | Meaning |
| --- | --- | --- |
| `verified` | 0 | Every delivered case ran and passed against the installed copy on this host, apart from any declared not applicable here, which are named; the installed files match the shipped manifest; and your project did not change. |
| `failed` | 1 | A delivered case failed, or the run changed your project. The output names which. |
| `cannot verify` | 2 | Nothing failed, but the run cannot claim verification: a prerequisite is missing, the installed files do not match the manifest, or a case was skipped or did not run. The output names the cause and what to do. |

`verified` is your own observation of this run. It is not provenance, which only the registry's integrity and npm's provenance attestation give, and it covers no behaviour the delivered cases do not check. Promises a run in your installation cannot check are listed as not verified by it; [Testing](dist/test/package-check/testing.md) says what the publisher runs for each.

## Limitations

What Hosting does not establish. The obligations they concern are in [Requirements](dist/docs/requirements/functional/requirements.md). These limits are stated, not prevented.

### Operations

- **Writer authority.** Reconciliation paths name changes inside the root. Hosting additionally creates its documented lock, staging and aside siblings beside the canonical root, and can retain recovery originals or report leftovers there. The caller must have authority for that complete footprint before requesting a write. A literal root-only authorization is insufficient. Hosting adds no runtime permission check and does not infer authority from filesystem access. This does not authorize an arbitrary sibling target or cleanup of recovery originals.

- **Containment is by canonical path.** `within` compares canonical paths, not physical objects, so a bind mount, a hard link or another alias can reach the same object from outside `root`. It is a check, not a lock: a link changed between the check and a later read is not prevented (hosting/F48).
- **One filesystem.** Hosting stages its writes beside the directory and renames them into place, so the directory and its parent must be on one filesystem (hosting/F49, hosting/A21).
- **Readers take no lock.** `read`, `readFile` and `kind` take no lock, so a reader can see a directory while a writer changes it.

### Guarded file reconciliation

`reconcile` offers no transactional guarantee beyond hosting/F6 and hosting/F11.

- **Uncooperative writers.** The lock serializes Hosting's writers only. A process that writes into `root` without Hosting can change a file between the precondition check and the apply, and that change is not detected. A caller, KAAL Core included, must not treat `reconcile` as protection against writers that do not use Hosting: its preconditions guard against changes made before the reconciliation began, not against a concurrent uncooperative writer.
- **Expectations.** hosting/F14 makes an expectation exactly as strong as a write's guard. Hosting's writers cannot change an expected file between the check and the apply, and a writer that does not use Hosting is not excluded.
- **Readers.** Readers take no lock, so a reader can see a reconciliation half applied.
- **Unrecoverable host failures.** A host that refuses the rollback too leaves `root` partly applied, reported under hosting/F11. Hosting cannot then put `root` back, and it does not retry.
- **Leftovers.** A staging or aside directory the host will not let Hosting remove stays beside `root` (hosting/F12). Hosting reports it but does not remove it later. After an apply, it holds only originals that were replaced or removed as planned, never anything `root` needs. A later reconciliation is unaffected, since each one stages under a new name. Because those names are new each time, a report with `leftovers` is not equal between hosts (hosting/N3 holds for every report without them).
- **Crashes.** Rollback covers every failure Hosting observes while it runs, not the end of the process itself. A reconciliation cut off by a kill or a power loss can leave `root` partly applied, with the staged and kept-aside files beside it.

### The conformance suite

- **It reads code; it does not run it.** A platform decision reached through data it cannot see, such as a value read from a file or passed in from outside the inspected sources, is not found. `exclusions` say so (hosting/F32, hosting/F55).
- **Hosting is exempt.** It is the one capability that realizes host differences. The suite is for every other capability, and Hosting's own sources are not its subject.
- **Judgment is Review's.** Hosting defines what is found, what is tested and what is asked. Review decides each judgment, Testing decides how a not applicable case is counted, and each capability corrects its own code and cases.
- **Declarations given to it.** The portability audit reads the declarations the runner gives it and the sources under `root`. A declaration kept elsewhere is not audited; the runner is responsible for passing the capability's declarations (hosting/F40).
- **Hosts.** Whether a host fact holds is established on the hosts KAAL runs: Linux, macOS and Windows. Another host gets its own row in the host guide in a new version of Hosting (hosting/F41).

### The package and its verification

- **The interface is the package's shape, not its behaviour.** What each entry does is the business of its own Requirements and Test Cases (hosting/F35).
- **What `verified` establishes.** Only that every declared case ran and passed against the installed copy on this host, apart from those declared not applicable here, that the installed files match the shipped manifest, and that the consumer did not change. It is not provenance, which only the registry's integrity and npm's provenance attestation give. The manifest ships in the package, so a match is consistency evidence only. It does not cover a behaviour no delivered case checks, nor how a consumer uses Hosting (hosting/F21–hosting/F25).
- **The verification does not verify itself.** The Test Cases of the verification itself do not ship, so a delivered run never checks its own verifier. They are allocated to the publisher, who runs them against a packed candidate in a fresh consumer on Linux, Windows and macOS ([Testing](dist/test/package-check/testing.md)).

## Removal

```
npm uninstall @kaihacksai/kaal-hosting
```

Hosting keeps no state of its own outside the directories you give it. A lock directory, `<dir>.lock`, exists beside a directory only while Hosting writes to it.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
