# Evidence of check 1, Change Isolation (release/CTL42, release/CTL23)

Counts follow release/C153, chapter "Amendment: the evidence before enforcement, per control". One distinct revision of one pull request counts once per control and situation. Read from this file only.

## Count at the head of this file

Read by script from the job logs of every run of `change-isolation-plain.yml` created from 14:34:47 UTC (the HOTFIX on `main`) until 17:09 UTC, plus the three probe revisions. One distinct revision counts once per control and situation. The record's `sha` equals the head of the run in every row. The old check is the check run `Change Isolation` on the same head.

| Situation | Kind | Required | Counting |
| --- | --- | --- | --- |
| PASS on an ordinary change | A | 5 | 28 |
| PASS on a WIRE (`.github` alone) | A | 5 | 4 |
| A verified synchronization, judged by its own resolutions | A | 5 | 8 |
| FAIL on `.github` mixed with another path | P | 3 | 3 |
| A head already on the default branch | N | none required (Owner, 27 Nov) | not required |
| All A together | A | 15 | 40 |

## Counting, A (verdict PASS on CTL42 and CTL23, old check success, same revision)

| Branch | Revision (head) | Run | CTL42 | CTL23 | Old check | Situation |
| --- | --- | --- | --- | --- | --- | --- |
| claude/release-c153-ledger-counts | 82bcde03b7d2f0262ae182415f40fe85f8e80390 | 46039384038 | PASS | PASS | success | PASS on an ordinary change |
| wire/promotion-source-plain | 61e02fccc79d4d44cc841c1abf06a158f3ac4108 | 46038536538 | PASS | PASS | success | PASS on a WIRE (`.github` alone) |
| wire/codeql-judge-run | 47d49ce20160ee86b1191d1bcb68403603ae5f0c | 46038350034 | PASS | PASS | success | PASS on a WIRE (`.github` alone) |
| claude/sync-wire-codeql | 73531de3bbc38312d63f5d0d4f1c5bca75760b1e | 46038276584 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-nurd8a | 0cdda641b5a55e6ff48ee98aad043e79dc196a42 | 46038197192 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-nurd8a | 88ebf31057fafc0370541337916df4629bc4b0ef | 46038153126 | PASS | PASS | success | PASS on an ordinary change |
| testing/c84-judged-revision-plan | e2ae023d34365f4b05661309499dd4ac50355d5d | 46037815058 | PASS | PASS | success | PASS on an ordinary change |
| kaal/release/promotion-source-plain | d9f4a3c3d93fbdcfe650e5cff52f675c967ecbc7 | 46036612572 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-g6hmfd-sync-psp-2 | ef10cbf3133bcb598ec32fa31eb6ce15ec47a2b9 | 46035937923 | PASS | PASS | success | A verified synchronization |
| claude/project-thread-nurd8a | 11d2448e2f69331144fff4eb7fd4fa4743f515e0 | 46035836583 | PASS | PASS | success | PASS on an ordinary change |
| testing/c84-judged-revision-plan | 0e7694590ff00d64142a08075bb8298b287988b4 | 46035519739 | PASS | PASS | success | PASS on an ordinary change |
| wire/codeql-judge-run | 39dd9885cc4685791f246dcafa050b6ba27c64dc | 46034191363 | PASS | PASS | success | PASS on a WIRE (`.github` alone) |
| kaal/release/evidence-amendment | a847ba108fd275e17f1456b7c6697305465b77d0 | 46033135752 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-nurd8a | f674f69ae8a759fcbad0be0ec95a9a2e356b7891 | 46033055950 | PASS | PASS | success | PASS on an ordinary change |
| testing/c84-judged-revision-plan | d6caf406c23b59aa46bec5dc4465931304b18e20 | 46032520048 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-g6hmfd-sync-release-evidence-amendment-1 | aefb7bc741b6a16e6d42b5a23cc9813f49190f7f | 46032380669 | PASS | PASS | success | A verified synchronization |
| kaal/release/promotion-source-plain | dd4d97a1671877920933220b1f3edba12c4d435a | 46032357498 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c159-act | a427c28c2354bad4e7b2993a47cf719c051bfec8 | 46031668676 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c159-do2 | 694682a90f843e739f1da7eaa9e8022ab6b8932c | 46030777959 | PASS | PASS | success | PASS on an ordinary change |
| kaal/engineering/controls-callers | a0996ab9c8934beb9c34d951a081a6a2e589d38c | 46030470146 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c159-sync | 558755bc2b954f239fec79ce9231b5e13e14358f | 46029976543 | PASS | PASS | success | A verified synchronization |
| claude/project-thread-g6hmfd-sync-engineering-controls-callers-1 | 5a24eebab027a5ee4698b9205555f585857580c0 | 46029801131 | PASS | PASS | success | A verified synchronization |
| wire/branching-plain | 2e75fd9142e064f05c02091aa46484221c685dab | 46028266423 | PASS | PASS | success | PASS on a WIRE (`.github` alone) |
| testing/c83-restore | 8fb488342772d7f65c5008e87513166006fceee8 | 46027859017 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c153-evidence-files | a194fbe8366832efcd8b6d780bc5d96b330edff5 | 46027489946 | PASS | PASS | success | PASS on an ordinary change |
| testing/c83-sync-main | aa24c742c58593474adaba5b6bf98fd88602cd82 | 46026954145 | PASS | PASS | success | A verified synchronization |
| kaal/release/branching-plain | 20e49266080edaaf46e82de672f773a581e2c08e | 46026894447 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-g6hmfd-sync-release-branching-plain-2 | 1647984cdcebd883ed2f14942b8f35110444c8d9 | 46026180558 | PASS | PASS | success | A verified synchronization |
| kaal/engineering/source-split | 7658b310475258d202fa2d95e7d411e439b015a2 | 46023398183 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-g6hmfd-sync-engineering-source-split-3 | c981b62b7ee15b82e77715b89948df0a13a22a87 | 46022383788 | PASS | PASS | success | A verified synchronization |
| kaal/engineering/controls-callers | 541dde0767ad9a8c9906bb5a92ba2a13323dd2b7 | 46022023395 | PASS | PASS | success | PASS on an ordinary change |
| claude/eng-controls-callers-proposal | 1b83cf68baab7df2ab101802ce5cb75ed1b13199 | 46021005472 | PASS | PASS | success | PASS on an ordinary change |
| kaal/engineering/controls-callers | 37857b6f0185302733bedb0e2f3874a7a2b3a1bc | 46020970204 | PASS | PASS | success | PASS on an ordinary change |
| claude/eng-controls-callers-cases | a0ed1a995f992f163f4aae31d98d20a17bf5e217 | 46019268023 | PASS | PASS | success | PASS on an ordinary change |
| kaal/release/merge-group-review-events | 5474b67e6df4cde2b8a83f312cd7f82f95213a63 | 46019250160 | PASS | PASS | success | PASS on an ordinary change |
| claude/eng-controls-callers-proposal | 8628f160dfb357cfcd7f99fe126c317713d6ba26 | 46019061627 | PASS | PASS | success | PASS on an ordinary change |
| kaal/hosting/github-waiting | 2f01dfd4c6e9b79ee965fc50ed61037f49691a69 | 46019024003 | PASS | PASS | success | PASS on an ordinary change |
| kaal/engineering/controls-callers | 3233b60f34bc6ef2287a2735149771988138bbcb | 46018767925 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-nurd8a | 6c53867d4ec6f89ec8f96f92436e23825a91c76e | 46018040690 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-g6hmfd-sync-release-merge-group-review-events-1 | a002a7c85de92416888fd117027de28e6367a412 | 46018034439 | PASS | PASS | success | A verified synchronization |

## Counting, P (provoked, verdict REPORT on both entries, old check failure, same revision)

| Pull request | Revision (head) | CTL42 | CTL23 | Old check | Situation |
| --- | --- | --- | --- | --- | --- |
| #2816 (probe) | 53c591d7b56b9e3efb7608ca9e6d88557e66ec6a | REPORT | REPORT | failure | FAIL on `.github` mixed with another path |
| #2817 (probe) | 0a8d350a41aa97cfd0ace4342357cd24fbe2abc4 | REPORT | REPORT | failure | FAIL on `.github` mixed with another path |
| #2818 (probe) | e62b2897d5e8cd3fd5fe06b3f1f5a503fc641566 | REPORT | REPORT | failure | FAIL on `.github` mixed with another path |

## Inspected and disqualified (record sha is the merge commit)

| Pull request | Revision (head) | Run | Verdict of the entry | Old check | Why not counting |
| --- | --- | --- | --- | --- | --- |
| #2816 (provoked, `.github` mixed) | d836d9365b305d611b13fb5a38ac59da26851335 | 46000343997 | REPORT (CTL42), record sha d4751363… | Change Isolation: failure | record names the merge commit, not the head (release/D20) |

## Uninspected

Runs created after 17:09 UTC and the runs of #2787 and #2811 (before the HOTFIX, disqualified by the same rule once read).

## Open

A PASS on a WIRE needs 5 and has {cnt['PASS on a WIRE (`.github` alone)']}: any further WIRE revision counts. The count is the CPO's to accept: the HOTFIX establishes eligibility, not automatic credit.
