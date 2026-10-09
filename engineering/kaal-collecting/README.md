# kaal-collecting (engineering)

The machinery that proves the delivery of `packages/kaal-collecting`, the capability for collecting KAAL-addressed communication from KAAL clients. It is not shipped, and it is not part of `kaal-core`.

`npm test` here is acceptance, run on what the package actually ships:

- **Delivery.** Deploy `kaal-core`'s payload, register the capability's Node through Core's `registerSkill()`, and show that Core carried no such Skill before, that exactly one Node and its seal are added, that the Skill is found by its type alone and that its bytes and identity are the ones sealed. The Node keeps known, reachable and all clients apart, and names no host, transport, client or mechanism.
- **Realization.** The Agent Skill is one skill, named as its directory, points to the Nodes rather than defining the capability again, and ships exactly one script, which makes no network access and names no host or client.
- **The record.** `collect.mjs` is challenged through the command an agent runs: reached, unreached and empty exposures are recorded as three different things; carriers are copied verbatim with the SHA-256 of their bytes and the path they were carried at; nothing outside the given directory is read; symlinks, non-files, unsafe names, an existing client record, an unknown collection and bad names are refused without writing anything; numbering follows Changes; and `check` catches an altered, missing or unrecorded carrier.
- **Conventions.** The capability passes the checks Engineering KAAL Skill carries, and its contribution passes `register-skill --check`.
