# C164 change

## PLAN

1. Record the intent I32, the Requirements F224, F225 and F226, the architecture A215 and the Cases T1723 to T1727 (plain `.test.mjs`, never renamed). The five are RED on the collector, because `scripts/flags.mjs`, `scripts/stamp.mjs` and `scripts/flag-status.mjs` are absent, and were run GREEN against a throwaway implementation that is not committed. The 118 other Cases stay GREEN. The adapter and the Cases of C158 are not changed.
2. No script, Skill word, record or workflow changes in the PLAN.

## STAMP (Kai)

Running of a control in a place is read as three separate facts, never merged. **Declared** is the decision of the flag: `STOPPED`, `ADVISORY` or `PREVENTING` (the legacy `on` reads as preventing and `off` as advisory). **Observed** is the signal of the runs: `OK`, `TORN` (it was meant to run and gave no verdict, a loud error) or `MUTE` (no trace of a run); a Stopped control expects no run and shows `N/A`. **Blocked** is the evidence of what actually blocked in the latest run, and **Blocking** is what the declaration makes the control do (Torn and Mute block under Preventing, only report under Advisory). STAMP is the state shown: Stopped, Advisory or Preventing when the observed signal is OK, otherwise Torn or Mute, so silence is never read as a choice. Stepwise escalation: a Preventing flag without an earlier Advisory run that gave a verdict is the finding `unproven-preventing`; making that a rule over the changes of the file is the Owner's decision, so none is built.

## One contract for a missing or unknown flag (CPO hold 3)

An unknown flag is a **configuration error**, not a state: it is not Mute, not Advisory and not off. (1) **`validateFlags({ controls, source })`** finds it before anything runs: every preventive or detective control has a recognized flag in every place it runs, else `no-flag:<control>@<place>` or `unrecognized-flag:<control>@<place>`; for a control the owner's record declares preventive the error is named `preventive-without-flag`, so it is loud; an unknown flag never blocks, because only an explicit flag authorizes blocking; orphan flags are not errors; the adopter stops before running when it is not `ok`. (2) **`toBoundary`** refuses it (throws), so an unknown value can never reach the adapter as off or as on. (3) **STAMP and the report** show it as a configuration error with `declared`, `observed`, `stamp` and `blocking` empty, and the evidence of what blocked stays visible. (4) A legacy caller that passes no flag at all keeps today's behavior (the adapter, C158, runs it as asked and it may block), because changing that would drop protection silently; it is not concealed: the finding `blocked-without-flag` is named beside the configuration error. (5) Every mismatch between decision, signal and evidence is a named finding: `ran-while-stopped`, `blocked-while-stopped`, `blocked-while-advisory`, `blocked-unexpectedly`, `not-blocked-while-preventing`. Pinned by T1724 (validation, `toBoundary`, the adapter end to end), T1725 (the judgement) and T1726 (the report). First entries and each escalation are separate Owner decisions.

## Enforcement and configuration failure (CPO hold 4)

An unknown flag never enforces by verdict: only an explicit flag authorizes a control to block by its verdict. A configuration failure is a different thing, a CI failure, and `decideOutcome` pins the exact pipeline outcome: a declared-preventive control with a missing file, a missing entry or an invalid value is `CONFIG_FAILED` with `preventive-without-flag`, nothing runs, no verdict is recorded and the entry exits non-zero (the job is red and the merge stops, as a configuration failure and not as enforcement); a detective control with the same inputs is `CONFIG_FAILED` with `no-flag` or `unrecognized-flag`, exit 0, a finding only; a legacy caller with no `boundary.flag` and no validation runs as asked (C158) and a block is `blocked-without-flag`, enforcement `legacy`. Pinned by T1724 (all the inputs, for both declared types, and the legacy path) and T1726 (the same configuration through the report). Release maps the exit to its job, and the library sets no exit code of its own.

## Ownership (Kai)

- **Package** (`@kaihacksai/kaal-controls`): the file format `kaal-controls/flags@1`, `parseFlags`, `flagSource`, `validateFlags`, `decideOutcome`, `reportFlags`, `renderFlagStatus`. Free of KAAL, hosting and any path of an adopter; T1724 and T1726 guard it.
- **KAAL's controls instance**: the file `engineering/14-operations/controls/flags.json`, beside the control records it governs, and its values. A flip is a pull request that changes that file, reviewed like any change. The library never writes it.
- **Hosting**: reading the file as it is at the base of a pull request is platform mechanics and Hosting's. The library takes the text.
- **Release** (an adopter): declares which controls its checks have and the places they run in, reads the file text from the base, validates the file with `validateFlags` and stops when it is not ok, asks the source for each control and place (`source.of(id, place)`), converts with `toBoundary` and passes the answer as `boundary.flag`, or does not run a Stopped control. It writes no mode logic, because `runControl` decides what a flag value means (C158) and `toBoundary` is the library's.

## DO

Not authorized by this PLAN. On its merge into the collector, and with C158 on main and the collector synced:

1. `scripts/flags.mjs`, `scripts/stamp.mjs` and `scripts/flag-status.mjs`, pure. A thin command in the manner of `judge-mode.mjs` that reads a flags file, the control list and the run answers from paths it is given and prints the Markdown report, with no platform word.
2. The first `flags.json` of KAAL's instance with the entries Release declares, as a change of its own to the instance on the Owner's go (the library ships none).
3. One paragraph in the reference that owns the adapter. T1723 to T1727 GREEN; the package suite GREEN. Mutation patches for each weakening, as in C157 and C158: a partly read file used, a missing or unknown flag read as off or Mute, a duplicate control accepted, a flag disagreement not named, a Torn state read as Advisory, a Mute state read as Stopped or Advisory, Torn or Mute not blocking under Preventing, an unknown flag value accepted by `toBoundary`, a block under Stopped or Advisory hidden, a configuration failure read as enforcement or the reverse, a preventive configuration failure exiting 0, a detective one exiting non-zero, a declared state shown in place of an observed one, an unproven Preventing hidden, an orphan flag hidden.

## ACT

A retro entry in the collector.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Key of an entry.** The control id and the place (`release/CTL42` in `pull_request`), one entry for each pair, because STAMP is the state of a control in a place. A place is an opaque text of the adopter's (a station, controls/C161). A check that holds several controls has an entry for each. Release asked for `release/check-1` names: a check is not a control, so I recommend control ids.
2. **Which copy is read.** The file at the base of the pull request, never the pull request's own copy, so a pull request cannot switch off the control that judges it (F224 item 6). The library cannot tell and says so; the adopter reads it, through Hosting.
3. **Flag name.** Stored in the file with the entry (`name`), so the adopter's convention (`KAAL_<CAP>_<CONTROL>`) lives in the adopter's file and not in the library.
4. **Missing or unknown entry.** A configuration error found by `validateFlags` before execution (`no-flag`, `unrecognized-flag`, or `preventive-without-flag` for a control declared preventive), refused by `toBoundary`; never read as off, stopped or Mute, and never passed to the adapter.
5. **Second source.** A flag source from Hosting (GitHub variables) is a later decision. The seam is `of(control)`, and nothing in the library names it.
6. **Placement.** The three scripts are flat in `scripts/` as `judge-running.mjs` is. The layout of C160 and the restructure of C163 move pure files into `scripts/lib/` when they land.
7. **Runs and last run.** The adopter hands the established runs of a control in a place, oldest first, each with its verdict (none when established without a record, which is how Torn shows). `last` is the newest. The library carries no date.
8. **Stopped.** The adopter does not run a Stopped control (`toBoundary` gives `null`). Stopped is known from the file and needs no run, so its observed signal is `N/A`; if it ran or blocked anyway, that is shown as a finding. The adapter is not changed.
9. **Legacy values.** `on` and `off` stay readable so that C158 and its callers work unchanged; the new values are the vocabulary of the file. A later Change may retire the legacy ones.

10. **Room for an escalation ratchet (pending the Owner's answer).** A rule that a flag may be `on` only when the control is wired and its evidence counts are met, and that `on` to `off` is only an explicit de-escalation, would judge changes of this file. The file format leaves room for it: an entry is an object, so fields (a history line, a reason) can be added in a later version of the schema, and `parseFlags` refuses an unknown schema rather than guessing. Nothing of it is built or decided here.
11. **Collector.** This Change has its own collector `kaal/controls/flag-file`, branched from the tip of `kaal/controls/flag-status` because the DO and Case T1724 use C158's flag in the run. It is synced with main after C158 is promoted, and it never holds C158 back.

## Not here

No DO, WIRE, flag, workflow, required check, ruleset or publish. The first real `flags.json` and every flip are separate Owner decisions.
