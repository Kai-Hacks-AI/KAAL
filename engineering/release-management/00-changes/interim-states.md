# Interim states (A to B)

Mechanisms that stand in for a target element until it exists. Each is marked temporary where it runs, names the target it stands in for, and ends by a condition a Case judges.

- **The testing controls read `far.json` themselves.**

  Interim: test Candidate and test Integration are built as a temporary version that reads the same `far.json` record shape as `change/F7` to `F10`, parses it with a real parser and says "interim, replaced by kaal-change/far" in its output. `kaal-change/far` (`change/C2`) is a PLAN and its DO (`proposal`, `decide`, `exceptions`, `compose`) is not built (Owner, 9 Nov).

  Target: F18, F12, F16.

  Difference: the target uses the FAR capability; the interim does the same reading in the controls.

  Ends when: `kaal-change/far` is built and the controls use it, which T9 judges against the replacement; the replacement swaps the module and not the record.

- **The old `pull_request_target` checks stay required.**

  Interim: until a fail-closed trust root is demonstrated live, no existing required context is removed and the four old `pull_request_target` workflows stay; the new trusted controls are added next to them (add-new) and are not required. A gate that has to wait for a control that still runs under another event waits on that check run by API and fails closed, the pattern `merge-group-review.yml` already uses. If the trust root is not demonstrated, the migration stops at "add new, remove nothing", and the default block of 2 Dec 2026 is an open decision for the Owner.

  Target: F17, F6, F14.

  Difference: the target has no `pull_request_target` and a trust root that the candidate cannot change.

  Ends when: the trust root is demonstrated and the old contexts and workflows are removed, which T10 judges live.

- **The testing gate consumes verified authorizations and verifies none.**

  Interim: `05-src/lanes/gate.mjs` reads an `authorized` input for one boundary and treats a candidate-carried Accept as no authority. Nothing produces that input yet: the verifier belongs to Change (PLAN #1342, `kaal-change/far`) and is not built. With no verifier, every missing, skipped or conditional lane fails the gate.

  Target: F18, F12, F16.

  Difference: the target gate receives the output of Change's verifier; the interim has the contract and the fail-closed behavior, and no producer.

  Ends when: `kaal-change/far` produces the authorization input and the gate consumes it, which T23 judges.

