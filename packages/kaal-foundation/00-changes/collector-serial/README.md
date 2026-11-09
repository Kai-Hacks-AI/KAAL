# Foundation: the collector runs Case files one at a time

Capability: Foundation. Target: `kaal/foundation`. Record number provisional until integration. Intent: foundation/I15 (F42, the collector).

The collector (`04-test/engineering-check/collect.mjs`) ran every collector Case file in parallel. Several of them pack or rebuild the package's `dist/` (acquisition packs it, capability, boundary and the tree plan test build it), so a pack could read `dist/` mid-rebuild and install an incomplete copy. T32 then failed in roughly one run in ten with "Cannot read properties of undefined (reading 'includes')", and a rerun passed. The collector now passes `--test-concurrency=1`, so the files share `dist/` one at a time. Six consecutive runs: 47/47, about 25 seconds each.

No promotion, version bump, SYNC, ledger entry, release dispatch or npm publication.
