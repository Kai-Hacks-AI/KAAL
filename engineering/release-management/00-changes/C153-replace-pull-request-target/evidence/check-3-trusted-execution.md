# Evidence of check 3: the trusted-execution proof (release/C153, check 3, release/C157)

This proof is kept apart from the numerical thresholds of `check-3.md`. Counts do not authorize enforcement; this proof is a prerequisite of the enforcement go, and it is the Owner's to accept.

## What is to be proved

The admission `Change Isolation (review, plain pull_request)` gives a pull request head the context `Change Isolation (review)` so it can enter the merge queue. It judges nothing. The proof is that, on plain `pull_request`, running the candidate's own copy of the workflow, it cannot do more than that, and that the judgment it does not make is still made, unchanged, on the merge group.

## The four statements and how each is produced

| # | Statement | Produced from | Status |
| --- | --- | --- | --- |
| T1 | The workflow on main is byte-equal to its source and has nothing to execute of the pull request: `permissions: {}` at both levels, no `checkout`, no `uses`, no secret, no expression of pull request content | the file on main at the tip, read by script (non-comment lines carry none of these) and Case release/T1576 | produced (below) |
| T2 | At run time the token carries metadata read only, and the job has exactly the one constant `echo` step | the job logs ("GITHUB_TOKEN Permissions") and the job's steps of every counted admission run | produced for all 96 counted admission runs (below) |
| T3 | A candidate that edits the admission workflow changes only its own pull request's run: a probe pull request that edits the job to fail or to print a marker shows the edit running in that pull request alone, and a second pull request raised after it shows its own unmodified admission | two probe pull requests, never merged | produced (below) |
| T4 | The judgment is untouched: `merge-group-review.yml` (on `merge_group`) is unchanged by the swap, and its runs after the swap carry the same verdict as before. The swap changes no file but the ruleset context's source | the 11 merge-group runs of `check-3.md` (verdict unchanged), the diff of the swap (the old `merge-group-admission.yml` removed, nothing else), and one merge-group run after the swap | partly produced: before the swap only |

One finding from the logs: the merge-group run 46037928392 (the first group of #2884) failed at its first step, `Wait for the group's other required checks`; the judging steps were skipped. It is not a refusal by the judge and it is not counted anywhere.

## T1 produced

`.github/workflows/change-isolation-admission-plain.yml` on main is byte-equal to `engineering/release-management/05-src/wiring/workflows/change-isolation-admission-plain.yml`. Its non-comment lines contain no `uses`, no `secrets`, no `${{ }}` expression and no `checkout`.

## T2 produced (12 of the counted admission runs, evenly sampled)

| Branch | Revision (head) | Run | Token | Steps | Reads or runs |
| --- | --- | --- | --- | --- | --- |
| testing/c84-do | 0d5db321245c2db7b414f143ed6c1f5a0c3bb7b3 | 46039928038 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| kaal/release/promotion-source-plain | d9f4a3c3d93fbdcfe650e5cff52f675c967ecbc7 | 46036614706 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| claude/project-thread-g6hmfd-sync-release-evidence-amendment-1 | aefb7bc741b6a16e6d42b5a23cc9813f49190f7f | 46032380720 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| testing/c83-restore | 8fb488342772d7f65c5008e87513166006fceee8 | 46027858864 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| claude/eng-controls-callers-proposal | 1b83cf68baab7df2ab101802ce5cb75ed1b13199 | 46021005167 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| claude/project-thread-g6hmfd-sync-release-merge-group-review-events-1 | a002a7c85de92416888fd117027de28e6367a412 | 46018034109 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| claude/eng-controls-callers-do | 7e5920a8ae9833090e0b6906fb481d8cc2fd258b | 46011114526 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| kaal/core/exchange | 6c8da82f1dceb124f2dc4951c089153b0d0dba26 | 46006168251 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| kaal/hosting/github-app-adapter | d1e392fe67f62726501e263cc229f68ed92d361b | 46003769151 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| claude/project-thread-g6hmfd-sync-hotfix-record-judged-head-1 | ceb0bc492b359a436e11162d278e98a59d28563b | 46002980701 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| claude/project-thread-g6hmfd-sync-core-skill-license-1 | 2d49f99b424c686defa6c6c3b85c8593055182fe | 46000739349 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |
| claude/project-thread-g6hmfd-sync-engineering-source-split-1 | b7ba692f4c0ed3bb35f0261a7a0ee788e83e7dcc | 46000687323 | Metadata: read | 1 step, `Admit to the merge queue only` | no checkout, no `uses` |

## T3 produced

| Pull request | Revision (head) | Run | What the run shows |
| --- | --- | --- | --- |
| #2906 (probe, never merged) | a7d63dc4070137d1efc2f480b8b97041ab226f95 | 46042387708 | the edited definition ran in this pull request only: the extra step `Probe marker` ran and printed its marker (success) |
| #2907 (probe, never merged) | 09aff2a8bb6b89b408e3e678deb58f7e8f60a5fb | 46042397195 | the edited definition ran in this pull request only: the extra step `Probe failure` failed this pull request's own admission |
| #2902 (probe of check 2, unedited) | ce5ae44a00ab16e114643ef62bcae52e1adc5bf1 | 46041467896 | the unedited definition: one step, `Admit to the merge queue only`, no marker (a pull request raised before the edits) |

An edited admission changes its own pull request's run and no other. It can make that pull request fail; it cannot make another pass or add a context for it. That the admission judges nothing is why an edit gains nothing: the judgment is the merge group's.

## T2 audit: all counted admission runs

Read by script from the job logs and steps of every admission run counted in `check-3.md` (96 runs, one per revision). In every run the token carries `Metadata: read` only and the job has exactly one step, `Admit to the merge queue only`, with no checkout and no `uses`. Deviating runs: 0.

| Branch | Revision (head) | Run | Token | Steps besides setup and cleanup | As stated |
| --- | --- | --- | --- | --- | --- |
| testing/c84-do | 0d5db321245c2db7b414f143ed6c1f5a0c3bb7b3 | 46039928038 | Metadata: read | 1 | yes |
| claude/release-c153-ledger-counts | 82bcde03b7d2f0262ae182415f40fe85f8e80390 | 46039383818 | Metadata: read | 1 | yes |
| wire/promotion-source-plain | 61e02fccc79d4d44cc841c1abf06a158f3ac4108 | 46038536530 | Metadata: read | 1 | yes |
| wire/codeql-judge-run | 47d49ce20160ee86b1191d1bcb68403603ae5f0c | 46038349951 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 0cdda641b5a55e6ff48ee98aad043e79dc196a42 | 46038197261 | Metadata: read | 1 | yes |
| claude/sync-wire-codeql | 73531de3bbc38312d63f5d0d4f1c5bca75760b1e | 46038190896 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 88ebf31057fafc0370541337916df4629bc4b0ef | 46038138340 | Metadata: read | 1 | yes |
| testing/c84-judged-revision-plan | e2ae023d34365f4b05661309499dd4ac50355d5d | 46037800782 | Metadata: read | 1 | yes |
| kaal/release/promotion-source-plain | d9f4a3c3d93fbdcfe650e5cff52f675c967ecbc7 | 46036614706 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-psp-2 | ef10cbf3133bcb598ec32fa31eb6ce15ec47a2b9 | 46035937903 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 11d2448e2f69331144fff4eb7fd4fa4743f515e0 | 46035822942 | Metadata: read | 1 | yes |
| testing/c84-judged-revision-plan | 0e7694590ff00d64142a08075bb8298b287988b4 | 46035519452 | Metadata: read | 1 | yes |
| wire/codeql-judge-run | 39dd9885cc4685791f246dcafa050b6ba27c64dc | 46034191678 | Metadata: read | 1 | yes |
| kaal/release/evidence-amendment | a847ba108fd275e17f1456b7c6697305465b77d0 | 46033135762 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | f674f69ae8a759fcbad0be0ec95a9a2e356b7891 | 46033055965 | Metadata: read | 1 | yes |
| testing/c84-judged-revision-plan | d6caf406c23b59aa46bec5dc4465931304b18e20 | 46032519926 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-evidence-amendment-1 | aefb7bc741b6a16e6d42b5a23cc9813f49190f7f | 46032380720 | Metadata: read | 1 | yes |
| kaal/release/promotion-source-plain | dd4d97a1671877920933220b1f3edba12c4d435a | 46032357680 | Metadata: read | 1 | yes |
| claude/release-c159-act | a427c28c2354bad4e7b2993a47cf719c051bfec8 | 46031668598 | Metadata: read | 1 | yes |
| claude/release-c159-do2 | 694682a90f843e739f1da7eaa9e8022ab6b8932c | 46030777730 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | a0996ab9c8934beb9c34d951a081a6a2e589d38c | 46030471845 | Metadata: read | 1 | yes |
| claude/release-c159-sync | 558755bc2b954f239fec79ce9231b5e13e14358f | 46029882232 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-controls-callers-1 | 5a24eebab027a5ee4698b9205555f585857580c0 | 46029800618 | Metadata: read | 1 | yes |
| wire/branching-plain | 2e75fd9142e064f05c02091aa46484221c685dab | 46028266476 | Metadata: read | 1 | yes |
| testing/c83-restore | 8fb488342772d7f65c5008e87513166006fceee8 | 46027858864 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-files | a194fbe8366832efcd8b6d780bc5d96b330edff5 | 46027490046 | Metadata: read | 1 | yes |
| testing/c83-sync-main | aa24c742c58593474adaba5b6bf98fd88602cd82 | 46026953612 | Metadata: read | 1 | yes |
| kaal/release/branching-plain | 20e49266080edaaf46e82de672f773a581e2c08e | 46026895838 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-branching-plain-2 | 1647984cdcebd883ed2f14942b8f35110444c8d9 | 46026180041 | Metadata: read | 1 | yes |
| kaal/engineering/source-split | 7658b310475258d202fa2d95e7d411e439b015a2 | 46023398812 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-source-split-3 | c981b62b7ee15b82e77715b89948df0a13a22a87 | 46022383835 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | 541dde0767ad9a8c9906bb5a92ba2a13323dd2b7 | 46022024054 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-proposal | 1b83cf68baab7df2ab101802ce5cb75ed1b13199 | 46021005167 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | 37857b6f0185302733bedb0e2f3874a7a2b3a1bc | 46020969992 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-cases | a0ed1a995f992f163f4aae31d98d20a17bf5e217 | 46019268105 | Metadata: read | 1 | yes |
| kaal/release/merge-group-review-events | 5474b67e6df4cde2b8a83f312cd7f82f95213a63 | 46019254317 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-proposal | 8628f160dfb357cfcd7f99fe126c317713d6ba26 | 46019061917 | Metadata: read | 1 | yes |
| kaal/hosting/github-waiting | 2f01dfd4c6e9b79ee965fc50ed61037f49691a69 | 46019024417 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | 3233b60f34bc6ef2287a2735149771988138bbcb | 46018767752 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 6c53867d4ec6f89ec8f96f92436e23825a91c76e | 46018040985 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-merge-group-review-events-1 | a002a7c85de92416888fd117027de28e6367a412 | 46018034109 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 1e5250aa9278884a73aa5ac634bc129b85de11a5 | 46016376753 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-act | 63f1e1235a7d75fd0a8d44eee31cf4ce31058447 | 46016209430 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-cases | 76a1975dcd5ff4a0bf62263a5215552bce544941 | 46016171923 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-act | 032168a7b249955e1de04b1e74b9747bf835c6d4 | 46016118618 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-cases | 72f067e7c3944434fe746d718c82744b8d798565 | 46016100509 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-act | bfefeefb0df4441bde95935984dbf426408848af | 46015770109 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 5e2f03e9d2f6bffb50ef7cd532763635093c48fd | 46015732407 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-do | 7e5920a8ae9833090e0b6906fb481d8cc2fd258b | 46011114526 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | eb145d2043fff50982ba5ee4ae8fb9911e39b484 | 46010884954 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 3e74efe60b9ff1222755ab47a6ed0c87331bfb2e | 46009835727 | Metadata: read | 1 | yes |
| hotfix/record-judged-head | d2581b7001b97266e269ce8ba8816cb8c4e75a88 | 46007476012 | Metadata: read | 1 | yes |
| kaal/release/branching-plain | 858ce8803ed406249f007ff48bb7ed8627ce1239 | 46007420515 | Metadata: read | 1 | yes |
| kaal/core/skill-standard | ef5a7fa4234b0e85ce135514f0547e684587ba28 | 46007001677 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-files | 8e23573d8ef43d1b1d836b9d17f3d430d5431211 | 46007001006 | Metadata: read | 1 | yes |
| kaal/engineering/source-split | 4d75898d6785900fda94f7e0b4373b330ff7a99c | 46006671025 | Metadata: read | 1 | yes |
| kaal/core/exchange | 6c8da82f1dceb124f2dc4951c089153b0d0dba26 | 46006168251 | Metadata: read | 1 | yes |
| claude/core-identity-plan | 6de3e35e8d9bf91f1c754e1e5bb0f50d92deacb4 | 46006165624 | Metadata: read | 1 | yes |
| claude/core-identity-plan | d3ebb8d60b6e763d36e66c47bde070d4519c5d88 | 46006009132 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-plan | 78dbaea45f6ea87757b16e47236881d343db4cef | 46005649287 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-plan | 718626188d42eae3b29b97c5913c7b2fac650934 | 46005423955 | Metadata: read | 1 | yes |
| kaal/core/installation-integrity | 9430531d6dd26dbb2c320f961e54ad72cddb8af9 | 46005266589 | Metadata: read | 1 | yes |
| kaal/core/repo-free-skill | 3988d5a04c706b18411ff0d76b6bb97bdf981c0b | 46004965364 | Metadata: read | 1 | yes |
| kaal/core/skill-license | 8df159bd01bd260863ec4abc182788c2e972f096 | 46004570652 | Metadata: read | 1 | yes |
| kaal/hosting/github-app-adapter | d1e392fe67f62726501e263cc229f68ed92d361b | 46003769151 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-source-split-2 | 9661f754e4288eb3cf73f714e0cb1973a9476325 | 46003476153 | Metadata: read | 1 | yes |
| claude/release-c158-head-sha | dc4b46dcd021c189ac3df32d3fa56a40ae10ea98 | 46003393003 | Metadata: read | 1 | yes |
| claude/release-c166-hotfix | 890b2028ff2c301dd0b87da8d5356c4bb3e0ceb2 | 46003205420 | Metadata: read | 1 | yes |
| kaal/release/branching-plain | 608c9e52c8da82a23e7658ee3b6ef7a3d35be7bb | 46003151039 | Metadata: read | 1 | yes |
| hotfix/record-judged-head | e1b880b76891a3e2bee0e99f14fce481319ab98d | 46003066505 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-controls-flag-status-1 | 304ba578c4e3143873b9caf941e9a3b34a6e4021 | 46003031373 | Metadata: read | 1 | yes |
| hotfix/record-judged-head | 0d25b8a625a3193d8c6bb9b80c731371f7763f21 | 46003002877 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-hotfix-record-judged-head-1 | ceb0bc492b359a436e11162d278e98a59d28563b | 46002980701 | Metadata: read | 1 | yes |
| kaal/engineering/source-split | 274a4a34916b972980c190e82346aeb43e65d978 | 46002169856 | Metadata: read | 1 | yes |
| claude/core-identity-plan | 2b5f4393a9e97de7969f9af5adb4870ea4441c66 | 46002170758 | Metadata: read | 1 | yes |
| claude/core-identity-plan | 47a2d0a854298bbc362ea1f8d9776ab3190dfd9d | 46001990347 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-2 | f9b374ef40b104ff1fa28bfb3a1c6c1d9a89649a | 46001883464 | Metadata: read | 1 | yes |
| claude/project-thread-063rup-flag-sync | 8d90214bad9c990923de8ef6eb5d103d398ed9d4 | 46000904320 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-2 | ada7f063276cbded84bf6199199c0703f91d4c7b | 46000853125 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-exchange-1 | 143c63e9543ac144044d5131526ff2a88d76a7f4 | 46000746130 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-skill-license-1 | 2d49f99b424c686defa6c6c3b85c8593055182fe | 46000739349 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-repo-free-skill-1 | 3af06eac7072c6fe9ad6c750e7dcfc166336bbff | 46000734132 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-skill-standard-1 | be31d7f5ba0b5f55cfc7bfc0243c45c4ac279fca | 46000725910 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-installation-integrity-1 | ca218db2545f49c1929c350bd23bd1ed71e743ae | 46000718982 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-hosting-github-app-adapter-1 | 59da9b4aba798ac2a8b65d2f18313e5894aa82dc | 46000712591 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-change-declared-or-none-1 | b070213b5fa4f2c89fd8ae1a7aebd2f2135f876f | 46000705111 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-controls-neutral-wording-1 | 72648aa9b578fb4d1ce81ef59e742dd25b43f55f | 46000700642 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-branching-plain-1 | b93ee9748099799b48a95a624fb32d6bcb3bae54 | 46000693340 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-source-split-1 | b7ba692f4c0ed3bb35f0261a7a0ee788e83e7dcc | 46000687323 | Metadata: read | 1 | yes |
| claude/release-c165-hotfix | 0c6015d70e024e955e3036e333e61f64565e542d | 46000596466 | Metadata: read | 1 | yes |
| probe/c153-check1-mixed-3 | 8dff4c2625f8593a30f91154322a4e20f16be079 | 46000359669 | Metadata: read | 1 | yes |
| probe/c153-check1-mixed-2 | 552834b37775af7398def22178c5c398e4d6a354 | 46000350604 | Metadata: read | 1 | yes |
| probe/c153-check1-mixed-1 | d836d9365b305d611b13fb5a38ac59da26851335 | 46000344082 | Metadata: read | 1 | yes |
| kaal/change/declarations | 0ee2055254392ef8ed52ba8d4d5059714597b5c9 | 45999780578 | Metadata: read | 1 | yes |
| kaal/release/evidence-criteria | 61abeb097ccb30dcb686d730f6144c02dea108aa | 45997230147 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-evidence-criteria-1 | b2fc6043239cc065369928950231f9b98f59b8ab | 45996552074 | Metadata: read | 1 | yes |

## T2 audit: all counted admission runs

Read by script from the job logs and steps of every admission run counted in `check-3.md` (96 runs, one per revision). In every run the token carries `Metadata: read` only and the job has exactly one step, `Admit to the merge queue only`, with no checkout and no `uses`. Deviating runs: 0.

| Branch | Revision (head) | Run | Token | Steps besides setup and cleanup | As stated |
| --- | --- | --- | --- | --- | --- |
| testing/c84-do | 0d5db321245c2db7b414f143ed6c1f5a0c3bb7b3 | 46039928038 | Metadata: read | 1 | yes |
| claude/release-c153-ledger-counts | 82bcde03b7d2f0262ae182415f40fe85f8e80390 | 46039383818 | Metadata: read | 1 | yes |
| wire/promotion-source-plain | 61e02fccc79d4d44cc841c1abf06a158f3ac4108 | 46038536530 | Metadata: read | 1 | yes |
| wire/codeql-judge-run | 47d49ce20160ee86b1191d1bcb68403603ae5f0c | 46038349951 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 0cdda641b5a55e6ff48ee98aad043e79dc196a42 | 46038197261 | Metadata: read | 1 | yes |
| claude/sync-wire-codeql | 73531de3bbc38312d63f5d0d4f1c5bca75760b1e | 46038190896 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 88ebf31057fafc0370541337916df4629bc4b0ef | 46038138340 | Metadata: read | 1 | yes |
| testing/c84-judged-revision-plan | e2ae023d34365f4b05661309499dd4ac50355d5d | 46037800782 | Metadata: read | 1 | yes |
| kaal/release/promotion-source-plain | d9f4a3c3d93fbdcfe650e5cff52f675c967ecbc7 | 46036614706 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-psp-2 | ef10cbf3133bcb598ec32fa31eb6ce15ec47a2b9 | 46035937903 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 11d2448e2f69331144fff4eb7fd4fa4743f515e0 | 46035822942 | Metadata: read | 1 | yes |
| testing/c84-judged-revision-plan | 0e7694590ff00d64142a08075bb8298b287988b4 | 46035519452 | Metadata: read | 1 | yes |
| wire/codeql-judge-run | 39dd9885cc4685791f246dcafa050b6ba27c64dc | 46034191678 | Metadata: read | 1 | yes |
| kaal/release/evidence-amendment | a847ba108fd275e17f1456b7c6697305465b77d0 | 46033135762 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | f674f69ae8a759fcbad0be0ec95a9a2e356b7891 | 46033055965 | Metadata: read | 1 | yes |
| testing/c84-judged-revision-plan | d6caf406c23b59aa46bec5dc4465931304b18e20 | 46032519926 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-evidence-amendment-1 | aefb7bc741b6a16e6d42b5a23cc9813f49190f7f | 46032380720 | Metadata: read | 1 | yes |
| kaal/release/promotion-source-plain | dd4d97a1671877920933220b1f3edba12c4d435a | 46032357680 | Metadata: read | 1 | yes |
| claude/release-c159-act | a427c28c2354bad4e7b2993a47cf719c051bfec8 | 46031668598 | Metadata: read | 1 | yes |
| claude/release-c159-do2 | 694682a90f843e739f1da7eaa9e8022ab6b8932c | 46030777730 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | a0996ab9c8934beb9c34d951a081a6a2e589d38c | 46030471845 | Metadata: read | 1 | yes |
| claude/release-c159-sync | 558755bc2b954f239fec79ce9231b5e13e14358f | 46029882232 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-controls-callers-1 | 5a24eebab027a5ee4698b9205555f585857580c0 | 46029800618 | Metadata: read | 1 | yes |
| wire/branching-plain | 2e75fd9142e064f05c02091aa46484221c685dab | 46028266476 | Metadata: read | 1 | yes |
| testing/c83-restore | 8fb488342772d7f65c5008e87513166006fceee8 | 46027858864 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-files | a194fbe8366832efcd8b6d780bc5d96b330edff5 | 46027490046 | Metadata: read | 1 | yes |
| testing/c83-sync-main | aa24c742c58593474adaba5b6bf98fd88602cd82 | 46026953612 | Metadata: read | 1 | yes |
| kaal/release/branching-plain | 20e49266080edaaf46e82de672f773a581e2c08e | 46026895838 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-branching-plain-2 | 1647984cdcebd883ed2f14942b8f35110444c8d9 | 46026180041 | Metadata: read | 1 | yes |
| kaal/engineering/source-split | 7658b310475258d202fa2d95e7d411e439b015a2 | 46023398812 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-source-split-3 | c981b62b7ee15b82e77715b89948df0a13a22a87 | 46022383835 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | 541dde0767ad9a8c9906bb5a92ba2a13323dd2b7 | 46022024054 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-proposal | 1b83cf68baab7df2ab101802ce5cb75ed1b13199 | 46021005167 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | 37857b6f0185302733bedb0e2f3874a7a2b3a1bc | 46020969992 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-cases | a0ed1a995f992f163f4aae31d98d20a17bf5e217 | 46019268105 | Metadata: read | 1 | yes |
| kaal/release/merge-group-review-events | 5474b67e6df4cde2b8a83f312cd7f82f95213a63 | 46019254317 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-proposal | 8628f160dfb357cfcd7f99fe126c317713d6ba26 | 46019061917 | Metadata: read | 1 | yes |
| kaal/hosting/github-waiting | 2f01dfd4c6e9b79ee965fc50ed61037f49691a69 | 46019024417 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | 3233b60f34bc6ef2287a2735149771988138bbcb | 46018767752 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 6c53867d4ec6f89ec8f96f92436e23825a91c76e | 46018040985 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-merge-group-review-events-1 | a002a7c85de92416888fd117027de28e6367a412 | 46018034109 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 1e5250aa9278884a73aa5ac634bc129b85de11a5 | 46016376753 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-act | 63f1e1235a7d75fd0a8d44eee31cf4ce31058447 | 46016209430 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-cases | 76a1975dcd5ff4a0bf62263a5215552bce544941 | 46016171923 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-act | 032168a7b249955e1de04b1e74b9747bf835c6d4 | 46016118618 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-cases | 72f067e7c3944434fe746d718c82744b8d798565 | 46016100509 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-act | bfefeefb0df4441bde95935984dbf426408848af | 46015770109 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 5e2f03e9d2f6bffb50ef7cd532763635093c48fd | 46015732407 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-do | 7e5920a8ae9833090e0b6906fb481d8cc2fd258b | 46011114526 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | eb145d2043fff50982ba5ee4ae8fb9911e39b484 | 46010884954 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 3e74efe60b9ff1222755ab47a6ed0c87331bfb2e | 46009835727 | Metadata: read | 1 | yes |
| hotfix/record-judged-head | d2581b7001b97266e269ce8ba8816cb8c4e75a88 | 46007476012 | Metadata: read | 1 | yes |
| kaal/release/branching-plain | 858ce8803ed406249f007ff48bb7ed8627ce1239 | 46007420515 | Metadata: read | 1 | yes |
| kaal/core/skill-standard | ef5a7fa4234b0e85ce135514f0547e684587ba28 | 46007001677 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-files | 8e23573d8ef43d1b1d836b9d17f3d430d5431211 | 46007001006 | Metadata: read | 1 | yes |
| kaal/engineering/source-split | 4d75898d6785900fda94f7e0b4373b330ff7a99c | 46006671025 | Metadata: read | 1 | yes |
| kaal/core/exchange | 6c8da82f1dceb124f2dc4951c089153b0d0dba26 | 46006168251 | Metadata: read | 1 | yes |
| claude/core-identity-plan | 6de3e35e8d9bf91f1c754e1e5bb0f50d92deacb4 | 46006165624 | Metadata: read | 1 | yes |
| claude/core-identity-plan | d3ebb8d60b6e763d36e66c47bde070d4519c5d88 | 46006009132 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-plan | 78dbaea45f6ea87757b16e47236881d343db4cef | 46005649287 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-plan | 718626188d42eae3b29b97c5913c7b2fac650934 | 46005423955 | Metadata: read | 1 | yes |
| kaal/core/installation-integrity | 9430531d6dd26dbb2c320f961e54ad72cddb8af9 | 46005266589 | Metadata: read | 1 | yes |
| kaal/core/repo-free-skill | 3988d5a04c706b18411ff0d76b6bb97bdf981c0b | 46004965364 | Metadata: read | 1 | yes |
| kaal/core/skill-license | 8df159bd01bd260863ec4abc182788c2e972f096 | 46004570652 | Metadata: read | 1 | yes |
| kaal/hosting/github-app-adapter | d1e392fe67f62726501e263cc229f68ed92d361b | 46003769151 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-source-split-2 | 9661f754e4288eb3cf73f714e0cb1973a9476325 | 46003476153 | Metadata: read | 1 | yes |
| claude/release-c158-head-sha | dc4b46dcd021c189ac3df32d3fa56a40ae10ea98 | 46003393003 | Metadata: read | 1 | yes |
| claude/release-c166-hotfix | 890b2028ff2c301dd0b87da8d5356c4bb3e0ceb2 | 46003205420 | Metadata: read | 1 | yes |
| kaal/release/branching-plain | 608c9e52c8da82a23e7658ee3b6ef7a3d35be7bb | 46003151039 | Metadata: read | 1 | yes |
| hotfix/record-judged-head | e1b880b76891a3e2bee0e99f14fce481319ab98d | 46003066505 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-controls-flag-status-1 | 304ba578c4e3143873b9caf941e9a3b34a6e4021 | 46003031373 | Metadata: read | 1 | yes |
| hotfix/record-judged-head | 0d25b8a625a3193d8c6bb9b80c731371f7763f21 | 46003002877 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-hotfix-record-judged-head-1 | ceb0bc492b359a436e11162d278e98a59d28563b | 46002980701 | Metadata: read | 1 | yes |
| kaal/engineering/source-split | 274a4a34916b972980c190e82346aeb43e65d978 | 46002169856 | Metadata: read | 1 | yes |
| claude/core-identity-plan | 2b5f4393a9e97de7969f9af5adb4870ea4441c66 | 46002170758 | Metadata: read | 1 | yes |
| claude/core-identity-plan | 47a2d0a854298bbc362ea1f8d9776ab3190dfd9d | 46001990347 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-2 | f9b374ef40b104ff1fa28bfb3a1c6c1d9a89649a | 46001883464 | Metadata: read | 1 | yes |
| claude/project-thread-063rup-flag-sync | 8d90214bad9c990923de8ef6eb5d103d398ed9d4 | 46000904320 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-2 | ada7f063276cbded84bf6199199c0703f91d4c7b | 46000853125 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-exchange-1 | 143c63e9543ac144044d5131526ff2a88d76a7f4 | 46000746130 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-skill-license-1 | 2d49f99b424c686defa6c6c3b85c8593055182fe | 46000739349 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-repo-free-skill-1 | 3af06eac7072c6fe9ad6c750e7dcfc166336bbff | 46000734132 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-skill-standard-1 | be31d7f5ba0b5f55cfc7bfc0243c45c4ac279fca | 46000725910 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-installation-integrity-1 | ca218db2545f49c1929c350bd23bd1ed71e743ae | 46000718982 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-hosting-github-app-adapter-1 | 59da9b4aba798ac2a8b65d2f18313e5894aa82dc | 46000712591 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-change-declared-or-none-1 | b070213b5fa4f2c89fd8ae1a7aebd2f2135f876f | 46000705111 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-controls-neutral-wording-1 | 72648aa9b578fb4d1ce81ef59e742dd25b43f55f | 46000700642 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-branching-plain-1 | b93ee9748099799b48a95a624fb32d6bcb3bae54 | 46000693340 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-source-split-1 | b7ba692f4c0ed3bb35f0261a7a0ee788e83e7dcc | 46000687323 | Metadata: read | 1 | yes |
| claude/release-c165-hotfix | 0c6015d70e024e955e3036e333e61f64565e542d | 46000596466 | Metadata: read | 1 | yes |
| probe/c153-check1-mixed-3 | 8dff4c2625f8593a30f91154322a4e20f16be079 | 46000359669 | Metadata: read | 1 | yes |
| probe/c153-check1-mixed-2 | 552834b37775af7398def22178c5c398e4d6a354 | 46000350604 | Metadata: read | 1 | yes |
| probe/c153-check1-mixed-1 | d836d9365b305d611b13fb5a38ac59da26851335 | 46000344082 | Metadata: read | 1 | yes |
| kaal/change/declarations | 0ee2055254392ef8ed52ba8d4d5059714597b5c9 | 45999780578 | Metadata: read | 1 | yes |
| kaal/release/evidence-criteria | 61abeb097ccb30dcb686d730f6144c02dea108aa | 45997230147 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-evidence-criteria-1 | b2fc6043239cc065369928950231f9b98f59b8ab | 45996552074 | Metadata: read | 1 | yes |

## T2 audit: all counted admission runs

Read by script from the job logs and steps of every admission run counted in `check-3.md` (96 runs, one per revision). In every run the token carries `Metadata: read` only and the job has exactly one step, `Admit to the merge queue only`, with no checkout and no `uses`. Deviating runs: 0.

| Branch | Revision (head) | Run | Token | Steps besides setup and cleanup | As stated |
| --- | --- | --- | --- | --- | --- |
| testing/c84-do | 0d5db321245c2db7b414f143ed6c1f5a0c3bb7b3 | 46039928038 | Metadata: read | 1 | yes |
| claude/release-c153-ledger-counts | 82bcde03b7d2f0262ae182415f40fe85f8e80390 | 46039383818 | Metadata: read | 1 | yes |
| wire/promotion-source-plain | 61e02fccc79d4d44cc841c1abf06a158f3ac4108 | 46038536530 | Metadata: read | 1 | yes |
| wire/codeql-judge-run | 47d49ce20160ee86b1191d1bcb68403603ae5f0c | 46038349951 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 0cdda641b5a55e6ff48ee98aad043e79dc196a42 | 46038197261 | Metadata: read | 1 | yes |
| claude/sync-wire-codeql | 73531de3bbc38312d63f5d0d4f1c5bca75760b1e | 46038190896 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 88ebf31057fafc0370541337916df4629bc4b0ef | 46038138340 | Metadata: read | 1 | yes |
| testing/c84-judged-revision-plan | e2ae023d34365f4b05661309499dd4ac50355d5d | 46037800782 | Metadata: read | 1 | yes |
| kaal/release/promotion-source-plain | d9f4a3c3d93fbdcfe650e5cff52f675c967ecbc7 | 46036614706 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-psp-2 | ef10cbf3133bcb598ec32fa31eb6ce15ec47a2b9 | 46035937903 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 11d2448e2f69331144fff4eb7fd4fa4743f515e0 | 46035822942 | Metadata: read | 1 | yes |
| testing/c84-judged-revision-plan | 0e7694590ff00d64142a08075bb8298b287988b4 | 46035519452 | Metadata: read | 1 | yes |
| wire/codeql-judge-run | 39dd9885cc4685791f246dcafa050b6ba27c64dc | 46034191678 | Metadata: read | 1 | yes |
| kaal/release/evidence-amendment | a847ba108fd275e17f1456b7c6697305465b77d0 | 46033135762 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | f674f69ae8a759fcbad0be0ec95a9a2e356b7891 | 46033055965 | Metadata: read | 1 | yes |
| testing/c84-judged-revision-plan | d6caf406c23b59aa46bec5dc4465931304b18e20 | 46032519926 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-evidence-amendment-1 | aefb7bc741b6a16e6d42b5a23cc9813f49190f7f | 46032380720 | Metadata: read | 1 | yes |
| kaal/release/promotion-source-plain | dd4d97a1671877920933220b1f3edba12c4d435a | 46032357680 | Metadata: read | 1 | yes |
| claude/release-c159-act | a427c28c2354bad4e7b2993a47cf719c051bfec8 | 46031668598 | Metadata: read | 1 | yes |
| claude/release-c159-do2 | 694682a90f843e739f1da7eaa9e8022ab6b8932c | 46030777730 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | a0996ab9c8934beb9c34d951a081a6a2e589d38c | 46030471845 | Metadata: read | 1 | yes |
| claude/release-c159-sync | 558755bc2b954f239fec79ce9231b5e13e14358f | 46029882232 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-controls-callers-1 | 5a24eebab027a5ee4698b9205555f585857580c0 | 46029800618 | Metadata: read | 1 | yes |
| wire/branching-plain | 2e75fd9142e064f05c02091aa46484221c685dab | 46028266476 | Metadata: read | 1 | yes |
| testing/c83-restore | 8fb488342772d7f65c5008e87513166006fceee8 | 46027858864 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-files | a194fbe8366832efcd8b6d780bc5d96b330edff5 | 46027490046 | Metadata: read | 1 | yes |
| testing/c83-sync-main | aa24c742c58593474adaba5b6bf98fd88602cd82 | 46026953612 | Metadata: read | 1 | yes |
| kaal/release/branching-plain | 20e49266080edaaf46e82de672f773a581e2c08e | 46026895838 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-branching-plain-2 | 1647984cdcebd883ed2f14942b8f35110444c8d9 | 46026180041 | Metadata: read | 1 | yes |
| kaal/engineering/source-split | 7658b310475258d202fa2d95e7d411e439b015a2 | 46023398812 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-source-split-3 | c981b62b7ee15b82e77715b89948df0a13a22a87 | 46022383835 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | 541dde0767ad9a8c9906bb5a92ba2a13323dd2b7 | 46022024054 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-proposal | 1b83cf68baab7df2ab101802ce5cb75ed1b13199 | 46021005167 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | 37857b6f0185302733bedb0e2f3874a7a2b3a1bc | 46020969992 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-cases | a0ed1a995f992f163f4aae31d98d20a17bf5e217 | 46019268105 | Metadata: read | 1 | yes |
| kaal/release/merge-group-review-events | 5474b67e6df4cde2b8a83f312cd7f82f95213a63 | 46019254317 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-proposal | 8628f160dfb357cfcd7f99fe126c317713d6ba26 | 46019061917 | Metadata: read | 1 | yes |
| kaal/hosting/github-waiting | 2f01dfd4c6e9b79ee965fc50ed61037f49691a69 | 46019024417 | Metadata: read | 1 | yes |
| kaal/engineering/controls-callers | 3233b60f34bc6ef2287a2735149771988138bbcb | 46018767752 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 6c53867d4ec6f89ec8f96f92436e23825a91c76e | 46018040985 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-merge-group-review-events-1 | a002a7c85de92416888fd117027de28e6367a412 | 46018034109 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 1e5250aa9278884a73aa5ac634bc129b85de11a5 | 46016376753 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-act | 63f1e1235a7d75fd0a8d44eee31cf4ce31058447 | 46016209430 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-cases | 76a1975dcd5ff4a0bf62263a5215552bce544941 | 46016171923 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-act | 032168a7b249955e1de04b1e74b9747bf835c6d4 | 46016118618 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-cases | 72f067e7c3944434fe746d718c82744b8d798565 | 46016100509 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-act | bfefeefb0df4441bde95935984dbf426408848af | 46015770109 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 5e2f03e9d2f6bffb50ef7cd532763635093c48fd | 46015732407 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-do | 7e5920a8ae9833090e0b6906fb481d8cc2fd258b | 46011114526 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | eb145d2043fff50982ba5ee4ae8fb9911e39b484 | 46010884954 | Metadata: read | 1 | yes |
| claude/project-thread-nurd8a | 3e74efe60b9ff1222755ab47a6ed0c87331bfb2e | 46009835727 | Metadata: read | 1 | yes |
| hotfix/record-judged-head | d2581b7001b97266e269ce8ba8816cb8c4e75a88 | 46007476012 | Metadata: read | 1 | yes |
| kaal/release/branching-plain | 858ce8803ed406249f007ff48bb7ed8627ce1239 | 46007420515 | Metadata: read | 1 | yes |
| kaal/core/skill-standard | ef5a7fa4234b0e85ce135514f0547e684587ba28 | 46007001677 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-files | 8e23573d8ef43d1b1d836b9d17f3d430d5431211 | 46007001006 | Metadata: read | 1 | yes |
| kaal/engineering/source-split | 4d75898d6785900fda94f7e0b4373b330ff7a99c | 46006671025 | Metadata: read | 1 | yes |
| kaal/core/exchange | 6c8da82f1dceb124f2dc4951c089153b0d0dba26 | 46006168251 | Metadata: read | 1 | yes |
| claude/core-identity-plan | 6de3e35e8d9bf91f1c754e1e5bb0f50d92deacb4 | 46006165624 | Metadata: read | 1 | yes |
| claude/core-identity-plan | d3ebb8d60b6e763d36e66c47bde070d4519c5d88 | 46006009132 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-plan | 78dbaea45f6ea87757b16e47236881d343db4cef | 46005649287 | Metadata: read | 1 | yes |
| claude/eng-controls-callers-plan | 718626188d42eae3b29b97c5913c7b2fac650934 | 46005423955 | Metadata: read | 1 | yes |
| kaal/core/installation-integrity | 9430531d6dd26dbb2c320f961e54ad72cddb8af9 | 46005266589 | Metadata: read | 1 | yes |
| kaal/core/repo-free-skill | 3988d5a04c706b18411ff0d76b6bb97bdf981c0b | 46004965364 | Metadata: read | 1 | yes |
| kaal/core/skill-license | 8df159bd01bd260863ec4abc182788c2e972f096 | 46004570652 | Metadata: read | 1 | yes |
| kaal/hosting/github-app-adapter | d1e392fe67f62726501e263cc229f68ed92d361b | 46003769151 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-source-split-2 | 9661f754e4288eb3cf73f714e0cb1973a9476325 | 46003476153 | Metadata: read | 1 | yes |
| claude/release-c158-head-sha | dc4b46dcd021c189ac3df32d3fa56a40ae10ea98 | 46003393003 | Metadata: read | 1 | yes |
| claude/release-c166-hotfix | 890b2028ff2c301dd0b87da8d5356c4bb3e0ceb2 | 46003205420 | Metadata: read | 1 | yes |
| kaal/release/branching-plain | 608c9e52c8da82a23e7658ee3b6ef7a3d35be7bb | 46003151039 | Metadata: read | 1 | yes |
| hotfix/record-judged-head | e1b880b76891a3e2bee0e99f14fce481319ab98d | 46003066505 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-controls-flag-status-1 | 304ba578c4e3143873b9caf941e9a3b34a6e4021 | 46003031373 | Metadata: read | 1 | yes |
| hotfix/record-judged-head | 0d25b8a625a3193d8c6bb9b80c731371f7763f21 | 46003002877 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-hotfix-record-judged-head-1 | ceb0bc492b359a436e11162d278e98a59d28563b | 46002980701 | Metadata: read | 1 | yes |
| kaal/engineering/source-split | 274a4a34916b972980c190e82346aeb43e65d978 | 46002169856 | Metadata: read | 1 | yes |
| claude/core-identity-plan | 2b5f4393a9e97de7969f9af5adb4870ea4441c66 | 46002170758 | Metadata: read | 1 | yes |
| claude/core-identity-plan | 47a2d0a854298bbc362ea1f8d9776ab3190dfd9d | 46001990347 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-2 | f9b374ef40b104ff1fa28bfb3a1c6c1d9a89649a | 46001883464 | Metadata: read | 1 | yes |
| claude/project-thread-063rup-flag-sync | 8d90214bad9c990923de8ef6eb5d103d398ed9d4 | 46000904320 | Metadata: read | 1 | yes |
| claude/release-c153-evidence-2 | ada7f063276cbded84bf6199199c0703f91d4c7b | 46000853125 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-exchange-1 | 143c63e9543ac144044d5131526ff2a88d76a7f4 | 46000746130 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-skill-license-1 | 2d49f99b424c686defa6c6c3b85c8593055182fe | 46000739349 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-repo-free-skill-1 | 3af06eac7072c6fe9ad6c750e7dcfc166336bbff | 46000734132 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-skill-standard-1 | be31d7f5ba0b5f55cfc7bfc0243c45c4ac279fca | 46000725910 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-core-installation-integrity-1 | ca218db2545f49c1929c350bd23bd1ed71e743ae | 46000718982 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-hosting-github-app-adapter-1 | 59da9b4aba798ac2a8b65d2f18313e5894aa82dc | 46000712591 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-change-declared-or-none-1 | b070213b5fa4f2c89fd8ae1a7aebd2f2135f876f | 46000705111 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-controls-neutral-wording-1 | 72648aa9b578fb4d1ce81ef59e742dd25b43f55f | 46000700642 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-release-branching-plain-1 | b93ee9748099799b48a95a624fb32d6bcb3bae54 | 46000693340 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-engineering-source-split-1 | b7ba692f4c0ed3bb35f0261a7a0ee788e83e7dcc | 46000687323 | Metadata: read | 1 | yes |
| claude/release-c165-hotfix | 0c6015d70e024e955e3036e333e61f64565e542d | 46000596466 | Metadata: read | 1 | yes |
| probe/c153-check1-mixed-3 | 8dff4c2625f8593a30f91154322a4e20f16be079 | 46000359669 | Metadata: read | 1 | yes |
| probe/c153-check1-mixed-2 | 552834b37775af7398def22178c5c398e4d6a354 | 46000350604 | Metadata: read | 1 | yes |
| probe/c153-check1-mixed-1 | d836d9365b305d611b13fb5a38ac59da26851335 | 46000344082 | Metadata: read | 1 | yes |
| kaal/change/declarations | 0ee2055254392ef8ed52ba8d4d5059714597b5c9 | 45999780578 | Metadata: read | 1 | yes |
| kaal/release/evidence-criteria | 61abeb097ccb30dcb686d730f6144c02dea108aa | 45997230147 | Metadata: read | 1 | yes |
| claude/project-thread-g6hmfd-sync-evidence-criteria-1 | b2fc6043239cc065369928950231f9b98f59b8ab | 45996552074 | Metadata: read | 1 | yes |

## Open

T3 is produced; a run of an unedited pull request raised after the two probes is added by the script extension. T4 needs the swap, which is the Owner's go. The extension of T2 to all counted runs is a script run, not a new kind of evidence.
