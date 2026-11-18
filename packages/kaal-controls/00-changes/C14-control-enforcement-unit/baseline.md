# C14 baseline

The baseline is the collector `kaal/controls/control-status` at `aeb9ff59f7b1204408e4e8f0228d4c469c532c3e`, not `main`, because a registry entry carries the `status` of C12 and the finder that reads `stations` is the finder of C12. C14 is promoted only after C12 is on `main`.

- The collector holds the finder that lists every control with `status`, `rank`, `valid` and `problems`, the check in the Skill, and the references `declaring-controls.md` and `judging-status.md`. It holds no `stations`, no registry, no judge, no sign, no `enforcement/` and no `engineering/controls/stations.json`.
- `engineering/release-management/05-src/wiring/rulesets/integrating.json` on `main` requires `verify Stages (Integrating)` and `verify Stages (Developing)`, and release/CTL8 runs as a job of `sync-review.yml` with the repository's token. C14 changes neither. Kai decided on 18 Nov 2026 that the GitHub App "KAAL Inspector" is the Control Enforcement Unit, part of kaal-controls and not a capability of its own.
