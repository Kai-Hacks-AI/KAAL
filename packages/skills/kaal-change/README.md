# @kaihacksai/kaal-change 0.0.1

Change-owned semantic isolation through the public
`@kaihacksai/kaal-change/isolation` export. This version delivers a rudimentary Change Practice Agent Skill and isolation,
not the broader Change lifecycle or delivery API.

```js
import { isolate } from '@kaihacksai/kaal-change/isolation';
const result = isolate(proposal, { change: proposal.ref, owners, sources, graph });
```

The Graph view and owner inventories are supplied by the caller. An assessment
explains selected scope, potential impact, incoming/outgoing boundary contracts
and multi-loop testing obligations. It executes no subject or tests. Even an
`isolated` assessment covers only the supplied model: `authority.status` remains
`unestablished` and `execution.status` remains `not-assessed`.

The only runtime dependency is Foundation. Graph and Hosting are optional peers:
a caller supplies Graph's public view; the shipped verification command needs
both peers. Missing verification providers produce `cannot verify`, never a pass.

Verify an installed copy with its providers installed:

```sh
npm explore @kaihacksai/kaal-change -- npm test
```

It runs the delivered controlled examples through public exports, reports all
required Cases and ends in one `kaal-change-verification` JSON line. It checks
consistency against its inventory, not publisher provenance.

Read [Intent](docs/intent.md), [Requirements](docs/requirements.md),
[Architecture and input contract](docs/architecture.md),
[Testing](docs/testing.md), [Operations](docs/operations.md) and
[Limitations](docs/limitations.md). MIT; see LICENSE.

The agent-facing anchor is [kaal-change](skills/kaal-change/SKILL.md). It guides
proposal, concern tracing, boundary analysis and multi-loop TDD through BASS.
Run its controlled example from the installed skill directory:

```sh
node scripts/example.mjs
```

All relative resources travel with the skill; the example needs the installed
package and its Graph/Hosting providers resolvable from that location. External
use keeps KAAL in the operator environment rather than embedding it in the target.
Core can admit the separate `payload/Change-Practice.md` Skill Node. See Operations
for registration. The host chooses Agent Skill discovery; this package does not
rewrite target instructions, install a target Engine or activate CI.

0.0.1 is the narrow contract documented here. Lifecycle, succession, delivery
satisfaction, classification, CHAOS, FAR and the older broad release programme
remain excluded. This source delivery does not itself publish to npm.
