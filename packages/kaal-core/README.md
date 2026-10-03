# kaal-core

KAAL Core as an npm package. It carries KAAL's artifacts as files, in `artifacts/`, laid out as they deploy: the Kernel, the Nodes and one empty seal `seals/<ID>` per sealed Node. The files are the authority. Its public API is `payload()`, which returns them as files keyed by path relative to the KAAL directory.

Build and test from this directory alone: `npm ci && npm test`.

Verification, sealing and the acceptance suite live outside the package, in `engineering/kaal-core`.
