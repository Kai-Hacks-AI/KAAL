# C14 baseline

The baseline is the collector `kaal/controls/control-status` at `aeb9ff59f7b1204408e4e8f0228d4c469c532c3e`, not `main`, because a registry entry carries the `status` of C12 and the finder that reads `stations` is the finder of C12. C14 is promoted only after C12 is on `main`.

- The collector holds the finder that lists every control with `status`, `rank`, `valid` and `problems`, the check in the Skill, and the references `declaring-controls.md` and `judging-status.md`. It holds no `stations` and no registry.
- Kai decided on 18 Nov 2026 that the GitHub App "KAAL Inspector" is the Control Enforcement Unit, part of kaal-controls, and that it is built in thin slices (`design.md`). The first slice touches no workflow, ruleset or App.
