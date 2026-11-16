# C50 baseline

The baseline is `main` at 71394da. Nothing here depends on work that is not on `main`.

- `engineering/release/release.mjs` holds `readiness()` (engineering/F29), with the scope `@kaihacksai/` and the repository URL as constants, and its Cases engineering/T62 and T63.
- `release/CTL1` and the control shape with the mandatory `type` are on `main` (controls/C9, controls/C10). No control exists for publishing.
- The package scope `@kaihacksai/` is Kai's standing decision of 16 Nov 2026.
