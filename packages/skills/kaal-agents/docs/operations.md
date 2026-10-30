# Agents: Operations (how)

How to install `kaal-agents`, run it and verify it. What each command promises is in [Requirements](requirements.md).

## Prerequisites

- Node 24 or later.
- Git on `PATH`. `orient` reads Git, and the delivered cases create repositories of their own.
- Core's package, installed in the project you orient, only when you want its Engine's catalog. Without it, `orient` still runs, and reports the catalog as unresolved.

## Install

```sh
npm install --save-dev kaal-agents
```

The package needs nothing else at run time, and it writes nothing into your repository.

## Run

```sh
npx --no kaal-agents orient [<dir>] [--json]
npx --no kaal-agents preach check <report.json>
```

| Command | Exit 0 | Exit 1 | Exit 2 |
| --- | --- | --- | --- |
| `orient` | every discovery part was established | a usage error, such as `<dir>` not being a directory | it reported, but a discovery part is unresolved |
| `preach check` | the report is structurally valid | the report is structurally invalid, with each problem named | the file cannot be read as JSON |

`orient` opens its text output with `authority: unresolved (orient discovers; it does not authorize)`. That line is always there, whatever the exit status. `preach check` says "structurally valid", never "resolved", and prints a claimed resolution with "(authority not verified)".

An Agent loads the Skill from `node_modules/kaal-agents/skills/kaal-agents/SKILL.md`. It says when to run each command and how to read the result.

## Register the Nodes

The Capability Node and the two Definitions join an Engine through Core alone:

```sh
npx kaal register capability agents node_modules/kaal-agents/capability
```

## Verify the installation

Run the consumer verifier directly, from the project you installed the package in:

```sh
node node_modules/kaal-agents/test/verify.mjs
```

This runs `test/verify.mjs` against the installed copy (agents/F7). It checks the shipped files against `test/verify.json`, runs every declared case in a scratch directory it removes, checks the coverage the manifest declares and that your project is unchanged, and ends in exactly one result:

- **verified (0):** every shipped file matches the manifest, every declared case ran and passed, every defined identifier has its coverage, and your project is unchanged. The run still names the identifiers it did not verify itself, because the publisher verifies them or no Test Case does ([Testing](testing.md)).
- **failed (1):** a declared case failed, or your project changed during the run. Each cause is named.
- **cannot verify (2):** a prerequisite is missing; the manifest is absent, cannot be read or declares no cases; an installed file differs from the manifest, is missing or is not in it; a declared case was skipped, marked todo or did not run; a case ran that the manifest does not declare; or a defined identifier has no declared coverage. Each cause is named. When the installed files differ, reinstall the package, then run the command again.

Its last line is the summary, `kaal-agents-verification ` followed by JSON, for a program to read: the result, its cause, evidence and next step, the package's name, version and location, the platform and Node version, the digest of the installed files, every declared case with its outcome, and the coverage ([Requirements](requirements.md), agents/F7).

The verification needs no network and no KAAL source checkout.

**Not yet: `npm explore kaal-agents -- npm test`.** In this version, the package's `npm test` script is still the publisher's: it runs tests that need the KAAL checkout and do not ship. So `npm explore kaal-agents -- npm test` fails in an installation. Use the direct command above. Before `kaal-agents` 0.0.1 is released, `npm test` becomes the consumer's entry and runs exactly this verifier (see [Limitations](limitations.md)).
