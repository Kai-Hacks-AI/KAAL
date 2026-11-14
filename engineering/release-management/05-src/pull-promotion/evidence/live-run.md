# Live run of Pull Promotion with the five candidate collectors declared (pull/C12, Case pull/T14)

Invocation: `node engineering/release-management/05-src/pull-promotion/run.mjs Kai-Hacks-AI/KAAL engineering/release-management/05-src/pull-promotion/declaration.json`

Exit code 0, stderr empty. The result is `live-report.json`, written by the command itself, unedited. The run before the candidates were declared is kept as `live-report-before-candidates.json` and `live-run-before-candidates.md`.

Run on 14 Nov 2026 about 23:15 UTC, in the Pull Promotion thread's container, read through GET calls only.

## What it shows

One entry per declared collector (17), in the declared order, judged from file state; no pull request is read. **No collector qualifies**, and each of the five new candidates says what is missing:

| Collector | Status | Missing (first two) |
| --- | --- | --- |
| kaal/engineering/collector-capability | does not qualify | ACT: no concluding collector-level retrospective; Cases T268, T269 have no execution at the head |
| kaal/guard/registration | does not qualify | ACT: no retrospective; an expected Test Case in the tree |
| kaal/retro/skill | does not qualify | ACT: no retrospective; an expected Test Case in the tree |
| kaal/release/githooks-split | does not qualify | ACT: no retrospective; Case T206 has no execution at the head |
| kaal/release/wire-operation | does not qualify | ACT: no retrospective; Cases T281, T282 have no execution at the head |

`qualifiers` is empty, `undeclared` is empty and `problems` is empty. Declaring a collector does not make it qualify, and no value or size is recorded, so `next.collector` is null.

## Limits

Advisory only. The five collectors move quickly: their heads at the time of the run are in the report's own reads, and `collector-files.json` records the file lists the scopes were checked against.
