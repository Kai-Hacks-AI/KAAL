# Requirements

Controls of a station are its requirements, in three kinds: **in** (the receiver's check), **stock** (what must hold of what sits at the station) and **out** (the sender's check). Verified against `main` at 251e814; GitHub settings (the `npm` environment, rulesets, the npmjs trusted-publisher binding) are not readable from the repository and are unverified.

## Naming is aligned (spans everything) [release-management/F4]

Ids: F1 approve Publishing, F2 verify Package Promotion, F3 version Package, F5 audit Lineage, F6 isolate Change, F7 verify Ancestry, F8 scan Vulnerabilities, F9 scan Dependencies, F10 bind Merge, F11 approve Promotion, F12 test Candidate, F13 serialize Promotion, F14 accept Capability, F15 approve Change, F16 test Integration. Each is allocated to one of the four components in `03-architecture`; F4 is cross-cutting and allocated to the naming map, not to a component.

Aligned does not mean identical strings (Owner, 9 Nov). Wherever a station or control appears (Intent, Requirements, Architecture, `05-src` folders, files and scripts, GitHub workflows, jobs and gates), its name is self-explanatory, easy to understand and semantically consistent with the control's name, so a reader and a program can tell which control it is. Each surface may spell it its own way (a folder `approve-publishing`, a job `approve Publishing`); a **mapping** in the Architecture lists, per control, its spelling on each surface, and later its graph id (deferred). A surface name that maps to no control, or a control with no name on a surface where it runs, is a finding (an observation, not a gate). Read by parsers (YAML for workflows, Markdown AST for the records, directory listing for `05-src`), never regex. Use vs build: the YAML parser already in Engineering is used; no new parser.

## Controls are pinned to `main` [release-management/F17]

Rationale: I4, Delivery architecture changes independently of Solution architecture.

A release control judges a candidate with the checker `main` holds (checkout of `main`, on `pull_request` and `merge_group`), with its logic in `05-src` and only wiring in `.github`. Allocated to the architecture's wiring rule (a cross-cutting requirement like F4, checked by T8). The testing controls are pinned through F18 (FAR): their machinery and Regression run as `main`'s copy, Features travel with the candidate.

## Testing applies FAR [release-management/F18]

test Candidate (into `main`) and test Integration (into a collector) apply FAR (Owner, 9 Nov):

- **Regression** protects the target: it is the target's own Cases, run as the target's copy and pinned (F17), never the candidate's version of them.
- **Features** test the incoming change: they are the Cases the candidate adds or changes, they travel with the candidate (Solution content) and run as candidate code.
- **Accepts** is a short, explicit list that lets a candidate weaken named Regression Cases. It is the only door to weaken Regression, and a change to Accepts is reviewed and approved like any change; a Regression Case missing, edited or skipped without an Accepts entry fails.

By I4 the machinery is Delivery and pinned; the Cases under test are Solution content. Allocated to the testing controls (`main/` test Candidate, `collectors/` test Integration), which share the FAR rule.

## Root (spans stations; the Owner's list, 9 Nov)

Controls that act on more than one station live at the root. All are names only here, except where noted.

- **audit Lineage [release-management/F5]** (today's `branching-audit`: `lineage.ts` `establishment`, `collector`, `workingBranch`, `holds.json`, `branching-audit.sh`, scheduled check `Branching audit`). Holds the stock of stations 11 and 12.
- **isolate Change [release-management/F6]** (today's `Change Isolation`: what may travel together, `engineering/change-isolation/`) and the **synchronization shape** that `Branching` judged on `kaal/*` (a merge of `main`, first-parent shape, each step forward, resolutions adopted or its own Change).
  - **.github travels alone is a failure, not a warning (Owner, 9 Nov).** A change that touches `.github/` and any path outside it fails the check (`check.mjs` exits 1) on a pull request into a `kaal/*` collector, on a promotion into `main`, and in the merge queue. So workflow changes cannot ride with feature work; they reach `main` only as a lone `.github` change that gets human approval. A lone `.github` change may land in a collector, but the collector cannot then promote it together with other paths (the aggregate is judged at `main`); a synchronization that adopts `main`'s own `.github` content unchanged is exempt (already admitted on `main`). By I4 (Delivery changes independently of Solution), this is what stops a candidate editing the workflow that judges it, so "Require workflows to pass" is an optional extra layer, not a must.
- **verify Ancestry [release-management/F7]** (today's freshness: a promotion's head contains `main`'s tip, so merging gives `main` exactly the state validated). One control with two targets, the `kaal/*` collector side and the promotion into `main`; it spans two stations, so it lives at the root.
- **scan Vulnerabilities [release-management/F8]** (today's CodeQL, `codeql.yml`: `CodeQL (actions)`, `CodeQL (javascript-typescript)`).
- **scan Dependencies [release-management/F9]** (today's `dependency-review.yml`, `Dependency Review`).

`Branching` itself is retired by splitting: freshness to verify Ancestry, synchronization shape to isolate Change, merge method to bind Merge (below), add-new before remove-old.

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
- **in, backwards from the stock (names only):** bind Merge [F10] (merge queue, `bind-group`, and the merge method that `Branching` judged: squash for a Change or promotion, merge commit for a synchronization), approve Promotion [F11] (native approval settings), test Candidate [F12, F18] (the FAR lanes on `kaal/*` to `main`, separate jobs), serialize Promotion [F13] (one promotion at a time), accept Capability [F14] (promotion source, today's `Promotion Source`). Gate: `gate (main)`.

## Station 12-collectors (names only)

- **stock:** audit Lineage (from the root).
- **in:** approve Change [F15] (native approval settings of `kaal/*`), test Integration [F16, F18] (the lanes on `kaal/*` PRs, separate jobs). Gate: `gate (collectors)`.
- **out:** none of its own; verify Ancestry and isolate Change act here from the root.
