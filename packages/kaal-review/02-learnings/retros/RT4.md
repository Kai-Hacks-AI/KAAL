---
id: review/RT4
format: 4L
reflects: [review/C8]
---
Account of: I am the Review agent who planned `review/C8` (`#2702`, amendments `#2736` and `#3007`), carried its DO (`#3004`) on collector `kaal/review/inspector-app`, and wrote this retrospective; Kai is the Owner, the CTO and the CPO are delegated roles whose calls shaped the Change, and this is my own account.

## Liked
- subject: building the judgement as a factory that takes its lookups (`makeJudgeApproval({ factOrigin, grantIdentity })`) and delivering it built with Hosting's own, so a Case can use stand-ins and no caller can replace them
  keeps: when the CPO held the DO over the author fact, the amendment changed one argument and one lookup, and the delivered judgement stayed fail-closed throughout.
- subject: showing the refusal against Hosting's real adapter in a Review test (a grant minted by `mintToken` against a local stand-in, facts read by `readPullRequestFacts`, then the delivered `judgeApproval`)
  keeps: it found two declarations Hosting would have refused (the owner `review` instead of `kaal-review`, and a numeric `appId`) before any App was wired, which no Case written from a description had shown.

## Learned
- subject: what Hosting enforces on a declaration and on an author
  searched: I read `app-declaration.ts` and `app-token.ts` on Hosting's collector and its Cases, and found that `owner` must be the package directory, `appId` must be the text of digits, a check's signer is the App slug (`kaal-inspector`), and the author of a pull request is `{ login, type }` whose bot login is `<slug>[bot]`, the same form as `grantIdentity(grant).login`.
- subject: why the signed check must come from the Inspector and not from `github-actions`
  searched: I reasoned from how a `pull_request` workflow runs the files of the head, so a pull request can define a job named `verify Sync` that succeeds, and the CPO chose the Inspector-signed chain for Release C173.

## Lacked
- subject: the shapes Hosting really delivers (author, signer, owner, `appId`), known when the Cases of T1587 and T1588 were written
  decision-point: writing the facts fixture and the declaration Cases in the PLAN, from the description of Hosting's reader and not from its code.
  cost: the CPO held the DO, and a PLAN amendment (`#3007`) changed four Cases, three documents and two declarations before the DO could land.
  findable: yes
  address: Case

## Longed For
- subject: one Case that runs every judgement of an App against the real adapter of Hosting, written in the PLAN beside the Cases that use stand-ins
  worked-anyway: I added it in the DO and the amendment, and the CPO approved both.

Decisions: none made, the owner decides.
