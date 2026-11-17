# C55 baseline

The baseline is `main` at 39261fa. Nothing here depends on work that is not on `main`.

- `engineering/release/README.md` states engineering/F30: the package's source `npm test` runs in the package's directory first, and a failure stops the release. The step lives in `engineering/release/run.mjs`, with no judge of its own that release-management declares.
- `release/CTL1` (verify Stages) and the control shape with the mandatory `type` are on `main`. Verify Package (`release/CTL3`, `release/I28`) is in review on its own collector and is not a prerequisite of this Change.
- The package scope `@kaihacksai/` is Kai's standing decision of 16 Nov 2026.
