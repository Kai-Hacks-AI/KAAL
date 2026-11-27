# C164 change

## PLAN

1. Record the intent I32, the Requirements F224 and F225, the architecture A215 and the Cases T1723 to T1726 (plain `.test.mjs`, never renamed). The four are RED on the collector, because `scripts/flags.mjs` and `scripts/flag-status.mjs` are absent, and were run GREEN against a throwaway implementation that is not committed. The 118 other Cases stay GREEN.
2. No script, Skill word, record or workflow changes in the PLAN.

## Ownership (Kai)

- **Package** (`@kaihacksai/kaal-controls`): the file format `kaal-controls/flags@1`, `parseFlags`, `flagSource`, `reportFlags`, `renderFlagStatus`. Free of KAAL, hosting and any path of an adopter; T1724 and T1726 guard it.
- **KAAL's controls instance**: the file `engineering/14-operations/controls/flags.json`, beside the control records it governs, and its values. A flip is a pull request that changes that file, reviewed like any change. The library never writes it.
- **Hosting**: reading the file as it is at the base of a pull request is platform mechanics and Hosting's. The library takes the text.
- **Release** (an adopter): declares which controls its checks have, reads the file text from the base, asks the source for each control (`source.of(id)`), and passes the answer as `boundary.flag`. It writes no mode logic, because `runControl` decides what a flag value means (C158).

## DO

Not authorized by this PLAN. On its merge into the collector, and with C158 on main and the collector synced:

1. `scripts/flags.mjs` and `scripts/flag-status.mjs`, pure. A thin command in the manner of `judge-mode.mjs` that reads a flags file, the control list and the run answers from paths it is given and prints the Markdown report, with no platform word.
2. The first `flags.json` of KAAL's instance with the entries Release declares, as a change of its own to the instance on the Owner's go (the library ships none).
3. One paragraph in the reference that owns the adapter. T1723 to T1726 GREEN; the package suite GREEN. Mutation patches for each weakening, as in C157 and C158: a partly read file used, a missing flag read as off, a duplicate control accepted, a flag disagreement not named, a switched-off control reported as preventive, an orphan flag hidden.

## ACT

A retro entry in the collector.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Key of an entry.** The control id (`release/CTL42`), one entry for each control, so that the report is per control. A check that holds several controls has an entry for each. Release asked for `release/check-1` names: a check is not a control, so I recommend control ids.
2. **Which copy is read.** The file at the base of the pull request, never the pull request's own copy, so a pull request cannot switch off the control that judges it (F224 item 6). The library cannot tell and says so; the adopter reads it, through Hosting.
3. **Flag name.** Stored in the file with the entry (`name`), so the adopter's convention (`KAAL_<CAP>_<CONTROL>`) lives in the adopter's file and not in the library.
4. **Missing entry.** Passed on as missing, so the run is `UNKNOWN` and the report says `no-flag`. Never read as off.
5. **Second source.** A flag source from Hosting (GitHub variables) is a later decision. The seam is `of(control)`, and nothing in the library names it.
6. **Placement.** The two scripts are flat in `scripts/` as `judge-running.mjs` is. The layout of C160 and the restructure of C163 move pure files into `scripts/lib/` when they land.
7. **Last run.** `last` is the last counted record in the order the adopter lists its records (newest last), because `judgeRunning` carries no date.

## Not here

No DO, WIRE, flag, workflow, required check, ruleset or publish. The first real `flags.json` and every flip are separate Owner decisions.
