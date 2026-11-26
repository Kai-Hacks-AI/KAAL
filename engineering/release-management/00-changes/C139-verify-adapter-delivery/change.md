# C139 change

## Reason

Kai asked for small, meaningful controls that follow the change protocol: detective, then advisory behind a flag, then preventive only on the Owner's go. controls/C142 says the station and the flag are release's. This PLAN is that part, read from files only, never from a pull request text.

## The delivery map

One data file, `05-src/adapter/delivery-map.json`, owned by release. A row is `{ "control": "<capability>/CTL<n>", "delivered": "<installed file>", "entry": "<script>" }`: the **delivered** file (a workflow under `.github/workflows` or a hook under `.githooks`) and the **entry**, the script that delivered file runs when the control runs. The map only claims. It is not evidence, and it does not say whether the entry runs through the adapter.

**Structural and operational evidence, kept apart.**

- *Structural: the delivered file names the entry, and the entry integrates the adapter.* A static read of the delivered file at the merge result shows that its commands (`run:` steps, hook lines) invoke the mapped entry path. That is structure, not operation: it says what the file would run, not that it ran. The entry's integration is `recognizeIntegration({control, entry: {path, text}, adapter, revision})` of controls/F212 (`scripts/recognize-adapter.mjs`), which returns `{control, revision, integration: 'recognized'}` or throws, and never says `adapted`. `adapter` is the path of the adapter module in the same root as the entry path, and the runner passes it. A recognition is structure and not execution, and gives no finding. A mapped entry the delivered file does not invoke gives UNKNOWN for that control.
- *Operational: the entry ran through the adapter.* Only execution evidence is operational (a record of a run, which the adapter supplies). This Change reads none, so it never claims an operational fact. Everything it observes is structural, and its verdict says so.
- **The absence of a recognizable pattern is not confirmed nonconformance:** it is unknown. Only `adapted: false` from other evidence is a finding (controls/F206 as amended), and release has no such evidence, so it never makes one. This PLAN follows the revised C148 and does not restate it.
- **Identity is kept per control.** A delivered file may legitimately invoke several mapped entries; each row is established on its own, by its own `{control, delivered, entry}`, and the verdict of one never stands for another. Only an entry claimed by two controls is ambiguous, because its identity is not one, and it is UNKNOWN.

**Evidence completeness (CPO, #2628).** The map declares the delivered directories it inventories (`inventory`, a non-empty list of paths), its `rows` (non-empty, each with `control`, `delivered` and `entry`) and its `notControls` (a list, possibly empty). A map that is absent, not JSON, not an object, or lacks or malforms any of them is UNKNOWN naming the map and the missing part, never a PASS. A declared directory that is missing, not a directory, a dangling link or unreadable is UNKNOWN naming the location: an inventory that cannot be inspected is not an empty one. Only a directory that exists, is readable and holds no file is verified empty. A pull request folder that cannot be read is UNKNOWN too. Each of these is UNKNOWN and nothing else: never a FAIL, never a PASS and never `adapted: false`, and the verdict names the map or the location, not a control. The Cases are T1557 (new, parked) and T1554 (its map fixtures declare `inventory`); the DO satisfies them without changing them.

**The inventory is checked against the delivered files, independently of the map.** Every file under `.github/workflows` and `.githooks` is claimed by a row or listed under `notControls`. A `notControls` exclusion is not taken on its word either: it must carry a reason and the runner checks it from the file, an exclusion standing only if the delivered file invokes no script of the repository's judges (a file that checks out, builds or publishes). An exclusion for a file that does invoke a script, a delivered file nobody claims, an unreadable file, or an inventory it cannot settle is UNKNOWN, never PASS.

## The runner

`05-src/adapter/run-verify-adapter.mjs`, reading the merge result of the pull request as a folder, as data and never run:

1. Settle the inventory and, per row, the structural fact above (the delivered file invokes the entry). No operational fact is read. A row it cannot establish is UNKNOWN (no observation is made for it).
2. For a row it can establish, read the entry at the merge result and call `recognizeIntegration({control, entry: {path, text}, adapter, revision})` (controls/F212), with the adapter module of the same root. A recognition counts as observed, with no finding; a throw is unknown.
3. `findUnadapted({controls, delivered, observed, revision})` (controls/F206) is called through `runControl` (controls/C141) in detective mode, which owns the fail-closed UNKNOWN, the log and the record. Any runtime observation (`adapted: true|false`) that exists is passed through unchanged, next to the recognitions and never merged with them: a recognition never overrides, hides or resolves an `adapted: false`, and `true` plus `false` for one control and revision stay contradictory (controls/F206 item 8, controls/T1553). A delivered control with no recognizable integration is unknown, and the UNKNOWN names those controls: that list is the delivered controls without a recognizable integration, never a FAIL and never read as `adapted: false`.
4. The judge code, `recognize-adapter.mjs`, `verify-adapter.mjs` and `adapter.mjs`, is the default branch's. The pull request is data, so a candidate cannot change the judge that judges it.
5. One line `adapter-evidence {...}` per run: `kind`, `pr`, `merge`, `run`, `verdict`, `findings`, the shape of the ACT judges' records (release/C127).
   **The line binds the revision by bytes (CPO, #2628), not by a printed sha.** It also carries `digests`: the Git blob id of every file the runner read (the map, each delivered file, each entry), computed from the bytes it read. `run-verify-adapter.mjs --bind <evidence file> --git <repo>` re-reads the same paths from Git at the recorded `merge` (`git rev-parse <merge>:<path>`) and compares. Every digest equal is `BOUND`; a different digest, a path absent at the sha, a `merge` that does not resolve or is missing, absent or empty `digests`, or a line that is not evidence is UNKNOWN naming the path or part, never a PASS and never a FAIL. T1558 holds the Cases. A later push gives a new line, and an old line never stands for a new revision.
6. The flag is the variable `KAAL_CONTROLS_VERIFY_ADAPTER` handed in as `KAAL_FLAG`. Exactly `on` makes a FAIL or an UNKNOWN exit 1 (advisory: a red check no ruleset requires); anything else exits 0 with the same verdict written (detective).

## What the first run will say

Release's control entries do not integrate the adapter today, so the first advisory runs say UNKNOWN naming each delivered release control with no recognizable integration. That list is the evidence, advisory only, not a FAIL: a FAIL needs `adapted: false` from other evidence, and none exists. UNKNOWN is never ratchetable: no control that reads UNKNOWN is baselined, and this Change implies no baseline for it. Migrating the entries to the adapter is its own Change, after the evidence is read, and only on the Owner's go.

## The workflow source

`05-src/wiring/workflows/verify-adapter.yml`, source only. Plain `pull_request`, `contents: read`, no token, no secret, no `pull_request_target`, nothing installed; the default branch is checked out as the judge, the merge result at `pr` as data, one job named `verify Adapter`, the flag as `KAAL_FLAG`. It adds no trust boundary beyond verify Triggers and verify Envelope, so no new CTO proof is asked; the CPO's bypass proof for the installed workflow remains a step of the WIRE.

## Order

The DO needs `recognize-adapter.mjs` of controls/C148 on the same line: release's DO waits for that DO, or takes it through a SYNC from `main`. Release adopts no copy of it. For the same reason T1554 can be seen GREEN only in the DO, once `recognize-adapter.mjs` is on the line; in the PLAN it is seen RED on the absent runner, and its fixtures were written against the revised F212 text (a recognizable integration of `runControl` from the adapter module, and a call).

## Not in this Change

No WIRE, flag, required check or ruleset change. No migration of an entry to the adapter, and no ratchet baseline of an UNKNOWN. No change to controls' scripts. The parked Cases keep the one mechanism the lanes have today, as a carrier and not a model, as in release/C136; the lifecycle of an expected RED belongs to Engineering.

## Cases

T1554 (runner), T1555 (workflow source) and T1557 (evidence-completeness boundaries) are parked `.red.mjs`. T1554 now carries the two negative Cases the CPO asked for: a mapped entry that the delivered file does not invoke, and an exclusion that is not justified, both UNKNOWN.
