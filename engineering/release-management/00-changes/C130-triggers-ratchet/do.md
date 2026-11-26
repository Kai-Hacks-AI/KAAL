# C130 do

What the DO built, against the decisions of `change.md`.

## Built

- `05-src/triggers/verify-triggers.mjs`: the judge reports findings, the sorted paths of the workflows that use `pull_request_target` (`findingsOf`), and hands the verdict to kaal-controls' `judge-mode --mode ratchet` (decisions 1 and 2). `previous` is the findings of the base, read as Git data by the same reader, and `baseline` is `previous` without what the head resolved. The exit codes (0, 1, 2) and the report line stay what a workflow step reads. If `judge-mode` is absent on the base the answer is UNKNOWN, which never passes.
- `04-controls/CTL20-gate-verify-triggers/CTL20.md`: the ratchet is declared on the preventive control: `strategy: ratchet` with `baseline-source`, `owner` and `exit`, no deadline and no `:ratchet` station (decision 4). The finder on main accepts the fields. CTL19 stays detective and is not re-typed.
- Cases T1407 to T1411: the report, the verdicts through the shared ratchet, the persistence lifecycle with its limit, the control records, and the allowance read from the base only.
- `evidence.md`: the table of the next ten pull requests, empty until the installed judge runs.

## Cases changed on purpose (decision 7)

T1129 compares the record with its draft of release/C91; it now also leaves out the four fields the record declares, and the prose of the record is unchanged (the explanation of the ratchet is in this Change and in T1410). T1126 and T1134 seed a temporary repository with the judge file alone. The judge now imports the shared `judge-mode.mjs` by a relative path, so both seeds also carry that one file. Their targets and assertions do not change. T1116 and T1120 to T1122 pass unchanged: the verdict of every old fixture is the same.

## Not done here

- The workflow `verify-triggers.yml` is untouched: the installed workflow runs the judge of the base, which stays the old one until a WIRE, on Kai's go, moves the new one to the base. No flag, no ruleset change, no removal of any of the five uses.
- No deadline. The exit (removing the five uses) is separate work.
