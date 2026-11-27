# hosting/C114 DO record (first part)

This DO delivers everything of the PLAN except the change of `raisePullRequest` and its command (hosting/C113's raise takes the grant) and hosting/T326. That part waits for hosting/C113 to reach `main` and this collector to take it, since the raise does not exist in this collector yet; it is the second, small DO. The CPO's and the coordinator's agreement to two DOs stands.

## What was delivered

- `scripts/github/`: `app-declaration`, `app-manifest`, `app-logo`, `app-error`, `grant`, `app-token`, `app-reads`, re-exported from `index.ts` as `renderAppManifest`, `mintToken`, `grantAbilities`, `grantIdentity`, `listBranches`, `compareRevisions`, `listPullRequests`, `readRef`, `listReviews`, `checkLogo` and `AppAdapterError`.
- Docs: hosting/I22, F98 to F103, A43 to A45; the allocation row in `testing.md`; the README export list; four rows in the Skill's `operations.md`.
- Cases: T318 to T325 and T329 to T331 as `04-test/package-check/app-*.test.mjs` with `app-fixtures.mjs`; the drafts are removed from this folder, except T326 and its fixtures, which the second DO delivers.

## Cases as the PLAN amended them

The Cases are the amended drafts (the three PLAN amendments, the last correcting four defects found when the drafts first ran). Their assertions are unchanged by this DO; the imports are merged per file and point at `./app-fixtures.mjs`, and the duplicate `keys()` line of the merged T321 and T329 is declared once.

## Two points where the DO differs from the PLAN's words, not from any Case

- **Where the App's identity comes from.** The PLAN says `GET /app` with the JWT. The merged T320 lists the exact calls of a mint and `GET /app` is not among them, so the identity is read from the answer that call already gives: `GET /repos/{repo}/installation` with the same JWT returns `app_id` and `app_slug` of the App the key belongs to. It is the same authority (an answer to the App's own JWT), one call fewer. The stand-in's installation answer therefore carries `app_slug`, as GitHub's does.
- **The stand-in's gate** now accepts the grant's own token, which the amended fixtures had refused (recorded in the third amendment).

## Evidence

- T318 to T325 and T329 to T331: 11 of 11 pass locally. Each fails before the source exists (the exports are absent).
- Allocation, requirements, architecture, intent and fixture-ownership Cases pass with the new elements.
- No `node:fs`, `node:child_process`, `node:http` or `process.env` in the adapter (T324).
- Linux only; Windows and macOS run in CI.

## Not done

- No App is created or installed, no key stored, no logo uploaded, no workflow or ruleset written, no npm publish, no pin moves.

## Second DO

On the merged amendments (#2735, #2746), after a SYNC of main (C113 and C115) into the collector.

- **Attribution and the pull request facts.** `facts.ts` holds the private table and `factOrigin`; every read registers the frozen fact it returns; `readPullRequestFacts` is new. The drafts T336 to T339 became `04-test/package-check/app-facts.test.mjs` with bodies and assertions unchanged; only the import of the fixtures changed.
- **The raise and CLI take a grant.** `raisePullRequest(request, { grant, fetch?, api?, now? })` needs `read-contents` and `raise-pull-requests`; a `token` option is refused with the rule `token`; a missing or forged grant is `GRANT_UNTRUSTED`. The command takes `--app <name>` and mints its grant from `KAAL_APP_ID` and `KAAL_APP_KEY`, read in the command and nowhere in the adapter. The PLAN names the two variables but not how the command learns which App it is; `--app` is the smallest answer and is a CLI argument, not authority (the declaration, the abilities and the identity are still established by `mintToken`).
- **T310 to T317 and T335** obtain a grant through the public door (`mintToken` against the stand-in the Case injects) and nothing else changed in what they claim. The stand-in answers the App's routes unrecorded while the grant is minted, so every assertion on the raise's own requests still counts the raise's requests only. Two expectations name the grant where they named the token: T315's missing authority is now `GRANT_UNTRUSTED` (it was rule `token`), and the secret it must not leak is the grant's token. T316 passes `--app` and the key and id in the environment.
- **T326 as drafted could not pass.** Its grants were minted against one stand-in and used with another, which a grant refuses by design (T330), and the transport check comes before the ability check. The Case now mints each grant on the stand-in it then uses; the six assertions and what they claim are the draft's.
- **The default branch.** `main` in the facts is the revision of the branch the pull request's answer names as the repository's default, and of `main` when the answer names none.
- Ids F106, F107, A47 and T336 to T339 are as the PLAN planned them; the intent is I22 (no new intent). The allocation, README export row and operations rows are added.

Evidence: all 168 package-check Cases pass on Linux; `test:publisher` passes except four Cases that need Node 24 (this host has 22): T79, T84, T85 and the teardown Case, none of them touched. Windows and macOS run in CI.

Not done: no App created or installed, no key stored, no workflow or ruleset, no npm publish, no pin move, no WIRE.
