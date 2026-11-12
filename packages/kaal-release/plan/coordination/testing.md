# analyze Flow: Testing (target)

Cases trace one requirement each. They are written in this PLAN as runnable files, `T<n>.red.mjs`, beside the requirements, with the shared fixtures in `fixtures.mjs`. They fail because the Script does not exist (RED). They are not wired into any test list, so CI stays green. The DO adds the Script and renames each Case to `T<n>.test.mjs` when it is green. Run one by hand with `node -e "import('./T1.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| coordination/T1 | F5, F6 | A declared pair whose member has no pull request is OPEN PR: the promotion when fresh; the sync first and the promotion waiting on it when behind; an open promotion with no sync gets its sync. |
| coordination/T2 | F5 | A head that moved after the approval is REVIEW PR, with both commits shown; approved at the current head with auto-merge off is ENABLE AUTO-MERGE. |
| coordination/T3 | F5 | Changes requested, unresolved threads, a conflict or a failing check is REVISE PR for the author, cause in the reason. |
| coordination/T4 | F8 | The first incomplete declared pair is the only active pair; the next pair waits and gets no OPEN PR. |
| coordination/T5 | F7, F8 | A development sync that names a blocked Change does not occupy the lane. |
| coordination/T6 | F8 | A merged promotion completes its pair, the next pair becomes active, and a surviving collector is not offered again. |
| coordination/T7 | F2, F3, F4 | An absent review, an undeclared policy, undeclared pairs, an undeclared type, a sync with no purpose: each is in `notJudged`, and no action is guessed. |
| coordination/T8 | F4 | The same inputs, and the requests in reverse order, give byte-identical output. |
| coordination/T9 | F1, N1 | The Script exists, imports only built-ins, and uses no network, process or write API. |
| coordination/T10 | F11 | A hold gives `escalate` for the owner, and the output holds no command. |
| coordination/T11 | N2 | The Script and the fixtures hold no KAAL-specific identity (interim list); generic words pass, both shown by fixtures. |
| coordination/T12 | F5, F7 | A development sync is recommended only for a freshness failure behind a stale collector, naming the Change it unblocks; a conflict, another failing check, a missing review and a freshness failure on a fresh collector are not syncs. |
| coordination/T13 | F6, F8, F10 | The sequence of 12 Nov, promotion 1440, sync 1430, promotion 1428, is listed in that order with one active pair, and advances when 1440 merges. |
| coordination/T14 | F10 | A hotfix is the expedite class and does not occupy the lane; a fallback request is reported and not classified. |
| coordination/T15 | F9 | Entries carry their layer and are ordered nearest the outcome first with dependencies before dependents; the publishing layer is reported as not modelled. |
