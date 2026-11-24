# C17 DO

Built from the merged PLAN, on the collector `kaal/controls/kaal-minimum-evidence`.

- The ten controls registered in `engineering/release-management/04-controls/` each declare an `evidence` line, as in `interface.md`: detective `[fixture:2, real:1, provoked:1:fail]`, preventive and corrective `[fixture:2, real:2, provoked:1:fail]`. The numbers are a starting point for each control's owner to confirm.
- The ten release Cases that compare a control file with its draft (T540, T600, T730, T750, T751, T752, T860, T880, T1116, T1129) strip the `evidence` line, one replace each.
- `engineering/controls/06-records/README.md` holds the folder for control run records. `05-src/report-to-records.mjs` turns a `kaal-testing` report into records and carries `base` only for a test RED on the base report and GREEN on the head; Case T1097 covers it.
- Case T778 (controls/F23) runs the product check on `engineering/` without and with `--records engineering/controls/06-records`.
- Cases T1094 to T1096 renamed from `.red.mjs` to `.test.mjs`.

## Evidence

- `node --test engineering/cases/cases.test.mjs`: 281 pass and 16 fail. The 16 are the names that fail on `main` and no other fails; T1094 to T1097, T778 and the ten release Cases are green. `npm test` in `packages/kaal-controls`: 50 Cases pass.
- No control claims `tested`, no record exists yet, and no flag, ruleset, workflow, hook or App changed.
