# kaal-core

KAAL Core as an npm package. It carries KAAL's artifacts as files, in `artifacts/`, laid out as they deploy: the Kernel, the Nodes and one empty seal `seals/<ID>` per sealed Node. The files are the authority. Its public API is `payload()`, which returns them as files keyed by path relative to the KAAL directory, and `registerSkill()`, which registers a capability's KAAL Skill contribution (Nodes and their own seals) with an installed KAAL directory under `skills/<capability>/`. Core carries the `Skill` type and this registration, never a Skill.

Build and test from this directory alone: `npm ci && npm test`.

Verification, sealing and the acceptance suite live outside the package, in `engineering/kaal-core`.
