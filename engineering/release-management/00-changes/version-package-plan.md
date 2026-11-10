# version Package (PLAN)

PLAN, nothing is built. It closes gaps G1, G2 and G3 of the control version Package (F3, Cases T1 to T3) in the order PLAN, RED, DO. G4 (bump and changelog tooling) stays out: versions are hand-edited and this Change makes them checkable, not generated.

## What the control decides

F3: a version leaving `main` for npm is a semantic version, named once, greater than every version already published, and traceable to the Change that set it; the commit authorized for release is marked by a tag naming the version and the commit, created before publication. Today `readiness` (`05-src/release-engine/release.mjs`) refuses a non-semver version (a hand-written pattern) and a version already published. Not enforced: greater than the highest published (G1), the tag (G2), traceability to a recorded Change (G3).

## Use or build (stated before building)

- **Version precedence (G1).** Use the `semver` package (a parser and comparator: validity, `gt`, ordering with prereleases) instead of extending the hand-written pattern. It is a transitive dependency in the lockfile today; the DO adds it as a direct, exact development dependency of the engineering workspace. Nothing in a shipped package takes it (a development dependency on tooling is fair; a runtime dependency of a package is not). Building a comparator is refused: a parser exists.
- **Record lookup (G3).** Use the commonmark parser already used by `04-test/records.mjs` to read Change Records; no regular expression over prose.
- **Tag (G2).** Use Git for the facts (`git rev-parse <tag>^{commit}`, `git ls-remote --tags`); the engine judges data given to it and touches no host, as it does today.

## Design

All judgments are pure functions of data the caller gathers, like `readiness` now, so they run the same on a package-change pull request and in the release (this also serves G17, the early readiness signal; running them on that pull request belongs to the lanes Change).

- **T1.** `readiness` receives the published versions of the package, refuses a version that is not greater than the highest of them under `semver`, and reports the highest in the finding. A first publication (no published version) is unchanged. A prerelease below a published stable is refused like any lower version.
- **Prerelease.** Ordering is plain `semver` correctness. Whether a prerelease may be published at all is a policy decision (dist-tags, consumers' ranges) that must be settled before the first prerelease publication; none is planned. Until the Owner decides, `readiness` refuses a prerelease version. The first publications (Guard 0.0.4, Hosting 0.0.1, Foundation 0.0.1) are stable versions and do not depend on this decision.
- **T2, the tag is created before publication, under a tag ruleset (Owner decision, 10 November 2026).** The tag names the exact commit the Owner authorizes to publish, so it is created before npm; nothing but the release workflow may create, move or delete it.
  - `tagPreflight({ name, version, commit, tags, published })`, before the tag is created, writes nothing. Passes when no tag `<name>@<version>` exists. Fails when one exists and points at another commit, and also when one exists while the version is on the registry at another commit; a tag at the right commit for a version not yet published passes (a retry of the same release).
  - Creation is one step of the release workflow, after test Candidate evidence for that exact commit exists and before the approval of approve Publishing, in a `.github` Change of its own. It creates the annotated tag and the draft GitHub Release it identifies (lifecycle: `lifecycle-flow-assessment.md`). The token's permission is the least that creates one tag (`contents: write` on that step only).
  - The **tag ruleset** (a proof file for the Owner to import, `tag-ruleset-proof.json` in the project files, not applied by this PLAN) restricts creation of `*@*` tags to the release workflow's identity, and forbids updating and deleting them. **Owner decision (10 November): the identity is a GitHub App, the ruleset's only bypass actor; its key is a secret of the `tagging` environment.** What lives as code and what only in the GitHub UI is in the lifecycle assessment ("Tag identity"). A bypass actor skips the whole ruleset, so the ruleset cannot also be what requires the checks for that actor: the tag job's ordering and the `tagging` environment carry that, and the ruleset is the fence that nobody else can create, move or delete the tag.
  - `tagAfterRelease({ name, version, commit, tags, published })`, after publication and registry acceptance (verify Package Promotion), fails unless the version is on the registry and the tag still names exactly the released commit. A rejected or failed publication leaves a tag and a draft Release without a published version: the retry re-runs the same release on the same tag (the preflight passes), and an abandoned tag stays, its version is burned and never reused, and its draft Release stays unpublished with a note. A package tag is never moved or deleted (the ruleset forbids both); a deletion is an explicit Owner act that edits the ruleset and is recorded as an incident. A published version that fails verification is not rolled back: it is an incident, deprecated and superseded.
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
- Prerelease policy: refused until the Owner decides, before any first prerelease publication.
- ~~Who holds the tag-write permission~~ Decided by the Owner (10 November): a GitHub App, the sole bypass actor, key in the `tagging` environment secret. Open only: the App's permission set (least privilege, `contents: write` as the proposal) and the live proof that the bypass actor behaves as stated.
