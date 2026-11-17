# C13 baseline

The baseline is the collector `kaal/controls/control-status` at `a9bfd8dd03e26ff1e05b91f1d6066f55f35ca957`, not `main`. The declaration carries `status`, and the finder on `main` refuses that field, so the Cases of this Change can only run against the finder of C12. C13 is promoted only after C12 is on `main`.

- The collector holds the finder that lists every control with its status, the check in the Skill (`check-controls.mjs`) and the Case T778 that runs it on `engineering/`.
- `engineering/controls/` holds the old README of the first PLAN of the controls and the numbered folders C12 added. This Change adds beside them and leaves the README as it is.
- Kai approved declaring the control, separate from `verify Stages`, with no hook for now, on 17 Nov 2026.
