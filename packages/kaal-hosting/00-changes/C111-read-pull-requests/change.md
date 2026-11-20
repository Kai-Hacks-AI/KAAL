# hosting/C111 change

## From

Hosting has no GitHub read. Each caller that needs the open pull requests builds its own `gh` call and knows which route works where.

## To

Hosting offers `readPullRequests(repository, { gh })`, with the command `kaal-hosting-pulls --repository <owner/name>` in the `kaal-hosting` Skill: one implementation, two doors (hosting/I18's shape). It resolves with one record per open pull request, in one shape in every environment:

- `number`, `title`, `draft`, `head: { ref, sha }`, `base: { ref }`, `mergeState`, `autoMerge`, `reviews`, `threads: { unresolved }`, `checks`.
- A fact Hosting could not read is the value `{ unknown: true, reason }`, never a guess, never an empty or zero value. `reviews: []` means no review; `reviews: { unknown: true, … }` means not read.
- A list it could not read at all rejects with `HostingError` `PULLS_UNREADABLE`.

Inside Hosting, and visible to no caller:

- **One small Script per transport**, each under `05-src/skills/kaal-hosting/scripts/github/`: `gh-graphql.ts` (the whole record in one `gh api graphql` call), `gh-rest.ts` (the pull list, each pull's reviews and checks through `gh api` REST routes), `cloud-threads.ts` (the review-thread route of a cloud session, for `threads` only).
- **A thin selection step**, `pull-requests.ts`: it tries GraphQL; if the transport is refused it reads the base facts from REST and the threads from the cloud route; what no transport answers is `unknown`. It holds no route, no query and no environment test of its own.
- **One seam for the binary.** Each transport starts its command through `options.gh(args)`, which by default is `gh` started through Hosting's `execute`. A transport may use another binary later without changing a caller. The Test Cases inject the seam, so none needs `gh` installed or the network, and all run on the three hosts.

## Because

One home for reaching GitHub, with the environment differences kept inside it, so Show WIP and every later caller ask for facts and run in any environment, an agent's included.

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's existing Cases (T1 to T279) stay GREEN; `index.ts` gains exports only.
2. Accept list: none.
3. Feature Cases, RED on `main` today (drafts `T290–T294.red.mjs`, all failing with `readPullRequests is not exported`):
   - hosting/T290: GraphQL answers; every fact is read, threads counted from it.
   - hosting/T291: GraphQL refused (HTTP 403); the base facts come from REST and the threads from the cloud route, in the same shape.
   - hosting/T292: GraphQL refused and no thread route; `threads` is `unknown`, every other fact is read, never a zero.
   - hosting/T293: nothing answers; `readPullRequests` rejects `PULLS_UNREADABLE`, and nothing is invented.
   - hosting/T294: the command is built into `dist` and declared as the bin `kaal-hosting-pulls`. Its behaviour (one JSON fact line, exit 0 when read, 2 when not) is the same call as T290 to T293 and is covered by one more Case the DO adds beside T294.

## Not in this Change

Show WIP (release/C99, its own Change, raised from a `main` that holds this one); branches, tags, compare and package-file reads (the inventory views, a later slice); writing to GitHub; the dispatcher, collector scripts and Guard; Git history queries; any version, publication or pin move; `.kaal/hosting`.

## DO

Not authorized by this PLAN. On the merged PLAN, in the collector: add the Scripts, the command, the exports and the Skill, requirement and architecture texts (`interface.md`), turn T290 to T294 into `04-test/package-check/pull-requests.test.mjs`, allocate the ids in `04-test/package-check/testing.md`, and run Hosting's suites on all three hosts.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
