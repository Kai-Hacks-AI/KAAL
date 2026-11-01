# @kaihacksai/kaal-change — isolation slice

Change-owned semantic isolation through the public
`@kaihacksai/kaal-change/isolation` export. This prerelease delivers isolation,
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
