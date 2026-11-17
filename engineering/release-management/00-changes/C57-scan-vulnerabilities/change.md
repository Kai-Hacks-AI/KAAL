# C57 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the control, the record, the workflow) and the Cases T740 to T743, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no control item, no Intent item, no source, no workflow, no `.github` file and no ruleset.

## Mechanism

`npm audit --package-lock-only --omit=dev --json` over the lockfile of `main`. It needs no install and no token, and it answers from the npm advisory database. The alternative, reading Dependabot alerts, needs a token with `security_events` and depends on a setting of the repository the Owner controls, so it is not used. Severity low and above, runtime scope (`--omit=dev`), no exemptions: no `--ignore`, no allowlist.

## How a finding surfaces

The job `scan Vulnerabilities (main)` ends red when the outcome is FAIL or UNKNOWN. The red run names each advisory (package, severity, advisory url) in its log and its job summary. UNKNOWN never passes: an unreachable registry or an unreadable result is red, not green. A scheduled workflow only runs from the default branch, so the scan reads `main` by construction. No issue is opened and nothing is written, so the workflow has `contents: read` only. An issue per finding is a possible later Change.

## Ids

Change `release/C57`, Cases T740 to T749 (four used: T740 to T743), Intent `release/I31`, gap `release/G86`, control `release/CTL6`. Allocated by the coordinator on 17 Nov 2026 after release/C56.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Add `01-intent/I31-known-advisories-on-main/I31.md`, `04-controls/CTL6-scan-vulnerabilities/CTL6.md`, the interpreter and CLI in `05-src/vulnerability-scan/`, and `05-src/wiring/workflows/scan-vulnerabilities.yml`, equal to the drafts.
2. Rename T740 to T743 from `.red.mjs` to `.test.mjs` when they are green.

## ACT

A 4L retrospective in `act.md`.

## Left open

- The WIRE that installs the workflow under `.github`, with a recorded scheduled run.
- Whether a finding should also open an issue.
