# hosting/C111 interface

The element texts the DO adds. The PLAN adds none to the tree. Provisional ids, as in `C111.md`.

## Intent

After hosting/I18.

> **hosting/I19.** KAAL code, an agent or a person that needs the open pull requests of a repository with their reviews, review threads and checks reads them through Hosting alone, from the library or from a command of the Skill, with one answer shape in every environment and no knowledge of which route or binary reached GitHub.

## Requirements

After hosting/F84, in `02-requirements/functional/requirements.md`.

- **hosting/F85** [hosting/I19]: **`readPullRequests(repository, { gh })`** resolves with one record per open pull request (`number`, `title`, `draft`, `head`, `base`, `mergeState`, `autoMerge`, `reviews`, `threads`, `checks`), the same shape whichever transport answered.
- **hosting/F86** [hosting/I19]: **Unknown is kept apart from none.** A fact no transport could read is `{ unknown: true, reason }`; an empty list or a count of zero is only ever what GitHub reported.
- **hosting/F87** [hosting/I19]: **A list that cannot be read at all rejects** with `HostingError` `PULLS_UNREADABLE`; nothing is returned in its place.
- **hosting/F88** [hosting/I19]: **One Script per transport, a thin selection.** Each transport (GraphQL, REST, the cloud review-thread route) is its own module under `scripts/github/` and starts its command through `options.gh`; the selection step holds no route, query or environment test.
- **hosting/F89** [hosting/I19]: **One implementation, two ways in.** The Skill ships `scripts/github/pull-requests-cli.mjs`, declared as the command `kaal-hosting-pulls --repository <owner/name>`; it calls `readPullRequests` and prints one JSON fact line, exit 0 when read and 2 when not.
- **hosting/N13** [hosting/I19]: Reading pull requests adds no runtime dependency, reads only, and sends no secret anywhere; the command inherits the credentials of the `gh` the environment is signed in to.

## Architecture

- **hosting/A39** [hosting/F85 to hosting/F89, hosting/N13]: `pull-requests.ts` and the three transport modules live in `05-src/skills/kaal-hosting/scripts/github/`, re-exported from `index.ts`; the command is `kaal-hosting-pulls` (bin row after `kaal-hosting-revision`, `dist/skills/kaal-hosting/scripts/github/pull-requests-cli.mjs`, delivered). The Skill and its operation guide name the function and the command and say when to use them instead of calling `gh`.
