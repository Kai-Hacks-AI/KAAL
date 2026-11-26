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

- The raise and CLI change and T326 (second DO). No App is created or installed, no key stored, no logo uploaded, no workflow or ruleset written, no npm publish, no pin moves.
