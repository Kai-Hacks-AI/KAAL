# Evidence of check 3, admission of Change Isolation (review) (release/C157, not a control)

Admission is not verification and has no PASS or FAIL record, so no refused pull request is asked for. Counts follow release/C153, chapter "Amendment: the evidence before enforcement, per control". Read by script from every run of `change-isolation-admission-plain.yml` created from 12:05 UTC (its WIRE) until 19:44 UTC, and every `merge_group` run of `merge-group-review.yml` in the same time.

## Count at the head of this file (numerical thresholds only; the trusted-execution proof is separate, see Open)

| Situation | Required | Counting |
| --- | --- | --- |
| Pull request revisions admitted, in agreement with the old check on the same revision | 5 | 174 |
| Merge-group runs whose Review verdict the admission leaves unchanged | 5 | 16 |

## Admitted (job `Change Isolation (review, plain pull_request)` success, old check `Change Isolation (review)` success, same revision)

| Branch | Revision (head) | Run | New | Old |
| --- | --- | --- | --- | --- |
| claude/project-thread-g6hmfd-sync-flagfile-1 | 6dcb841ed56d5e539e97849aa3baa64e5695dc38 | 46058226799 | success | success |
| testing/c84-interim | fb10b27f0e0feb9b81c97bd826768fd848638918 | 46057665319 | success | success |
| claude/project-thread-063rup-flags-act | 98aca0b55df1f9147314a319b987f4ae872a7250 | 46057647519 | success | success |
| testing/c84-interim | 7ef3423dea2df6ffc105ec133ab7a209066569ec | 46057232803 | success | success |
| testing/c84-interim | 7ecabd272225899c3641017396996e7a620814e3 | 46057104938 | success | success |
| claude/project-thread-063rup-flags-do | 35423ee7e6bb91b34c4e55d60b184e6a439c2fcf | 46056861427 | success | success |
| kaal/testing/mutation-verification | fa6be056ba383741710cacfe855e101a2f995798 | 46055857328 | success | success |
| claude/project-thread-g6hmfd-sync-mutation-2 | 1fb1fd2bebc3b89fdcf2b43595a7e29a1a966c81 | 46055252668 | success | success |
| claude/release-c167-plan | 2687ba70020ae673d91753cb306a9c6a7986d9eb | 46055233534 | success | success |
| claude/project-thread-063rup-flags-plan | 707f4f29bb61586970428e5e19c4b4c56537ad71 | 46055184049 | success | success |
| claude/release-c167-plan | 41af31b8853fe6aa3201a0b434eb440581f8744a | 46055175891 | success | success |
| claude/project-thread-063rup-flags-plan | ddafe91eae670e268b96d2016df4043217b6b2f3 | 46055128433 | success | success |
| claude/release-c167-plan | 9efb58ee75778b8da2215eb3058015d365e35f80 | 46054896549 | success | success |
| claude/project-thread-063rup-flags-plan | a53c315b5a2d3632d77d39e0486e336019ee1929 | 46054831781 | success | success |
| claude/release-c167-plan | 1c312ef541f4bc1b403a6832abe297c347f843e3 | 46052963508 | success | success |
| claude/project-thread-063rup-flags-plan | 955ae0edb6bfb1e59dec416a12ba51c96b4c063f | 46052959443 | success | success |
| claude/project-thread-063rup-flags-plan | 8a06c4e27af6c3c9d4fabf4fd698ff8911a0df60 | 46052827208 | success | success |
| testing/c83-strict-do | ec43c1cedc23c07c668198ac4783c92dcaf7304a | 46050540985 | success | success |
| kaal/controls/neutral-wording | 5823f0f8b6f0c9b8c55d04cba7ccdbee4a865b7b | 46050186853 | success | success |
| claude/release-c167-plan | ed09e6c650845eae5af159557390d197e0e1cacd | 46049814129 | success | success |
| claude/project-thread-063rup-flags-plan | 796a20fca072aa68839f63813ef4ee3c07e9c646 | 46049767583 | success | success |
| claude/release-c167-plan | bb377655ff378046ddf2dc4b825b8c6beeebfcda | 46049737801 | success | success |
| claude/project-thread-063rup-flags-plan | 0bca300d54bdfbca7e2c0abadd54510ec65c8029 | 46049548600 | success | success |
| claude/project-thread-g6hmfd-sync-neutral-1 | 6341c103a224f8dd51a6da8b945b6b77d2d86d41 | 46049544249 | success | success |
| claude/release-c167-plan | ce4c5296c781666fb2de30395493277894d993eb | 46049084039 | success | success |
| testing/c83-strict-plan | 5dab2c9eb035544da0e5316ddad2507cadadeebe | 46049054416 | success | success |
| claude/project-thread-063rup-flags-plan | 5d021062931d06cd4c37be71437bdfe50cd4d536 | 46048952463 | success | success |
| claude/project-thread-063rup-flags-plan | 7c55186575ddb58da67f5869a40045a67e49cfed | 46048938237 | success | success |
| kaal/release/ledger-counts | d5758a250a4c342221152f0f0bbae5c65c0de5aa | 46048918137 | success | success |
| kaal/controls/flag-status | 26ae9185972215a5441629e807fa23857b28cc96 | 46047652840 | success | success |
| claude/release-c167-plan | 3707596b05d3eef7dcf7fad8286b05f247a80783 | 46047417520 | success | success |
| claude/release-c153-ledger-check4 | bd93526a7ebd11239e8c948a2f24a07c4b5a3a55 | 46047348013 | success | success |
| claude/project-thread-063rup-flags-plan | 1bf36cea9fce38d4b82027fa702a82eae0fa9a89 | 46047169616 | success | success |
| claude/project-thread-063rup-flags-plan | 5b9a94a7cffb06db3d7fc2864a0e21f16fa29907 | 46047103105 | success | success |
| kaal/release/ledger-counts | e15fb77cec19bd3a0f6b23c0f186f0ebb90a1706 | 46046857115 | success | success |
| claude/project-thread-g6hmfd-sync-flagstatus-1 | 5eadd4aa9cc59d2587eb0b9d5c5a67daf7579b9e | 46046596451 | success | success |
| kaal/hosting/judged-revision | e6975f1715f2f7651c5af90012cc8acf795534dc | 46046400341 | success | success |
| kaal/release/ledger-counts | 8e69ef50994d66ab0facaecb473fd160950bd307 | 46046370179 | success | success |
| claude/release-c167-plan | cac1fd871eef0cac0b43dc296e9a91582e3b6193 | 46046221785 | success | success |
| kaal/release/inspector-app | 8e6503f47aaee64f8d999fa13da0770101736560 | 46044909015 | success | success |
| claude/release-c153-ledger-p-rows | f6560143e3cedc8f2fafe16294e8548fe507eb47 | 46044569211 | success | success |
| claude/project-thread-nurd8a | 52da7e433fcfa85f28d05255a46cdfc2b7e4cec3 | 46044553033 | success | success |
| wire/c153-check4-head-6 | 3cadd2af5b62b70987f1345436d4814eb1697303 | 46044525849 | success | success |
| wire/c153-check4-head-5 | b6e95e9b9882c6a5acc3d49795fa0f42640c3bc8 | 46044516670 | success | success |
| wire/c153-check4-head-4 | 1eabdb96d2bff3213b3b4a107c1cbce55afee8cd | 46044505409 | success | success |
| wire/workflow-names-judge-run | 849934306cc657418c42068515b507d21f8f133c | 46043740186 | success | success |
| wire/c153-check4-head-3 | 6837295d762ccf2a448dccee304129f6532e1a2a | 46043671747 | success | success |
| wire/c153-check4-head-2 | c6742dbebd8805bdce25633715b84019b80a0607 | 46043663325 | success | success |
| wire/c153-check4-head-1 | 2ab802ee5c5a2b505f7c7a5244ae8255bd0e7d5e | 46043650341 | success | success |
| probe/c153-check4-origin-3 | 78b7d5213cd7d67c969daba92457438953bc2579 | 46043642062 | success | success |
| probe/c153-check4-origin-2 | cf782d23f6e059158bcb68d0a3ba4fc9d738118a | 46043629914 | success | success |
| probe/c153-check4-origin-1 | e5f8cb42d54dc51f186d30a2b358e98f2a21ffc9 | 46043620485 | success | success |
| probe/c153-check2-ctl38-3 | 54469ae7996511bb70c7cf3f59f3cce42ecb38ae | 46042573267 | success | success |
| probe/c153-check2-ctl38-2 | 41f5bb74d2de8e22bbdcd93cef97135c171de078 | 46042572225 | success | success |
| probe/c153-check2-ctl38-1 | c9489246be1f2cd8871ec9c6a96c1ed40c03640e | 46042568928 | success | success |
| probe/c153-check3-edit-marker | a7d63dc4070137d1efc2f480b8b97041ab226f95 | 46042387708 | success | success |
| claude/project-thread-nurd8a | 57963d4807f15a0589d674d04f8f64106c86c2fd | 46042292427 | success | success |
| claude/release-c153-ledger-counts | 38223b41ba7fc9671ad33e1d57a331f734aa1916 | 46041548692 | success | success |
| probe/c153-check2-ctl39-3 | d862b0c8c4ad96904b72cd199aaab18e763ad4d4 | 46041474442 | success | success |
| probe/c153-check2-ctl39-2 | 3976ce5262b44c972b54b882b8c5411879a6a118 | 46041471451 | success | success |
| probe/c153-check2-ctl39-1 | ce5ae44a00ab16e114643ef62bcae52e1adc5bf1 | 46041467896 | success | success |
| claude/release-c153-ledger-counts | 8ad7230b3cd1ed16610b132a547551cdbcc9931f | 46041213072 | success | success |
| claude/project-thread-nurd8a | 29678a00aa33ba04b69e5c1297f49065b31c8a96 | 46040957454 | success | success |
| claude/project-thread-063rup-layers-plan | fdabeb5aceba19b74eb4a8d52b448151ef82f146 | 46040814558 | success | success |
| claude/project-thread-nurd8a | c5ae334e165572b65fc76aa2dd3f7559c68d006d | 46040790799 | success | success |
| wire/promotion-source-plain | 3d216e5973b5a6786f2c7ed7d2b9de95737c2cd2 | 46040756946 | success | success |
| claude/sync-wire-promotion-source | 397b1afb7bdebb08f798034b19df90d32882ad80 | 46040686128 | success | success |
| testing/c84-act | ddd6fb8aabfdde88ee4bb14512e4a96124489f70 | 46040588752 | success | success |
| claude/project-thread-063rup-layers-plan | 6640836734ba533686a0ac34eaad10ac7c230be8 | 46040430792 | success | success |
| claude/project-thread-063rup-layers-plan | fcb93335a36681349c17202e329ad8e2d52b462e | 46040392498 | success | success |
| claude/project-thread-nurd8a | fef0a85e7a58e8bb8b98eebe88077078bce3ad40 | 46040308106 | success | success |
| probe/c153-check2-sync-3 | 2e5dac54b7cf5506bd8f556a416e356cbf1d6c8f | 46040187794 | success | success |
| probe/c153-check2-sync-2 | acdee033fb2b1991d48ca2fe85a1b2ba01e2569c | 46040183284 | success | success |
| probe/c153-check2-sync-1 | 530e63fd3dd0e3e68b3bcf185bc84733a8e3b5c0 | 46040176794 | success | success |
| claude/project-thread-063rup-layers-plan | 46e49db68f92e26e70252a8e790b4b615b15c220 | 46040151673 | success | success |
| probe/c153-check1-mixed-3 | e62b2897d5e8cd3fd5fe06b3f1f5a503fc641566 | 46040130935 | success | success |
| probe/c153-check1-mixed-2 | 0a8d350a41aa97cfd0ace4342357cd24fbe2abc4 | 46040120967 | success | success |
| probe/c153-check1-mixed-1 | 53c591d7b56b9e3efb7608ca9e6d88557e66ec6a | 46040117248 | success | success |
| testing/c84-do | 0d5db321245c2db7b414f143ed6c1f5a0c3bb7b3 | 46039928038 | success | success |
| claude/release-c153-ledger-counts | 82bcde03b7d2f0262ae182415f40fe85f8e80390 | 46039383818 | success | success |
| wire/promotion-source-plain | 61e02fccc79d4d44cc841c1abf06a158f3ac4108 | 46038536530 | success | success |
| wire/codeql-judge-run | 47d49ce20160ee86b1191d1bcb68403603ae5f0c | 46038349951 | success | success |
| claude/project-thread-nurd8a | 0cdda641b5a55e6ff48ee98aad043e79dc196a42 | 46038197261 | success | success |
| claude/sync-wire-codeql | 73531de3bbc38312d63f5d0d4f1c5bca75760b1e | 46038190896 | success | success |
| claude/project-thread-nurd8a | 88ebf31057fafc0370541337916df4629bc4b0ef | 46038138340 | success | success |
| testing/c84-judged-revision-plan | e2ae023d34365f4b05661309499dd4ac50355d5d | 46037800782 | success | success |
| kaal/release/promotion-source-plain | d9f4a3c3d93fbdcfe650e5cff52f675c967ecbc7 | 46036614706 | success | success |
| claude/project-thread-g6hmfd-sync-psp-2 | ef10cbf3133bcb598ec32fa31eb6ce15ec47a2b9 | 46035937903 | success | success |
| claude/project-thread-nurd8a | 11d2448e2f69331144fff4eb7fd4fa4743f515e0 | 46035822942 | success | success |
| testing/c84-judged-revision-plan | 0e7694590ff00d64142a08075bb8298b287988b4 | 46035519452 | success | success |
| wire/codeql-judge-run | 39dd9885cc4685791f246dcafa050b6ba27c64dc | 46034191678 | success | success |
| kaal/release/evidence-amendment | a847ba108fd275e17f1456b7c6697305465b77d0 | 46033135762 | success | success |
| claude/project-thread-nurd8a | f674f69ae8a759fcbad0be0ec95a9a2e356b7891 | 46033055965 | success | success |
| testing/c84-judged-revision-plan | d6caf406c23b59aa46bec5dc4465931304b18e20 | 46032519926 | success | success |
| claude/project-thread-g6hmfd-sync-release-evidence-amendment-1 | aefb7bc741b6a16e6d42b5a23cc9813f49190f7f | 46032380720 | success | success |
| kaal/release/promotion-source-plain | dd4d97a1671877920933220b1f3edba12c4d435a | 46032357680 | success | success |
| claude/release-c159-act | a427c28c2354bad4e7b2993a47cf719c051bfec8 | 46031668598 | success | success |
| claude/release-c159-do2 | 694682a90f843e739f1da7eaa9e8022ab6b8932c | 46030777730 | success | success |
| kaal/engineering/controls-callers | a0996ab9c8934beb9c34d951a081a6a2e589d38c | 46030471845 | success | success |
| claude/release-c159-sync | 558755bc2b954f239fec79ce9231b5e13e14358f | 46029882232 | success | success |
| claude/project-thread-g6hmfd-sync-engineering-controls-callers-1 | 5a24eebab027a5ee4698b9205555f585857580c0 | 46029800618 | success | success |
| wire/branching-plain | 2e75fd9142e064f05c02091aa46484221c685dab | 46028266476 | success | success |
| testing/c83-restore | 8fb488342772d7f65c5008e87513166006fceee8 | 46027858864 | success | success |
| claude/release-c153-evidence-files | a194fbe8366832efcd8b6d780bc5d96b330edff5 | 46027490046 | success | success |
| testing/c83-sync-main | aa24c742c58593474adaba5b6bf98fd88602cd82 | 46026953612 | success | success |
| kaal/release/branching-plain | 20e49266080edaaf46e82de672f773a581e2c08e | 46026895838 | success | success |
| claude/project-thread-g6hmfd-sync-release-branching-plain-2 | 1647984cdcebd883ed2f14942b8f35110444c8d9 | 46026180041 | success | success |
| kaal/engineering/source-split | 7658b310475258d202fa2d95e7d411e439b015a2 | 46023398812 | success | success |
| claude/project-thread-g6hmfd-sync-engineering-source-split-3 | c981b62b7ee15b82e77715b89948df0a13a22a87 | 46022383835 | success | success |
| kaal/engineering/controls-callers | 541dde0767ad9a8c9906bb5a92ba2a13323dd2b7 | 46022024054 | success | success |
| claude/eng-controls-callers-proposal | 1b83cf68baab7df2ab101802ce5cb75ed1b13199 | 46021005167 | success | success |
| kaal/engineering/controls-callers | 37857b6f0185302733bedb0e2f3874a7a2b3a1bc | 46020969992 | success | success |
| claude/eng-controls-callers-cases | a0ed1a995f992f163f4aae31d98d20a17bf5e217 | 46019268105 | success | success |
| kaal/release/merge-group-review-events | 5474b67e6df4cde2b8a83f312cd7f82f95213a63 | 46019254317 | success | success |
| claude/eng-controls-callers-proposal | 8628f160dfb357cfcd7f99fe126c317713d6ba26 | 46019061917 | success | success |
| kaal/hosting/github-waiting | 2f01dfd4c6e9b79ee965fc50ed61037f49691a69 | 46019024417 | success | success |
| kaal/engineering/controls-callers | 3233b60f34bc6ef2287a2735149771988138bbcb | 46018767752 | success | success |
| claude/project-thread-nurd8a | 6c53867d4ec6f89ec8f96f92436e23825a91c76e | 46018040985 | success | success |
| claude/project-thread-g6hmfd-sync-release-merge-group-review-events-1 | a002a7c85de92416888fd117027de28e6367a412 | 46018034109 | success | success |
| claude/project-thread-nurd8a | 1e5250aa9278884a73aa5ac634bc129b85de11a5 | 46016376753 | success | success |
| claude/eng-controls-callers-act | 63f1e1235a7d75fd0a8d44eee31cf4ce31058447 | 46016209430 | success | success |
| claude/eng-controls-callers-cases | 76a1975dcd5ff4a0bf62263a5215552bce544941 | 46016171923 | success | success |
| claude/eng-controls-callers-act | 032168a7b249955e1de04b1e74b9747bf835c6d4 | 46016118618 | success | success |
| claude/eng-controls-callers-cases | 72f067e7c3944434fe746d718c82744b8d798565 | 46016100509 | success | success |
| claude/eng-controls-callers-act | bfefeefb0df4441bde95935984dbf426408848af | 46015770109 | success | success |
| claude/project-thread-nurd8a | 5e2f03e9d2f6bffb50ef7cd532763635093c48fd | 46015732407 | success | success |
| claude/eng-controls-callers-do | 7e5920a8ae9833090e0b6906fb481d8cc2fd258b | 46011114526 | success | success |
| claude/project-thread-nurd8a | eb145d2043fff50982ba5ee4ae8fb9911e39b484 | 46010884954 | success | success |
| claude/project-thread-nurd8a | 3e74efe60b9ff1222755ab47a6ed0c87331bfb2e | 46009835727 | success | success |
| hotfix/record-judged-head | d2581b7001b97266e269ce8ba8816cb8c4e75a88 | 46007476012 | success | success |
| kaal/release/branching-plain | 858ce8803ed406249f007ff48bb7ed8627ce1239 | 46007420515 | success | success |
| kaal/core/skill-standard | ef5a7fa4234b0e85ce135514f0547e684587ba28 | 46007001677 | success | success |
| claude/release-c153-evidence-files | 8e23573d8ef43d1b1d836b9d17f3d430d5431211 | 46007001006 | success | success |
| kaal/engineering/source-split | 4d75898d6785900fda94f7e0b4373b330ff7a99c | 46006671025 | success | success |
| kaal/core/exchange | 6c8da82f1dceb124f2dc4951c089153b0d0dba26 | 46006168251 | success | success |
| claude/core-identity-plan | 6de3e35e8d9bf91f1c754e1e5bb0f50d92deacb4 | 46006165624 | success | success |
| claude/core-identity-plan | d3ebb8d60b6e763d36e66c47bde070d4519c5d88 | 46006009132 | success | success |
| claude/eng-controls-callers-plan | 78dbaea45f6ea87757b16e47236881d343db4cef | 46005649287 | success | success |
| claude/eng-controls-callers-plan | 718626188d42eae3b29b97c5913c7b2fac650934 | 46005423955 | success | success |
| kaal/core/installation-integrity | 9430531d6dd26dbb2c320f961e54ad72cddb8af9 | 46005266589 | success | success |
| kaal/core/repo-free-skill | 3988d5a04c706b18411ff0d76b6bb97bdf981c0b | 46004965364 | success | success |
| kaal/core/skill-license | 8df159bd01bd260863ec4abc182788c2e972f096 | 46004570652 | success | success |
| kaal/hosting/github-app-adapter | d1e392fe67f62726501e263cc229f68ed92d361b | 46003769151 | success | success |
| claude/project-thread-g6hmfd-sync-engineering-source-split-2 | 9661f754e4288eb3cf73f714e0cb1973a9476325 | 46003476153 | success | success |
| claude/release-c158-head-sha | dc4b46dcd021c189ac3df32d3fa56a40ae10ea98 | 46003393003 | success | success |
| claude/release-c166-hotfix | 890b2028ff2c301dd0b87da8d5356c4bb3e0ceb2 | 46003205420 | success | success |
| kaal/release/branching-plain | 608c9e52c8da82a23e7658ee3b6ef7a3d35be7bb | 46003151039 | success | success |
| hotfix/record-judged-head | e1b880b76891a3e2bee0e99f14fce481319ab98d | 46003066505 | success | success |
| claude/project-thread-g6hmfd-sync-controls-flag-status-1 | 304ba578c4e3143873b9caf941e9a3b34a6e4021 | 46003031373 | success | success |
| hotfix/record-judged-head | 0d25b8a625a3193d8c6bb9b80c731371f7763f21 | 46003002877 | success | success |
| claude/project-thread-g6hmfd-sync-hotfix-record-judged-head-1 | ceb0bc492b359a436e11162d278e98a59d28563b | 46002980701 | success | success |
| kaal/engineering/source-split | 274a4a34916b972980c190e82346aeb43e65d978 | 46002169856 | success | success |
| claude/core-identity-plan | 2b5f4393a9e97de7969f9af5adb4870ea4441c66 | 46002170758 | success | success |
| claude/core-identity-plan | 47a2d0a854298bbc362ea1f8d9776ab3190dfd9d | 46001990347 | success | success |
| claude/release-c153-evidence-2 | f9b374ef40b104ff1fa28bfb3a1c6c1d9a89649a | 46001883464 | success | success |
| claude/project-thread-063rup-flag-sync | 8d90214bad9c990923de8ef6eb5d103d398ed9d4 | 46000904320 | success | success |
| claude/release-c153-evidence-2 | ada7f063276cbded84bf6199199c0703f91d4c7b | 46000853125 | success | success |
| claude/project-thread-g6hmfd-sync-core-exchange-1 | 143c63e9543ac144044d5131526ff2a88d76a7f4 | 46000746130 | success | success |
| claude/project-thread-g6hmfd-sync-core-skill-license-1 | 2d49f99b424c686defa6c6c3b85c8593055182fe | 46000739349 | success | success |
| claude/project-thread-g6hmfd-sync-core-repo-free-skill-1 | 3af06eac7072c6fe9ad6c750e7dcfc166336bbff | 46000734132 | success | success |
| claude/project-thread-g6hmfd-sync-core-skill-standard-1 | be31d7f5ba0b5f55cfc7bfc0243c45c4ac279fca | 46000725910 | success | success |
| claude/project-thread-g6hmfd-sync-core-installation-integrity-1 | ca218db2545f49c1929c350bd23bd1ed71e743ae | 46000718982 | success | success |
| claude/project-thread-g6hmfd-sync-hosting-github-app-adapter-1 | 59da9b4aba798ac2a8b65d2f18313e5894aa82dc | 46000712591 | success | success |
| claude/project-thread-g6hmfd-sync-change-declared-or-none-1 | b070213b5fa4f2c89fd8ae1a7aebd2f2135f876f | 46000705111 | success | success |
| claude/project-thread-g6hmfd-sync-controls-neutral-wording-1 | 72648aa9b578fb4d1ce81ef59e742dd25b43f55f | 46000700642 | success | success |
| claude/project-thread-g6hmfd-sync-release-branching-plain-1 | b93ee9748099799b48a95a624fb32d6bcb3bae54 | 46000693340 | success | success |
| claude/project-thread-g6hmfd-sync-engineering-source-split-1 | b7ba692f4c0ed3bb35f0261a7a0ee788e83e7dcc | 46000687323 | success | success |
| claude/release-c165-hotfix | 0c6015d70e024e955e3036e333e61f64565e542d | 46000596466 | success | success |
| probe/c153-check1-mixed-3 | 8dff4c2625f8593a30f91154322a4e20f16be079 | 46000359669 | success | success |
| probe/c153-check1-mixed-2 | 552834b37775af7398def22178c5c398e4d6a354 | 46000350604 | success | success |
| probe/c153-check1-mixed-1 | d836d9365b305d611b13fb5a38ac59da26851335 | 46000344082 | success | success |
| kaal/change/declarations | 0ee2055254392ef8ed52ba8d4d5059714597b5c9 | 45999780578 | success | success |
| kaal/release/evidence-criteria | 61abeb097ccb30dcb686d730f6144c02dea108aa | 45997230147 | success | success |
| claude/project-thread-g6hmfd-sync-evidence-criteria-1 | b2fc6043239cc065369928950231f9b98f59b8ab | 45996552074 | success | success |

## Merge-group runs (the admission does not run on merge_group, so the verdict is the old one)

| Run | Revision | Conclusion | Counting |
| --- | --- | --- | --- |
| 46056438210 | f5cb24de4c8e1478a36fc79bc576cebbe0ef7f3a | success | yes |
| 46054636686 | 004eabcdc1c41a01d69e848622cfb138918f0d85 | success | yes |
| 46048813355 | adb0082d799c76761e5cba4773a1754f614f9d77 | success | yes |
| 46045110224 | 82812887aaa16032db44b3844150f873267c9515 | success | yes |
| 46042470350 | 4eaef50f418040781cf8a4cb873ce3f8f18c3ba2 | success | yes |
| 46039067485 | bd92bd2010ce5658d4ec37a131a7ae8c21fed641 | success | yes |
| 46037928392 | 552442ab9547b49447596265a51821f4b5ff84cc | failure | no, cause not read |
| 46037412362 | 1197557d014546b26e1d48396c6e5425ba1dd6e7 | success | yes |
| 46035384185 | 5db2a56f9b8974b8745c83199488272b89fcaae8 | success | yes |
| 46031385736 | 00cf28e42697464ab45d14d2cd21d1068992040b | success | yes |
| 46029019190 | 52b7c8d4d514dd5556abd859e9b60d578b333aa2 | success | yes |
| 46027649788 | dc3b473fb4d164ad64c5154bedbeba7837535c23 | success | yes |
| 46025466559 | eb369e7361e51f6357b71d0e92d076ddb5f3f59c | success | yes |
| 46021221201 | a248f06f434b840167039d0ccf57c33b6b1bf066 | success | yes |
| 46017240627 | f76ee86b664c8fb78adea9412d01aa26de7e653c | success | yes |
| 45999939077 | 7dceec07b7223fefef4a367732a95d21a81307cb | success | yes |
| 45995837268 | 2c1b4a9d9b5c2e1c7ced69b1c5b3756ae4ffea2d | success | yes |

## Inspected, admission failed while the old check passed

One run of the admission job failed on a head where the old check `Change Isolation (review)` succeeded: the probe `probe/c153-check3-edit-fail` (head 09aff2a8bb6b89b408e3e678deb58f7e8f60a5fb, run 46042397195), a provoked edit of the admission step for the trusted-execution proof (T3). It is kept apart from the admitted rows, and the proof file says what it shows.

## Uninspected

The cause of any failed merge-group run (46037928392, first group of #2884) is not read. Runs created after 19:44 UTC.

## Open

The thresholds above (5 admitted revisions, 5 merge-group runs) are numerical only. The trusted-execution proof is a separate requirement that is NOT yet in this ledger: it is required before the enforcement go, and counts alone do not authorize enforcement. The counts are the CPO's to accept.
