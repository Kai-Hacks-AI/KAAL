# Coordination: Testing (target)

Cases trace one requirement each. They are specified here and written as executable Cases in the DO, RED first. Each runs the Script on fixtures (a facts file and a declaration file) and checks the printed entries.

| Case | Requirement | Fixture and expected result |
| --- | --- | --- |
| coordination/T1 | F5, F6 | The declared next candidate is fresh and has no promotion request: the list holds `OPEN PR` targeting that candidate's promotion. |
| coordination/T2 | F5 | A request's head commit differs from the commit its approval names: `REVIEW PR` for that request, with both commits in `evidence`. |
| coordination/T3 | F5 | A request has changes requested, or unresolved threads, or red CI: `REVISE PR`, with the cause in `reason`. |
| coordination/T4 | F7 | A promotion sync is open for candidate A: candidate B gets `WAIT`, dependency on A's promotion merging, and no `OPEN PR` for B's promotion sync. |
| coordination/T5 | F7 | A sync into a collector that is not the declared candidate is open, and no promotion is open: the lane is free and the promotion work of the candidate is not blocked. |
| coordination/T6 | F7 | A promotion request is merged: the lane is free and the next candidate's step appears. A surviving collector that is ahead of the target does not produce an `OPEN PR`. |
| coordination/T7 | F2, F3, F4 | A missing, contradictory or undeclared fact (no review commit, no declared policy, an unknown title kind) yields a `notJudged` entry naming it, and no guessed action. |
| coordination/T8 | F4 | The same inputs give byte-identical output. |
| coordination/T9 | F1, N1 | The Script source imports only built-ins and calls no network or process API. |
| coordination/T10 | F8 | A hold makes the entry `needs-authority`; the Script prints no command and enables nothing. |
| coordination/T11 | N2 | T5 of the kaal-release PLAN over the Script and fixtures passes, with positive and negative fixtures. |

The Cases fail on `main` because the Script does not exist (RED). They are not wired until the DO.
