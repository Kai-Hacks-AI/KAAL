# C13 baseline

The baseline is `main` at `733d84b9fb0e57f1748475dd0d613dccbf28a306`. C12 is on `main` (promotion #1934), so the finder on `main` reads the `status` field the declaration carries and the Cases run against it.

- The collector holds the finder that lists every control with its status, the check in the Skill (`check-controls.mjs`) and the Case T778 that runs it on `engineering/`.
- `engineering/controls/` holds the old README of the first PLAN of the controls and the numbered folders C12 added. This Change adds beside them and leaves the README as it is.
- Kai approved declaring the control, separate from `verify Stages`, with no hook for now, on 17 Nov 2026.
