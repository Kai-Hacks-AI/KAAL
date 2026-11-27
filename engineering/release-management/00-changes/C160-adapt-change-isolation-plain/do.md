# C160 do

Moves the source of the check 1 replacement onto the controls adapter. The installed workflows are unchanged: the source waits for its own WIRE on the Owner's go. Nothing is required, no flag is set and no ruleset is touched.

## What was built

- `05-src/change-isolation/judge-github-alone.mjs` (release/CTL42) and `judge-delivery.mjs` (release/CTL23): each runs one rule of `engineering/change-isolation/check.mjs` (`check` for the `.github` rule, `deliveryMixed`) through `runControl` in detective mode. The answer is `{kind, verdict, findings, record}`. Run as a command, each prints its verdict, its findings and one `kaal-control <record>` line when the run is known.
- `05-src/change-isolation/lib/report.mjs`: the answer and the command line they share. It judges nothing.
- `05-src/wiring/workflows/change-isolation-plain.yml`: the judge step is replaced by two jobs, one per verdict, each with the same fetch and head binding as before. The facts the command carries are unchanged. `kaal-guard` is not used.
- `04-controls/CTL42-verify-github-alone/CTL42.md`: the control record.
- Cases T1581, T1582, T1587, T1588 and T1571 are renamed from `.red.mjs` to `.test.mjs`.

## Departures from the PLAN, recorded

1. **The two job names are quoted** (named in the amendment). `Change Isolation: .github alone (plain pull_request)` holds `: `, which a plain YAML scalar cannot. T1581 and T1571 now expect the quoted form. The names are the PLAN's, unchanged.
2. **T1571's job-name line follows the two names.** It pinned the one job name `Change Isolation (plain pull_request)`, which the PLAN's two-job contract replaces. Its other expectations are unchanged.
3. **Release/T1575 (C155) is superseded by the PLAN amendment (#2745)**, in the part that pinned the one job name. It now asserts what it was for: no job takes the required context `Change Isolation`, and the names stay of the plain `pull_request`.
4. **No delivery map row is written.** The rows for CTL42 and the CTL23 host are written at the WIRE of the file, with its own go, as the PLAN says.
5. **The record has no mode, applied or flag field yet.** Those arrive with controls/C158 (#2725); the entries take them when the adapter on `main` carries them.

## The judgment of a verified synchronization is kept

As the PLAN amendment (#2745) says: a verified synchronization of a collector is judged by its explicit resolutions only, a head already on the default branch does not apply, and any other change into a collector is judged whole. The lineage verdict is the default branch's own `engineering/github/lineage.ts`, read from `origin/<default>` and never from the candidate; one that cannot be read is UNKNOWN (exit 2). Release/T1590 pins it with real Git, including a verified synchronization whose resolutions mix `.github` with another path (reported) and an unreadable lineage (UNKNOWN). The entries take the default branch from `KAAL_DEFAULT`, which the workflow step already supplies.
