# review/C8 DO

Authorized by the CPO's approval of the PLAN (#2702) and of its amendment (#2736), and by the Owner's rule that a merged PLAN is the go for its DO.

## Delivered

- `13-source/scripts/judge-approval.mjs` holds the judgement of the Approver. `makeJudgeApproval({ factOrigin })` builds it over a lookup of the origin of a fact, and the delivered `judgeApproval` is built with Hosting's own `factOrigin` from `@kaihacksai/kaal-hosting`, which no caller can replace. It answers `approve` or `abstain` and nothing else, fails closed and never throws. It approves only when the facts are attributed to Hosting and were read by the Approver, the head and base are those of the evidence, the ancestry is the base tip and main, every run of `verify Sync` at the head is completed, `success` and signed by the Inspector, the author is not the Approver, and the execution is trusted: the code of main, a trigger from the constant list (`workflow_run`), and a head that was not checked out.
- `13-source/scripts/judge-app.mjs` reads the declaration of the Approver beside the Inspector's (`readDeclaration(text, app)`), refuses an `appId` that is not a positive whole number (`bad-app-id`), and `judgeApps` finds two Apps that share an `appId` (`shared-app-id`).
- `13-source/github-apps/approver.json` is the declaration of the Approver: its four abilities. It has no `appId` yet; the Owner records it after creating the App by hand.
- `test/approver-app.test.mjs` runs the three Cases (review/T1587 to review/T1589) in `scripts.test`. The temporary `run-red.mjs` is removed.

## Not done

- No workflow, `.github` file, key, installation, WIRE or ruleset. The workflow that runs the judgement on a trusted trigger, and its proof of trusted execution at WIRE, are the CTO's and need the Owner's go. The Owner creates and installs the App.
- The `appId` of the Approver is recorded by the Owner in a later reviewed change.
- T1587 to T1589 stay provisional until release confirms the ids. No promotion and no publication.
