# kaal-incident

The capability by which a KAAL client deliberately addresses an incident to KAAL, as an npm package. One capability, delivered in two parts:

- `kaal/`: its KAAL contribution, the sealed Node `KAAL Incident` (typed by `Skill`) and its seal. It is registered with an installed KAAL through `kaal-core`'s `registerSkill()`, which places it under `skills/kaal-incident/` of the KAAL directory.
- `skills/kaal-incident/`: its Agent Skills realization (`SKILL.md`, `scripts/`), installed under the host's `skills/`.

A carrier is a file with two parts (Happened, Expected), kept at `incidents/YY/MM/DD/CC.md` inside the client's KAAL directory so that it stays with the embedded KAAL until KAAL collects it. `scripts/incident.mjs` is the one definition of its form and the only way to make one. Making a carrier addresses it to KAAL; the client's own incidents are its own business and this capability neither replaces nor governs them. Transport, submission and collection are not part of it.

The capability is optional: it is not Core, a valid embedding does not need it, and nothing installs it unless it is selected by the exact ID of its Node.

The public API is `payload()`, returning `{ kaal, skills }` as files keyed by path. The script needs Node.js 20 or later and no other package. Registering needs `kaal-core`.

Build and test from this directory alone: `npm ci && npm test`. Engineering and acceptance live outside the package, in `engineering/kaal-incident`.
