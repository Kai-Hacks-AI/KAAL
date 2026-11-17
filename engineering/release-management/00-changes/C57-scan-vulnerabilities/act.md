# C57 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The gap between the two controls was already written in release/I4: Dependabot reports on what is already present, and a diff cannot see an advisory published later. That made the new Intent release/I31 and the choice of mechanism short. `npm audit --package-lock-only` needs no install, no token and no repository setting, and a first look showed that it already finds 4 moderate runtime advisories on `main`, so the control is not hypothetical. The interpreter and the CLI copy the shape of release/CTL2's analyze adapter, so a reader of one reads the other.

## Learned

The CPO review found a real hole: `Number(counts[s]) || 0` turned a missing count into zero, and an incomplete audit could say PASS. A control whose contract is that UNKNOWN never passes has to treat absence as UNKNOWN at every field it counts, not only at the top of the result. Cases that observe a RED first (T742 on the first new case) are what showed the fix was the fix. Cases that declare `tests: release/CTL6` are all listed by the finder as control tests, so T742 and T743 test the Change instead and only T740 stands beside the control. The first Branching run of a new PR fails before auto-merge registers; cycling auto-merge re-runs it.

## Lacked

A scheduled run. Nothing here shows that the cron fires, that `shell: bash {0}` lets the interpreter judge a non-zero `npm audit`, or that a red run reaches a person: that needs the WIRE and a recorded run. Also lacking: Requirements and Architecture for release/I31, so the claim stops at what T740 to T743 observe.

## Longed For

The WIRE that installs `scan-vulnerabilities.yml` under `.github/workflows/`, then one recorded run. The first run will be red with the 4 moderate advisories, so a Change that resolves or decides on them should come with it.

## Follow-ups

- Promote the collector `kaal/release/scan-vulnerabilities` through SYNC and PROMOTION, one promotion at a time.
- WIRE the workflow, with the Owner's go, and record the first scheduled run.
- Decide what to do with the 4 moderate runtime advisories on `main`.
- Decide whether a finding should also open an issue.
- Add Requirements and Architecture of `release/I31` in later Changes.
