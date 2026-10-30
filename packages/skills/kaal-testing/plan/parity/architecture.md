# Cross-Platform Inventory Parity: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A20** [testing/F56–testing/F58, testing/N11]: `kaal-testing/verifiers` (testing/A18) gains `parity(runs, { supported, weakening })`, still importing nothing. It gives `{ result, cases, findings }`:
  - `runs` is one `{ observed, facts }` per platform. `observed` is what `observe` gave. `facts` is testing/A18's, as the harness established it on that platform.
  - `cases` holds one `{ name, outcomes }` per declared case. `outcomes` maps each platform to the case's outcome there.
  - `weakening` defaults to none.

  `SCENARIOS`, `observe` and `judge` are unchanged, so testing/T54–testing/T62 stand as planned. The export inventory row for `./verifiers` (testing/A8) covers the addition.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | what the runs on a candidate's platforms establish together: the same declared cases, each visible everywhere, exemption only by established applicability, and the combined result |
| Each package | its supported platforms (packaging/F12), its cases, and each case's applicability |
| Engineering (#641) | running each supported platform on the one candidate, establishing each run's facts, the static scan for platform markers in non-Hosting tests, and resolving or reporting each weakening finding |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C31` PLAN, this Change | Testing | none |
| `testing/C32` DO: `parity` in `kaal-testing/verifiers`, testing/T70–testing/T73 GREEN in Testing's `npm test` | Testing | `testing/C31` |
| `engineering/C…` the release lane calls `parity` on each candidate's Linux, Windows and macOS runs (#641) | Engineering | `testing/C32` |
