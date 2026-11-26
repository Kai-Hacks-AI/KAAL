# hosting/C114 change

## From

Each KAAL App is a hand-made GitHub object. Its manifest is a JSON file written in GitHub's words inside the capability that uses it, its token is minted by a third-party action in a workflow, its API calls are plain `fetch` in the capability's own scripts, and nothing says what its logo must be. The Inspector and the Approver have none of this yet, so Review would write each in GitHub's words too.

## To

1. **A declaration, written by the capability that owns the App, with no GitHub word.** One file per App at `packages/<capability>/13-source/github-apps/<app>.json`: `{ app, name, owner, purpose, abilities: [...], logo? }`. `abilities` is a closed vocabulary Hosting defines: `read-contents`, `read-pull-requests`, `raise-pull-requests`, `approve-pull-requests`, `read-checks`, `post-checks`. Hosting maps each to the GitHub permission and level (for example `raise-pull-requests` and `approve-pull-requests` are both `pull_requests: write`, which GitHub does not tell apart and Hosting does). No App may hold both `raise-pull-requests` and `approve-pull-requests`: an App never decides on what it raised. Which App may hold `approve-pull-requests` at all is Review's rule, checked by Review. Every App lists `read-contents`, since its declaration is read through it (item 3). An ability outside the list is refused, and no ability can write contents, workflows, administration or secrets: the three Apps never push. The capability states what its App needs, never how GitHub says it. Engineering confirms the folder in C37.
2. **Manifest.** `renderAppManifest(declaration)` returns the manifest GitHub's App-from-manifest flow reads, as stable JSON: `name`, the fixed `url`, `public: false`, an inactive hook with the inert address the existing manifest already uses, no events, and `default_permissions` mapped from the abilities (and always `metadata: read`). Deterministic, LF, a field outside the declaration format refused.
3. **Token and grant, established from trusted authority.** The caller names only the App, the App id, the key, the repository and the abilities it wants. It never supplies the declaration, the permissions, a token or an ability list that is believed. `mintToken({ app, appId, privateKey, repo, abilities }, { fetch?, api?, now? })` returns a **grant**:
   1. It signs an RS256 App JWT with `node:crypto` (`iss` the App id, `iat` a minute back, `exp` at most ten minutes ahead) and finds the installation (`GET /repos/{repo}/installation`).
   2. The installation's granted permissions must equal the permissions of the declaration, no more and no less (`APP_INSTALLATION_MISMATCH`). This is the adoption check: an App installed wider than it declares, or narrower, is refused, so a wide installation cannot slip in.
   3. It creates a bootstrap token narrowed to `contents: read` on that repository, and with it reads the declaration **itself**: the repository's default branch (asked of GitHub, not the caller), its commit, its tree, and the one file `packages/*/13-source/github-apps/<app>.json`. None or two such files, a truncated tree, a file that is not a valid declaration or whose `app` differs from its file name, is refused (`APP_DECLARATION_MISSING`, `APP_DECLARATION_AMBIGUOUS`, `INVALID_APP_DECLARATION`). A change to a declaration takes effect only once it is on the default branch.
   4. The requested abilities must be within that declaration (`APP_TOKEN_REFUSED`), then it creates the installation token narrowed to exactly them and to that repository.
   5. It **verifies what GitHub returned**: `permissions` must equal the requested abilities' permissions exactly (an empty, extra, higher or unknown permission is `APP_GRANT_MISMATCH`), `expires_at` must be a time after `now` and within one hour of it, and the repository selection must be the one repository.
   6. The grant is a frozen value Hosting created, `{ app, repo, expiresAt }`, whose token and abilities Hosting holds privately (`grantAbilities(grant)` reads them; a copy, a clone, a plain object or a bare token carries none and is refused with `GRANT_UNTRUSTED`). The abilities of a grant are what GitHub really granted, which Hosting derived from the declaration, never what a caller says.
   Every Hosting call that uses a token (the reads below, C113's raise, and the approve and post operations of Review when they are built) takes the grant as its only authority, and refuses before any call: a non-grant (`GRANT_UNTRUSTED`), an expired one (`GRANT_EXPIRED`), one without the ability the call needs (`ABILITY_REFUSED`). A `token`, `abilities` or `declaration` option is not an option and is refused. A 404 for the installation is `APP_NOT_INSTALLED` and a 401 is `APP_KEY_REJECTED`, so the two failures of the first Dispatcher raise are told apart. The private key, the JWT and the token never appear in an error, a log line or a path.
   **Adapter policy and GitHub's permission.** GitHub has one `pull_requests: write` for raising and approving, so GitHub cannot keep the Dispatcher from approving; a token used outside Hosting could. Hosting keeps the two apart by (a) separate Apps (never both abilities), (b) the installation check above, (c) every Hosting operation gating on the grant. What remains outside Hosting is a workflow that mints or uses a token without Hosting. That is closed where the approval is counted, not here: only the Approver's identity counts as an approval (Review's rule, in its ruleset), so a Dispatcher token that approved would not count. Release moves token minting into Hosting in its own Change.
4. **Reads for the Dispatcher.** The reads the Dispatcher makes move behind Hosting and close the read half of hosting/D11: `listBranches(repo, prefix, { grant })`, `compareRevisions(repo, base, head)`, `listPullRequests(repo, { state, base?, head? })` and `readRef(repo, ref)`. Each is GET only, pages until a short page, returns Hosting's own fact shape (never GitHub's JSON), and a failure is a named error. Raising stays hosting/C113's `raisePullRequest`: the Dispatcher raises through it, and the policy of the type, read at the base revision, decides what it may raise.
5. **Logo slot.** A declaration may name `logo`, a file path under the capability's package. `checkLogo(bytes)` accepts a PNG that is square and at least 200 by 200 pixels (GitHub's own recommendation; the DO restates the limit from GitHub's documentation at that day) and names what is wrong otherwise. Hosting holds no logo and uploads none: an App's logo is set by the owner in GitHub's settings, so the slot only makes the asset checkable.
6. **No App, no secret, no install here.** Hosting never creates or installs an App, reads a key from disk, or stores a token. Creating each App and keeping its key stay Kai's.

## Because

One adapter for everything GitHub in the Apps' life, so Release and Review write the judgement and not a line of GitHub, a second host would add its own adapter without touching a declaration, and the first Dispatcher failure (a 404 nobody could read) cannot recur silently.

## Which part comes from which owner

| Part | Owner | Source | Hosting's part |
| --- | --- | --- | --- |
| What the Dispatcher needs and why | Release | `packages/kaal-release/13-source/github-apps/dispatcher.json` (to be written by Release) | maps abilities to permissions, renders the manifest |
| What the Inspector and the Approver need and why | Review | `packages/kaal-review/13-source/github-apps/{inspector,approver}.json` (to be written by Review) | the same |
| What a Dispatcher run decides and raises | Release | its `decide` and its types' policy | the reads, and `raisePullRequest` (C113) |
| App ids, keys, installation, display names in GitHub | Kai | GitHub settings, repository variables and secrets | never touched |
| Which abilities exist | Hosting | the closed vocabulary here | defines, refuses the rest |
| Pull request types and their rules | Engineering, Change, Release | hosting/C113's policy files | read at the base revision |

Release's existing `app-manifest.json` is `{ metadata: read, pull_requests: write }`. The Dispatcher also reads `compare`, `git/ref` and `git/matching-refs`, and C113's raise reads policy files at the base revision, which GitHub serves only with `contents: read`. Release's declaration therefore lists `read-contents` beside `raise-pull-requests`; that is a Release decision in its own Change, and Hosting refuses a token request beyond the declaration read from the default branch.

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's existing Cases (T1 to T302, and C113's T303 to T317 once delivered) stay GREEN. Nothing existing changes, and no Dispatcher script is touched here.
2. Accept list: hosting/T310 to T317 (C113's raise Cases) change only in how they obtain authority: a grant in place of a bare token. Their assertions on the raise itself stay. The CLI Case T316 gets the same set-up. Nothing else.
3. Feature Cases, RED on `main` today. They are executable drafts in this folder (`T318` to `T326`, `.red.mjs`, with `fixtures.mjs` and a local stand-in for GitHub's API; nothing reaches the network, and the key is generated inside the Case). The DO turns them into delivered Cases **unchanged**: a Case that has to change returns to a PLAN.
   - hosting/T318: `renderAppManifest` of the Dispatcher declaration gives exact bytes, the same twice; abilities map to the declared GitHub permissions and `metadata: read` is always present.
   - hosting/T319: invalid declarations are refused with `INVALID_APP_DECLARATION`: an ability outside the vocabulary, any ability that could write contents, workflows, administration or secrets, a GitHub word as a field (`default_permissions`, `hook_attributes`), a missing or empty `name`, `owner` or `abilities`, a field outside the format, a repeated ability, `write-pull-requests` (not an ability), an App holding both `raise-pull-requests` and `approve-pull-requests`.
   - hosting/T320: `mintToken` finds the installation, reads the declaration itself from the default branch with a contents-only bootstrap token, then sends one signed request narrowed to the requested abilities' permissions and the one repository; the JWT verifies (RS256, `iss`, `iat`, `exp` within ten minutes); the result is a frozen grant whose abilities are the verified grant, with no token property.
   - hosting/T321: negative Cases for the mint: refuses before any call a caller-supplied declaration or permissions, missing key, App id, app or abilities; refuses an ability beyond the declaration on the default branch, an approving one the App does not declare, a missing, ambiguous, invalid or truncated declaration, an installation wider or narrower than the declaration, a returned grant that is empty, wider, higher or unknown, an expired or implausible expiry; names 404, 401, other status and network errors; the narrowed token is never requested after a refusal; no error, stack or console line holds the key, the JWT or a token; no retry.
   - hosting/T322: the reads: `listBranches`, `compareRevisions`, `listPullRequests` and `readRef` send exactly the documented GET requests, page until a short page, return only Hosting's fact shape, send no write, take a `grant`, and are refused with `ABILITY_REFUSED` before any call when it lacks the ability the call needs, and name a failure; an unknown `state`, an empty prefix and a `head` without an owner are refused before any call.
   - hosting/T325: a grant cannot be forged, copied, cloned, widened or edited; a plain object, a bare token or nothing is `GRANT_UNTRUSTED`; `abilities`, `token` and `declaration` options are refused; an expired grant is `GRANT_EXPIRED`; all before any call.
   - hosting/T326: `raisePullRequest` accepts only a grant holding `raise-pull-requests` and `read-contents`; a bare token, a forged grant and a read-only grant are refused before any call.
   - hosting/T323: `checkLogo` accepts a square PNG of at least 200 by 200 and names a wrong signature, a non-square image, a smaller one and an empty file; it reads only the bytes it is given.
   - hosting/T324: the adapter modules import no `node:fs`, `node:child_process` or `node:http`, never read an environment variable or a file for a key or token, and Hosting's shipped `docs/` name no Change.

## The interface the Cases fix

All from `@kaihacksai/kaal-hosting`; the modules are `scripts/github/app-manifest`, `app-token`, `app-reads` and `app-logo`.

- `renderAppManifest(declaration): string`; `mintToken({ app, appId, privateKey, repo, abilities }, { fetch?, api?, now? }): Promise<Grant>` with `Grant = Readonly<{ app, repo, expiresAt }>` and `grantAbilities(grant): string[]`; `checkLogo(bytes): { ok: true, width, height } | { ok: false, problem: "empty" | "not-png" | "not-square" | "too-small", width?, height? }`.
- `listBranches(repo, prefix, opts): Promise<string[]>`; `compareRevisions(repo, base, head, opts): Promise<{ status, aheadBy, behindBy, files, truncated }>`; `listPullRequests(repo, { state, base?, head? }, opts): Promise<{ number, title, state, merged, head: { ref, sha }, base: { ref }, body }[]>`; `readRef(repo, ref, opts): Promise<string | null>`; `opts` is `{ grant, fetch?, api?, now? }`; `read-contents` is needed by `listBranches`, `compareRevisions` and `readRef`, `read-pull-requests` by `listPullRequests`.
- Errors carry a `code`: `INVALID_APP_DECLARATION`, `APP_DECLARATION_MISSING`, `APP_DECLARATION_AMBIGUOUS`, `APP_TOKEN_REFUSED`, `APP_INSTALLATION_MISMATCH`, `APP_GRANT_MISMATCH`, `APP_NOT_INSTALLED`, `APP_KEY_REJECTED`, `APP_TOKEN_FAILED`, `GRANT_UNTRUSTED`, `GRANT_EXPIRED`, `ABILITY_REFUSED`, `INVALID_READ`, `READ_FAILED`.
- A Case injects the transport (`fetch`, `api`, `now`), never data. The key a Case uses is generated inside the Case.

## Questions, settled by the reading below unless said otherwise

- **Owners write the declarations, in their own Changes.** Release writes the Dispatcher's, Review writes the Inspector's and the Approver's. This Change plans the format and the adapter and writes none of them.
- **`read-contents` for the Dispatcher.** Settled above: the Dispatcher needs it for the reads and for C113's raise; Release lists it.
- **The Approver.** Settled with Review (26 November): approving is its own ability, `approve-pull-requests`; no App holding `raise-pull-requests` may also hold it; Review writes the Inspector's declaration (`post-checks`, `read-contents`, `read-pull-requests`, provisionally) and the Approver's in its own Changes, and checks that only the Approver holds approving. Hosting mints a token only for what the declaration lists and gates each call by ability.
- **Gating C113's raise.** Settled by the CPO's review: the same rule everywhere. C114's DO changes `raisePullRequest` (C113) to take `grant` in place of `token`, requiring `raise-pull-requests` and `read-contents`; the CLI mints its grant from `KAAL_APP_ID` and `KAAL_APP_KEY` (read in the CLI, never in the adapter) instead of `GITHUB_TOKEN`. C113's Cases T310 to T317 change their transport set-up to this (accept list below) and T326 adds the refusals. C113's DO (open) is not touched by this PLAN.
- **Token minting in workflows.** `actions/create-github-app-token` stays in `.github/workflows` until Release moves it in its own Change; Hosting only offers the call.

## Not in this Change

Any DO. Creating, installing or configuring an App; a key, a variable or a secret; a logo file; a workflow or a ruleset; a Dispatcher script or its `decide`; the Inspector's and the Approver's judgement; the declarations of the Apps' owners; a second host; version, publication or pin moves.

## DO

Not authorized by this PLAN. On the merged PLAN, in the collector: the declaration format and its validator, `renderAppManifest`, `mintToken`, the four reads, `checkLogo`, T318 to T326 as delivered Cases, C113's raise and CLI moved to the grant, the ids allocated in `04-test/package-check/testing.md`, the element texts of `interface.md`, the README and Skill entry, and Hosting's suites on all three hosts.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
