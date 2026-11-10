# version Package (PLAN)

PLAN, nothing is built. It closes gaps G1, G2 and G3 of the control version Package (F3, Cases T1 to T3) in the order PLAN, RED, DO. G4 (bump and changelog tooling) stays out: versions are hand-edited and this Change makes them checkable, not generated.

## What the control decides

F3: a version leaving `main` for npm is a semantic version, named once, greater than every version already published, and traceable to the Change that set it; the released commit is marked by a tag naming the version and the commit. Today `readiness` (`05-src/release-engine/release.mjs`) refuses a non-semver version (a hand-written pattern) and a version already published. Not enforced: greater than the highest published (G1), the tag (G2), traceability to a recorded Change (G3).

## Use or build (stated before building)

- **Version precedence (G1).** Use the `semver` package (a parser and comparator: validity, `gt`, ordering with prereleases) instead of extending the hand-written pattern. It is a transitive dependency in the lockfile today; the DO adds it as a direct, exact development dependency of the engineering workspace. Nothing in a shipped package takes it (a development dependency on tooling is fair; a runtime dependency of a package is not). Building a comparator is refused: a parser exists.
- **Record lookup (G3).** Use the commonmark parser already used by `04-test/records.mjs` to read Change Records; no regular expression over prose.
- **Tag (G2).** Use Git for the facts (`git rev-parse <tag>^{commit}`, `git ls-remote --tags`); the engine judges data given to it and touches no host, as it does today.

## Design

All judgments are pure functions of data the caller gathers, like `readiness` now, so they run the same on a package-change pull request and in the release (this also serves G17, the early readiness signal; running them on that pull request belongs to the lanes Change).

- **T1.** `readiness` receives the published versions of the package, refuses a version that is not greater than the highest of them under `semver`, and reports the highest in the finding. A first publication (no published version) is unchanged. A prerelease below a published stable is refused like any lower version.
- **Prerelease.** Ordering is plain `semver` correctness. Whether a prerelease may be published at all is a policy decision (dist-tags, consumers' ranges) that must be settled before the first prerelease publication; none is planned. Until the Owner decides, `readiness` refuses a prerelease version. The first publications (Guard 0.0.4, Hosting 0.0.1, Foundation 0.0.1) are stable versions and do not depend on this decision.
- **T2, the tag has two verdicts at two times.** The tag must never certify a version that was not released, so it is written only after publication, never before approval.
  - `tagPreflight({ name, version, commit, tags, published })`, before the Owner's approval, writes nothing. Passes when no tag `<name>@<version>` exists. Fails when one exists and points at another commit, and also when one exists while the version is not on the registry (an unexplained tag: a rejected or failed earlier attempt, or a tag made by hand, must not look like a release). A tag at the right commit for a version already on the registry means the release already happened and `readiness` refuses the version anyway.
  - `tagAfterRelease({ name, version, commit, tags, published })`, after publication and registry acceptance (verify Package Promotion), fails unless the version is on the registry and the tag exists at exactly the released commit.
  - The write itself is a step of the publish workflow after publication and registry acceptance, in a `.github` Change of its own. A rejected or failed publication therefore leaves no tag; a retry re-runs the preflight on a clean state. The token's permission is the least that creates one tag (`contents: write` on that step only), and who may hold it is open for the Owner.
- **T3, traceability, not authorization.** A pure `versionRecorded({ name, version, previous, records })`: if the version differs from the base commit's, a Change Record under `.kaal/changes/` must name `<name>@<version>` in a `Version:` member, parsed with commonmark; an unchanged version needs none. **This proves that the version is traceable to a recorded Change and nothing more.** A record written by the candidate does not prove that the Change was accepted or that its version change was authorized, and the control does not claim it. Authority comes from independent evidence that exists today and that this control does not replace: the Change's pull request into the collector passes approve Change (F15), the promotion into `main` passes approve Promotion (F11), and publication passes approve Publishing in the `npm` environment (F1), by the people those controls name. The control reads the record from the trusted baseline (the commit on the collector or `main` that the approvals admitted), never from the candidate alone, so a candidate cannot add a record for its own bump and have it count.

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
- Prerelease policy: refused until the Owner decides, before any first prerelease publication.
- Who holds the tag-write permission and on which step (least privilege; tag after publication only).
