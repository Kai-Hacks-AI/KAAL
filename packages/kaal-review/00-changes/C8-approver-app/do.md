# review/C8 DO

Authorized by the CPO's approval of the PLAN (#2702) and of its amendments (#2736 and the amendment that aligns the Cases with Hosting's delivered contract), and by the Owner's rule that a merged PLAN is the go for its DO.

## Delivered

- `13-source/scripts/judge-approval.mjs` holds the judgement of the Approver. `makeJudgeApproval({ factOrigin })` builds it over a lookup of the origin of a fact, and the delivered `judgeApproval` is built with Hosting's own `factOrigin` from `@kaihacksai/kaal-hosting`, which no caller can replace. It answers `approve` or `abstain` and nothing else, fails closed and never throws. It approves only when the facts are attributed to Hosting and were read by the Approver, the head and base are those of the evidence, the ancestry is the base tip and main, every run of `verify Sync` at the head is completed, `success` and signed by the Inspector, the author is not the Approver, and the execution is trusted: the code of main, a trigger from the constant list (`workflow_run`), and a head that was not checked out.
- `13-source/scripts/judge-app.mjs` reads the declaration of the Approver beside the Inspector's (`readDeclaration(text, app)`), refuses an `appId` that is not a positive whole number (`bad-app-id`), and `judgeApps` finds two Apps that share an `appId` (`shared-app-id`).
- `13-source/github-apps/approver.json` is the declaration of the Approver: its four abilities. It has no `appId` yet; the Owner records it after creating the App by hand.
- The refusal of the Approver's own pull request follows Hosting's author fact `{ login, type }`, compared as exact text with `grantIdentity(grant).login`; the judgement takes the grant as its third argument. The Inspector's signer is its App slug, `kaal-inspector`. Both declarations now carry the owner `kaal-review` and an `appId` as the text of digits (`"5953432"` for the Inspector), because Hosting refuses a declaration otherwise.
- `test/approver-hosting.test.mjs` shows the refusal against Hosting's real contract: a grant minted through `mintToken` against a local stand-in of GitHub, facts read by `readPullRequestFacts`, and the delivered `judgeApproval` over them. It is in `scripts.test`, with the Inspector's and the Approver's Cases.
- `test/approver-app.test.mjs` runs the three Cases (review/T1587 to review/T1589) in `scripts.test`. The temporary `run-red.mjs` is removed.

## Not done

- No workflow, `.github` file, key, installation, WIRE or ruleset. The workflow that runs the judgement on a trusted trigger, and its proof of trusted execution at WIRE, are the CTO's and need the Owner's go. The Owner creates and installs the App.
- The `appId` of the Approver is recorded by the Owner in a later reviewed change (recorded: see below).
- T1587 to T1589 stay provisional until release confirms the ids. No promotion and no publication.

## appId recorded

The Owner created the App "KAAL Approver" by hand and gave its App ID, `5964054`. It is recorded in `13-source/github-apps/approver.json` as the text of digits, the same way the Inspector's `5953432` was, and no two Apps share an id. No installation, key, secret, workflow or WIRE is part of this change.
