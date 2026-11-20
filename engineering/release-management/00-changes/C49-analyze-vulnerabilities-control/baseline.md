# C49 baseline

The baseline is the collector `kaal/release/analyze-vulnerabilities-stages` with `main` at 71394da merged in.

- `main` holds the control shape with the mandatory `type` and the finder (controls/C8, controls/C9) and `release/CTL1` with the Intent `release/I27` (controls/C10).
- The collector holds, from release/C48, the workflow `analyze-vulnerabilities.yml`, the reports `analyze Vulnerabilities (Integrating)` and `(Promoting)`, and the rows in `controls.md`. It holds no control item.
- `release/I4` (analyze Vulnerabilities) exists in `01-intent` and has no control that has it. Its old Case T72 stays as it is.
