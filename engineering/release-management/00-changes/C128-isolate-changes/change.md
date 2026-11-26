# C128 change

## PLAN

A rename, and nothing else. The behavior, the answers (`own`, `inherited`, no attribution), the evidence and the consumer contract of release/C123 are unchanged.

### Decisions (the approval of this pull request is the go for the DO)

1. **The name is `isolate Changes`.** The verb is the control's, in the form of the other controls (`hold Act`, `limit Act`): it isolates the collector's own changes. The classes keep their words.
2. **What changes with it**, each a rename of the same thing:
   - the control record `04-controls/CTL33-attribute-changes/CTL33.md` becomes `04-controls/CTL33-isolate-changes/CTL33.md`, title `isolate Changes`, and its text; the id `release/CTL33` and the Intent `release/I67` stay;
   - the library `lib/attribute-changes.mjs` becomes `lib/isolate-changes.mjs`, exporting `isolateChanges`;
   - the runner mode `attribute` becomes `isolate`, `attributionOf` becomes `isolationOf`, and its report line reads `isolate Changes`;
   - the workflow source: the job and the check become `isolate Changes`, the flag `KAAL_RELEASE_ISOLATE_CHANGES`;
   - the fixture `attribution-fixtures.mjs` becomes `isolation-fixtures.mjs`; the Cases T1352 to T1360 keep their ids and file names and change the text they read; T1314 lists the new layer name.
3. **Nothing installed is renamed.** The installed workflow carries no check of this control and no variable exists, so no WIRE, ruleset or variable changes here. The WIRE that installs the check follows this Change and carries the new name; it is a separate review and needs the Owner's go.
4. **History stays.** The records of release/C123 (its PLAN, DO, Defect and the retro RT12) say what happened under the old name and are not rewritten. The accepted edits are the Cases that read the old names, and they are recorded in `do.md`.
5. **The flag.** `KAAL_RELEASE_ISOLATE_CHANGES`, exactly `on` is live. The flag of the old name never existed.

### Cases

No new behavior and no new Case: T1352 to T1360 pass unchanged in what they pin (the same fixtures, the same answers) under the new names. T1360, which pins the record, the check name and the flag, is the one that proves the rename is complete; a leftover of the old name in the source is a red Case.
