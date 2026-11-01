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
| `@kaihacksai/kaal-hosting` | `read`, `readFile`, `kind`, `within`, `update`, `reconcile`, `initialize`, `execute`, `contribution` and `HostingError` |
| `@kaihacksai/kaal-hosting/conformance` | `inspect`, `couplings`, `OS_BOUNDARY` and `osBoundary`: inspections of another capability's sources. Importing the main entry does not load it. |
| `@kaihacksai/kaal-hosting/boundary` | `boundary`, `boundarySuite`, `portability` and `portabilitySuite`: the conformance suite, the only entry that loads `node:test` |
| `@kaihacksai/kaal-hosting/fixtures` | `facts` and `specialEntries`: host facts established by trying them, and the fixture that needs one |
| `kaal-hosting-boundary` | the suite as a command: `kaal-hosting-boundary --name <name> --root <dir> [--builtin <module>]… [--applicability <file>]` |
| `skills/kaal-hosting-boundary/` | the review instructions for what the suite puts to judgment, and the per-host guide, `HOSTS.md` |

## Agent guidance

The package ships `skills/kaal-hosting/`: a general Agent Skill for selecting operations, preserving failures and recovery evidence, and interpreting installed verification. Its references carry executable examples exercised by the delivered Cases. It accompanies Hosting as an Extension; Core continues to consume the existing API. The separate `kaal-hosting-boundary` Skill handles boundary review.

## The product contract

What Hosting promises, and its limits, are in the package's `docs/`:

- [Intent](docs/intent.md): why Hosting exists and the outcomes it intends.
- [Requirements](docs/requirements.md): what each operation and the suite guarantee, with every error code.
- [Architecture](docs/architecture.md): where each function lives, and the package's interface.
- [Testing](docs/testing.md): how each promise is checked, and where.
- [Limitations](docs/limitations.md): what Hosting does not establish, such as protection against writers that do not use it.

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

`verified` is your own observation of this run. It is not provenance, which only the registry's integrity and npm's provenance attestation give, and it covers no behaviour the delivered cases do not check. Promises a run in your installation cannot check are listed as not verified by it; [Testing](docs/testing.md) says what the publisher runs for each.

## Removal

```
npm uninstall @kaihacksai/kaal-hosting
```

Hosting keeps no state of its own outside the directories you give it. A lock directory, `<dir>.lock`, exists beside a directory only while Hosting writes to it.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
