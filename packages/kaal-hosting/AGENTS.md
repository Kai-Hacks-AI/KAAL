# Working on Hosting (engineering rules; not shipped)

This folder is a KAAL package in the layout Packaging owns. Only `dist/` ships.

- `00-changes/` the working history, one folder per Change; `01-intent` to `03-architecture` the documentation; `04-test/` the checks (`package-check` and `boundary-check` ship, `engineering-check` does not); `05-src/` the Agent (`AGENTS.md`) and the Skill (`skills/kaal-hosting`), whose scripts are the TypeScript library in `scripts/`; `06-defects/` Package Defects; `kaal/` the Extension Node and what Hosting expects of other capabilities.
- `dist/` is built, never edited: `npm run build`. Building twice gives the same bytes.
- Planned Cases are immutable once their RED has merged. A layout move may change only the path clause of one, and the Change lists it.
- Hosting is the lowest layer: no dependency on another KAAL package, and no Case imports Packaging's checker.
- `npm run test:publisher` is the publisher's run; `npm test` is the verification a consumer runs.
- `readRevision` and the command `kaal-hosting-revision` share one implementation, `05-src/skills/kaal-hosting/scripts/revision.ts`; the command only parses arguments and prints. A change to one is a change to both, and the Cases of hosting/F80 to hosting/F84 cover both.
- `readPullRequests` and the command `kaal-hosting-pulls` share one implementation, `05-src/skills/kaal-hosting/scripts/github/pull-requests.ts`; the command only parses arguments and prints. Each transport is its own small module beside it, and no route or environment test belongs in the selection step. A change to one is a change to both, and the Cases of hosting/F85 to hosting/F89 cover both.
