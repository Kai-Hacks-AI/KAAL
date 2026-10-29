# kaal-core

KAAL Core: the smallest working KAAL. It carries the Kernel, the six foundational Nodes and the `CASE` Definition, reads and identifies Nodes by their exact content, resolves types and references by name and identity, registers Capabilities, Agents, Skills and Extensions by one mechanism, and bootstraps a KAAL Engine into any directory, `./.kaal/` by default.

Core depends on no Git host and no agent provider. It has two runtime dependencies, and neither depends on Core. `kaal-graph` owns the general Node mechanics Core uses: a Node's Form and identity, and finding Nodes by id, name and type. `kaal-hosting` owns every host mechanic Core needs (reading files, staging, portable and faithful publication). Core keeps what is its own: the Kernel and the foundation, admission, registration and the catalog. It needs Node.js 24 or later.

## Release status

kaal-core is not released. Its version is 0.0.1, and that version is not published on npm or anywhere else. Its interfaces and the bytes of its foundational Nodes can still change without an upgrade path. Core's releases are separate from those of other KAAL packages: `@kaihacksai/kaal-guard` is published on its own and does not depend on kaal-core, so a Guard release says nothing about Core's.

## Install and bootstrap

Until a release, kaal-core is installed from a checkout of this repository:

```sh
npm ci && npm run build -w kaal-core              # in the KAAL checkout
npm install <path-to-KAAL>/packages/kaal-core     # in your repository
npx kaal init      # materializes ./.kaal/ from the package payload (or: --engine <dir>)
npx kaal verify    # checks the Kernel and the six foundational Nodes by identity
npx kaal version   # the kaal-core that runs, and the version that installed ./.kaal
npx kaal upgrade   # bring ./.kaal to this kaal-core
npx kaal remove    # remove Core's installation, keeping what is not Core's
```

Installing the package writes nothing into your repository. `kaal init` does, and only when you run it.

## The foundation

| Document             | What it is                                                            |
| -------------------- | --------------------------------------------------------------------- |
| `KAAL-KERNEL.md`     | The bootstrap. Not a Node: it brings the first Nodes into being.      |
| `Node.md`            | Node 1, the genesis exception. It declares no type.                   |
| `KAAL-Definition.md` | A Node typed by `Node`.                                                |
| `KAAL-Capability.md` | A Node typed by `KAAL Definition`. Nodes it types are Capabilities.   |
| `KAAL-Agent.md`      | A Node typed by `KAAL Definition`. Nodes it types are Agents.         |
| `KAAL-Skill.md`      | A Node typed by `KAAL Definition`. Nodes it types are Skills.         |
| `KAAL-Extension.md`  | A Node typed by `KAAL Definition`. Nodes it types are Extensions.     |
| `CASE.md`            | A Node typed by `KAAL Definition`, naming the four parallel kinds.    |
| `LOVE.md`            | A Node typed by `KAAL Definition`: when a package may step up.        |

CASE stands for Capabilities, Agents, Skills and Extensions: four parallel kinds, none a kind of another. A Capability is a responsibility that overlaps with no other, delivered in any number of packages or none. `CASE` is a Definition like any other; it types nothing, and Core gives it no machinery.

LOVE is the test a package meets before it steps up from an internal capability to a reusable or published package:

- **Lifecycle**: it can be installed, upgraded, removed and versioned.
- **Ownership**: it overlaps with no other owner.
- **Verification**: independent evidence shows that it holds, as Testing defines that evidence.
- **Encapsulation**: consumers rely on its declared interface, never on its internals.

Meeting LOVE is a judgment of maturity, not a mandate to publish. A decision to package something never authorizes its release. `LOVE` is a Definition beside `CASE`. Like `CASE`, it types nothing, and adding it changed neither the Kernel's bytes nor any existing id.

These Nodes change the Kernel's bytes, so an Engine bootstrapped from an earlier kaal-core no longer verifies: its Kernel is not the one Core recognizes and it lacks `KAAL Capability` and `KAAL Agent`. kaal-core 0.0.1 is unreleased, so `kaal upgrade` does not adopt such an Engine: it keeps and reports the files it does not recognize, and refuses because the result would not verify. Bootstrap a fresh Engine. The ids of `Node`, `KAAL Definition`, `KAAL Skill` and `KAAL Extension`, and of every Node typed by them, are unchanged.

A Node is a UTF-8 Markdown file that begins with frontmatter in the Kernel's Form, for example:

```markdown
---
name: Greeting
type:
  name: KAAL Skill
  id: <the SHA-256 of the KAAL Skill Node's exact bytes>
---
```

The Form is Graph's, and Core reads every Node through it. The frontmatter is one YAML 1.2 mapping read with the core schema, with LF line endings. Keys are strings and never repeat, and there is no anchor, alias, merge key (`<<`) or tag outside the core schema (`!!str`, `!!int`, `!!float`, `!!bool`, `!!null`, `!!seq`, `!!map`). Core interprets `name` and `type` (exactly `name` and `id`), and reads them as written: `id: 1234e5678…` stays that string and never becomes a number. Any other key belongs to the capability that defines it. Core accepts it and returns it uninterpreted, with its YAML 1.2 type (`priority: 3` is the number 3, `enabled: true` the boolean), in the Node's `frontmatter`, the complete parsed mapping, as Graph's `identify(bytes)` reads it.

A Node's id is the SHA-256 of its exact bytes. Filenames and locations are not part of identity: the Engine finds Nodes by scanning, so a Node is the same Node wherever it is stored. A Node is admitted when its type resolves, by id with the name checked, to an admitted Node. Only Core's own `Node` may declare no type: Graph reads an ordinary Node with `identify` and a root with `identifyRoot`, and Core admits exactly one root, its genesis.

## Engine layout

```
<engine>/                   ./.kaal/ unless --engine names another directory
  AGENTS.md                   entry point for an Agent working with this Engine
  KAAL-KERNEL.md
  core/Node.md, KAAL-Definition.md, KAAL-Capability.md, KAAL-Agent.md,
       KAAL-Skill.md, KAAL-Extension.md, CASE.md
  capabilities/<name>/        registered Capability contributions
  agents/<name>/              registered Agent contributions
  skills/<name>/              registered Skill contributions
  extensions/<name>/          registered Extension contributions
  state/core/installation.json  Core's record, at ./.kaal only (see Lifecycle)
```

This layout is how Core delivers files, not part of any identity. The Engine is found by content: you may move or rename any file, keeping its bytes, and every Node keeps its id, its type resolution and its discovery.

`kaal init` materializes the payload into a missing or empty Engine directory. A missing directory is staged and renamed into place in one step. An existing empty directory, such as the current one, is kept and filled in place, never removed. If the directory already holds a valid Engine, recognized by identity whatever its layout, init writes nothing. If it holds anything else, init refuses and writes nothing.

## CLI

```
kaal init                                              bootstrap the Engine (see below)
kaal verify                                            verify the Engine
kaal list                                              list the Capabilities, Agents, Skills and Extensions
kaal resolve <name> [<id>]                             resolve a Node by name, or by name and id
kaal identify <file>...                                print the id, name and type of Node files
kaal register <capability|agent|skill|extension> <name> <dir>
                                                       register a contribution, atomically
kaal export <out-dir>                                  write the foundational payload into an empty directory
kaal version                                           print the kaal-core that runs and the Engine's recorded version
kaal upgrade                                           bring ./.kaal to this kaal-core's Installation Contract
kaal remove                                            remove Core's installation from ./.kaal
```

Every command takes `--engine <dir>`: the Engine directory itself, absolute or relative, under any name (`kaal init --engine ./myKAAL`). Without it, the Engine is `./.kaal`. `.kaal` is a default convention, not part of any identity.

## Registration

A contribution is a directory of Nodes of one kind (capability, agent, skill or extension), registered under one name (lowercase letters, digits and single hyphens). It is accepted only as a whole. Every file must be a Node in Form at a relative `.md` path, every Node's type must resolve against the Engine and the contribution together, at least one Node must be typed by Core's Node of that kind (`KAAL Capability`, `KAAL Agent`, `KAAL Skill` or `KAAL Extension`), and none by the other three. All checks run before anything is written. Hosting then publishes the contribution all or nothing, refusing paths that would not be held faithfully on Linux, Windows and macOS (names that differ only by case or Unicode normalization, names Windows cannot hold), so a refused contribution leaves the Engine byte-for-byte unchanged. Registering the identical contribution again is a no-op; a name already registered for the kind with other content is refused. `registerSkill` and `registerExtension` remain as shorthands for `register` with that kind. Core does not relate a Capability to its Agents, Skills or Extensions; that relationship is an Edge, which belongs to Graph and the capabilities.

## API

Functions that read or write an Engine go through Hosting and return promises; `evaluate`, `payload` and `foundation` are pure and synchronous. An Engine is what admission found, `{ nodes, rejected }`: looking its Nodes up, and reading a Node's identity, are Graph's (`kaal-graph`).

```js
import { bootstrap, verify, loadEngine, register, registerSkill, registerExtension, catalog, payload, foundation, exportPayload } from "kaal-core";
import { Graph } from "kaal-graph";

await bootstrap(".kaal");
(await verify(".kaal")).ok;                          // true
const engine = await loadEngine(".kaal");            // { nodes, rejected }
new Graph(engine.nodes).resolve(foundation().skill); // the KAAL Skill Node
await registerSkill(".kaal", "greeting", { "Greeting.md": bytes });
await register(".kaal", "capability", "greeting", { "Greeting-People.md": bytes });
await catalog(".kaal");                              // { capabilities: [{ name, id }], agents, skills, extensions }
```

`readContribution(dir)` reads a contribution from a directory, every file keyed by its `/`-separated relative path, ready for `register`. When Core refuses something, such as an Engine that is not valid or a directory that is not empty, it throws a `KaalError` whose message names what was refused, and it writes nothing.

### Typed artifacts

A file whose frontmatter names its Type as a string `<Capability>/<Type>` (for example `type: Guard/Check`) is a typed artifact, not a Node. Where the file is never decides: a Node may be anywhere in an Engine, `.kaal/config/<capability>/` included, and so may a typed artifact. Any other string `type`, such as `KAAL Skill` or `guard/check`, leaves the file a claimed Node, rejected as not in Form. `evaluate(files, { types })` returns `{ nodes, rejected, artifacts }`, and each artifact is `{ path, type, state, findings }`:

- `registered`: the Engine admits exactly one Type Definition of that name. That is a Node typed by `KAAL Definition` whose `capability: { name, id }` resolves to an admitted `KAAL Capability` named as the Type's prefix. This is first-stage ownership, not an exclusive namespace claim. Namespace registration and collision detection belong to future Capability registration.
- `unregistered`: the Engine admits no Node of that name. This is not invalid, and the finding gives the next step.
- `unknown`: identity or ownership cannot be established. Either several Nodes share the name, or the Node is not a Type Definition, or its Capability is another one.
- `invalid`: a supplied schema (`types`, in `kaal-core/frontmatter`'s shape) fails, whatever the registration state.

The state depends only on the admitted Nodes, the artifact's frontmatter and the supplied Types, so registering a Type Definition later turns the same unchanged bytes from unregistered to registered. `verify(dir, { types })` and `kaal verify` fail on an unknown artifact, and on an invalid one when Types are supplied. They pass on an unregistered one. `kaal verify` lists every typed artifact with its state, and Core never changes one.

`capabilities(dir)` is deprecated: it still returns `{ skills, extensions }`, and `catalog` replaces it.

### Frontmatter

`kaal-core/frontmatter` validates the YAML frontmatter of KAAL's collaborative Markdown artifacts, deterministically and from the frontmatter alone: the body never changes the result. Each Capability owns its Types and their schemas and supplies them as a mapping from Type name, `<Capability>/<Type>`, to schema. A schema lists every key the Type allows, each with one value kind (`id`, `name`, `enum`, `ref`, `path`, `boolean`, `number` or `parameter`), optionally as a list or required. Structured values nest declarations: a `record` is a closed mapping of declared `fields`, a `map` has keys matching a `parameter` declaration (`key`) and values matching `of`, and an `either` conforms when any of its two or more alternatives (`of`) does; `required` applies to a top-level key or a record field. A finding inside a structured value carries `at`, a JSON Pointer (RFC 6901) to where it is, and flat findings carry none; there is no free-text kind, prose keys such as `description` are refused, and `type`, which names the artifact's Type, is never declared. Reading the YAML is Graph's (`kaal-graph/form`). The module is pure, and imports no host module.

```js
import { checkSchema, validate } from "kaal-core/frontmatter";

const types = { "Sample/Record": { keys: { change: { value: "id", required: true } } } };
checkSchema("Sample/Record", types["Sample/Record"]); // []
validate(bytes, types); // { verdict: "valid" | "invalid" | "unknown", findings: [{ key, rule }] }
```

An artifact that names no Type the mapping holds is `unknown`, never `valid`. `validate` throws a `TypeError` if a supplied Type or schema is itself invalid.

`isTypeName(value)` tells whether a value is a Type name in the form `<Capability>/<Type>`, each part starting with a capital letter and holding only letters and digits. That is the form a typed artifact's `type` takes.

### Installation Contract

`kaal-core/installation` checks an installation contract: the one installer-neutral JSON document in which a Capability states what an installation of it is, in the format of Core's `Installation Contract` Definition. A contract names that format, its Capability, version, assets, catalogue of published SHA-256s, record, runtime and the Skills it provides; the lifecycle rules are the format's. A Capability conforms by data alone and does not import this module to do so.

```js
import { checkContract, installationFormat } from "kaal-core/installation";

checkContract({ format: installationFormat(), capability: "sample", version: "0.0.2", assets, catalogue, record, runtime: { node: 24 }, provides: [{ skill: "sample" }] });
// [] when it conforms, otherwise [{ key: "assets.0.target", rule: "path" }, ...]
```

An asset marked with a `surface`, such as `hook`, is installed only when a consumer opts in, by the Capability's own command; Core never realizes it. The record a contract names maps each file the Capability owns to its `sha256` and `version`, and any other member is the Capability's. `checkRecord(record)` returns its findings, and `register({ contract, record, written })` returns the record once the files Core wrote are registered: only asset files Core wrote, with the contract's version, keeping every other entry and member.

### Installation Contract Conformance

`kaal-core/conformance` offers Core's own Test Cases for the Installation Contract, core/T10 to core/T13, as reusable cases over any contract instance. `installationConformance(instance)` checks that the instance conforms, then that `checkContract` refuses each of the cases' mutations of it: unknown and missing members, wrong types, unsafe targets, catalogue entries that name no asset, and Skills provided at another location. It returns one result per case, and a test runner wraps each in a test of its own. A mutation that cannot be applied to the instance is a failure, never a pass. The module registers no test, imports no test harness, and nothing in Core's runtime loads it.

```js
import { installationConformance } from "kaal-core/conformance";

installationConformance(contract);
// [{ id: "core/T10", holds: true, failures: [] }, { id: "core/T11", ... }, { id: "core/T12", ... }, { id: "core/T13", ... }]
```

### Agent Realization

`kaal-core/agent` plans how Core makes each Skill reachable by the agents of the providers a repository declares in `.kaal/config/core/agents.json` (`declaration`). Every Skill is deployed to `.agents/skills/<name>/`; a provider that discovers Skills only at a location of its own (Claude Code, `.claude/skills/<name>/`) gets a copy of the same canonical source. Every Skill file is deployed with the bytes the Capability ships, everywhere: Core states no Skill format and reads no `SKILL.md`, which is Engineer Skill's. Core claims only what its own record holds: a file someone changed, and anything at a target Core did not deploy, is kept and reported, and only unmodified files Core deployed are pruned. Core never writes an instruction file such as `AGENTS.md` or `CLAUDE.md`, and governs no location but its own deployments.

```js
import { realize } from "kaal-core/agent";

realize({ skills: [{ name, files }], providers: ["claude-code"], record, present });
// { write: [{ path, bytes }], keep: [{ path, reason }], prune: [path], pointers, unknown: [provider], record }
```

A Skill a Capability's contract delivers is that Capability's at its canonical location: pass it in `contracted`, with whether the Capability's record registers it already, and Core's own record keeps only the provider deployments, beside the Engine files of Core's own installation (see Lifecycle).

`kaal-core/realization` applies a plan through Hosting. `realizeIn(root, { skills, contracts })` reads the declaration, the present files and every record, registers what Core writes in each contract's record, keeps Core's own record at `.kaal/state/core/installation.json`, and applies it all in one guarded reconciliation: if anything changed since it was read, nothing changes. Where a deployment changes between a file and a directory, Core's unmodified files in the way are removed and the new ones written in that same reconciliation, which Hosting applies in one step. Core coordinates and takes over nothing: once a Capability's record registers any file of its Skill, Core leaves that canonical location to the Capability's own lifecycle, and it uses the sources it is given without judging their provenance against the catalogue.

```js
import { realizeIn } from "kaal-core/realization";

await realizeIn(process.cwd(), { skills: [{ name, files }], contracts: [contract] });
// { plan, outcomes: [{ path, outcome }], pruned, records }
```

Both modules are pure and import no host module; applying a plan is Hosting's.

## Lifecycle

Core is installed by an Installation Contract of its own, `installation.kaal.json`, in the format it owns. It names the Capability `core` at kaal-core's version, one file asset for each payload file, from `payload/<path>` to `.kaal/<path>`, and a catalogue of every content each target has had in a published version. Core follows the format's rules for its own files: install only where absent, keep a modified file and report it, remove only an unmodified file.

- **Record and version.** `kaal init` registers each file it writes in Core's record, `.kaal/state/core/installation.json`, with Core's version. That is the same record Agent Realization keeps its provider deployments in: one Core record, and each keeps the other's entries. `kaal version` prints the kaal-core that runs and the version the record holds for the Engine's files. It says when the Engine is unrecorded, and when the files carry several versions.
- **Upgrade.** `kaal upgrade` brings `./.kaal` to the contract of the kaal-core that runs:
  - it writes a target that is absent;
  - it replaces a file the record holds that still has its recorded bytes;
  - it adopts a file the record lacks when the catalogue lists its bytes, which is how an Engine without a record gets one;
  - it keeps and reports every other file;
  - it removes an unmodified recorded file the contract no longer delivers.

  The upgraded Engine must verify, or nothing changes. Upgrading an Engine already at the contract writes nothing.
- **Remove.** `kaal remove` removes every unmodified file Core's record holds, the provider deployments included, then the record, and the directories that empties. It keeps and reports the rest: modified files, registered contributions, typed artifacts, and other Capabilities' records and assets.
- **Where.** Core's contract and record are written relative to the repository root, so the lifecycle acts on `./.kaal` alone. With `--engine`, `upgrade` and `remove` are refused, `version` reports the Engine as unrecorded, and `init` bootstraps without a record.

Each step is decided by Core and applied by Hosting in one guarded reconciliation: if anything changed since it was read, nothing changes. An upgrade also relies on the Engine files it leaves untouched, so each is a read-only expectation Hosting checks without rewriting it, and its executable mark stays as it is. The lifecycle is reached through the `kaal` command; no entry point exports it.

## Core as a Capability

Core is a Capability of its own. `capability/Core.md` is its Node, typed by `KAAL Capability`. Core is responsible for the management capabilities that make a repository KAAL-managed:

- the recursive structure of Capabilities, and their composition;
- installation contracts;
- realization and lifecycle.

It owns none of the domain semantics of Intent, Requirements, Architecture, Code, Testing or Operating. `ownership.kaal.json` claims `packages/kaal-core/` for that Node, in the claim format Testing reads. Both files are repository data, not delivered.

Core depends on no discipline. Its only KAAL dependencies are `kaal-graph` and `kaal-hosting`. Its interface is what `exports` lists and the `kaal` command, each named in this README, and nothing else resolves.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
