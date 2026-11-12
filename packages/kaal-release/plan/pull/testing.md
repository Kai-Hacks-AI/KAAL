# Pull Promotion: Testing (target)

Cases trace requirements. They are runnable files, `T<n>.red.mjs`, beside the requirements, with shared fixtures in `fixtures.mjs` and one recording of a real collector in `evidence/`. They fail because the Script does not exist (RED) and are wired into no test list, so CI stays green. The DO adds the Script and renames each Case to `T<n>.test.mjs` when it is green. Run one by hand with `node -e "import('./T1.red.mjs').then(m => m.run())"`. A throwaway reference was written once outside the repository to show that T1 to T13 can pass; it is not delivered and implies no design.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T1 | F1, N1 | The Script exists, imports only built-ins and not analyze Flow, and uses no network, process, environment or write API. |
| pull/T2 | F4 | READY only when every judgment passes; any FAIL is BLOCKED even beside an unknown; no FAIL and any UNKNOWN is NOT JUDGED; no evidence is never a pass; the six judgments, owned, in order. |
| pull/T3 | F5 | The increment is what landed since the last delivery: a missing carried type is incomplete and named, an increment without its closing ACT is incomplete, a declaration without the closing piece is unknown, an open piece of the Change blocks, a delivered piece does not count again, an undeclared increment or an absent landing time is unknown. |
| pull/T4 | F6 | A complete Change, a complete increment and a ready collector are separate statements; an incomplete Change does not block an increment; an undeclared Change is not judged. |
| pull/T5 | F7 | Checks are judged by their declared owner: failures trace to it, running and absent checks are unknown and named, an unowned check is reported and not judged, a contradictory pair is unknown. |
| pull/T6 | F8 | Behind the target fails, an unknown distance is unknown, and the lane's turn (active, waiting, not judged) never changes the verdict. |
| pull/T7 | F9 | Landed pieces must be approved at the version that landed; no review is unknown, another version or a change request fails. |
| pull/T8 | F10 | One next action in the five words: OPEN, the flow's own finding, WAIT on the lane, REVISE naming the owner, nothing when not judged, escalate on a hold; never a command or a bypass. |
| pull/T9 | F11 | Byte-identical output for the same inputs and for the evidence in reverse order; no time in the output. |
| pull/T10 | F3 | The Script reads only Analyze Flow's fields plus the three additions: no competing collector-state model. |
| pull/T11 | F12 | Two ready collectors yield at most one OPEN; the output carries no authorization; no authority is invented. |
| pull/T12 | F1, F13 | The command prints what the function returns, from any directory with an empty environment; a verdict of any kind exits 0; an unreadable input or an unknown collector fails naming it. |
| pull/T13 | F2, F4 to F10 | REAL evidence, recorded from the repository on 12 Nov 2026: `kaal/release/wire-fallback-template` (promotion #1461, DO #1458, release/C14) is BLOCKED twice over, each traced to its owner: the Change reports no ACT closing the increment, and Release's Branching check is red; the other judgments pass; the Change is incomplete on the target; the Owner's hold makes the recommendation an escalation for the owner. |
| pull/T14 | F13, F14 | The connected path on the real repository: the command reads the host, prints the verdict of one real collector with owners and missing evidence, changes no open piece, and an unreadable host fails naming what could not be read. Run by hand on the Owner's device; it needs the signed-in host reader and is not in CI. |
