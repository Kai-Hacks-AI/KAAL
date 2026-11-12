# analyze Flow: Testing (target)

Cases trace one requirement each. They are written in this PLAN as runnable files, `T<n>.red.mjs`, beside the requirements, with the shared fixtures in `fixtures.mjs`. They fail because the Script does not exist (RED). They are not wired into any test list, so CI stays green. The DO adds the Script and renames each Case to `T<n>.test.mjs` when it is green. Run one by hand with `node -e "import('./T1.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| coordination/T1 | F5, F6 | A declared pair whose member has no piece is OPEN: the promotion when fresh; the sync first and the promotion waiting on it when behind; an open promotion with no sync gets its sync. |
| coordination/T2 | F5, F11 | A version that moved after the approval is REVIEW, with both versions shown; approved at the current version and not set to land on approval is LAND, a recommendation for the `lander` to set the normal landing path, never a manual landing; approved with a CHECK still running is WAIT on that CHECK; approved and landing is WAIT on the landing; a landed piece has no finding. |
| coordination/T3 | F5 | Changes requested, unresolved threads, a conflict or a failing check is REVISE for the author, cause in the reason. |
| coordination/T4 | F8 | The first incomplete declared pair is the only active pair; the next pair waits and gets no OPEN. |
| coordination/T5 | F7, F8 | A development sync that names a blocked Change does not occupy the lane. |
| coordination/T6 | F8, F13 | A landed promotion with its delivery evidence completes its pair, the next pair becomes active, and a delivered version is not offered again. |
| coordination/T7 | F2, F3, F4 | An absent review, an undeclared policy, undeclared pairs, an undeclared type, a sync with no purpose: each is in `notJudged`, and no action is guessed. |
| coordination/T8 | F4 | The same inputs, and the pieces in reverse order, give byte-identical output. |
| coordination/T9 | F1, N1 | The Script exists, imports only built-ins, and uses no network, process or write API. |
| coordination/T10 | F11 | A hold gives `escalate` for the owner, the output holds no command, and LAND never reads as a manual landing or a bypass. |
| coordination/T11 | N2 | The Script and the fixtures hold no KAAL-specific identity (interim list); generic words pass, both shown by fixtures. |
| coordination/T12 | F5, F7 | A development sync is recommended only for a freshness failure behind a stale collector, naming the Change it unblocks; a conflict, another failing check, a missing review and a freshness failure on a fresh collector are not syncs. |
| coordination/T13 | F6, F8, F10 | The sequence of 12 Nov, promotion 1440, sync 1430, promotion 1428, is listed in that order with one active pair, and advances when 1440 lands. |
| coordination/T14 | F10 | A hotfix is the expedite class and does not occupy the lane; a fallback piece is reported and not classified. |
| coordination/T15 | F9 | Entries carry their layer and are ordered nearest the outcome first with dependencies before dependents; the publishing layer is reported as not modelled. |
| coordination/T17 | F13 | Only a delivery of the collector's current version completes its pair: a collector that changed after a promotion is delivered again, a delivered version is not offered twice, and a landed promotion without delivery evidence is reported, blocks the next pair and guesses nothing. |
| coordination/T16 | F12 | The Script runs from a command line in any directory with an empty environment, prints what the function returns, and fails only when an input cannot be read. |
| coordination/T18 | F14 | Recorded host data becomes the facts: type, Change, version, fit, comments, the review at its version, CHECKs by newest run, landing on approval, and only the collectors something uses. |
| coordination/T19 | F14, F17 | The vertical slice on recorded data: supplier, then Script across plain data, gives one ready recommendation (LAND for the lander) naming the real piece and its pair, and the same output twice. |
| coordination/T20 | F13, F15, F16 | A landed PROMOTION's recorded head and landing become the delivery and release the next pair; where the host did not record them, no delivery is invented, the gap is reported, the pair stays unjudged and later pairs wait. |
| coordination/T21 | F14, F15 | Truncated lists, a collector that cannot be compared or does not exist, and an unreachable host are reported or fail naming the host error; nothing is defaulted. |
| coordination/T22 | F17 | On the real repository the command prints findings that name real pieces and at most one ready promotion, and an unreadable host fails naming what could not be read. Run by hand on the Owner's device; it needs the signed-in host reader and is not in CI. |
