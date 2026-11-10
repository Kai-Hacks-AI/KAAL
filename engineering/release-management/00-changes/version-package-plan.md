# version Package (PLAN)

PLAN, nothing is built. It closes gaps G1, G2 and G3 of the control version Package (F3, Cases T1 to T3) in the order PLAN, RED, DO. G4 (bump and changelog tooling) stays out: versions are hand-edited and this Change makes them checkable, not generated.

## What the control decides

F3: a version leaving `main` for npm is a semantic version, named once, greater than every version already published, and traceable to the Change that set it; the released commit is marked by a tag naming the version and the commit. Today `readiness` (`05-src/release-engine/release.mjs`) refuses a non-semver version (a hand-written pattern) and a version already published. Not enforced: greater than the highest published (G1), the tag (G2), a recorded Change (G3).

## Use or build (stated before building)

- **Version precedence (G1).** Use the `semver` package (a parser and comparator: validity, `gt`, ordering with prereleases) instead of extending the hand-written pattern. It is a transitive dependency in the lockfile today; the DO adds it as a direct, exact development dependency of the engineering workspace. Nothing in a shipped package takes it (a development dependency on tooling is fair; a runtime dependency of a package is not). Building a comparator is refused: a parser exists.
- **Record lookup (G3).** Use the commonmark parser already used by `04-test/records.mjs` to read Change Records; no regular expression over prose.
- **Tag (G2).** Use Git for the facts (`git rev-parse <tag>^{commit}`, `git ls-remote --tags`); the engine judges data given to it and touches no host, as it does today.

## Design

All judgments are pure functions of data the caller gathers, like `readiness` now, so they run the same on a package-change pull request and in the release (this also serves G17, the early readiness signal; running them on that pull request belongs to the lanes Change).

- **T1.** `readiness` receives the published versions of the package, refuses a version that is not greater than the highest of them under `semver`, and reports the highest in the finding. A first publication (no published version) is unchanged. A prerelease of a version below a published stable is refused like any lower version.
- **T2.** A new pure `tagVerdict({ name, version, commit, tags })` where `tags` maps tag names to the commits they point to: no tag passes only when the release will create it; a tag naming `<name>@<version>` that points at another commit fails; one that points at the released commit verifies. The tag is created by a step of the publish workflow after readiness and before approval; that is a `.github` Change of its own and needs a decision about who may create tags (below).
- **T3.** A new pure `versionRecorded({ name, version, previous, records })`: if the version differs from the base commit's, one Change Record under `.kaal/changes/` must name `<name>@<version>` in a `Version:` member, parsed with commonmark; an unchanged version needs none. A record naming a different version than the manifest's fails.

## Sequence

1. This PLAN, CPO review.
2. RED: T1 to T3 as Cases next to the engine, failing for a lower version, a tag at another commit and an unrecorded version bump; each with fixtures for the passing and the failing input.
3. DO, engine only: the three functions, `semver` as the one new dependency, parity with the existing readiness Cases. No workflow change.
4. Separately, `.github` only: the publish workflow gathers the inputs (registry versions, tags, records), calls the functions, and creates the tag. Next to the existing steps, nothing removed.

## Not in this Change

G4 tooling; the `.github` step; running these on package-change pull requests (the lanes Change, G17); changing a published version; any release, tag creation or publication.

## Open for the Owner and CPO

- The `Version:` member of a Change Record as the convention that ties a version to a Change (a new field in the record template), or another binding.
- Who may create the release tag and with what permission (the publish job's token), since creating a tag is a write the workflow does not have today.
- Whether a prerelease line is part of the release path at all; the proposal treats it by `semver` order and adds no prerelease policy.
