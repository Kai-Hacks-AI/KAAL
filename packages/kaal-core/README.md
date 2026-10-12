# kaal-core

KAAL Core: the smallest working KAAL. It carries the five foundational documents, reads and identifies Nodes by their exact content, resolves types and references by name and identity, registers Skills and Extensions, and bootstraps a KAAL Engine into any host as `.kaal/`.

Core depends on no Git host and no agent provider. It has no runtime dependencies and needs Node.js 20 or later.

## Install and bootstrap

```sh
npm install kaal-core
npx kaal init      # materializes .kaal/ from the package payload
npx kaal verify    # checks the Kernel and the four foundational Nodes by identity
```

Installing the package writes nothing into your repository. `kaal init` does, and only when you run it.

## The foundation

| Document             | What it is                                                            |
| -------------------- | --------------------------------------------------------------------- |
| `KAAL-KERNEL.md`     | The bootstrap. Not a Node: it brings the first Nodes into being.      |
| `Node.md`            | Node 1, the genesis exception. It declares no type.                   |
| `KAAL-Definition.md` | A Node typed by `Node`.                                                |
| `KAAL-Skill.md`      | A Node typed by `KAAL Definition`. Nodes it types are Skills.         |
| `KAAL-Extension.md`  | A Node typed by `KAAL Definition`. Nodes it types are Extensions.     |

A Node is a UTF-8 Markdown file that begins with frontmatter in exactly this Form:

```markdown
---
name: Greeting
type:
  name: KAAL Skill
  id: <the SHA-256 of the KAAL Skill Node's exact bytes>
---
```

A Node's id is the SHA-256 of its exact bytes. Filenames and locations are not part of identity: the Engine finds Nodes by scanning, so a Node is the same Node wherever it is stored. A Node is admitted when its type resolves, by id with the name checked, to an admitted Node. Only Core's own `Node` may declare no type.

## Engine layout

```
.kaal/
  KAAL-KERNEL.md
  core/Node.md, KAAL-Definition.md, KAAL-Skill.md, KAAL-Extension.md
  skills/<capability>/        registered Skill contributions
  extensions/<capability>/    registered Extension contributions
```

## CLI

```
kaal init                                              bootstrap <host>/.kaal (idempotent)
kaal verify                                            verify the Engine
kaal list                                              list the Skills and Extensions the Engine holds
kaal resolve <name> [<id>]                             resolve a Node by name, or by name and id
kaal identify <file>...                                print the id, name and type of Node files
kaal register <skill|extension> <capability> <dir>     register a contribution, atomically
kaal export <out-dir>                                  write the foundational payload into an empty directory
```

Every command takes `--host <dir>`; the default is the current directory.

## Registration

A contribution is a directory of Nodes registered under one capability name (lowercase letters, digits and single hyphens). It is accepted only as a whole. Every file must be a Node in Form at a relative `.md` path, every Node's type must resolve against the Engine and the contribution together, at least one Node must be typed by Core's `KAAL Skill` (or `KAAL Extension`), and a Skill contribution carries no Extension, nor the reverse. All checks run before anything is written, and the contribution is staged and renamed into place in one step, so a refused contribution leaves the Engine byte-for-byte unchanged. Registering the identical contribution again is a no-op; a capability already registered with other content is refused.

## API

```js
import { bootstrap, verify, loadEngine, registerSkill, registerExtension, capabilities, identify, payload, foundation, exportPayload } from "kaal-core";

bootstrap(".kaal");
verify(".kaal").ok;                                  // true
const engine = loadEngine(".kaal");
engine.resolve(foundation().skill);                  // the KAAL Skill Node
registerSkill(".kaal", "greeting", { "Greeting.md": bytes });
capabilities(".kaal");                               // { skills: [{ name, id }], extensions: [...] }
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
