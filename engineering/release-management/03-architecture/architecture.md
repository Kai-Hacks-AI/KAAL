# Architecture

## The flow (system view)

```
   ROOT:  audit Lineage | isolate Change | verify Ancestry
          scan Vulnerabilities | scan Dependencies

   12-collectors (kaal/*)       11-main                      10-npmjs
 +------------------+      +------------------+      +-------------------+
 | in:  approve     |      | in:  bind Merge  |      | in:  approve      |
 |   Change, test   |      |   approve Promo, |      |   Publishing      |
 |   Integration    |      |   test Candidate,|      | stock: verify     |
 |                  |      |   serialize Pro- |      |   Package         |
 | gate (collectors)| ---> |   motion, accept |      |   Promotion       |
 |                  |      |   Capability     | ---> | out:  (none yet)  |
 |                  |      | gate (main)      |      +-------------------+
 |                  |      | out: version     |
 +------------------+      |   Package        |
                           +------------------+
```

Stations exist only in this drawing: they are not folders, and a control's station is traced by graph edge, not by path. Station `13-change-branch` is dropped for now (Owner, 9 Nov). Pull-oriented: each station owns its **in** move, and the sender owns its **out** check; the same station's out and the next station's in may be different controls. The drawing reads left to right (work moves toward npm) and the receiver pulls. This PLAN designs only the border `11-main` to `10-npmjs`; `the root controls (audit Lineage, isolate Change, verify Ancestry, scan Vulnerabilities, scan Dependencies) serve both 11 and 12. Control names are the Owner's; existing checks and files keep their names.

## Components and requirements allocation

Architecture names the components and allocates each requirement to exactly one of them (requirements allocation). A requirement and its component are linked by a graph edge; the tables are the readable form. Controls are requirements and components realize them, so a component holds several controls, and some controls are realized by a native setting or a tool we use and have no source.

**Four components (Owner, 9 Nov), all peers in `05-src/`:** `pipeline/` (the end-to-end piece that spans the stations and holds the five shared controls) and the stations `npmjs/`, `main/` and `collectors/`. Every folder is a node in the architecture and there are no loose files. Rule: a station may use `pipeline/` but never another station. The name follows Domain-Driven Design, with release-management as the bounded context. A control's Cases sit next to its code in its component. The drawing above shows the stations. `release-management` itself is traced as an element of the Delivery architecture.

| Component | Allocated requirements | Realized by (today's code) |
| --- | --- | --- |
| `05-src/pipeline/` | F5 audit Lineage, F6 isolate Change, F7 verify Ancestry, F8 scan Vulnerabilities, F9 scan Dependencies | `lineage.ts` (establishment, collectors, working-branches, freshness, synchronization, claim) with `holds.json` and `branching-audit.sh`/`branching.sh`; `engineering/change-isolation/` and `change-isolation.sh`; scans are tools, below |
| `05-src/npmjs/` | F1 approve Publishing, F2 verify Package Promotion | A2, A3: `release.yml` Publish and Accept, `publishable()`, `provenance()` (G5 to G11) |
| `05-src/main/` | F3 version Package, F10 bind Merge, F11 approve Promotion, F12 test Candidate, F13 serialize Promotion, F14 accept Capability | A1: `readiness()` in `engineering/release/release.mjs` (G1 to G4); `lineage.ts` source and auto-merge, `promotion-source.sh`; `bind-group.sh`; `engineering/lanes/` for test Candidate |
| `05-src/collectors/` | F15 approve Change, F16 test Integration | `engineering/lanes/` for test Integration; approve Change has no source |

Each of F1 to F3 and F5 to F16 is allocated to exactly one component above. F4 (naming aligned) is cross-cutting and allocated to the naming map below, not to a component. A1 = version Package, A2 = approve Publishing, A3 = verify Package Promotion keep their ids.

**Realized by a native setting or a tool, not by source** (recorded here, no folder; the component only holds the requirement and its Case where one can check it):

- approve Change (F15): the `kaal/*` ruleset (code owner review, approval of the most recent push).
- approve Promotion (F11): the `main` ruleset, same settings.
- serialize Promotion (F13): the merge queue's one-at-a-time setting.
- bind Merge (F10): the merge queue, plus the merge-method verdict (`lineage.ts` auto-merge) and `bind-group.sh`.
- approve Publishing (F1): the `npm` environment's required reviewer, plus the binding in `publishable()`.
- scan Vulnerabilities (F8): the CodeQL action (`codeql.yml`), used, not built.
- scan Dependencies (F9): `dependency-review-action` and Dependabot (`dependency-review.yml`), used, not built.

Shared code lives in `pipeline/`: `main/` uses `lineage.ts` verdicts that live there, so a station never imports a sibling. The lane code (`engineering/lanes/`) serves test Candidate (`main/`) and test Integration (`kaal/`); where it lives is decided in those Changes. The `claim` verdict (one Change Record per squash Change) is allocated to isolate Change (F6), subject to the Owner.

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

- **Workflow** = `release/<station>`: `release/npmjs`, `release/main`, `release/collectors`. The root `audit Lineage` stays its own scheduled workflow.
- **Job** = the control name (`test Candidate`, `approve Change`, ...). A control with lanes (for example `test Candidate`) may call a reusable workflow, which GitHub shows one level deeper (`release/main / test Candidate / Hosting (Linux)`).
- **One gate job per ruleset**, named `gate (main)` and `gate (collectors)` (Owner, 9 Nov: these two only). It `needs:` every control job of its station, runs with `if: always()`, and fails unless every needed job succeeded (a skipped job counts as passing for GitHub, so the gate must check results itself). Each gate has a distinct job name because contexts are matched by job name. A ruleset then lists only its gate as required check.
- **No `gate (npmjs)`**: npmjs has no branch ruleset, so it needs no gate. The `npm` environment approval stays the npmjs control (*approve Publishing*); `Publish` waits on that approval directly.

**Design: a gate that depends on root controls across workflows.** `needs:` works only inside one workflow, and a `pull_request_target` workflow must never share a run with jobs that check out PR code (today's trust split). So:

- **Root controls are reusable workflows** (`on: workflow_call`), one per control, and `release/main` and `release/collectors` call them (`release/main / isolate Change`). One definition, called from both stations, which is what a root control spanning two stations needs. The trusted controls (isolate Change, verify Ancestry, accept Capability, bind Merge) are called from a `pull_request_target` caller that never checks out the candidate; the lane controls (test Candidate, test Integration, scan Vulnerabilities, scan Dependencies) are called from a `pull_request` caller (and a `merge_group` caller), because they run candidate code.
- **The gate is a job in the trusted caller.** It `needs:` the trusted controls in its own run, and for the lane controls, which run under another event, it waits on their check runs by API and fails closed, the pattern `merge-group-review.yml` already uses. No shared run, no trust mixing.
- **Use vs build:** `workflow_call` and the existing wait-by-API pattern are used; `re-actors/alls-green` is not (not used anywhere in `.github` today; it would add a third-party Action needing a SHA pin and an Actions-policy allowance from the Owner) and it cannot join jobs across events anyway.
- **To prove before the Changes:** that a required context from a job called through `workflow_call` is matched by the *called* job's name or the `caller / called` composite. A throwaway branch settles it; if the composite is what the ruleset sees, the gates' own names (`gate (main)`, `gate (collectors)`) are unaffected because they are plain jobs.

**Assumption, Owner-confirmed 9 Nov:** npmjs has no branch ruleset. Rulesets and the `npm` environment are not readable from the repository, so this is not verified there.

**Mapping gaps to fill (F4 would flag them today):** `Dependency Review` (to `scan Dependencies`), `CodeQL` (to `scan Vulnerabilities`), the lane names that come from `${{ matrix.check }}` (Workspaces, Engineering), and `Guard Acceptance Boundary`. The map must say which `Guard` is meant: a workflow, a job and a check all carry that name, and `KAAL` names three workflows.

## Naming map (control names across surfaces)

One row per control: the name in the records (this folder), the component path under `05-src/` (`pipeline/`, `npmjs/`, `main/`, `collectors/`), and the job in the GitHub UI. Spellings may differ if each is self-explanatory; the map is what a parser follows. Graph ids will replace the first column later (deferred). Rows are filled as each Change lands; the pattern is `approve Publishing` | `05-src/npmjs/` | `release/npmjs / approve Publishing`.
