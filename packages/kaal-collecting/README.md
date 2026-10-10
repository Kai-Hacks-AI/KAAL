# kaal-collecting

The capability for bringing communication addressed to KAAL into KAAL from the KAAL clients it can reach, as an npm package. One capability, delivered in two parts:

- `kaal/`: its KAAL contribution, the sealed Node `Collecting KAAL` (typed by `Skill`) and its seal. It is registered with an installed KAAL through `kaal-core`'s `registerSkill()`, which places it under `skills/kaal-collecting/` of the KAAL directory.
- `skills/kaal-collecting/`: its Agent Skills realization (`SKILL.md`, `scripts/`), installed under the host's `skills/`.

Collecting is the KAAL side of `KAAL client → available adapter → exposed KAAL carriers → collection by KAAL`. It reaches nothing itself: the collecting agent reaches a client with whatever means it has and gives `collect.mjs` the directory of what the client exposes to KAAL. The script records, per attempted client, either that exposure, byte for byte with each carrier's SHA-256, or that the client was not reached and why, in a dated, write-once collection under `collections/` of the KAAL directory.

With `--keep` an attempt is also kept as a sighting under `clients/<name>/sightings/` and its carriers are stored once per client and hash under `incidents/<name>/` and `requests/<name>/`, in the directory the caller passes, beside `collections/`; a reused name needs an explicit `--continues`, recorded as an assertion and not as proof. A client directory records sightings only, and the Engine does not decide where it sits.

It keeps no list of clients, so a known client, a reachable client and the set of all clients stay three different things: nothing in a collection states or implies that a client it did not attempt is absent. What it collects is evidence only; it opens no Issue, Change or backlog entry and interprets nothing.

The package is not part of `kaal-core`: Core provides the `Skill` type and the registration, and this capability joins through them.

The public API is `payload()`, returning `{ kaal, skills }` as files keyed by path. The script needs Node.js 20 or later and no other package. Registering needs `kaal-core`.

Build and test from this directory alone: `npm ci && npm test`. Engineering and acceptance live outside the package, in `engineering/kaal-collecting`.
