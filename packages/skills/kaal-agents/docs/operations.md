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

This runs `test/verify.mjs` against the installed copy (agents/F7). It checks the shipped files against `test/verify.json`, runs every delivered case, and ends in exactly one result:

- **verified (0):** every shipped file matches the manifest, and every declared case ran and passed.
- **failed (1):** a shipped file differs, is missing or is not in the manifest, or a case failed. Each cause is named. Reinstall the package, then run the command again.
- **cannot verify (2):** a prerequisite is missing, the manifest cannot be read, it declares no cases, or a declared case did not run. Each cause is named. Fix the cause, then run the command again.

The verification needs no network and no KAAL source checkout.

**Not yet: `npm explore kaal-agents -- npm test`.** In this version, the package's `npm test` script is still the publisher's: it runs tests that need the KAAL checkout and do not ship. So `npm explore kaal-agents -- npm test` fails in an installation. Use the direct command above. Before `kaal-agents` 0.0.1 is released, `npm test` becomes the consumer's entry and runs exactly this verifier (see [Limitations](limitations.md)).
