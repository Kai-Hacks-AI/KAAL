# C139 change

## Reason

Kai asked for small, meaningful controls that follow the change protocol: detective, then advisory behind a flag, then preventive only on the Owner's go. controls/C142 says the station and the flag are release's. This PLAN is that part, read from files only, never from a pull request text.

## The delivery map

One data file, `05-src/adapter/delivery-map.json`, owned by release. A row is `{ "control": "<capability>/CTL<n>", "delivered": "<installed file>", "entry": "<script>" }`: the **delivered** file (a workflow under `.github/workflows` or a hook under `.githooks`) and the **entry**, the script that delivered file runs when the control runs. The map only claims. It is not evidence, and it does not say whether the entry runs through the adapter.

**Two independent facts, kept apart (structural and operational).**

- *Operational: the delivered file really invokes the entry.* The runner reads the delivered file at the merge result and requires that its commands (`run:` steps, hook lines) invoke the mapped entry path. A compliant script that is merely named in the map but not invoked by the delivered file gives UNKNOWN for that control: never PASS, never a finding. A file that invokes several mapped entries, or an entry claimed by two controls, is ambiguous and also UNKNOWN.
- *Structural: the entry integrates the adapter.* That is `recognizeIntegration({control, entry: {path, text}, adapter, revision})` of controls/F212 (`scripts/recognize-adapter.mjs`), which returns `{control, revision, integration: 'recognized'}` or throws, and never says `adapted`. `adapter` is the path of the adapter module in the same root as the entry path, and the runner passes it. A recognition is structure and not execution, and gives no finding. **The absence of a recognizable pattern is not confirmed nonconformance:** it is unknown. Only `adapted: false` from other evidence, not from structure, is a finding (controls/F206 as amended), and release has no such evidence, so it never makes one. This PLAN follows the revised C148 and does not restate it.

**The inventory is checked against the delivered files, independently of the map.** Every file under `.github/workflows` and `.githooks` is claimed by a row or listed under `notControls`. A `notControls` exclusion is not taken on its word either: it must carry a reason and the runner checks it from the file, an exclusion standing only if the delivered file invokes no script of the repository's judges (a file that checks out, builds or publishes). An exclusion for a file that does invoke a script, a delivered file nobody claims, an unreadable file, or an inventory it cannot settle is UNKNOWN, never PASS.

## The runner

`05-src/adapter/run-verify-adapter.mjs`, reading the merge result of the pull request as a folder, as data and never run:

1. Settle the inventory and, per row, the operational fact above. A row it cannot establish is UNKNOWN (no observation is made for it).
2. For a row it can establish, read the entry at the merge result and call `recognizeIntegration({control, entry: {path, text}, adapter, revision})` (controls/F212), with the adapter module of the same root. A recognition counts as observed, with no finding; a throw is unknown.
3. `findUnadapted({controls, delivered, observed, revision})` (controls/F206) is called through `runControl` (controls/C141) in detective mode, which owns the fail-closed UNKNOWN, the log and the record. A delivered control with no recognizable integration is unknown, and the UNKNOWN names those controls: that list is the delivered controls not adapted, never a FAIL.
4. The judge code, `recognize-adapter.mjs`, `verify-adapter.mjs` and `adapter.mjs`, is the default branch's. The pull request is data, so a candidate cannot change the judge that judges it.
5. One line `adapter-evidence {...}` per run: `kind`, `pr`, `merge`, `run`, `verdict`, `findings`, the shape of the ACT judges' records (release/C127).
6. The flag is the variable `KAAL_CONTROLS_VERIFY_ADAPTER` handed in as `KAAL_FLAG`. Exactly `on` makes a FAIL or an UNKNOWN exit 1 (advisory: a red check no ruleset requires); anything else exits 0 with the same verdict written (detective).

## What the first run will say

Release's control entries do not integrate the adapter today, so the first advisory runs say UNKNOWN naming each delivered release control with no recognizable integration. That list is the evidence, advisory only, not a FAIL: a FAIL needs `adapted: false` from other evidence, and none exists. Baselining and migrating the entries are their own Changes, only on the Owner's go. Baselining it as a ratchet and migrating the entries to the adapter are their own Changes, after the evidence is read, and only on the Owner's go.

## The workflow source

`05-src/wiring/workflows/verify-adapter.yml`, source only. Plain `pull_request`, `contents: read`, no token, no secret, no `pull_request_target`, nothing installed; the default branch is checked out as the judge, the merge result at `pr` as data, one job named `verify Adapter`, the flag as `KAAL_FLAG`. It adds no trust boundary beyond verify Triggers and verify Envelope, so no new CTO proof is asked; the CPO's bypass proof for the installed workflow remains a step of the WIRE.

## Order

The DO needs `recognize-adapter.mjs` of controls/C148 on the same line: release's DO waits for that DO, or takes it through a SYNC from `main`. Release adopts no copy of it. For the same reason T1554 can be seen GREEN only in the DO, once `recognize-adapter.mjs` is on the line; in the PLAN it is seen RED on the absent runner, and its fixtures were written against the revised F212 text (a recognizable integration of `runControl` from the adapter module, and a call).

## Not in this Change

No WIRE, flag, required check or ruleset change. No migration of an entry to the adapter and no ratchet baseline. No change to controls' scripts. The parked Cases keep the one mechanism the lanes have today, as a carrier and not a model, as in release/C136; the lifecycle of an expected RED belongs to Engineering.

## Cases

T1554 (runner) and T1555 (workflow source) are parked `.red.mjs`. T1554 now carries the two negative Cases the CPO asked for: a mapped entry that the delivered file does not invoke, and an exclusion that is not justified, both UNKNOWN.
