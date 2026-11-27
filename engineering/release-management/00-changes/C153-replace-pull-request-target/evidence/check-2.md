# Evidence of check 2, Branching (release/CTL37, release/CTL38, release/CTL39)

Counts follow release/C153, chapter "Amendment: the evidence before enforcement, per control". Read by script from the job logs of every run of `branching-plain.yml` created from 15:49 UTC (its WIRE) until 17:09 UTC, plus the probe revisions. The record's `sha` equals the head of the run in every counted row. The old check is the check run `Branching` on the same head. A revision where every entry answers not-applicable writes no record and counts nowhere.

## Count at the head of this file

| Entry | Situation | Kind | Required | Counting |
| --- | --- | --- | --- | --- |
| CTL37 freshness | PASS | A | 5 | 10 |
| CTL38 synchronization | PASS | A | 5 | 5 |
| CTL39 auto-merge | PASS | A | 5 | 21 |
| CTL37 freshness | FAIL (behind the target) | P | 3 | 3 (probes #2816 to #2818) |
| CTL38 synchronization | FAIL | P | 3 | 0 |
| CTL39 auto-merge | FAIL | P | 3 | 0 |
| All entries | A | 15 | 36 |

## Counting A (PASS only, record names the head, old check agrees)

| Branch | Revision (head) | Run | Entry | Verdict | Old check `Branching` |
| --- | --- | --- | --- | --- | --- |
| claude/release-c153-ledger-counts | 82bcde03b7d2f0262ae182415f40fe85f8e80390 | 46039392971 | CTL39 auto-merge | PASS | success |
| wire/promotion-source-plain | 61e02fccc79d4d44cc841c1abf06a158f3ac4108 | 46038568391 | CTL37 freshness | PASS | success |
| wire/codeql-judge-run | 47d49ce20160ee86b1191d1bcb68403603ae5f0c | 46038368126 | CTL39 auto-merge | PASS | success |
| wire/codeql-judge-run | 47d49ce20160ee86b1191d1bcb68403603ae5f0c | 46038368126 | CTL37 freshness | PASS | success |
| claude/sync-wire-codeql | 73531de3bbc38312d63f5d0d4f1c5bca75760b1e | 46038276659 | CTL39 auto-merge | PASS | success |
| claude/sync-wire-codeql | 73531de3bbc38312d63f5d0d4f1c5bca75760b1e | 46038276659 | CTL38 synchronization | PASS | success |
| claude/project-thread-nurd8a | 0cdda641b5a55e6ff48ee98aad043e79dc196a42 | 46038197267 | CTL39 auto-merge | PASS | success |
| claude/project-thread-nurd8a | 88ebf31057fafc0370541337916df4629bc4b0ef | 46038153347 | CTL39 auto-merge | PASS | success |
| testing/c84-judged-revision-plan | e2ae023d34365f4b05661309499dd4ac50355d5d | 46037814940 | CTL39 auto-merge | PASS | success |
| kaal/release/promotion-source-plain | d9f4a3c3d93fbdcfe650e5cff52f675c967ecbc7 | 46036624179 | CTL39 auto-merge | PASS | success |
| kaal/release/promotion-source-plain | d9f4a3c3d93fbdcfe650e5cff52f675c967ecbc7 | 46036624179 | CTL37 freshness | PASS | success |
| claude/project-thread-g6hmfd-sync-psp-2 | ef10cbf3133bcb598ec32fa31eb6ce15ec47a2b9 | 46035942238 | CTL39 auto-merge | PASS | success |
| claude/project-thread-g6hmfd-sync-psp-2 | ef10cbf3133bcb598ec32fa31eb6ce15ec47a2b9 | 46035942238 | CTL38 synchronization | PASS | success |
| claude/project-thread-nurd8a | 11d2448e2f69331144fff4eb7fd4fa4743f515e0 | 46035836515 | CTL39 auto-merge | PASS | success |
| testing/c84-judged-revision-plan | 0e7694590ff00d64142a08075bb8298b287988b4 | 46035519296 | CTL39 auto-merge | PASS | success |
| wire/codeql-judge-run | 39dd9885cc4685791f246dcafa050b6ba27c64dc | 46034197128 | CTL37 freshness | PASS | success |
| wire/codeql-judge-run | 39dd9885cc4685791f246dcafa050b6ba27c64dc | 46034197128 | CTL39 auto-merge | PASS | success |
| kaal/release/evidence-amendment | a847ba108fd275e17f1456b7c6697305465b77d0 | 46033146680 | CTL39 auto-merge | PASS | success |
| kaal/release/evidence-amendment | a847ba108fd275e17f1456b7c6697305465b77d0 | 46033146680 | CTL37 freshness | PASS | success |
| claude/project-thread-nurd8a | f674f69ae8a759fcbad0be0ec95a9a2e356b7891 | 46033062521 | CTL39 auto-merge | PASS | success |
| testing/c84-judged-revision-plan | d6caf406c23b59aa46bec5dc4465931304b18e20 | 46032525836 | CTL39 auto-merge | PASS | success |
| claude/project-thread-g6hmfd-sync-release-evidence-amendment-1 | aefb7bc741b6a16e6d42b5a23cc9813f49190f7f | 46032386852 | CTL38 synchronization | PASS | success |
| claude/project-thread-g6hmfd-sync-release-evidence-amendment-1 | aefb7bc741b6a16e6d42b5a23cc9813f49190f7f | 46032386852 | CTL39 auto-merge | PASS | success |
| claude/release-c159-act | a427c28c2354bad4e7b2993a47cf719c051bfec8 | 46031675458 | CTL39 auto-merge | PASS | success |
| claude/release-c159-do2 | 694682a90f843e739f1da7eaa9e8022ab6b8932c | 46030783705 | CTL39 auto-merge | PASS | success |
| kaal/engineering/controls-callers | a0996ab9c8934beb9c34d951a081a6a2e589d38c | 46030479634 | CTL39 auto-merge | PASS | success |
| kaal/engineering/controls-callers | a0996ab9c8934beb9c34d951a081a6a2e589d38c | 46030479634 | CTL37 freshness | PASS | success |
| claude/release-c159-sync | 558755bc2b954f239fec79ce9231b5e13e14358f | 46029976745 | CTL39 auto-merge | PASS | success |
| claude/release-c159-sync | 558755bc2b954f239fec79ce9231b5e13e14358f | 46029976745 | CTL38 synchronization | PASS | success |
| claude/project-thread-g6hmfd-sync-engineering-controls-callers-1 | 5a24eebab027a5ee4698b9205555f585857580c0 | 46029809891 | CTL38 synchronization | PASS | success |
| claude/project-thread-g6hmfd-sync-engineering-controls-callers-1 | 5a24eebab027a5ee4698b9205555f585857580c0 | 46029809891 | CTL39 auto-merge | PASS | success |
| wire/branching-plain | 2e75fd9142e064f05c02091aa46484221c685dab | 46028277602 | CTL37 freshness | PASS | success |
| wire/branching-plain | 2e75fd9142e064f05c02091aa46484221c685dab | 46028277602 | CTL39 auto-merge | PASS | success |
| #2891 (probe, a merge of main) | 530e63fd3dd0e3e68b3bcf185bc84733a8e3b5c0 | probe | CTL37 freshness | PASS | success |
| #2892 (probe, a merge of main) | acdee033fb2b1991d48ca2fe85a1b2ba01e2569c | probe | CTL37 freshness | PASS | success |
| #2893 (probe, a merge of main) | 2e5dac54b7cf5506bd8f556a416e356cbf1d6c8f | probe | CTL37 freshness | PASS | success |

## Verified verdict, not counted as A (a REPORT with the old check failing)

A natural failure on which the old check and the new entry agree. It is a verdict observation, not a PASS agreement, and it is not in the A total above (which counts PASS rows only). It is also not provoked, so it is not counted as P.

| Branch | Revision (head) | Run | Entry | Verdict | Old check `Branching` |
| --- | --- | --- | --- | --- | --- |
| kaal/release/promotion-source-plain | dd4d97a1671877920933220b1f3edba12c4d435a | 46032357568 | CTL37 freshness | REPORT | failure |

## Counting P (provoked, REPORT with old failure, same revision)

| Pull request | Revision (head) | Entry | Verdict | Old check |
| --- | --- | --- | --- | --- |
| #2816 (probe) | 53c591d7b56b9e3efb7608ca9e6d88557e66ec6a | CTL37 freshness | REPORT | failure |
| #2817 (probe) | 0a8d350a41aa97cfd0ace4342357cd24fbe2abc4 | CTL37 freshness | REPORT | failure |
| #2818 (probe) | e62b2897d5e8cd3fd5fe06b3f1f5a503fc641566 | CTL37 freshness | REPORT | failure |

## Not counting (all entries not applicable, no record)

| Branch | Revision (head) | Run | Why | Old check |
| --- | --- | --- | --- | --- |


## Inspected and disqualified

The synchronization probes #2891 to #2893 (an ordinary change carrying a merge of main) were meant to provoke a refusal; old and new entries both passed them, so they are not P. They count as A for freshness above.

## Uninspected

Runs created after 17:09 UTC.

## Open

CTL38 and CTL39 each need 3 provoked FAIL demonstrations. The count is the CPO's to accept.
