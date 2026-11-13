# C11 baseline

The baseline is `main`, at `d19abeff8225c578416138e9def950d952ba898b`. This Change depends on nothing that is not on `main`.

- `main` holds one pull request template, for a PLAN, and none for a Hotfix. Nothing on `main` states what the body of a Hotfix pull request contains.
- Current practice, not the approved target: `engineering/github/branching.md` defines a Hotfix route through the collector `kaal/hotfix`, established at `main`, one correction engineered into it and promoted, and the collector deleted. It says nothing about how a correction is presented. The CPO has adopted `hotfix/*` as the target namespace (`interface.md`).
- Four corrections used that route, each with its own pull request body (`evidence.md`).
- The three states of this Change are different today. Production is what the npm registry serves: Hosting 0.0.1, Foundation 0.0.1 and Guard 0.0.4. `main` already differs from it (`evidence.md`). Collectors hold work that is on neither.
