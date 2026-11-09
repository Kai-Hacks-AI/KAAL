# Requirements

The target requirements of Release management. They describe what must hold (B) and say nothing about how the repository gets there or what it holds at present; that is Change's (`00-changes`). Controls of a station are its requirements, in three kinds: **in** (the receiver's check), **stock** (what must hold of what sits at the station) and **out** (the sender's check).

## Naming is aligned (spans everything) [release-management/F4]

Ids: F1 approve Publishing, F2 verify Package Promotion, F3 version Package, F5 audit Lineage, F6 isolate Change, F7 verify Ancestry, F8 scan Vulnerabilities, F9 scan Dependencies, F10 bind Merge, F11 approve Promotion, F12 test Candidate, F13 serialize Promotion, F14 accept Capability, F15 approve Change, F16 test Integration. Each is allocated to one control component, setting or tool in `03-architecture`, with its control target; F4 is cross-cutting and allocated to the naming map, not to a component.

Aligned does not mean identical strings (Owner, 9 Nov). Wherever a station or control appears (Intent, Requirements, Architecture, `05-src` folders, files and scripts, GitHub workflows, jobs and gates), its name is self-explanatory, easy to understand and semantically consistent with the control's name, so a reader and a program can tell which control it is. Each surface may spell it its own way (a folder `approve-publishing`, a job `approve Publishing`); a **mapping** in the Architecture lists, per control, its spelling on each surface, and later its graph id (deferred). A surface name that maps to no control, or a control with no name on a surface where it runs, is a finding (an observation, not a gate). Read by parsers (YAML for workflows, Markdown AST for the records, directory listing for `05-src`), never regex. Use vs build: the YAML parser already in Engineering is used; no new parser.

## Controls are pinned to `main` [release-management/F17]

Rationale: I4, Delivery architecture changes independently of Solution architecture.

A release control judges a candidate with the checker `main` holds (checkout of `main`, on `pull_request` and `merge_group`), with its logic in `05-src` and only wiring in `.github`. Allocated to the architecture's wiring rule (a cross-cutting requirement like F4, checked by T8). The testing controls are pinned through F18 (FAR): their machinery and Regression run as `main`'s copy, Features travel with the candidate.

## Testing applies FAR [release-management/F18]

test Candidate (into `main`) and test Integration (into a collector) apply FAR (Owner, 9 Nov):

- **Regression** protects the target: it is the target's own Cases, run as the target's copy and pinned (F17), never the candidate's version of them.
- **Features** test the incoming change: they are the Cases the candidate adds or changes, they travel with the candidate (Solution content) and run as candidate code.
- **Accepts** is Change's Accept (`change/I7`, `change/F8` to `F10`), used as it is and not rebuilt: a short, explicit list, kept as `far.json` in the Change record (`<capability>/00-changes/…`, `change/A6`), that lets one named integration leave named Regression Cases RED. Each entry is `{ case, justifiedBy, protects }` with a reason and an alternative, and a decision (`accept`, `reject`, `narrow`, `redesign`) by the designated authority (the Owner) with evidence. It applies only to the integration it names and never transfers; there is no standing waiver. It is the only door to weaken Regression, and a change to Accepts is reviewed and approved like any change; a Regression Case missing, edited or skipped without an Accepts entry fails.

Each run tests both Features and Regression and **communicates what gets weakened**: the pinned runner reads `far.json`, runs `main`'s Regression against the candidate, and reports every Accepts entry it applied (which Regression Case stays RED, justified by which Features Case) visibly in the check output, for example the job summary, so the reviewer sees it at the decision point. A failure that matches an entry is accepted (the Case stays observed RED, the Plan's result succeeds under the exception, and it is reported); a failure without an entry stays red; an entry that matches no Regression Case, names a Features Case, or is listed twice is a finding (`change/F8`), so a stale entry fails. A run that applied no Accepts entry says so. On promotion the entries are consumed: the Change's Case changes become `main`'s new Regression. test Candidate and test Integration are the integration gate of `change/A8`.

By I4 the machinery is Delivery and pinned; the Cases under test are Solution content. Allocated to the testing controls (test Candidate at `main`, test Integration at `collectors`; both in `lanes/`), which share the FAR rule.

## Root (spans stations; the Owner's list, 9 Nov)

Controls that act on more than one station live at the root. All are names only here, except where noted.

- **audit Lineage [release-management/F5].** Audits, on a schedule, the stock of stations 11 and 12.
- **isolate Change [release-management/F6].** What may travel together in one Change, and the **synchronization shape** judged on `kaal/*`: a merge of `main`, first-parent shape, each step forward, resolutions adopted or in their own Change.
  - **.github travels alone is a failure, not a warning (Owner, 9 Nov).** A change that touches `.github/` and any path outside it fails the check (`check.mjs` exits 1) on a pull request into a `kaal/*` collector, on a promotion into `main`, and in the merge queue. So workflow changes cannot ride with feature work; they reach `main` only as a lone `.github` change that gets human approval. A lone `.github` change may land in a collector, but the collector cannot then promote it together with other paths (the aggregate is judged at `main`); a synchronization that adopts `main`'s own `.github` content unchanged is exempt (already admitted on `main`). By I4 (Delivery changes independently of Solution), this is what stops a candidate editing the workflow that judges it, so "Require workflows to pass" is an optional extra layer, not a must.
- **verify Ancestry [release-management/F7].** Freshness: a promotion's head contains `main`'s tip, so merging gives `main` exactly the state validated. One control with two targets, the `kaal/*` collector side and the promotion into `main`; it spans two stations, so it lives at the root.
- **scan Vulnerabilities [release-management/F8].** Vulnerabilities are scanned for in the code and the workflows (the CodeQL action, used and not built).
- **scan Dependencies [release-management/F9].** Dependencies are reviewed (the dependency-review action and Dependabot, used and not built).

## Station 10-npmjs

- **in: approve Publishing [release-management/F1, I2].** A publication runs only when a named person has approved it for this package, this version and these bytes. It starts by hand (`workflow_dispatch`) on the default branch only, waits for the approval of the `npm` environment (the Owner as required reviewer) and publishes the tested tarball through Trusted Publishing: no token and no repack. The release record binds record, run, commit and digest, and names the approving run.
- **stock: verify Package Promotion [release-management/F2, I2].** For each version in npm, the published bytes are the bytes `main` promoted: same tarball, same provenance, same commit. Acceptance downloads the published tarball, compares it with the tested one in `release.json`, checks the OIDC provenance against `Kai-Hacks-AI/KAAL`, `publish.yml` and the release commit, and installs the package afresh from the registry. The release record names the promotion (pull request or ledger entry) that put the commit on `main`. The publish workflow is `publish.yml`, named `KAAL / release / publish`.

## Station 11-main

- **out: version Package [release-management/F3, I1, I2]** (the sender names the version). A version leaving `main` for npm is a semantic version, named once, greater than every version already published, and traceable to the Change that set it. Readiness rejects a non-semver version and a version already on the registry; dependencies are exact and already published. The released commit is marked by a tag naming the version and the commit.
- **stock:** audit Lineage (from the root).
- **in, backwards from the stock:**
  - **bind Merge [release-management/F10].** The merge queue binds the group to the queued pull request, and the merge method is judged: squash for a Change or promotion, merge commit for a synchronization.
  - **approve Promotion [release-management/F11].** The native approval settings of the `main` ruleset carry the approval.
  - **test Candidate [release-management/F12].** The FAR lanes on `kaal/*` to `main` (F18), separate jobs.
  - **serialize Promotion [release-management/F13].** One promotion at a time.
  - **accept Capability [release-management/F14].** A promotion comes from a capability's collector (the promotion source).
  - Gate: `gate (promotion)`.

## Station 12-collectors

- **stock:** audit Lineage (from the root).
- **in:**
  - **approve Change [release-management/F15].** The native approval settings of `kaal/*` carry the approval.
  - **test Integration [release-management/F16].** The FAR lanes (F18) on `kaal/*` pull requests, separate jobs.
  - Gate: `gate (integration)`.
- **out:** none of its own; verify Ancestry and isolate Change act here from the root.
