# Evidence of check 3: the trusted-execution proof (release/C153, check 3, release/C157)

This proof is kept apart from the numerical thresholds of `check-3.md`. Counts do not authorize enforcement; this proof is a prerequisite of the enforcement go, and it is the Owner's to accept.

## What is to be proved

The admission `Change Isolation (review, plain pull_request)` gives a pull request head the context `Change Isolation (review)` so it can enter the merge queue. It judges nothing. The proof is that, on plain `pull_request`, running the candidate's own copy of the workflow, it cannot do more than that, and that the judgment it does not make is still made, unchanged, on the merge group.

## The four statements and how each is produced

| # | Statement | Produced from | Status |
| --- | --- | --- | --- |
| T1 | The workflow on main is byte-equal to its source and has nothing to execute of the pull request: `permissions: {}` at both levels, no `checkout`, no `uses`, no secret, no expression of pull request content | the file on main at the tip, read by script (non-comment lines carry none of these) and Case release/T1576 | produced (below) |
| T2 | At run time the token carries metadata read only, and the job has exactly the one constant `echo` step | the job logs ("GITHUB_TOKEN Permissions") and the job's steps of every counted admission run | produced for 12 sampled runs (below); to be extended to all counted runs by the same script |
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

## Open

T3 is produced; a run of an unedited pull request raised after the two probes is added by the script extension. T4 needs the swap, which is the Owner's go. The extension of T2 to all counted runs is a script run, not a new kind of evidence.
