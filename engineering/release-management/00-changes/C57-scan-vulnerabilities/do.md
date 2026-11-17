# C57 do

## What the DO added

- `01-intent/I31-known-advisories-on-main/I31.md` and `04-controls/CTL6-scan-vulnerabilities/CTL6.md`, equal to the drafts in `interface.md`. CTL6 is a detective control that has release/I31.
- `05-src/vulnerability-scan/interpreter.mjs`: reads the output of `npm audit --json` and says PASS, FAIL (one finding per advisory) or UNKNOWN, with what it analyzed (lockfile, runtime scope, threshold low, no exemptions, package count). `scan.mjs` is the command the job runs: it prints the record, writes the findings to the job summary and exits 0, 1 or 2.
- `05-src/wiring/workflows/scan-vulnerabilities.yml`: the job `scan Vulnerabilities (main)`, a daily cron (04:17 UTC) and `workflow_dispatch`, `contents: read`. The audit step runs with a shell without `-e` so that the exit status of `npm audit` does not hide the result, and the next step judges it.
- T740 to T743 renamed from `.red.mjs` to `.test.mjs`. All four are green, the finder lists release/CTL6 with release/T740 as its control test and refuses nothing, and release/T600 stays green.

## Not done, as planned

No `.github` file, ruleset or check changed. Nothing requires the scan. The WIRE that installs the workflow is a later step with the Owner's go; the first scheduled run is expected to be red (4 moderate advisories, see `evidence.md`).

## CPO revision at 2454c60

The interpreter turned a missing or malformed severity count into zero (`Number(counts[s]) || 0`), so an incomplete audit with the other counts at zero could say PASS. It now requires `low`, `moderate`, `high` and `critical` each to be present as a non-negative integer and says UNKNOWN otherwise. T742 gained eight cases (empty counts, a missing count, null, a string, a non-numeric string, negative, fractional, NaN) and one that complete zero counts without `info` still pass. Before the fix T742 was RED on the first new case; after it, T740 to T743 are green.
