# kaal-core

KAAL Core: the smallest working KAAL. It carries the Kernel, the six foundational Nodes and the `CASE` Definition, reads and identifies Nodes by their exact content, resolves types and references by name and identity, registers Capabilities, Agents, Skills and Extensions by one mechanism, and bootstraps a KAAL Engine into any directory, `./.kaal/` by default.

Core depends on no Git host and no agent provider. It has two runtime dependencies, and neither depends on Core. `kaal-graph` owns the general Node mechanics Core uses: a Node's Form and identity, and finding Nodes by id, name and type. `kaal-hosting` owns every host mechanic Core needs (reading files, staging, portable and faithful publication). Core keeps what is its own: the Kernel and the foundation, admission, registration and the catalog. It needs Node.js 24 or later.

## Install and bootstrap

```sh
npm install kaal-core
npx kaal init      # materializes ./.kaal/ from the package payload (or: --engine <dir>)
npx kaal verify    # checks the Kernel and the six foundational Nodes by identity
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

CASE stands for Capabilities, Agents, Skills and Extensions: four parallel kinds, none a kind of another. A Capability is a responsibility that overlaps with no other, delivered in any number of packages or none. `CASE` is a Definition like any other; it types nothing, and Core gives it no machinery.

These Nodes change the Kernel's bytes, so an Engine bootstrapped from an earlier kaal-core no longer verifies: its Kernel is not the one Core recognizes and it lacks `KAAL Capability` and `KAAL Agent`. kaal-core 0.0.1 is unreleased, so there is no migration; bootstrap a fresh Engine. The ids of `Node`, `KAAL Definition`, `KAAL Skill` and `KAAL Extension`, and of every Node typed by them, are unchanged.

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

`capabilities(dir)` is deprecated: it still returns `{ skills, extensions }`, and `catalog` replaces it.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
