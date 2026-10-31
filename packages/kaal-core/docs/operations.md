# kaal-core: Operations

This document covers installing, using, verifying and removing kaal-core.

## Supported platforms

kaal-core supports Linux, macOS and Windows, which are the hosts KAAL's Hosting package supports (core/F86). Every host operation goes through `kaal-hosting`, so kaal-core makes no platform decision of its own (core/F88). What host compatibility means, and how a platform difference is tested, are Hosting's.

## Runtime

- Node.js 24 or later. The package declares `"engines": { "node": ">=24" }`.
- npm, to install it and to run its verification.
- Runtime dependencies, installed by npm: `@kaihacksai/kaal-foundation`, `kaal-hosting` and `yaml`. KAAL's Graph package is not needed.

## Install

```sh
npm install kaal-core
```

kaal-core 0.0.1 is not yet published. Until it is, install it from a packed tarball together with the tarballs of its KAAL runtime dependencies:

```sh
npm install ./kaal-core-0.0.1.tgz <the dependency tarballs>
```

The release plan publishes kaal-core under the scoped name `@kaihacksai/kaal-core` (core/F74). The commands in this document use `kaal-core` until that rename lands. After it, substitute the scoped name.

Installing the package writes nothing into your repository. Only `kaal init`, `kaal register`, `kaal upgrade` and `kaal remove` write, and only when you run them.

## Use

The package installs the `kaal` command. Run it with `npx kaal <command>` from your repository root.

| Command | What it does |
| --- | --- |
| `kaal init` | Materializes the Engine from the payload into `./.kaal/`, a missing or empty directory, and records Core's files. An existing valid Engine is left unchanged. Anything else is refused. |
| `kaal verify` | Verifies the Engine: the Kernel and foundational Nodes by identity, every Node's type, every typed artifact's state, and the assembled registrations. Exit 0 when it holds, 1 otherwise. |
| `kaal list` | Lists the Capabilities, Agents, Skills and Extensions the Engine holds. |
| `kaal resolve <name> [<id>]` | Resolves an admitted Node by name, or by name and id. |
| `kaal identify <file>...` | Prints the id, name and type of Node files. |
| `kaal register <capability\|agent\|skill\|extension> <name> <dir>` | Registers a contribution, all or nothing. Registering the identical contribution again is a no-op. |
| `kaal export <out-dir>` | Writes the foundational payload into an empty directory. |
| `kaal version` | Prints the kaal-core that runs and the version Core's record holds for the Engine. |
| `kaal upgrade` | Brings `./.kaal` to this kaal-core's Installation Contract. Modified files are kept and reported. If the result would not verify, nothing changes. |
| `kaal remove` | Removes Core's installation from `./.kaal`. See [Remove](#remove). |

Every command takes `--engine <dir>` to name another Engine directory. Only `./.kaal` has a record, so `upgrade` and `remove` refuse `--engine`, `version` reports such an Engine as unrecorded, and `init --engine <dir>` bootstraps without a record.

When Core refuses something, it prints `kaal: <reason>`, exits 1 and writes nothing. The programmatic API is in the README and [Architecture](architecture.md).

## Verify the installed package

kaal-core ships its own verification. Run it in the installed package's directory:

```sh
npm explore kaal-core -- npm test
```

It needs only Node and the package's runtime dependencies: no repository, no build tool and no network. It writes only in a scratch directory under the operating system's temporary directory, which it removes, and leaves your project, its dependencies and its configuration as they were (core/N23).

The run does three things:

1. It checks every installed file against the shipped manifest, `test/verify.json`.
2. When they match, it runs the delivered tests against the installed copy.
3. It prints one execution record, a line starting with `kaal-core-execution: `, then the result.

The result is the last line of standard output, in the form `kaal-core: <result>: <name>@<version>: <declared> declared, <executed> executed`, followed by the cause when there is one. It is exactly one of these:

| Result | Exit | Meaning |
| --- | --- | --- |
| `verified` | 0 | Every required case executed successfully against the installed copy. |
| `failed` | 1 | A required case executed and failed. |
| `cannot verify` | 2 | The run is not evidence either way: a file does not match the manifest, a required case did not run, was skipped or was todo, an undeclared case ran, or the tests could not be run. |

These meanings are those of KAAL's Testing capability (testing/C9). kaal-core applies them and does not redefine them. None of these results is a validation. Read the result from standard output, not from npm's warnings on standard error. [Testing](testing.md) says what the delivered tests check, and [Limitations](limitations.md) says what a `verified` result does not show.

## Upgrade

Install the newer kaal-core with npm, then run `npx kaal upgrade`. It writes absent files, replaces files it recorded that you did not change, keeps and reports every other file, and removes recorded files the new version no longer delivers if they are unmodified. Upgrading an Engine that is already current writes nothing.

## Remove

1. Run `npx kaal remove` from the repository root. It removes every unmodified file Core's record holds, including the agent deployments Core made, then the record, then the directories that empties. It keeps and reports everything else: files you changed, registered contributions, typed artifacts, and other Capabilities' records and files.
2. Run `npm uninstall kaal-core`.

Files `kaal remove` keeps are yours to keep or delete. An Engine created with `--engine` has no record, so `kaal remove` refuses it. It is plain files, and you may delete the directory yourself.
