# kaal-architecture

KAAL Architecture: architectural decisions in KAAL, Enterprise Architecture and Solution Architecture. It is lightweight on purpose: two Nodes, an Agent Skill and an Installation Contract, with no scripts, no sourcing engine and no registry of options. It is not part of Core. Core provides the `KAAL Capability` type, admission and installation, and this capability joins through them.

```
payload/Architecture.md         the Capability Node, typed by Core's KAAL Capability
payload/URBAN.md                URBAN, Use, Rent, Buy, Adapt, New, typed by Core's KAAL Definition
skills/kaal-architecture/       the Agent Skill: SKILL.md
contract.json                   the Installation Contract, in Core's format
```

Architecture owns the decision and its grounds. Requirements states what must hold, Engineering realizes the chosen solution, including whatever Adapt or New it calls for, and Testing judges the evidence.

The package that names URBAN ships its Definition, so no Skill invokes URBAN without a file defining it.

## Install

Register the Nodes in the repository's Engine, `.kaal/`:

```sh
npx kaal register capability kaal-architecture node_modules/kaal-architecture/payload    # Core decides
```

Make the Agent Skill reachable through Core's Agent Realization, which reads `contract.json`:

```js
import { readFileSync } from "node:fs";
import { read } from "kaal-hosting";
import { realizeIn } from "kaal-core/realization";

const pkg = "node_modules/kaal-architecture";
await realizeIn(".", {
  skills: [{ name: "kaal-architecture", files: await read(`${pkg}/skills/kaal-architecture`) }],
  contracts: [JSON.parse(readFileSync(`${pkg}/contract.json`, "utf8"))],
});
```

The Skill lands at `.agents/skills/kaal-architecture/`, and Architecture's installation record at `.kaal/state/architecture/installation.json` registers each file with its SHA-256 and version. The Skill reads `Architecture` and `URBAN` from the same Engine. Agents of the providers declared in `.kaal/config/core/agents.json` get their own copy.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
