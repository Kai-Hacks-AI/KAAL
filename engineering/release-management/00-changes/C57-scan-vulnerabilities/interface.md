# C57 interface

Drafts as they are added in the DO. T740 and T741 read them. None of them is on the collector until the DO.

## Draft of I31.md

````
---
id: release/I31
title: known advisories on main are seen
---
# release/I31 known advisories on main are seen

Contract: the whole dependency tree of `main` is analyzed for known vulnerabilities on a schedule, and the result says exactly what it analyzed: the lockfile, the scope, the severity threshold, the exemptions and the number of packages.

An advisory published after a dependency entered `main` is seen within a day by the people who own `main`, and not only when a Change next touches that dependency. Owner: release management.
````

## Draft of CTL6.md

````
---
id: release/CTL6
title: scan Vulnerabilities
description: It reveals when a dependency already on main has a known vulnerability, daily.
type: detective
has: [release/I31]
---
# release/CTL6 scan Vulnerabilities

A detective control. `scan Vulnerabilities (main)` runs daily and on request over the lockfile of `main`. It reports every runtime dependency with a known advisory of severity low or above, with no exemption, and says what it analyzed. A finding or an unreadable result is a red run. It blocks nothing: a ruleset that required it would be another control with its own Owner decision.

It has one Intent, release/I31. It complements `analyze Vulnerabilities` (release/CTL2), which compares base and head of a change and cannot see an advisory published against a dependency already on `main`.
````

## The record

`interpret(output)` reads the standard output of `npm audit --json` and returns:

```
{ control: 'scan Vulnerabilities', outcome: 'PASS' | 'FAIL' | 'UNKNOWN', passes, findings, analyzed, reason }
findings: [{ package, severity, advisory, range }]
analyzed: { lockfile: 'package-lock.json', scope: 'runtime', threshold: 'low', exemptions: 0, packages }
```

- PASS: the audit has a result and no vulnerability of severity low, moderate, high or critical. `info` does not count.
- FAIL: at least one such vulnerability, with one finding per advisory.
- UNKNOWN: no output, output that is not JSON, an `error` object, or a result without counts. UNKNOWN never passes.

The CLI `scan.mjs` reads the output from the file named by `KAAL_SCAN_AUDIT`, prints the record as one JSON line and one line per finding, and exits 0 PASS, 1 FAIL, 2 UNKNOWN.

## The workflow

`05-src/wiring/workflows/scan-vulnerabilities.yml`: triggers `schedule` (one daily cron) and `workflow_dispatch` and no other; `permissions: contents: read`; one job named `scan Vulnerabilities (main)` that checks out with the pinned `actions/checkout` of the analyze workflow, runs `npm audit --package-lock-only --omit=dev --json` into a file, and runs `scan.mjs`. No `--ignore`, no allowlist, no write permission.

## Where it lives

`04-controls/CTL6-scan-vulnerabilities/CTL6.md` with T740 beside it, `01-intent/I31-known-advisories-on-main/I31.md` with T741 beside it, `05-src/vulnerability-scan/` and the workflow under `05-src/wiring/workflows/`.
