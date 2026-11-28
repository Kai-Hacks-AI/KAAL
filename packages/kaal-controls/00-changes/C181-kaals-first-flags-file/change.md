# C181 change

## PLAN

1. Record the intent I39, the Requirement F239 and the Cases T1742 and T1743 (plain `.test.mjs`). The Cases are enduring: they hold for the first file and for every later entry, flip or WIRE. What the first file holds is this Change's acceptance evidence (below), not a permanent rule.
   - T1742 reads `engineering/14-operations/controls/flags.json` with the library's `parseFlags` and requires that every entry names a control that has a record, and that each control has one flag name in the convention `KAAL_<CAPABILITY>_<CONTROL>`. RED on `main`: the file is absent.
   - T1743 requires every entry to carry a state the library recognizes (`stopped`, `advisory`, `preventing`) and `validateFlags` to be ok for each control at each place the file names. RED on `main`: the file is absent.
   - Both were run GREEN against the file itself (the whole DO, about 40 lines of JSON, not committed). Without it the suite is the existing Cases GREEN and these two RED.
   - Acceptance evidence of this Change, checked once at its DO and recorded in its ACT, outside the permanent suite: exactly eight entries, `release/CTL40` and `release/CTL41` at `Promoting`, `Collecting`, `Hotfixing` and `Wiring`, named `KAAL_RELEASE_VERIFY_PROMOTION_ORIGIN` and `KAAL_RELEASE_VERIFY_PROMOTION_HEAD_EVIDENCE`, all `advisory`; both controls declared preventive; no workflow or hook names the file or supplies `KAAL_FLAGS`. Later entries, flips and WIREs are their own Changes with their own acceptance evidence and do not break T1742 or T1743.
2. No script, workflow or ruleset change in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector `kaal/controls/kaal-flags`:

1. `engineering/14-operations/controls/flags.json`, `{ "schema": "kaal-controls/flags@1", "flags": [ ... ] }` with the eight entries of T1742, sorted by control and station, each named in the convention `KAAL_<CAPABILITY>_<CONTROL>` (Owner, 20 Nov 2026): `KAAL_RELEASE_VERIFY_PROMOTION_ORIGIN` for CTL40 and `KAAL_RELEASE_VERIFY_PROMOTION_HEAD_EVIDENCE` for CTL41, the same name at each of the four stations, value `advisory`.
2. T1742 and T1743 GREEN; the whole package suite GREEN under the lane. Mutations the Cases catch: a control with no record; a flag name outside the convention or two names for one control; an unrecognized value; a place that fails `validateFlags`; a duplicate entry. The acceptance evidence is checked by hand at the DO: a ninth entry, a value other than `advisory`, a missing station, or a workflow naming the file or supplying `KAAL_FLAGS` each fail it.
3. ACT: a retro entry in the collector. Then the Promoting thread promotes the collector, with CPO review. Release is told when it is on `main`.

## Why advisory and why these entries

`advisory` makes the control run and report without blocking, which is the first step of the stepwise escalation (no Preventing without proof of an earlier Advisory run). Both controls are declared preventive; their record station declarations and the flip to `on` come later, each on the Owner's go. The four stations are the ones Promotion Source runs at on every pull request, so a flag resolves at the station of every target even where the control is not applicable (Release's note). Entries for the controls of checks 2 and 1 follow at their own swaps, each its own Change.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Which Change holds the file.** The file belongs to KAAL's controls instance (engineering), the Change to Controls, because the format and the reader are the package's and the request came through Controls. Change Isolation only separates `.github`; this Change touches no `.github` path.
2. **The flag names.** One name per control, the same at every station, in the convention; if Release asks for different names, the Cases follow its list before the DO.
3. **Read from base.** The reader reads the file at the base of a pull request, never the PR's own copy (C164); a later change of a flag is a reviewed pull request that edits this file.
4. **Order.** Behind the 2 December work; the file is inert, so it can land before the swap WIRE and delays nothing.

## Not here

No WIRE, flip, escalation, ruleset, required check, workflow, record station declaration or npm publish. Nothing is switched on.
