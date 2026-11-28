# C181 change

## PLAN

1. Record the intent I39, the Requirement F239 and the Cases T1742 and T1743 (plain `.test.mjs`).
   - T1742 reads `engineering/14-operations/controls/flags.json` with the library's own `parseFlags` and `flagSource` and requires exactly eight entries: `release/CTL40` and `release/CTL41`, each at `Promoting`, `Collecting`, `Hotfixing` and `Wiring`, each with the name of its flag and the value `advisory`; no other control, no other value. It also requires that both controls exist in release's records and are declared preventive, so the file names no control that is not there. RED on `main`: the file is absent.
   - T1743 requires the file to be inert and valid: `validateFlags` over the two controls at the four stations is ok, no workflow or hook names `flags.json` or supplies `KAAL_FLAGS`, which release's entry needs to engage a flag (nothing is wired), and no entry is `preventing`, `on`, `stopped` or anything but `advisory` (no flip). RED on `main`: the file is absent.
   - Both were run GREEN against the file itself, which is the whole DO (about 40 lines of JSON, not committed). Without it the suite is the existing Cases GREEN and these two RED.
2. No script, workflow or ruleset change in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector `kaal/controls/kaal-flags`:

1. `engineering/14-operations/controls/flags.json`, `{ "schema": "kaal-controls/flags@1", "flags": [ ... ] }` with the eight entries of T1742, sorted by control and station, each named in the convention `KAAL_<CAPABILITY>_<CONTROL>` (Owner, 20 Nov 2026): `KAAL_RELEASE_VERIFY_PROMOTION_ORIGIN` for CTL40 and `KAAL_RELEASE_VERIFY_PROMOTION_HEAD_EVIDENCE` for CTL41, the same name at each of the four stations, value `advisory`.
2. T1742 and T1743 GREEN; the whole package suite GREEN under the lane. Mutations, each caught: a ninth entry; a value of `preventing`, `on` or `stopped`; a station missing; a control not in release's records; a duplicate entry; a workflow that names the file or supplies `KAAL_FLAGS`.
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
