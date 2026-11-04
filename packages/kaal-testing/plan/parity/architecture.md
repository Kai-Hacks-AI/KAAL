# Cross-Platform Inventory Parity: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A20** [testing/F56–testing/F58, testing/F67, testing/N11]: `kaal-testing/verifiers` (testing/A18) gains `parity(runs, { supported, osBoundary, challenged })`, still importing nothing. It gives `{ result, cases, findings }`:
  - `runs` is one `{ observed, facts }` per platform. `observed` is what `observe` gave. `facts` is testing/A18's, as the harness established it on that platform.
  - `cases` holds one `{ name, outcomes }` per declared case. `outcomes` maps each platform to the case's outcome there.
  - `osBoundary` defaults to `false`: the package is not the operating-system boundary unless the harness established that it is (testing/F67).
  - `challenged` defaults to none.

  `SCENARIOS`, `observe` and `judge` are unchanged, so testing/T54–testing/T62 stand as planned. The export inventory row for `./verifiers` (testing/A8) covers the addition.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the general test outcomes and the cross-platform evidence semantics: the same declared cases on every platform, each visible everywhere, exemption only by established applicability, the combined result, and refusing a platform scope outside the boundary as evidence. Testing authorizes no operating-system exception. |
| Hosting | the operating-system boundary: its OS-specific implementation and tests, and its declared platform scopes. It also owns the architectural rule that nothing else knows the OS, and supplies the cross-capability conformance suite and review guidance that challenge OS-specific implementation, assertions, test selection and applicability in every other capability. |
| Each package | its supported platforms (packaging/F12), its cases, and each case's applicability by optional complement |
| Engineering (#641) | executing and enforcing the checks, and reporting their evidence: running each supported platform on the one candidate, establishing each run's facts and `osBoundary` from Hosting's declaration (`osBoundary(name)`, hosting/F36), running Hosting's suite, and passing `challenged` from Hosting's portability audit (`portability().challenged`, hosting/F40). Engineering takes no ownership of Hosting's rule. |

## In the release lane

For each candidate, Engineering:
1. packs the candidate and installs it into a fresh consumer on Linux, Windows and macOS;
2. runs the package's own verifier on each platform, then `observe` and `judge` (testing/A18) on each run;
3. runs Hosting's cross-capability suite against the candidate's sources and tests, and gives Hosting's review guidance to the review of each Change, reporting every unresolved finding by case;
4. establishes `osBoundary` from Hosting's declaration of the boundary, `osBoundary(name)` (hosting/F36), which is `true` for Hosting alone, and never from the package's own claim;
5. calls `parity(runs, { supported, osBoundary, challenged })` and reports its result and findings beside the package's own results.

A platform scope in a non-Hosting package is then refused twice: Hosting's suite reports it as a violation, and `parity` refuses to count it as evidence (testing/F67).

**For testing/F47.** It judges one run and is unchanged, so testing/T54–testing/T62 stand. Its platform scope is an exemption only for the boundary. The harness must not establish a platform scope for another package as an exemption, and `parity` refuses one that it does establish.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C31` PLAN, this Change | Testing | none |
| `testing/C32` DO: `parity` in `kaal-testing/verifiers`, testing/T70–testing/T73 GREEN in Testing's `npm test` | Testing | `testing/C31` |
| `hosting/C13`/`hosting/C14` (#650), extended by `hosting/C16`: the cross-capability suite and review guidance that challenge OS-specific behaviour outside Hosting. `hosting/C16` adds platform-scoped applicability in manifests and the Hosting-owned declaration from which Engineering establishes `osBoundary` | Hosting | `hosting/C16` on `testing/C31` |
| `engineering/C…` the release lane runs Hosting's suite and calls `parity` on each candidate's Linux, Windows and macOS runs (#641) | Engineering | `testing/C32`, `hosting/C14`, `hosting/C16` |
