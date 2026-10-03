# kaal-core

KAAL Core as an npm package. Its public API is `payload()`: the Kernel, the first Nodes and their seal markers, as files keyed by path relative to the KAAL directory.

Build and test from this directory alone: `npm install && npm test`.

Verification, sealing and the acceptance suite live outside the package, in `engineering/kaal-core`.
