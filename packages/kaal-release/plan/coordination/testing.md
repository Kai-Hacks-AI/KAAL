# Coordination: Testing (target)

Cases trace one requirement each. They are written in this PLAN as runnable files, `T<n>.red.mjs`, beside the requirements, with the shared fixtures in `fixtures.mjs`. They fail because the Script does not exist (RED). They are not wired into any test list, so CI stays green. The DO adds the Script and renames each Case to `T<n>.test.mjs` when it is green. Run one by hand with `node -e "import('./T1.red.mjs').then(m => m.run())"`.

| Case | Requirement | Fixture and expected result |
| --- | --- | --- |
| coordination/T1 | F5, F6 | A declared candidate with no request: fresh gives `OPEN PR` for its promotion; behind gives `OPEN PR` for its sync first and the promotion waiting on it. |
| coordination/T2 | F5 | A request whose head moved after its approval: `REVIEW PR`, with both commits in `evidence`. Approved at the current head with auto-merge off: `ENABLE AUTO-MERGE`. |
| coordination/T3 | F5 | Changes requested, unresolved threads or red CI: `REVISE PR` for the author, cause in `reason`. |
| coordination/T4 | F7 | A promotion sync is open for candidate A: candidate B gets `WAIT`, dependency naming A, and no `OPEN PR`. |
| coordination/T5 | F7 | A sync into a collector that is not the declared candidate is open: purpose `development`, and the candidate's promotion stays `ready`. |
| coordination/T6 | F7 | A promotion request is merged: no entry for that collector, and the next candidate's promotion is `ready`. |
| coordination/T7 | F2, F3, F4 | An absent review fact, an undeclared policy, a title of an undeclared kind: each is in `notJudged` naming it, with no action guessed. |
| coordination/T8 | F4 | The same inputs, and the same requests in reverse order, give byte-identical output. |
| coordination/T9 | F1, N1 | The Script exists, imports only built-ins, and uses no network, process or write API. |
| coordination/T10 | F8 | A hold gives `needs-authority` for the owner, and the output holds no command. |
| coordination/T11 | N2 | The Script and the fixtures hold no KAAL-specific identity (interim list, see 00-changes.md); generic words pass, both shown by fixtures. |
