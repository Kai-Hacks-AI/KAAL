# Intent product plan: Requirements

- **intent/F12. Candidate changes, in order** [intent/I6]. Each is a separate Change, and none starts without release under `intent/I7`.

| Change | What | Needs from others | Startable now? |
| --- | --- | --- | --- |
| `intent/C5` PLAN | Packaging readiness (LOVE) for `kaal-intent`: Lifecycle, Ownership, Verification, Encapsulation, as `requirements/C5` did for Requirements. Includes an Installation Contract instance and what the README must name | Core's Installation Contract (on `kaal/architecture` and Core); no Core install/upgrade/remove path yet | Yes, as a PLAN. It plans and does not need Core's path |
| `intent/C6` DO | Packed-package verification in a clean consumer, and the README naming every Node a consumer may rely on | `intent/C5`; Hosting-first registry order for any install by name | No: waits on `intent/C5` |
| `intent/C7` DO | First capability states an Intent element as a Node, to prove the `Serves` target side end to end | Requirements' `Serves` Definition (`requirements/C10`, #741, then its DO) and an adopting capability | No: waits on Requirements |
| `intent/C8` PLAN | The boundary between an Intent and a Defect or trigger, if the CPO wants either traceable | A CPO decision (raised in `intent/C3`) | No: needs a decision |

- **intent/F13. What "blocked" means for Intent** [intent/I6]. Intent is blocked as a capability only when `intent/C5` cannot be started and no other change above can proceed. Waiting on another capability for one change is stated on that change's PR, not on the capability.
- **intent/F14. No Intent store** [intent/I7]. None of these changes adds a registry, index or store of Intents. Each capability keeps its own (`intent/F3`).
