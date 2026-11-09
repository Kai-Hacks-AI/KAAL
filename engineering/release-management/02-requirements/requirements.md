# Requirements

Controls of a station are its requirements, in three kinds: **in** (the receiver's check), **stock** (what must hold of what sits at the station) and **out** (the sender's check). Verified against `main` at 251e814; GitHub settings (the `npm` environment, rulesets, the npmjs trusted-publisher binding) are not readable from the repository and are unverified.

## Naming is aligned (spans everything) [release-management/F4]

Aligned does not mean identical strings (Owner, 9 Nov). Wherever a station or control appears (Intent, Requirements, Architecture, `05-src` folders, files and scripts, GitHub workflows, jobs and gates), its name is self-explanatory, easy to understand and semantically consistent with the control's name, so a reader and a program can tell which control it is. Each surface may spell it its own way (a folder `approve-publishing`, a job `approve Publishing`); a **mapping** in the Architecture lists, per control, its spelling on each surface, and later its graph id (deferred). A surface name that maps to no control, or a control with no name on a surface where it runs, is a finding (an observation, not a gate). Read by parsers (YAML for workflows, Markdown AST for the records, directory listing for `05-src`), never regex. Use vs build: the YAML parser already in Engineering is used; no new parser.

## Root (spans stations)

- **audit Lineage** (today's `branching-audit`: `lineage.ts` `establishment`, `collector`, `workingBranch`, `holds.json`, `branching-audit.sh`, scheduled check `Branching audit`). Holds the stock of stations 11 and 12. Name only here.

## Station 10-npmjs (designed)

- **in: approve Publishing [release-management/F1, I2].** A publication runs only when a named person has approved it for this package, this version and these bytes.
  - Exists: `release.yml` starts by hand (`workflow_dispatch`) on the default branch only. The Publish job waits for the `npm` environment (Owner as required reviewer, per the file's header) and publishes the tested tarball through Trusted Publishing, no token, no repack (`publishable()` binds record, run, commit and digest).
  - Gaps: G5 the approval is a GitHub environment gate and the release record does not say who approved. G6 the environment and trusted-publisher settings are outside the repository and unverified. G7 a first publication of a package is manual (F34) and outside the workflow. G8 the trusted publisher lapses without a workflow publish (observed 10 Nov) and nothing in the repository reminds of it.
- **stock: verify Package Promotion [release-management/F2, I2].** For each version in npm, the published bytes are the bytes `main` promoted: same tarball, same provenance, same commit.
  - Exists: the Accept job (step `registry`) downloads the published tarball, compares it with the tested one in `release.json` and checks the OIDC provenance against `Kai-Hacks-AI/KAAL`, `release.yml` and the release commit (`provenance()`); a fresh registry install follows.
  - Gaps: G9 nothing records which promotion put the commit on `main` (promotion PR, ledger entry), so "promoted main state" holds by the dispatch restriction only. G10 acceptance runs once after publication, with no later re-check. G11 for a package published by hand provenance is "none" by design.

## Station 11-main

- **out: version Package [release-management/F3, I1, I2]** (moved here from npmjs's in; the sender names the version). A version leaving `main` for npm is a semantic version, named once, greater than every version already published, and traceable to the Change that set it. This is built.
  - Exists: `readiness()` in `engineering/release/release.mjs` rejects a non-semver version and a version already on the registry ("raise the version"); dependencies must be exact and already published.
  - Gaps: G1 no check that the version is greater than the latest published. G2 no tag marks the released commit. G3 no check that the version was set by a recorded Change. G4 no changelog or bump tooling; versions are hand-edited.
- **stock:** audit Lineage (from the root).
- **in, backwards from the stock (names only):** bind Merge (merge queue and `bind-group`), approve Promotion (review), test Candidate (FAR lanes on `kaal/*` to `main`), serialize Promotion (one promotion at a time), accept Capability (promotion source).

## Station 12-kaal (names only)

- **out:** verify Ancestry (today's freshness check: `main`'s tip is an ancestor of the collector).
- **stock:** audit Lineage (from the root).
- **in:** approve Change, test Integration, isolate Change (Change Isolation).
