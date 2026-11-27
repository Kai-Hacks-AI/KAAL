# review/C6 DO

Authorized by the CPO's approval of the PLAN (#2604), and by the Owner's rule that a merged PLAN is the go for its DO.

## Delivered

- `13-source/scripts/judge-app.mjs` holds the judgements of the Inspector: `readDeclaration` reads a declaration as data and finds an ability beyond or short of its authority, `judgeApps` finds an App that decides on what it raised, `judgeWorkflow` judges the separation of the judge and the sign job as text, and `judgeSelfModification` and `checkEvidence` judge the provenance of a signed verdict. It reads data and text only and creates, installs and runs nothing.
- `13-source/github-apps/inspector.json` is the declaration of the Inspector: its three abilities, and the `appId` that the Owner recorded after creating the App by hand. No installation, key, workflow, `.github` file or WIRE is part of this DO.
- `test/inspector-app.test.mjs` runs the four Cases (review/T1535 to review/T1538) in `scripts.test`. The temporary `run-red.mjs` is removed.

## Not done

- The workflow source of the Inspector waits for the judge and the sign step of Controls to be on main, as the PLAN says, and then needs its own Case that `judgeWorkflow` finds it in.
- The rule on an `appId` (a positive whole number that no other App shares) belongs to review/F39 and the DO of review/C8, which also generalizes `readDeclaration` to the Approver.
- T1535 to T1538 stay provisional until release confirms the ids. No promotion, no installation and no publication.
