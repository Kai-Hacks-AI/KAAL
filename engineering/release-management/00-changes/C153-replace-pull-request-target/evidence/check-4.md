# Evidence of check 4, Promotion Source (release/CTL40 origin, release/CTL41 head evidence)

Counts follow release/C153, chapter "Amendment: the evidence before enforcement, per control". Read by script from the job logs of every run of `promotion-source-plain.yml` on a pull request from its WIRE (#2887, on main at 17:39 UTC) until the read, and the old check `Promotion Source` on the same head. The record's `sha` equals the head of the run in every counted row. One distinct revision counts once per control and situation.

## Count at the head of this file

| Entry | Situation | Kind | Required | Counting |
| --- | --- | --- | --- | --- |
| CTL40 origin | PASS (a wire or kaal branch of the repository) | A | 5 | 6 |
| CTL41 head evidence | PASS | A | 5 | 6 |
| CTL40 origin | FAIL (a head that is no kaal, hotfix or wire branch) | P | 3 | 3 |
| CTL41 head evidence | FAIL (a stock head whose required checks are not all green) | P | 3 | 3 |
| All entries | A | 15 | 12 |

## Counting A (PASS, record names the head, old check agrees)

| Branch | Pull request | Revision (head) | Run | Entry | Verdict | Old check |
| --- | --- | --- | --- | --- | --- | --- |
| wire/c153-check4-head-6 | #2917 | 3cadd2af5b62b70987f1345436d4814eb1697303 | 46044615700 | head evidence | PASS | success |
| wire/c153-check4-head-6 | #2917 | 3cadd2af5b62b70987f1345436d4814eb1697303 | 46044615700 | origin | PASS | success |
| wire/c153-check4-head-5 | #2916 | b6e95e9b9882c6a5acc3d49795fa0f42640c3bc8 | 46044611635 | origin | PASS | success |
| wire/c153-check4-head-5 | #2916 | b6e95e9b9882c6a5acc3d49795fa0f42640c3bc8 | 46044611635 | head evidence | PASS | success |
| wire/c153-check4-head-4 | #2915 | 1eabdb96d2bff3213b3b4a107c1cbce55afee8cd | 46044605935 | origin | PASS | success |
| wire/c153-check4-head-4 | #2915 | 1eabdb96d2bff3213b3b4a107c1cbce55afee8cd | 46044605935 | head evidence | PASS | success |
| wire/c153-check4-head-3 | #2913 | 6837295d762ccf2a448dccee304129f6532e1a2a | 46044321937 | origin | PASS | success |
| wire/c153-check4-head-3 | #2913 | 6837295d762ccf2a448dccee304129f6532e1a2a | 46044321937 | head evidence | PASS | success |
| wire/c153-check4-head-2 | #2912 | c6742dbebd8805bdce25633715b84019b80a0607 | 46044315728 | head evidence | PASS | success |
| wire/c153-check4-head-2 | #2912 | c6742dbebd8805bdce25633715b84019b80a0607 | 46044315728 | origin | PASS | success |
| wire/c153-check4-head-1 | #2911 | 2ab802ee5c5a2b505f7c7a5244ae8255bd0e7d5e | 46043650243 | head evidence | PASS | success |
| wire/c153-check4-head-1 | #2911 | 2ab802ee5c5a2b505f7c7a5244ae8255bd0e7d5e | 46043650243 | origin | PASS | success |

## Counting P (provoked, REPORT with the old check failing on the same head)

| Branch | Pull request | Revision (head) | Run | Entry | Verdict | Old check |
| --- | --- | --- | --- | --- | --- | --- |
| kaal/release/ledger-counts | #2923 | 8e69ef50994d66ab0facaecb473fd160950bd307 | 46046370354 | head evidence | REPORT | failure |
| kaal/release/evidence-counts | #2921 | 82bcde03b7d2f0262ae182415f40fe85f8e80390 | 46044912540 | head evidence | REPORT | failure |
| kaal/release/inspector-app | #2920 | 8e6503f47aaee64f8d999fa13da0770101736560 | 46044909514 | head evidence | REPORT | failure |
| probe/c153-check4-origin-3 | #2910 | 78b7d5213cd7d67c969daba92457438953bc2579 | 46043641864 | origin | REPORT | failure |
| probe/c153-check4-origin-2 | #2909 | cf782d23f6e059158bcb68d0a3ba4fc9d738118a | 46043630104 | origin | REPORT | failure |
| probe/c153-check4-origin-1 | #2908 | e5f8cb42d54dc51f186d30a2b358e98f2a21ffc9 | 46043620598 | origin | REPORT | failure |

## Inspected and not counted

| Branch | Revision (head) | Run | Why |
| --- | --- | --- | --- |
| kaal/release/ledger-counts | e15fb77cec19bd3a0f6b23c0f186f0ebb90a1706 | 46046857070 | old check not concluded when read |
| kaal/hosting/judged-revision | e6975f1715f2f7651c5af90012cc8acf795534dc | 46046400362 | old check not concluded when read |
| kaal/release/ledger-counts | #2923 | 8e69ef50994d66ab0facaecb473fd160950bd307 | 46046370354 | origin | PASS | failure | disagreement |
| kaal/release/evidence-counts | #2921 | 82bcde03b7d2f0262ae182415f40fe85f8e80390 | 46044912540 | origin | PASS | failure | disagreement |
| kaal/release/inspector-app | #2920 | 8e6503f47aaee64f8d999fa13da0770101736560 | 46044909514 | origin | PASS | failure | disagreement |

The provoked heads for the origin FAIL (#2908 to #2910) are draft pull requests from a probe branch into main. The provoked heads for the head-evidence FAIL are stray stock branches (`kaal/release/*`) whose required checks are not all green at the head. The head-evidence probes #2911 to #2913 and #2915 to #2917 (a wire branch with a failing Change Isolation) passed, because the judge reads the required checks of the head's own ruleset, so they count as A. All probes were never merged and no auto-merge was enabled on them.

## Not applicable (N)

The head-evidence entry answers not-applicable without a record when the origin fails. This is a situation the judge must not decide; it is counted nowhere.

## Uninspected

Runs created after the read. No run of a `merge_group` event is part of this check.

## Open

The count is the CPO's to accept. The old workflow `promotion-source.yml` keeps running at the swap, unrequired, as the detective comparison (release/C153).
