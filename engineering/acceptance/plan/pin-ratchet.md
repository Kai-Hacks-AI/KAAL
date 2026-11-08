# Engineering: the pin ratchet in the acceptance checks, and the root lock for Foundation 0.0.2

Two PLANs under foundation/C19 (amends C17, #848). Provisional numbers; rejudge against the collector at integration. No product, lock or test byte changes in this Change except the RED Case file named below.

## PLAN A: root lock for Foundation 0.0.2

- Precondition: the workspace Foundation is 0.0.2 on kaal/foundation (Foundation's layout Change). Core, Change and Testing stay on registry Foundation 0.0.1 (C19/I13); no consumer pin Change.
- Engineering derives `package-lock.json` independently of Foundation: `npm install --package-lock-only --ignore-scripts` on the exact head, compare blobs with Foundation's lock. Registry 0.0.1 copies of Foundation are nested under Core, Change and Testing.
- Checks: clean `npm ci --ignore-scripts` passes; a packed install of each consumer passes; `npm run manifest -w kaal-core -- --check` current after the build.
- Output: lock blob id, plus the ledger entry (id, paths, pre, post, digest) when the lock rides in a Change that touches other owners' paths.
- Not changed: any version, pin, or ruleset. No publication.

## PLAN B: narrow the single-copy assertions

- Today `engineering/acceptance/embed.test.mjs:167` fails any `node_modules` inside installed kaal-core, and C17 has a negative case "a consumer left on 0.0.1 must fail".
- Target: a nested Foundation copy of an OLDER published version under a consumer is a visible "pin-behind" report (fix soon), not a failure. It stays a hard failure when (a) the nested copy has the SAME version as the workspace one (a duplicate), (b) the nested version is below a floor that Foundation itself declares, (c) anything other than Foundation, Hosting or yaml is nested.
- Exit 4 "held" is a non-failing report in CI (CPO ask). No silent weakening: the report names consumer, nested version, workspace version.
- RED Case first (this Change): `engineering/acceptance/pin-ratchet.red.mjs`. Case 1 is RED on kaal/foundation (the assertion still refuses every nested copy); Cases 2 and 3 are controls that must stay GREEN after the fix (same-version duplicate fails; the host holds no kaal-graph). The declared-floor and foreign-package failures have no assertion to point at yet and get their Cases with the DO. The fix is a separate DO Change after approval.

## Order and cost

PLAN A waits for the Foundation layout head. PLAN B has no dependency: RED Case now, DO about one hour after the CPO's go. PLAN A DO (derivation and handover) about one hour after the layout head exists. Each DO needs its own CPO exact-head approval.
