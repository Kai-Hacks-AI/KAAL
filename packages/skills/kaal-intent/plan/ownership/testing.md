# Intent ownership and the traceability chain: Testing

This PLAN ships no code, so it adds no Case and changes no existing one. The existing `npm test -w kaal-intent` cases (`intent/T1`–`T4`) are untouched.

What a later DO would be held to, if the open questions in `requirements.md` lead to one:

| Planned check | Observes | Notes |
| --- | --- | --- |
| Every link in the chain map names an owner that exists | The owning capability's collector or package is present | Evidence is a repository read, not an execution |
| A stated `Serves` Edge reaches its Intent by `traverse` in the incoming direction | Uses Graph, with a fixture `Serves` as `intent/T3` already does | Never depends on Requirements' package |
| No Intent Node has an outgoing Edge | `intent/F1` | Checks Intent's own form |

None is written or run here. Verification of this Change is review of the map against the evidence named in `intent.md`, plus the repository's required checks (Branching, Change Isolation, CI).
