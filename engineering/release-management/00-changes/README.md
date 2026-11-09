# Changes (planned)

One Change per control, each through the full loop as graph Nodes (Intent, Requirement, Architecture, Cases; a Case `tests` a Node and no Node points at a Case). Because `.github` travels alone (F6, T7), a control's work is **two Changes**, not one: an Engineering Change that moves the code into `05-src` (and adds its Cases), and a `.github`-only Change that adds the job and wiring. Together they do four things, in this order, and nothing else (names aligned per F4: self-explanatory, mapped in `03-architecture`, not identical strings):

1. **Add** the control as a job named by the control inside the workflow `release/<station>` (see `03-architecture`), running the code from its component under `05-src/` (`pipeline/` for the five shared controls, or the station component `npmjs/`, `main/` or `collectors/`, per the allocation in `03-architecture`); a control realized by a native setting or a used tool moves no code.
2. **Move** the code from where it lives today into `05-src` (history kept with `git mv`; the old path keeps a one-line shim only if a required check or hook still calls it).
3. **Retire** the old check name once the Owner has added the new context to the ruleset by hand, and only when that makes sense: a control with no old equivalent retires nothing.
4. **Prove** it with Cases that sit next to the code (test layout rule); parity Cases pin that the moved code behaves as before.

Order of every rename is **add-new, Owner adds the context to the ruleset, remove-old**, so no step blocks a promotion in flight (#1278, #1272).

| Control | Component | Today (code, check) | Retires |
| --- | --- | --- | --- |
| isolate Change | pipeline | `engineering/change-isolation/`, `change-isolation.sh`; `Change Isolation`; plus the synchronization shape from `Branching` (`lineage.ts` `synchronization`) | `Change Isolation` |
| verify Ancestry | pipeline | freshness half of `Branching` (`lineage.ts` `freshness`, `branching.sh`) | `Branching` (together with the two rows below) |
| scan Vulnerabilities | pipeline | `codeql.yml`; `CodeQL (actions)`, `CodeQL (javascript-typescript)` | the two `CodeQL` names |
| scan Dependencies | pipeline | `dependency-review.yml`; `Dependency Review` | `Dependency Review` (a rename) |
| approve Change | collectors | native settings of the `kaal/*` ruleset (below) | none (nothing on `kaal/*` requires `Change Isolation (review)` today) |
| test Integration | collectors | `engineering/lanes/`; `Hosting`, `Workspaces`, `Acceptance`, `Engineering`, `Guard` x3 (`Guard` as a job is meant, not the workflow) | the lane names, as they become jobs of the control |
| accept Capability | main | `engineering/github/promotion-source.sh` on `main` today (the approved `.mjs` port, #1317, is pending promotion; whichever `main` holds when the Change runs is moved, and the `.sh` is not reintroduced); `Promotion Source` | `Promotion Source` |
| bind Merge | main | `.github/scripts/bind-group.sh`, merge queue; plus the merge-method half of `Branching` (`lineage.ts` `auto-merge`) | `Branching` (last of the three halves to move) |
| approve Promotion | main | native settings of the `main` ruleset (below); today also `Change Isolation (review)` | `Change Isolation (review)`, retired per the sequence below |
| test Candidate | main | the lanes on `kaal/*` to `main` | the lane names |
| serialize Promotion | main | merge queue, one promotion at a time; no named check | none |
| version Package | main | `engineering/release/release.mjs` `readiness()` | none (extends G1 to G4) |
| approve Publishing | npmjs | `release.yml` `environment: npm` | none |
| verify Package Promotion | npmjs | `release.yml` Accept, `provenance()` | none |
| audit Lineage | pipeline | `branching-audit.sh`, `holds.json`; `Branching audit` | `Branching audit` |

`Branching` retires only after all three halves have a new home (verify Ancestry, isolate Change, bind Merge), each add-new first. Two gates close the set: `gate (main)` and `gate (collectors)` (see `03-architecture`), added once the controls they need exist; the Owner adds those two contexts and then removes the old per-control contexts from the rulesets. Each Change has its own record under this folder when it starts.

## Retiring `Change Isolation (review)` (Owner, 9 Nov)

Reason: the native ruleset settings (code owner review, approval of the most recent push, dismiss on push) carry the approval when set up correctly. The check's one extra, binding the approval to the ledger entry's digest, is given up (`ledger-in-promotion-plan.md` called the plain approval "not recommended" for that reason; the Owner has decided otherwise). Native approval stays bound to the head by dismiss-on-push.

Order (add-new, settings, remove-old), each step safe before the next:

1. **Owner, rulesets (settings, nothing breaks):**
   - `kaal/*` (ruleset `lineage`): turn **Require review from Code Owners** on (now off). Effect to accept: a code owner approves every collector PR.
   - `main` and `kaal/*`: turn **Require approval of the most recent push** on (now off), so the last pusher cannot be the only approver.
   - Already on and kept: 1 approval, dismiss stale approvals on push, thread resolution, extra approval for unattributed changes (both); code owner review on `main`.
   - Keep the existing `CODEOWNERS` as it is. When a second owner exists, add the ledger path as its own line.
2. **Owner, `main` ruleset:** remove the required context `Change Isolation (review)`. Only after step 1 is verified (a real pull request into `main` shows the code owner review and last-push approval enforced) and the Owner's decision to give up the ledger-digest attestation is recorded in the repository, so there is never a window without an approval rule.
3. **Change, `.github` only** (travels alone): delete `merge-group-admission.yml`, `merge-group-review.yml`, `change-isolation-review.yml` and `change-isolation-review-relay.yml` (the jobs named `Change Isolation (review)` and `(review event)`).
4. **Change, Engineering:** retire the attestation code and documents that only served them (`attest.mjs`, `attesters.json`, `ledger-in-promotion-plan.md`, their Cases), and decide what `change-isolation.sh` does with `KAAL_ATTESTATION` (strict path unused). A ledger entry is then admitted by the ledger match plus the native approval.

Not blocked: nothing here touches the required contexts that #1278 and #1272 depend on. Step 2 is the only ruleset removal.

## Build order (agreed)

`pipeline` (audit Lineage first), then `npmjs`, then `main`, then `collectors`.

## Open for the Owner

- Decided (Owner, 9 Nov, includes retiring `Change Isolation (review)`): lanes stay separate jobs; `CodeQL` is `scan Vulnerabilities` and `dependency-review.yml` is `scan Dependencies`, both at the root; `isolate Change` and `verify Ancestry` at the root; the approval half is `approve Change` on `kaal/*` and `approve Promotion` on `main`; `Branching` is split (freshness to verify Ancestry, sync shape to isolate Change, merge method to bind Merge). Gate design is in `03-architecture` (reusable workflows plus wait-by-API).

