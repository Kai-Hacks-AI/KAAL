# Evidence of check 2, Branching (release/CTL37, release/CTL38, release/CTL39)

Counts follow release/C153, chapter "Amendment: the evidence before enforcement, per control". Read by script from the job logs of every run of `branching-plain.yml` created from 15:49 UTC (its WIRE) until 19:44 UTC, plus the probe revisions. The record's `sha` equals the head of the run in every counted row. The old check is the check run `Branching` on the same head. A revision where every entry answers not-applicable writes no record and counts nowhere.

## Count at the head of this file

| Entry | Situation | Kind | Required | Counting |
| --- | --- | --- | --- | --- |
| CTL37 freshness | PASS | A | 5 | 21 |
| CTL38 synchronization | PASS | A | 5 | 9 |
| CTL39 auto-merge | PASS | A | 5 | 52 |
| CTL37 freshness | FAIL (behind the target) | P | 3 | 3 (probes #2816 to #2818) |
| CTL38 synchronization | FAIL | P | 3 | 3 (probes #2899 to #2901) |
| CTL39 auto-merge | FAIL | P | 3 | 3 (probes #2899 to #2901) |
| All entries | A | 15 | 82 |

## Counting A (PASS only, record names the head, old check agrees)

| Branch | Revision (head) | Run | Entry | Verdict | Old check `Branching` |
| --- | --- | --- | --- | --- | --- |
| testing/c84-interim | fb10b27f0e0feb9b81c97bd826768fd848638918 | 46057665197 | CTL39 auto-merge | PASS | success |
| testing/c84-interim | 7ef3423dea2df6ffc105ec133ab7a209066569ec | 46057232651 | CTL39 auto-merge | PASS | success |
| testing/c84-interim | 7ecabd272225899c3641017396996e7a620814e3 | 46057113459 | CTL39 auto-merge | PASS | success |
| kaal/testing/mutation-verification | fa6be056ba383741710cacfe855e101a2f995798 | 46055861653 | CTL39 auto-merge | PASS | success |
| kaal/testing/mutation-verification | fa6be056ba383741710cacfe855e101a2f995798 | 46055857315 | CTL37 freshness | PASS | success |
| claude/project-thread-g6hmfd-sync-mutation-2 | 1fb1fd2bebc3b89fdcf2b43595a7e29a1a966c81 | 46055255315 | CTL39 auto-merge | PASS | success |
| claude/project-thread-g6hmfd-sync-mutation-2 | 1fb1fd2bebc3b89fdcf2b43595a7e29a1a966c81 | 46055252269 | CTL38 synchronization | PASS | success |
| claude/release-c167-plan | 2687ba70020ae673d91753cb306a9c6a7986d9eb | 46055233515 | CTL39 auto-merge | PASS | success |
| claude/release-c167-plan | 41af31b8853fe6aa3201a0b434eb440581f8744a | 46055176051 | CTL39 auto-merge | PASS | success |
| claude/release-c167-plan | 9efb58ee75778b8da2215eb3058015d365e35f80 | 46054896588 | CTL39 auto-merge | PASS | success |
| claude/release-c167-plan | 1c312ef541f4bc1b403a6832abe297c347f843e3 | 46052963406 | CTL39 auto-merge | PASS | success |
| kaal/controls/neutral-wording | 5823f0f8b6f0c9b8c55d04cba7ccdbee4a865b7b | 46050191684 | CTL39 auto-merge | PASS | success |
| kaal/controls/neutral-wording | 5823f0f8b6f0c9b8c55d04cba7ccdbee4a865b7b | 46050186782 | CTL37 freshness | PASS | success |
| claude/release-c167-plan | ed09e6c650845eae5af159557390d197e0e1cacd | 46049814280 | CTL39 auto-merge | PASS | success |
| claude/release-c167-plan | bb377655ff378046ddf2dc4b825b8c6beeebfcda | 46049737673 | CTL39 auto-merge | PASS | success |
| claude/project-thread-g6hmfd-sync-neutral-1 | 6341c103a224f8dd51a6da8b945b6b77d2d86d41 | 46049549123 | CTL39 auto-merge | PASS | success |
| claude/project-thread-g6hmfd-sync-neutral-1 | 6341c103a224f8dd51a6da8b945b6b77d2d86d41 | 46049544307 | CTL38 synchronization | PASS | success |
| claude/release-c167-plan | ce4c5296c781666fb2de30395493277894d993eb | 46049084152 | CTL39 auto-merge | PASS | success |
| kaal/controls/flag-status | 26ae9185972215a5441629e807fa23857b28cc96 | 46047659177 | CTL39 auto-merge | PASS | success |
| kaal/controls/flag-status | 26ae9185972215a5441629e807fa23857b28cc96 | 46047652961 | CTL37 freshness | PASS | success |
| claude/release-c167-plan | 3707596b05d3eef7dcf7fad8286b05f247a80783 | 46047423554 | CTL39 auto-merge | PASS | success |
| claude/release-c153-ledger-check4 | bd93526a7ebd11239e8c948a2f24a07c4b5a3a55 | 46047355077 | CTL39 auto-merge | PASS | success |
| claude/project-thread-g6hmfd-sync-flagstatus-1 | 5eadd4aa9cc59d2587eb0b9d5c5a67daf7579b9e | 46046600516 | CTL39 auto-merge | PASS | success |
| claude/project-thread-g6hmfd-sync-flagstatus-1 | 5eadd4aa9cc59d2587eb0b9d5c5a67daf7579b9e | 46046595921 | CTL38 synchronization | PASS | success |
| claude/release-c153-ledger-p-rows | f6560143e3cedc8f2fafe16294e8548fe507eb47 | 46044576004 | CTL39 auto-merge | PASS | success |
| claude/project-thread-nurd8a | 52da7e433fcfa85f28d05255a46cdfc2b7e4cec3 | 46044557667 | CTL39 auto-merge | PASS | success |
| wire/c153-check4-head-6 | 3cadd2af5b62b70987f1345436d4814eb1697303 | 46044525768 | CTL37 freshness | PASS | success |
| wire/c153-check4-head-5 | b6e95e9b9882c6a5acc3d49795fa0f42640c3bc8 | 46044516666 | CTL37 freshness | PASS | success |
| wire/c153-check4-head-4 | 1eabdb96d2bff3213b3b4a107c1cbce55afee8cd | 46044505737 | CTL37 freshness | PASS | success |
| wire/workflow-names-judge-run | 849934306cc657418c42068515b507d21f8f133c | 46043745177 | CTL39 auto-merge | PASS | success |
| wire/workflow-names-judge-run | 849934306cc657418c42068515b507d21f8f133c | 46043740139 | CTL37 freshness | PASS | success |
| wire/c153-check4-head-3 | 6837295d762ccf2a448dccee304129f6532e1a2a | 46043671808 | CTL37 freshness | PASS | success |
| wire/c153-check4-head-2 | c6742dbebd8805bdce25633715b84019b80a0607 | 46043663341 | CTL37 freshness | PASS | success |
| wire/c153-check4-head-1 | 2ab802ee5c5a2b505f7c7a5244ae8255bd0e7d5e | 46043650293 | CTL37 freshness | PASS | success |
| claude/project-thread-nurd8a | 57963d4807f15a0589d674d04f8f64106c86c2fd | 46042297594 | CTL39 auto-merge | PASS | success |
| claude/release-c153-ledger-counts | 38223b41ba7fc9671ad33e1d57a331f734aa1916 | 46041548773 | CTL39 auto-merge | PASS | success |
| claude/release-c153-ledger-counts | 8ad7230b3cd1ed16610b132a547551cdbcc9931f | 46041212078 | CTL39 auto-merge | PASS | success |
| wire/promotion-source-plain | 3d216e5973b5a6786f2c7ed7d2b9de95737c2cd2 | 46041150629 | CTL39 auto-merge | PASS | success |
| claude/project-thread-nurd8a | 29678a00aa33ba04b69e5c1297f49065b31c8a96 | 46040967402 | CTL39 auto-merge | PASS | success |
| claude/project-thread-nurd8a | c5ae334e165572b65fc76aa2dd3f7559c68d006d | 46040790826 | CTL39 auto-merge | PASS | success |
| wire/promotion-source-plain | 3d216e5973b5a6786f2c7ed7d2b9de95737c2cd2 | 46040757054 | CTL37 freshness | PASS | success |
| claude/sync-wire-promotion-source | 397b1afb7bdebb08f798034b19df90d32882ad80 | 46040690724 | CTL39 auto-merge | PASS | success |
| claude/sync-wire-promotion-source | 397b1afb7bdebb08f798034b19df90d32882ad80 | 46040685873 | CTL38 synchronization | PASS | success |
| testing/c84-act | ddd6fb8aabfdde88ee4bb14512e4a96124489f70 | 46040595935 | CTL39 auto-merge | PASS | success |
| claude/project-thread-nurd8a | fef0a85e7a58e8bb8b98eebe88077078bce3ad40 | 46040313669 | CTL39 auto-merge | PASS | success |
| testing/c84-do | 0d5db321245c2db7b414f143ed6c1f5a0c3bb7b3 | 46039934286 | CTL39 auto-merge | PASS | success |
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

Natural failures on which the old check and the new entry agree. It is a verdict observation, not a PASS agreement, and it is not in the A total above (which counts PASS rows only). It is also not provoked, so it is not counted as P.

| Branch | Revision (head) | Run | Entry | Verdict | Old check `Branching` |
| --- | --- | --- | --- | --- | --- |
| kaal/release/promotion-source-plain | dd4d97a1671877920933220b1f3edba12c4d435a | 46032357568 | CTL37 freshness | REPORT | failure |
| kaal/release/inspector-app | 8e6503f47aaee64f8d999fa13da0770101736560 | 46044908973 | CTL37 freshness | REPORT | failure |
| kaal/release/ledger-counts | 8e69ef50994d66ab0facaecb473fd160950bd307 | 46046370396 | CTL37 freshness | REPORT | failure |
| kaal/hosting/judged-revision | e6975f1715f2f7651c5af90012cc8acf795534dc | 46046400347 | CTL37 freshness | REPORT | failure |
| kaal/release/ledger-counts | e15fb77cec19bd3a0f6b23c0f186f0ebb90a1706 | 46046857057 | CTL37 freshness | REPORT | failure |
| kaal/release/ledger-counts | d5758a250a4c342221152f0f0bbae5c65c0de5aa | 46048918355 | CTL37 freshness | REPORT | failure |

## Counting P (provoked, REPORT with old failure, same revision)

| Pull request | Revision (head) | Entry | Verdict | Old check |
| --- | --- | --- | --- | --- |
| #2816 (probe) | 53c591d7b56b9e3efb7608ca9e6d88557e66ec6a | CTL37 freshness | REPORT | failure |
| #2817 (probe) | 0a8d350a41aa97cfd0ace4342357cd24fbe2abc4 | CTL37 freshness | REPORT | failure |
| #2818 (probe) | e62b2897d5e8cd3fd5fe06b3f1f5a503fc641566 | CTL37 freshness | REPORT | failure |
| #2899 (probe) | c9489246be1f2cd8871ec9c6a96c1ed40c03640e | CTL38 synchronization | REPORT | failure |
| #2900 (probe) | 41f5bb74d2de8e22bbdcd93cef97135c171de078 | CTL38 synchronization | REPORT | failure |
| #2901 (probe) | 54469ae7996511bb70c7cf3f59f3cce42ecb38ae | CTL38 synchronization | REPORT | failure |
| #2899 (probe, auto-merge enabled with squash) | c9489246be1f2cd8871ec9c6a96c1ed40c03640e | CTL39 auto-merge | REPORT | failure |
| #2900 (probe, auto-merge enabled with squash) | 41f5bb74d2de8e22bbdcd93cef97135c171de078 | CTL39 auto-merge | REPORT | failure |
| #2901 (probe, auto-merge enabled with squash) | 54469ae7996511bb70c7cf3f59f3cce42ecb38ae | CTL39 auto-merge | REPORT | failure |

## Not counting (all entries not applicable, no record)

| Branch | Revision (head) | Run | Why | Old check |
| --- | --- | --- | --- | --- |


## Inspected and disqualified

Two revisions carry more than one old `Branching` check run with different conclusions, so the old verdict of their runs is not read: claude/project-thread-063rup-layers-plan fdabeb5a (four runs) and kaal/release/evidence-counts 82bcde03.


The synchronization probes #2891 to #2893 (an ordinary change carrying a merge of main) were meant to provoke a refusal; old and new entries both passed them, so they are not P. They count as A for freshness above.

## Uninspected

Runs created after 19:44 UTC, except the probe runs listed above, which were read at their heads. The probes #2899 to #2901 branch from main into the collector (a main commit the collector lacks); the auto-merge REPORT came from enabling auto-merge, with squash, on a head whose synchronization verdict fails (the flow names no method). Draft probes with auto-merge off wrote no CTL39 record, and the old check judged nothing either: not applicable, counted nowhere. Auto-merge was disabled again on all three after reading and none merged.

## Open

All three provoked FAIL situations now stand at 3 of 3. The count is the CPO's to accept.
