# kaal-core: Architecture

This document says how kaal-core is built. Each element names, in brackets, the Requirements it answers (see [Requirements](requirements.md)).

## Dependencies

```
build time:  kaal-graph (devDependency) --copies Node Form and identity--> dist/node/
run time:    kaal-core --> @kaihacksai/kaal-foundation, kaal-hosting, yaml
optional:    kaal-graph, installed beside kaal-core, for navigation and analysis
```

- **Foundation** (`@kaihacksai/kaal-foundation`) provides SHA-256. Every digest kaal-core computes or checks, Node ids included, is Foundation's.
- **Hosting** (`kaal-hosting`) is KAAL's only operating-system boundary (core/F88, core/A44). Every file read, staging step, guarded write, removal and process start goes through it. kaal-core makes no platform decision of its own.
- **yaml** is needed by the delivered Node support, which reads YAML 1.2 frontmatter.
- **Graph** (`kaal-graph`) is a build-time source only (core/F76–core/F80, core/A37). The build copies Graph's Node Form and identity into the package. No source file imports Graph, and a consumer never needs it installed.

Dependencies run one way: disciplines, then Core, then Graph and Hosting, with Foundation at the bottom. Core imports no discipline (core/N11, core/A17).

## Entry points

The package's `exports` lists these entry points, and nothing else resolves (core/F41, core/A19).

| Entry point | Module | Exports |
| --- | --- | --- |
| `kaal-core` | `index.ts` | `bootstrap`, `verify`, `loadEngine`, `evaluate`, `register`, `registerSkill`, `registerExtension`, `readContribution`, `catalog`, `capabilities` (deprecated), `payload`, `foundation`, `exportPayload`, `KaalError` |
| `kaal-core/frontmatter` | `frontmatter.ts` | `checkSchema`, `validate`, `isTypeName` |
| `kaal-core/installation` | `installation.ts` | `installationFormat`, `checkContract`, `checkRecord`, `register` |
| `kaal-core/agent` | `agent.ts` | `declaration`, `realize` |
| `kaal-core/realization` | `realization.ts` | `realizeIn`, `record` |
| `kaal-core/conformance` | `conformance.ts` | `installationConformance` |
| `kaal-core/registration` | `registration.ts` | `assemble`, `REGISTRATION_TYPE`, `REGISTRATION_SCHEMA` |

The `kaal` command is `cli.ts`. It is the only way to reach the lifecycle: no entry point exports `upgrade` or `remove`.

## Modules

- **`node.ts`**: reads a Node through the delivered Node support (`#node/form`, `#node/node`), and defines `KaalError`. A Node's id is the SHA-256 of its exact bytes.
- **`payload.ts`**: the foundational payload shipped in `payload/`, and `foundation()`, the ids of the foundational Nodes.
- **`engine.ts`**: admission (core/A10, core/A11). `evaluate(files, { types })` returns `{ nodes, rejected, artifacts }`. A Node is admitted when its type resolves, by id with the name checked, to an admitted Node. A file whose `type` is a `<Capability>/<Type>` string is a typed artifact, given one of four states. `loadEngine` reads an Engine through Hosting.
- **`admitted.ts`**: Core's own index of admitted Nodes by name and id. It is a lookup, not navigation (core/F77).
- **`bootstrap.ts`**: `bootstrap`, `verify` and `exportPayload`. `verify` reports Nodes, typed artifacts and assembled registrations (core/A12, core/A28).
- **`register.ts`**: registers a contribution of one kind (capability, agent, skill or extension) as a whole. All checks run before anything is written, and Hosting publishes the contribution all or nothing.
- **`frontmatter.ts`**: the schema format and validator (core/A1–core/A4, core/A29). It is pure, and reading YAML is the delivered Node support's.
- **`installation.ts`**: the Installation Contract format, the record format and `register` into a record (core/A5, core/A14). Pure.
- **`conformance.ts`**: core/T10–core/T13 as reusable cases over any contract instance (core/A31). It imports only `installation.ts`, no test harness, and no runtime entry point imports it.
- **`agent.ts`**: Agent Realization planning and the placement table (core/A6, core/A15, core/A24). Pure. Skill files are deployed byte for byte.
- **`realization.ts`**: applies a realization plan through Hosting in one guarded reconciliation (core/A7).
- **`records.ts`**: reads installation records through Hosting. Internal.
- **`lifecycle.ts`**: `init`, `version`, `upgrade` and `remove` of `./.kaal`, planned by Core and applied by Hosting (core/A20–core/A23).
- **`registration.ts`**: `assemble(registrations)`, pure (core/A25, core/A26, core/A39). It returns scopes, kinds, instances, findings, untraced instances, shared terms, and `outgoing(scope, id)`. `cycles` is `null`, and `incoming` and `reach` return `null`: unavailable without Graph, never empty.

## The payload

`payload/` holds `KAAL-KERNEL.md`, `AGENTS.md` and, under `core/`, the foundational Nodes `Node`, `KAAL Definition`, `KAAL Capability`, `KAAL Agent`, `KAAL Skill` and `KAAL Extension`, and the Definitions `CASE`, `LOVE`, `Installation Contract` and `Agent Realization`. `kaal init` materializes it into an Engine.

The Engine is found by content. Filenames and locations are not part of identity, so a Node keeps its id and type resolution wherever it is stored.

`installation.kaal.json` is Core's own Installation Contract (core/F42, core/A20). It maps each payload file to its target under `.kaal/`, catalogues the SHA-256 of each published content, and names Core's record, `.kaal/state/core/installation.json`. Core follows the format's rules for its own files: install only where absent, keep a modified file and report it, remove only an unmodified file.

## Delivered Node support

A Node's Form and identity are Graph's contract. The build copies Graph's `form.mjs`, `node.mjs` and their declarations byte for byte into `dist/node/`, and writes `dist/node/provenance.json` with Graph's version and each file's SHA-256 (core/F79, core/A38). The copies are never edited. Core reaches them only through its own subpath imports, which are not in `exports`, so a consumer cannot import them.

## Registration

A registration is a typed artifact of Core's Type `Core/Registration` (core/A25). Its frontmatter holds `holder`, `scope`, `kinds` (each with its `traces` rule and an optional `definition`) and `instances` (each with `id`, `kind` and `traces`). There is no field for incoming traces. `verify` validates each registration against `REGISTRATION_SCHEMA` and reports `assemble`'s result (core/A28). It fails only on a collision or on a finding of core/F50–core/F52 or core/F54, never on a cycle, an untraced instance, a shared term or Graph's absence (core/A39).

## Delivered tests and verification

- **Layout** (core/A33). The package ships `test/embed/`, kaal-core's own cases (one file for each loop: Intent, Requirements, Architecture and Code), which its own `npm test` runs against the installed copy, `test/verify.mjs`, `test/run.mjs` and the manifest `test/verify.json`. The delivered tests are plain `node:test` files that import kaal-core by its package name.
- **The runner** (core/A34). `npm test` is `node test/run.mjs`. In an installation, which it recognizes when the package directory sits directly in a `node_modules` directory, it runs `test:consumer` alone. In the source workspace it runs every declared `test:<name>` suite. An ambiguous or damaged layout, or a missing suite, is `cannot verify` before any suite runs.
- **The verifier** (core/A43). `test:consumer` is `node test/verify.mjs`. It checks every file against the manifest, then runs each delivered test file in a scratch directory, compares the cases that ran with the declared cases, and prints one execution record and one result line. Details are in [Testing](testing.md).
- **The OS boundary** (core/A44). The runner and verifier reach the host only through kaal-hosting and hash only through Foundation. The one exception is the verifier's scratch directory, made with Node's portable temporary-directory call and removed afterwards, because Hosting offers no scratch directory today.

## Release acceptance

The publisher packs kaal-core and its runtime dependencies, installs the tarballs into a clean temporary directory, and runs the installed `npm test` there (core/A35). Each KAAL package it depends on is renamed and made publishable by its own owner (core/A36).

## Core Skill

- **core/A45** [core/F89]: `skills/kaal-core/` delivers the Agent Skill and its Skill Node. The package README points to them. Core decides Node admission; Engineer Skill independently checks the Agent Skill's format and relative references. The Skill adds no script, runtime export, dependency, automatic Engine registration or activation. Engine-entry navigation and the fuller initialization are not yet delivered.
