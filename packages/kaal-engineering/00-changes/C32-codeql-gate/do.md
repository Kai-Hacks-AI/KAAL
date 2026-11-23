# C32 do

The DO of the merged PLAN (#2346).

- **Source:** `13-source/workflows/codeql.yml` is `main`'s `.github/workflows/codeql.yml` unchanged (same triggers, same `analyze` job, same pinned actions) plus: a workflow `env` declaring `CODEQL_EXPECTED` and the two thresholds, and two jobs, `verify CodeQL analysis` and `verify CodeQL findings`. Each job checks out the merge result, sets up Node 24 (the pins `engineering.yml` already uses), runs its release judge to write a findings file, then runs kaal-controls' `judge-mode` in preventive mode on it. The judge exits 2 and writes no file for every UNKNOWN, and `judge-mode` reads an absent file as UNKNOWN, so no job passes on anything it could not read.
- **Amendment to the PLAN:** one job became two, after release split the judge (C129, CTL34 and CTL35). F93 now says two jobs and the thresholds; T1393 and T1394 were amended, and T1412 pins the two steps of each job.
- **What this Change does not do:** it installs nothing. `.github/workflows/codeql.yml` is untouched; the release WIRE installs the source. No ruleset change and no removal of the legacy rule.
- **Known property, for release:** the jobs run the judge from the checked-out merge result, so a pull request that changes the judge runs its own version. The same holds for the other Actions gates that run repository scripts; whether the gate should run the base's judge is a question for release, not decided here.
- **Cases:** T1393, T1394 and T1412 are GREEN; I also checked that T1412 goes RED when `judge-mode` is called in another mode and T1393 goes RED when a job's condition could skip it. The judge and `judge-mode` paths are those on `main` (checked at the DO), where the collector does not have them until its SYNC.
