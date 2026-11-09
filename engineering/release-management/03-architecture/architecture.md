# Architecture

## The flow (system view)

```
   ROOT:  audit Lineage | isolate Change | verify Ancestry
          scan Vulnerabilities | scan Dependencies

   12-kaal (kaal/*)             11-main                      10-npmjs
 +------------------+      +------------------+      +-------------------+
 | in:  approve     |      | in:  bind Merge  |      | in:  approve      |
 |   Change, test   |      |   approve Promo, |      |   Publishing      |
 |   Integration    |      |   test Candidate,|      | stock: verify     |
 |                  |      |   serialize Pro- |      |   Package         |
 | gate (kaal)      | ---> |   motion, accept |      |   Promotion       |
 |                  |      |   Capability     | ---> | out:  (none yet)  |
 |                  |      | gate (main)      |      +-------------------+
 |                  |      | out: version     |
 +------------------+      |   Package        |
                           +------------------+
```

Stations exist only in this drawing: they are not folders, and a control's station is traced by graph edge, not by path. Station `13-change-branch` is dropped for now (Owner, 9 Nov). Pull-oriented: each station owns its **in** move, and the sender owns its **out** check; the same station's out and the next station's in may be different controls. The drawing reads left to right (work moves toward npm) and the receiver pulls. This PLAN designs only the border `11-main` to `10-npmjs`; `the root controls (audit Lineage, isolate Change, verify Ancestry, scan Vulnerabilities, scan Dependencies) serve both 11 and 12. Control names are the Owner's; existing checks and files keep their names.

## Components and requirements allocation

Architecture names the components and allocates each requirement to exactly one of them (requirements allocation); a requirement and its component are linked by a graph edge, and the tables here are the readable form. A component is a folder `05-src/<name>/` with its Cases beside it. Stations are only the drawing above; the station column is a trace, not a path.

| Component (`05-src/…`) | Station (drawing) | Allocated requirement | Elements / today |
| --- | --- | --- | --- |
| `audit-lineage` | root | F5 | `lineage.ts` establishment, collector, workingBranch; `holds.json`; `branching-audit.sh` |
| `isolate-change` | root | F6 | `engineering/change-isolation/`; `lineage.ts` synchronization |
| `verify-ancestry` | root | F7 | `lineage.ts` freshness |
| `scan-vulnerabilities` | root | F8 | `codeql.yml` |
| `scan-dependencies` | root | F9 | `dependency-review.yml` |
| `approve-publishing` | 10 npmjs | F1 | A2: `release.yml` Publish, `environment: npm`, `publishable()` (G5 to G8) |
| `verify-package-promotion` | 10 npmjs | F2 | A3: `provenance()` and Accept (G9 to G11) |
| `version-package` | 11 main | F3 | A1: `readiness()` in `engineering/release/release.mjs` (G1 to G4) |
| `bind-merge` | 11 main | F10 | `bind-group.sh`, merge queue; `lineage.ts` auto-merge |
| `approve-promotion` | 11 main | F11 | native settings of the `main` ruleset |
| `test-candidate` | 11 main | F12 | the FAR lanes on `kaal/*` to `main` (`engineering/lanes/`) |
| `serialize-promotion` | 11 main | F13 | merge queue, one promotion at a time |
| `accept-capability` | 11 main | F14 | `promotion-source.sh`; `lineage.ts` source |
| `approve-change` | 12 kaal | F15 | native settings of the `kaal/*` ruleset |
| `test-integration` | 12 kaal | F16 | the lanes on `kaal/*` PRs (`engineering/lanes/`) |

Allocation rules: every F1, F2, F3 and F5 to F16 is allocated to exactly one component above, and every component carries exactly one requirement; its gaps (G1 to G11) travel with it. F4 (naming aligned) is cross-cutting and is allocated to the naming map below, not to a component. A requirement that cannot be placed on one component is a signal that the requirement or the component is wrong, and is reported as a finding. Existing A1 to A3 keep their ids (A1 = `version-package`, A2 = `approve-publishing`, A3 = `verify-package-promotion`). The Owner will confirm that the two lane components (`test-candidate`, `test-integration`) share `engineering/lanes/` code without sharing a requirement.

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

**Design: a gate that depends on root controls across workflows.** `needs:` works only inside one workflow, and a `pull_request_target` workflow must never share a run with jobs that check out PR code (today's trust split). So:

- **Root controls are reusable workflows** (`on: workflow_call`), one per control, and `release/main` and `release/kaal` call them (`release/main / isolate Change`). One definition, called from both stations, which is what a root control spanning two stations needs. The trusted controls (isolate Change, verify Ancestry, accept Capability, bind Merge) are called from a `pull_request_target` caller that never checks out the candidate; the lane controls (test Candidate, test Integration, scan Vulnerabilities, scan Dependencies) are called from a `pull_request` caller (and a `merge_group` caller), because they run candidate code.
- **The gate is a job in the trusted caller.** It `needs:` the trusted controls in its own run, and for the lane controls, which run under another event, it waits on their check runs by API and fails closed, the pattern `merge-group-review.yml` already uses. No shared run, no trust mixing.
- **Use vs build:** `workflow_call` and the existing wait-by-API pattern are used; `re-actors/alls-green` is not (not used anywhere in `.github` today; it would add a third-party Action needing a SHA pin and an Actions-policy allowance from the Owner) and it cannot join jobs across events anyway.
- **To prove before the Changes:** that a required context from a job called through `workflow_call` is matched by the *called* job's name or the `caller / called` composite. A throwaway branch settles it; if the composite is what the ruleset sees, the gates' own names (`gate (main)`, `gate (kaal)`) are unaffected because they are plain jobs.

**Assumption, Owner-confirmed 9 Nov:** npmjs has no branch ruleset. Rulesets and the `npm` environment are not readable from the repository, so this is not verified there.

**Mapping gaps to fill (F4 would flag them today):** `Dependency Review` (to `scan Dependencies`), `CodeQL` (to `scan Vulnerabilities`), the lane names that come from `${{ matrix.check }}` (Workspaces, Engineering), and `Guard Acceptance Boundary`. The map must say which `Guard` is meant: a workflow, a job and a check all carry that name, and `KAAL` names three workflows.

## Naming map (control names across surfaces)

One row per control: the name in the records (this folder), the folder under `05-src`, and the job in the GitHub UI. Spellings may differ if each is self-explanatory; the map is what a parser follows. Graph ids will replace the first column later (deferred). Rows are filled as each Change lands; the pattern is `approve Publishing` | `05-src/approve-publishing/` | `release/npmjs / approve Publishing`.
