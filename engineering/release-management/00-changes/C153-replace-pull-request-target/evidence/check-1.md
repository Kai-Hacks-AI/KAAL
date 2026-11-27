# Evidence of check 1, Change Isolation (release/CTL42, release/CTL23)

Counts follow release/C153, chapter "Amendment: the evidence before enforcement, per control". One distinct revision of one pull request counts once per control and situation. Read from this file only.

## Count at the head of this file

Read by script from the job logs of every run of `change-isolation-plain.yml` created from 14:34:47 UTC (the HOTFIX on `main`) until 19:44 UTC, plus the three probe revisions. One distinct revision counts once per control and situation. The record's `sha` equals the head of the run in every row. The old check is the check run `Change Isolation` on the same head.

| Situation | Kind | Required | Counting |
| --- | --- | --- | --- |
| PASS on an ordinary change | A | 5 | 73 |
| PASS on a WIRE (`.github` alone) | A | 5 | 9 |
| A verified synchronization, judged by its own resolutions | A | 5 | 12 |
| FAIL on `.github` mixed with another path | P | 3 | 3 |
| A head already on the default branch | N | none required (Owner, 27 Nov) | not required |
| All A together | A | 15 | 94 |

## Counting, A (verdict PASS on CTL42 and CTL23, old check success, same revision)

| Branch | Revision (head) | Run | CTL42 | CTL23 | Old check | Situation |
| --- | --- | --- | --- | --- | --- | --- |
| testing/c84-interim | 7ecabd272225899c3641017396996e7a620814e3 | 46057104861 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-do | 35423ee7e6bb91b34c4e55d60b184e6a439c2fcf | 46056861438 | PASS | PASS | success | PASS on an ordinary change |
| kaal/testing/mutation-verification | fa6be056ba383741710cacfe855e101a2f995798 | 46055857381 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-g6hmfd-sync-mutation-2 | 1fb1fd2bebc3b89fdcf2b43595a7e29a1a966c81 | 46055252192 | PASS | PASS | success | A verified synchronization |
| claude/release-c167-plan | 2687ba70020ae673d91753cb306a9c6a7986d9eb | 46055233637 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-plan | 707f4f29bb61586970428e5e19c4b4c56537ad71 | 46055184068 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c167-plan | 41af31b8853fe6aa3201a0b434eb440581f8744a | 46055175879 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-plan | ddafe91eae670e268b96d2016df4043217b6b2f3 | 46055128642 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c167-plan | 9efb58ee75778b8da2215eb3058015d365e35f80 | 46054896865 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-plan | a53c315b5a2d3632d77d39e0486e336019ee1929 | 46054831877 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c167-plan | 1c312ef541f4bc1b403a6832abe297c347f843e3 | 46052963271 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-plan | 955ae0edb6bfb1e59dec416a12ba51c96b4c063f | 46052959369 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-plan | 8a06c4e27af6c3c9d4fabf4fd698ff8911a0df60 | 46052827144 | PASS | PASS | success | PASS on an ordinary change |
| testing/c83-strict-do | ec43c1cedc23c07c668198ac4783c92dcaf7304a | 46050540997 | PASS | PASS | success | PASS on an ordinary change |
| kaal/controls/neutral-wording | 5823f0f8b6f0c9b8c55d04cba7ccdbee4a865b7b | 46050186896 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c167-plan | ed09e6c650845eae5af159557390d197e0e1cacd | 46049814119 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-plan | 796a20fca072aa68839f63813ef4ee3c07e9c646 | 46049767548 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c167-plan | bb377655ff378046ddf2dc4b825b8c6beeebfcda | 46049737646 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-plan | 0bca300d54bdfbca7e2c0abadd54510ec65c8029 | 46049548367 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-g6hmfd-sync-neutral-1 | 6341c103a224f8dd51a6da8b945b6b77d2d86d41 | 46049544283 | PASS | PASS | success | A verified synchronization |
| claude/release-c167-plan | ce4c5296c781666fb2de30395493277894d993eb | 46049084151 | PASS | PASS | success | PASS on an ordinary change |
| testing/c83-strict-plan | 5dab2c9eb035544da0e5316ddad2507cadadeebe | 46049054280 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-plan | 5d021062931d06cd4c37be71437bdfe50cd4d536 | 46048952594 | PASS | PASS | success | PASS on an ordinary change |
| kaal/release/ledger-counts | d5758a250a4c342221152f0f0bbae5c65c0de5aa | 46048918161 | PASS | PASS | success | PASS on an ordinary change |
| kaal/controls/flag-status | 26ae9185972215a5441629e807fa23857b28cc96 | 46047653153 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c167-plan | 3707596b05d3eef7dcf7fad8286b05f247a80783 | 46047417421 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c153-ledger-check4 | bd93526a7ebd11239e8c948a2f24a07c4b5a3a55 | 46047348080 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-plan | 1bf36cea9fce38d4b82027fa702a82eae0fa9a89 | 46047167648 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-flags-plan | 5b9a94a7cffb06db3d7fc2864a0e21f16fa29907 | 46047103225 | PASS | PASS | success | PASS on an ordinary change |
| kaal/release/ledger-counts | e15fb77cec19bd3a0f6b23c0f186f0ebb90a1706 | 46046857040 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-g6hmfd-sync-flagstatus-1 | 5eadd4aa9cc59d2587eb0b9d5c5a67daf7579b9e | 46046595934 | PASS | PASS | success | A verified synchronization |
| kaal/hosting/judged-revision | e6975f1715f2f7651c5af90012cc8acf795534dc | 46046400737 | PASS | PASS | success | PASS on an ordinary change |
| kaal/release/ledger-counts | 8e69ef50994d66ab0facaecb473fd160950bd307 | 46046370278 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c167-plan | cac1fd871eef0cac0b43dc296e9a91582e3b6193 | 46046221952 | PASS | PASS | success | PASS on an ordinary change |
| kaal/release/inspector-app | 8e6503f47aaee64f8d999fa13da0770101736560 | 46044908871 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c153-ledger-p-rows | f6560143e3cedc8f2fafe16294e8548fe507eb47 | 46044569183 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-nurd8a | 52da7e433fcfa85f28d05255a46cdfc2b7e4cec3 | 46044552959 | PASS | PASS | success | PASS on an ordinary change |
| wire/workflow-names-judge-run | 849934306cc657418c42068515b507d21f8f133c | 46043740270 | PASS | PASS | success | PASS on a WIRE (`.github` alone) |
| wire/c153-check4-head-3 | 6837295d762ccf2a448dccee304129f6532e1a2a | 46043671554 | PASS | PASS | success | PASS on a WIRE (`.github` alone) |
| wire/c153-check4-head-2 | c6742dbebd8805bdce25633715b84019b80a0607 | 46043663548 | PASS | PASS | success | PASS on a WIRE (`.github` alone) |
| wire/c153-check4-head-1 | 2ab802ee5c5a2b505f7c7a5244ae8255bd0e7d5e | 46043650393 | PASS | PASS | success | PASS on a WIRE (`.github` alone) |
| claude/project-thread-nurd8a | 57963d4807f15a0589d674d04f8f64106c86c2fd | 46042292350 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c153-ledger-counts | 38223b41ba7fc9671ad33e1d57a331f734aa1916 | 46041548882 | PASS | PASS | success | PASS on an ordinary change |
| claude/release-c153-ledger-counts | 8ad7230b3cd1ed16610b132a547551cdbcc9931f | 46041212249 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-nurd8a | 29678a00aa33ba04b69e5c1297f49065b31c8a96 | 46040957419 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-layers-plan | fdabeb5aceba19b74eb4a8d52b448151ef82f146 | 46040814591 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-nurd8a | c5ae334e165572b65fc76aa2dd3f7559c68d006d | 46040791093 | PASS | PASS | success | PASS on an ordinary change |
| wire/promotion-source-plain | 3d216e5973b5a6786f2c7ed7d2b9de95737c2cd2 | 46040757458 | PASS | PASS | success | PASS on a WIRE (`.github` alone) |
| claude/sync-wire-promotion-source | 397b1afb7bdebb08f798034b19df90d32882ad80 | 46040685794 | PASS | PASS | success | A verified synchronization |
| testing/c84-act | ddd6fb8aabfdde88ee4bb14512e4a96124489f70 | 46040588821 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-layers-plan | 6640836734ba533686a0ac34eaad10ac7c230be8 | 46040430981 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-nurd8a | fef0a85e7a58e8bb8b98eebe88077078bce3ad40 | 46040307739 | PASS | PASS | success | PASS on an ordinary change |
| claude/project-thread-063rup-layers-plan | 46e49db68f92e26e70252a8e790b4b615b15c220 | 46040151985 | PASS | PASS | success | PASS on an ordinary change |
| testing/c84-do | 0d5db321245c2db7b414f143ed6c1f5a0c3bb7b3 | 46039928105 | PASS | PASS | success | PASS on an ordinary change |
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

## Verified verdict, not counted as A (a REPORT with the old check failing)

Heads on a wire branch whose entries answered REPORT while the old check failed (they agree). They are verdict observations, not PASS agreements, and are not provoked for this check, so they are in neither A nor P.

| Branch | Revision (head) | Verdict CTL42 | Verdict CTL23 | Old check |
| --- | --- | --- | --- | --- |
| wire/c153-check4-head-4 | 1eabdb96d2bf | REPORT | REPORT | failure |
| wire/c153-check4-head-5 | b6e95e9b9882 | REPORT | REPORT | failure |
| wire/c153-check4-head-6 | 3cadd2af5b62 | REPORT | REPORT | failure |

## Inspected and disqualified (record sha is the merge commit)

| Pull request | Revision (head) | Run | Verdict of the entry | Old check | Why not counting |
| --- | --- | --- | --- | --- | --- |
| #2816 (provoked, `.github` mixed) | d836d9365b305d611b13fb5a38ac59da26851335 | 46000343997 | REPORT (CTL42), record sha d4751363… | Change Isolation: failure | record names the merge commit, not the head (release/D20) |

## Uninspected

Runs created after 19:44 UTC and the runs of #2787 and #2811 (before the HOTFIX, disqualified by the same rule once read).

## Open

Every situation of this check is met (the WIRE PASS situation stands at 9 of 5). The count is the CPO's to accept: the HOTFIX establishes eligibility, not automatic credit.
