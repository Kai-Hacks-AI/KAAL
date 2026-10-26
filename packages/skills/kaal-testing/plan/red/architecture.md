# RED Evidence and Feature-Accepted Regressions: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A7** [testing/F1, testing/N4]: `kaal-testing/observe` exports `observe({ files, cwd })`. `testing/C5` moves the runner start, the reporter and the reading of its lines out of `accept`, into the one module that both `observe` and `accept` use.
  - **How it runs.** The runner runs through Hosting, as `accept`'s does today. The reporter is `testing/A5`'s.
  - **The run object.** The returned run is remembered through `lib/observed.mjs`, as `accept`'s is. The snapshot adds each given file's state: its SHA-256, or `absent`. Nothing else in Testing reads runner output.
  - **Not a second interpreter.** C8's `accept` keeps its contract and its tests, testing/T9–testing/T13, unchanged.
- **testing/A1** [testing/F2–testing/F6, testing/F10, testing/N1, testing/N2]: `kaal-testing/red` exports `outcomes`, `classify`, `report` and `evaluate`.
  - **Imports.** It imports only Testing's own `lib/observed.mjs`, to recall a run's snapshot, and no host module.
  - **Results.**
    - `outcomes(run)` returns `outcome(id)`, `marker(id)`, `file(id)`, `identities()`, `unidentified()` and `findings()`.
    - `classify` returns `reds` (`{ test, class, file, marker?, accepted? }`), `stale`, `findings` and `counts`.
    - `report` returns text.
    - `evaluate` returns `{ pass, blocking }`.
  - **What Testing does not do.** Testing chooses no lane, reads no Change record, reads neither GitHub nor the repository, and names no gate. Whoever runs a gate observes `head` and `base`, then hands in the FAR outcome and the policy.
- **testing/A2** [testing/F4, testing/F5]: **FAR belongs to Change.** Testing keeps no acceptance store. The earlier `.kaal/config/testing/accepted.json` is withdrawn, because acceptance is a Change decision, not Testing configuration.
  - **The FAR proposal.** A proposal traces the Change and its Intent through F/N, Architecture and TEST A FINDING (T → A/F/I/N, and D where applicable). It names the affected Test Cases and commitments, explains the proposed weakening, and presents alternatives.
  - **The negotiation and decision.** The negotiation, the decision (accept, reject, narrow or redesign), its authority and its record are Change's, planned in the Change capability's own Change.
  - **What Testing consumes.** Testing consumes only the decided outcome, in the shape of `testing/F4`. It never decides whether an entry was validly granted.
  - **What acceptance does not do.** An accepted change of behavior that needs a PLAN amendment gets one through its own authorized Change. Acceptance never edits a Test Case.
- **testing/A3** [testing/F3]: **Feature REDs are derived from observed evidence, not declared.** This follows the Owner's direction on #385: a new Feature Test Case normally starts RED, and one already GREEN is legitimate.
  - **What makes a Test Case new.** It is new only when the base observably lacked it: its file was observed absent, or the file ran to the end without it.
  - **Unknown baseline.** A Test Case the base gives no evidence on is Unknown baseline, never new. This keeps `testing/C8`'s rule that unknown evidence is not absent.
  - **Missing RED.** An established GREEN Test Case that disappears is a Missing RED, so a silently removed test cannot pass as an unchanged one.
  - **The register is withdrawn.** The register option from #381 (Option B in the earlier revision) is withdrawn: there is nothing to keep in step.
- **testing/A4** [testing/F10]: **The gates are Engineering's, and Guard executes them.**
  - **What Engineering's Change decides.**
    - which suites each lane requires;
    - how it observes `head` and `base` with `observe` in one process;
    - which FAR decisions a gate hands in, those of the Changes the candidate carries;
    - the policy of each gate.
  - **The policies this PLAN expects.** These are informative, and Engineering decides them.
    - `development` (a Change into a `kaal/*` collector) blocks `regression`, `missing`, `unknown` and `unidentified`.
    - `promotion` (a collector into `main`) also blocks `feature`.
  - **Guard** runs that check and reports its exit status. It keeps no policy of its own.
  - **guard/C13** lands with its planned assertions unchanged and its REDs real, once the development gate exists.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C4` PLAN, this Change | Testing | `testing/C8` (on `kaal/testing`) |
| `testing/C5` DO: `kaal-testing/observe` and `kaal-testing/red`, with `accept` on the shared observation; testing/T1–testing/T8 and testing/T14–testing/T15 GREEN in Testing's `npm test` | Testing | `testing/C4` |
| `change/C…` PLAN: FAR, covering proposal, negotiation, decision and record, and the outcome shape `testing/F4` consumes | Change | `testing/C4` |
| `engineering/C…` PLAN and DO: the development and promotion gates, observing `head` and `base`, handing in FAR outcomes and policies | Engineering | `testing/C5`, `change/C…` |
| `guard/C13` with real REDs | Guard | the development gate |

`testing/C3` (conformance findings as evidence) is planned separately and is independent of this graph.
