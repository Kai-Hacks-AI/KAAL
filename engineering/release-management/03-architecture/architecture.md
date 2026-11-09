# Architecture

## The flow (system view)

```
   12-kaal (kaal/*)             11-main                      10-npmjs
 +------------------+      +------------------+      +-------------------+
 | in:  approve     |      | in:  bind Merge  |      | in:  approve      |
 |   Change, test   |      |   approve Promo, |      |   Publishing      |
 |   Integration,   |      |   test Candidate,|      | stock: verify     |
 |   isolate Change |      |   serialize Pro- |      |   Package         |
 | stock: audit     |      |   motion, accept |      |   Promotion       |
 |   Lineage        |      |   Capability     |      | out:  (none yet)  |
 | out: verify      | ---> | stock: audit     | ---> +-------------------+
 |   Ancestry       |      |   Lineage        |
 +------------------+      | out: version     |
                           |   Package        |
                           +------------------+
```

Station `13-change-branch` is dropped for now (Owner, 9 Nov). Pull-oriented: each station owns its **in** move, and the sender owns its **out** check; the same station's out and the next station's in may be different controls. The drawing reads left to right (work moves toward npm) and the receiver pulls. This PLAN designs only the border `11-main` to `10-npmjs`; `audit Lineage` at the root serves both 11 and 12. Control names are the Owner's; existing checks and files keep their names.

## Elements

- **release-management/A1 [F3]. Version gate (11-main out).** Today `readiness()` (`engineering/release/release.mjs`) inside Pack. Planned additions, each a separate DO with its own RED Case: greater-than-latest (G1), release tag (G2), version-set-by-Change (G3).
- **release-management/A2 [F1]. Approval gate (10-npmjs in).** `release.yml` Publish job, `environment: npm`; `publishable()`. Planned: the release record names the approving run (G5).
- **release-management/A3 [F2]. Promotion check (10-npmjs stock).** `provenance()` and Accept. Planned: the record carries the promotion it came from (G9).

Nothing above changes `.github` in this PLAN; `.github` changes travel alone as their own Change.

## Decision: how collectors are named (Owner, 9 Nov 2026; recorded, not yet applied)

Collectors are named by capability, and a sub-capability is allowed, with one clean concept:

- A collector is always `kaal/<capability>/<leaf>`, never a bare `kaal/<capability>`, because git cannot hold the ref `kaal/<capability>` and the refs under `kaal/<capability>/` at the same time.
- The leaf is the **version** for a versioned capability (`kaal/foundation/0.0.2`) and a **descriptive name** otherwise (`kaal/engineering/release-management`).
- The Owner will change the ruleset pattern to `kaal/**`.
- Link to *version Package* (`11-main` out): the collector's version leaf should match the package version that gets released.
- Consequence for the control: `accept Capability` (formerly accept Collector, today's promotion source) judges that a promotion comes from a capability's collector.

Nothing is renamed by this PLAN: existing branches (including this PLAN's own collector `kaal/engineering-release-management`, which would be `kaal/engineering/release-management`), rulesets and the Promotion Source check keep their names. Migration is a later Change.

## Decision: how PR checks are named and nested (Owner, 9 Nov 2026; recorded, not yet applied)

GitHub lists a check as `workflow name / job name`, and a ruleset matches the **job name only**. The names are:

- **Workflow** = `release/<station>`: `release/npmjs`, `release/main`, `release/kaal`. The root `audit Lineage` stays its own scheduled workflow.
- **Job** = the control name (`test Candidate`, `approve Change`, ...). A control with lanes (for example `test Candidate`) may call a reusable workflow, which GitHub shows one level deeper (`release/main / test Candidate / Hosting (Linux)`).
- **One gate job per ruleset**, named `gate (main)` and `gate (kaal)` (Owner, 9 Nov: these two only). It `needs:` every control job of its station, runs with `if: always()`, and fails unless every needed job succeeded (a skipped job counts as passing for GitHub, so the gate must check results itself). Each gate has a distinct job name because contexts are matched by job name. A ruleset then lists only its gate as required check.
- **No `gate (npmjs)`**: npmjs has no branch ruleset, so it needs no gate. The `npm` environment approval stays the npmjs control (*approve Publishing*); `Publish` waits on that approval directly.

**Open design point: how a gate sees jobs in other workflows.** `needs:` works only inside one workflow, and today's checks sit in many files (`ci.yml`, `change-isolation.yml`, `promotion-source.yml`, `lineage-synchronization.yml`, `codeql.yml`, `dependency-review.yml`, `merge-group*.yml`), on different events: `pull_request`, `pull_request_target` (change-isolation, promotion-source, merge-group-admission, which must never share a run with jobs that check out PR code) and `merge_group`. Two ways, for the Owner:

- **A. Consolidate** into one `release/<station>` workflow per event with `needs:` and the `alls-green` action. Cleanest UI nesting, but it merges trusted `pull_request_target` jobs with `pull_request` jobs and needs a separate merge_group copy; only possible where the trust model allows (reusable workflows via `workflow_call` for the trusted ones).
- **B. Wait by API:** the gate is a trusted job that reads the required check runs of the head (or merge group) and fails closed unless all succeeded; this is the pattern `merge-group-review.yml` already uses ("waits for the others, then reads"). Workflows stay as they are and are renamed in place; the nesting `release/<station> / <control>` is then only by workflow and job name.

Recommendation: B, because it matches existing code and keeps the trust split. Use vs build: B reuses that existing waiting pattern (extracted, not rewritten); A would add `re-actors/alls-green`, which is **not used anywhere in `.github` today**, so it would need a SHA pin and an Actions-policy allowance (an Owner step) and is not free. Neither is decided here.

**Assumption, Owner-confirmed 9 Nov:** npmjs has no branch ruleset. Rulesets and the `npm` environment are not readable from the repository, so this is not verified there.

**Mapping gaps to fill (F4 would flag them today):** `Dependency Review` (to `scan Dependencies`), `CodeQL` (to `scan Vulnerabilities`), the lane names that come from `${{ matrix.check }}` (Workspaces, Engineering), and `Guard Acceptance Boundary`. The map must say which `Guard` is meant: a workflow, a job and a check all carry that name, and `KAAL` names three workflows.

## Naming map (control names across surfaces)

One row per control: the name in the records (this folder), the folder under `05-src`, and the job in the GitHub UI. Spellings may differ if each is self-explanatory; the map is what a parser follows. Graph ids will replace the first column later (deferred). Rows are filled as each Change lands; the pattern is `approve Publishing` | `05-src/10-npmjs/approve-publishing/` | `release/npmjs / approve Publishing`.
