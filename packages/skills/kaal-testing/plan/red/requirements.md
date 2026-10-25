# RED Evidence and Accepted Regressions: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **testing/N1** [testing/I3]: Reading outcomes, checking the acceptance record, classifying and judging are pure and deterministic. They read nothing from the host and write nothing. The date an expiry is judged against is an input.
- **testing/N2** [testing/I1]: A Test Case's identity is the capability-qualified `<capability>/T<n>` at the start of its test title, such as `guard/T50`. It is never the test's position or its full title, so a reworded title keeps its identity.

## Functional

- **testing/F1** [testing/I1]: `outcomes(events)` reads the events of one `node:test` run and gives each leaf test's outcome by identity: GREEN when it passed, RED otherwise. Suites are not Test Cases. A leaf test that was skipped or marked `todo` is RED, and its marker is reported. It is never GREEN. A leaf test without an identity, such as a Code test, is not a Test Case. When it fails or is skipped, it is RED under `unidentified`, with its title. An identity that occurs twice in one run is a finding.
- **testing/F2** [testing/I1]: `classify` gives every RED Test Case of a run exactly one class, decided by comparing it with the same lane's outcomes on the base branch (for a collector, `main`):
  - **Feature RED**: the identity has no outcome on the base;
  - **Regression RED**: the identity is GREEN on the base;
  - **Persisting RED**: the identity is RED on the base too;
  - **Unidentified RED**: the test has no identity.
- **testing/F3** [testing/I2]: The acceptance record is a JSON file on the collector, `.kaal/config/testing/accepted.json`. Its `accepted` member lists acceptances. Each acceptance names:
  - `tests`: the identities it accepts, at least one;
  - `branch`: the one `kaal/*` collector it holds on;
  - `authority`: the Owner's review or comment that granted it, as its GitHub URL;
  - `expires`: the last day it holds, as `YYYY-MM-DD`;
  - `resolves`: optionally, the Change expected to turn the tests GREEN, as a capability-qualified Change id.

  `checkAccepted(record)` returns the findings for one record, empty when it conforms. Each finding names its member, such as `accepted.0.expires`.
- **testing/F4** [testing/I2]: An acceptance applies to a Regression RED only when all three hold: its identity is listed, the run is on the acceptance's `branch`, and the run's date is on or before `expires`. An expired acceptance applies to nothing and is reported as expired. An acceptance that lists a Test Case that is not a Regression RED in the run applies to nothing and is reported as stale, so it gets retired. An acceptance never applies to a Feature, Persisting or Unidentified RED.
- **testing/F5** [testing/I1, testing/I2]: `report(classification)` lists every RED with its identity and class. For each accepted regression it also gives the authority, branch and expiry. Counts give REDs by class. An accepted regression is counted as RED and is never counted or shown as GREEN.
- **testing/F6** [testing/I2, testing/I3]: `verdict(classification, gate)` returns `{ pass, blocking }`, where `blocking` is the set of identities, and the titles of unidentified tests, that fail the gate:
  - at `development` (a Change into a `kaal/*` collector): every Regression RED that no acceptance applies to, every Unidentified RED, and every duplicate identity;
  - at `promotion` (a `kaal/*` collector into `main`): the same, plus every Feature RED.

  A Persisting RED blocks neither gate, because the base already carries it, and it is still reported. `pass` is true exactly when `blocking` is empty. Acceptance subtracts single identities from the failing set, so accepting one regression can never unblock another.
