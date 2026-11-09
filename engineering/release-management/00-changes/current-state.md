# Present state (A)

What the repository and its settings hold now, observed on the collector `kaal/engineering-release-management` at 4bc234e unless stated. Each entry names the target (B) it differs from, in the root documents. GitHub settings (the `npm` environment, rulesets, the npmjs trusted-publisher binding) cannot be read from the repository; entries marked as such rest on the Owner's word or on the GitHub API on 9 Nov.

- **The publish workflow.**

  Current: on the collector the workflow file is `.github/workflows/publish.yml`, named `KAAL / release / publish`, with the jobs `Pack`, `approve Publishing` (`environment: npm`) and `verify Package Promotion`, calling the engine at its new path (#1327). On `main` the file is still `release.yml`, named `Release`, with the jobs `Pack`, `Publish` and `Accept`, until the collector is promoted. Nothing is released in between, because the Owner starts every release by hand.

  Target: F1, F2, `release-engine/`.

- **The release engine.**

  Current: the engine lives in `engineering/release-management/05-src/release-engine/` (#1324). `engineering/release/release.mjs` and `run.mjs` stand as full-facade shims with no caller left since #1327. `readiness()` rejects a non-semver version and a version already on the registry; `publishable()` binds record, run, commit and digest; `provenance()` checks the OIDC provenance against `Kai-Hacks-AI/KAAL`, `publish.yml` and the release commit.

  Target: F1, F2, F3, `release-engine/`.

- **The packages' publishers on npmjs.**

  Current: the Owner has bound `@kaihacksai/kaal-hosting`, `@kaihacksai/kaal-guard` and `@kaihacksai/kaal-foundation` as trusted publishers on `publish.yml` (reported by the Owner, 9 Nov; unverified from the repository). No package has an accepted release yet.

  Target: F1.

- **Foundation's manifest.**

  Current: `packages/kaal-foundation/package.json` has `repository` and `publishConfig`; the engine README's older observation that both were missing is out of date.

  Target: F3.

- **Branching, Change Isolation and the lane checks.**

  Current: the checks `Branching`, `Change Isolation`, `Change Isolation (review)`, `Promotion Source`, `Branching audit`, `CodeQL (actions)`, `CodeQL (javascript-typescript)`, `Dependency Review` and the lane names (`Hosting`, `Workspaces`, `Acceptance`, `Engineering`, `Guard`) are the checks in force; their code is `lineage.ts`, `holds.json`, `branching.sh`, `branching-audit.sh`, `engineering/change-isolation/`, `bind-group.sh`, `promotion-source.mjs` (#1317, pending promotion) and `engineering/lanes/`.

  Target: F5, F6, F7, F8, F9, F10, F12, F14, F16.

- **The workflows on `pull_request_target`.**

  Current: four workflows use `pull_request_target`: `change-isolation.yml`, `promotion-source.yml`, `lineage-synchronization.yml` and `merge-group-admission.yml`. They use it so that the default branch's definition and checker run and the candidate's commits are read as Git data. They run under a temporary repository Actions policy; GitHub blocks the event by default from 2 Dec 2026.

  Target: F6, F14, F17.

- **The rulesets and the queue.**

  Current: the rulesets `main` (to be renamed `promotion`) and `lineage` (to be renamed `integration`) hold the pull request settings and the required contexts (GitHub Actions app); the queue rule on `main` is SQUASH, 1/1/1, ALLGREEN, 60 minutes; `lineage` has no queue. Read from the GitHub API on 9 Nov. `CODEOWNERS` on `main` is read from the repository. Code owner review and approval of the most recent push are off on `kaal/*`, and approval of the most recent push is off on `main`.

  Target: F10, F11, F13, F15.

- **A queue on a pattern ruleset.**

  Current: GitHub refuses a merge queue rule on a pattern ruleset (`Merge queue rules are only supported for named branches or the default branch`), shown by an Owner trial on 9 Nov.

  Target: F13.

- **The settings that cannot be read.**

  Current: the `npm` environment and its reviewer, the temporary repository Actions policy, the availability and semantics of "Require workflows to pass" and the check identity of a job called through `workflow_call` are unverified; they are prerequisites of the proof in `transformation.md`.

  Target: F1, F17.

- **Decisions of 9 Nov.**

  Current: the collector and control decisions (names, layout, the Branching split, FAR use, the pin) are the Owner's decisions of 9 Nov, recorded in the project record and not verifiable in the repository.

  Target: F4, F17, F18.
