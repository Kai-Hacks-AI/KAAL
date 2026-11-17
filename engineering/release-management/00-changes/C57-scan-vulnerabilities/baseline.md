# C57 baseline

The baseline is the collector `kaal/release/scan-vulnerabilities` at `main` 39261fa, with no commit of its own.

- `05-src/wiring/workflows/analyze-vulnerabilities.yml` runs `dependency-review-action` v5.0.0 on base and head of a pull request or merge group. Its Intent `release/I4` says that Dependabot reports on dependencies already present and is not changed.
- `04-controls/` holds release/CTL1 and release/CTL2. No control reads the dependency tree of `main` on a schedule.
- Mechanism check, 17 Nov 2026: `npm audit --package-lock-only --omit=dev --json` runs against the root `package-lock.json` of `main` without installing, and already reports advisories on runtime dependencies of `main`.
