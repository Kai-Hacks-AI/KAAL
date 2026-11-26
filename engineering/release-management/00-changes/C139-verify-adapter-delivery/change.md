# C139 change

## Reason

Kai asked for small, meaningful controls that follow the change protocol: detective, then advisory behind a flag, then preventive only on the Owner's go. controls/C142 says the station and the flag are release's. This PLAN is that part, read from files only, never from a pull request text.

## The delivery map

One data file, `05-src/adapter/delivery-map.json`, owned by release: for each control of the repository that is delivered, the path of its **delivered entry**, the file that runs when the control runs (the judge script a workflow or a hook calls). A row is `{ "control": "<capability>/CTL<n>", "entry": "<path>" }`. The map names the entry; it does not say whether the entry runs through the adapter. That is read from the entry itself.

Why it is not a hand-kept list taken as proof (controls/F206 item 2): the set of delivered controls is checked against the delivered files, independently of the map. Every file under the installed delivery locations (`.github/workflows` and `.githooks`, release/A67) is either claimed by a row (its entry is what that file runs) or listed under `notControls`, an explicit list with a reason. A delivered file that nobody claims is a finding of its own, and the runner says UNKNOWN for it, never PASS.

## The runner

`05-src/adapter/run-verify-adapter.mjs`, reading the merge result of the pull request as a folder, as data and never run:

1. For each row of the map, read the entry at the merge result. A row whose entry file is absent is UNKNOWN (an observation cannot be made), never "not adapted".
2. `observeAdapted({control, entry: {path, text}, revision})` (controls/F212) gives `{control, revision, adapted}`, or throws for what it cannot read.
3. `findUnadapted({controls, delivered, observed, revision})` (controls/F206) gives the `unadapted:<id>` findings. The pair runs through `runControl` (controls/C141) in mode detective, which owns the fail-closed UNKNOWN, the log and the record.
4. The judge code, `observe-adapter.mjs`, `verify-adapter.mjs` and `adapter.mjs`, is the default branch's. The pull request is data, so a candidate cannot change the judge that judges it.
5. One line `adapter-evidence {...}` per run: `kind`, `pr`, `merge`, `run`, `verdict`, `findings`, the shape of the ACT judges' records (release/C127).
6. The flag is the variable `KAAL_CONTROLS_VERIFY_ADAPTER` handed in as `KAAL_FLAG`. Exactly `on` makes a FAIL or an UNKNOWN exit 1 (advisory: a red check no ruleset requires); anything else exits 0 with the same verdict written (detective).

## What the first run will say

Every release control entry is unadapted today (baseline), so the first advisory runs report one `unadapted:<id>` per delivered release control. That is the confirmed nonconformance controls/C142 expects, not a fault of the runner. Baselining it as a ratchet and migrating the entries to the adapter are their own Changes, after the evidence is read, and only on the Owner's go.

## The workflow source

`05-src/wiring/workflows/verify-adapter.yml`, source only. Plain `pull_request`, `contents: read`, no token, no secret, no `pull_request_target`, nothing installed; the default branch is checked out as the judge, the merge result at `pr` as data, one job named `verify Adapter`, the flag as `KAAL_FLAG`. It adds no trust boundary beyond verify Triggers and verify Envelope, so no new CTO proof is asked; the CPO's bypass proof for the installed workflow remains a step of the WIRE.

## Order

The DO needs `observe-adapter.mjs` of controls/C148 on the same line: release's DO waits for that DO, or takes it through a SYNC from `main`. Release adopts no copy of it. For the same reason T1554 can be seen GREEN only in the DO, once `observe-adapter.mjs` is on the line; in the PLAN it is seen RED on the absent runner, and its fixtures were written against the F212 text (an import of `runControl` from a specifier ending in `adapter.mjs`, and a call).

## Not in this Change

No WIRE, flag, required check or ruleset change. No migration of an entry to the adapter and no ratchet baseline. No change to controls' scripts. The parked Cases keep the one mechanism the lanes have today, as a carrier and not a model, as in release/C136; the lifecycle of an expected RED belongs to Engineering.

## Cases

T1554 (runner) and T1555 (workflow source) are parked `.red.mjs`.
