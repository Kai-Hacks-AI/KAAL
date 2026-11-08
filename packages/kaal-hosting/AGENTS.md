# Working on Hosting (engineering rules; not shipped)

This folder is a KAAL package in the layout Packaging owns. Only `dist/` ships.

- `00-changes/` the working history, one folder per Change; `01-intent` to `03-architecture` the documentation; `04-test/` the checks (`package-check` and `boundary-check` ship, `engineering-check` does not); `05-src/` the Agent (`AGENTS.md`) and the Skill (`skills/kaal-hosting`), whose scripts are the TypeScript library in `scripts/`; `06-defects/` Package Defects; `kaal/` the Extension Node and what Hosting expects of other capabilities.
- `dist/` is built, never edited: `npm run build`. Building twice gives the same bytes.
- Planned Cases are immutable once their RED has merged. A layout move may change only the path clause of one, and the Change lists it.
- Hosting is the lowest layer: no dependency on another KAAL package, and no Case imports Packaging's checker.
- `npm run test:publisher` is the publisher's run; `npm test` is the verification a consumer runs.
