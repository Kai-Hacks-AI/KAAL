# engineering/C16 change: main admits the delivery branches (kaal, hotfix, wire)

Smallest path, at the Owner's direction (15 Nov 2026): no extra registry, records or contexts. Earlier designs (class-aware extension, then a registry-and-qualifier stock model) are replaced by this one. Ids C16 and T450-T453 were checked on `main` only, not against every collector and open PR.

## From, to, because

- **From:** `Promotion Source` (`promotionSource` in `engineering/github/lineage.ts`) admits a pull request into `main` only from a `kaal/` head. `hotfix/<name>` and `wire/<name>` cannot enter, so the first WIRE (#1705, the githooks split) and every hotfix are blocked.
- **To:** `main` admits heads of three kinds, all of this repository: `kaal/<capability>/*`, `hotfix/*`, `wire/*`. Every other branch is development and is not deliverable. A `hotfix/*` or `wire/*` head is admitted only when every check its own branch ruleset requires is green on the exact head sha ("the branch passes all tests"). The branch's ruleset is the registration; nothing else is added.
- **Because:** the delivery paths are development -> `kaal/**`, `hotfix/*`, `wire/*` -> `main`, each protected by its own ruleset with its own checks. `main` needs to recognize them without baking in a one-off route.

## Design (git and GitHub terms)

1. **Route table in `lineage.ts`** (Engineering owns KAAL specifics; nothing here goes into a package or `.kaal/`): `kaal/` (unchanged), `hotfix/`, `wire/`. Base must be the default branch (else not applicable); head repository must be this repository; any other head fails with the guide link.
2. **`kaal/*` is unchanged.** It is admitted by the same prefix rule as today and reads no check facts. Tightening it to "full PDCA green" (a collector after PLAN with RED Cases is not ready) belongs to the collector ruleset's required checks and its own Change; once that ruleset requires them, the same check-read below applies to `kaal/*` too.
3. **`hotfix/*` and `wire/*` read two facts about the head** and `promotionSource` judges them: `required`, the status-check names of the rules that apply to the head branch (`GET /repos/{repo}/rules/branches/{headRef}`), and `runs`, the check runs on the head sha (`GET /repos/{repo}/commits/{sha}/check-runs`). Admitted only if `required` is non-empty and each name has a run with conclusion `success`. No facts, an empty `required`, a missing run, a failure or a run still in progress: fail, naming the check. A head whose facts cannot be read at all exits 2 (cannot judge).
4. **Where it runs.** In the existing `Promotion Source` check: `promotion-source.sh` gathers the two facts for hotfix/wire heads with `gh api` (the head sha comes from the event), then `lineage.ts` judges. No new context, no ruleset change to `main`. Nothing of the head is checked out or run.
5. **The OUT rule is the opener's.** A pull request is opened only after the branch is green, so the checks exist at the first run; the check runs again on `synchronize`, `edited` and `reopened`. A request opened early is red until re-run.
6. **Independent and untouched:** `promotionFreshness` (F2), Change Isolation (and review), Branching, ci, CodeQL, Dependency Review, the merge queue, Publishing (tags).

## Sequence (each its own Change)

1. This PLAN, CPO review at the exact head. T450-T453 are RED on `main`.
2. DO on collector `kaal/engineering/delivery-admission`: `lineage.ts`, `promotion-source.sh` and its tests. Then ACT and promotion to `main`. If the head sha and a token must reach the job, one `.github`-only DO (Change Isolation: it travels alone) is needed, in the same station order; it is stated in the DO PLAN, not decided here.
3. Owner (needs Kai's go): create the `wire/*` ruleset with the WIRE judge (release/C27) among its required checks. A `hotfix/*` ruleset follows later the same way (its RED-then-GREEN check is the Hotfix capability's Change).
4. #1705 opens as `wire/githooks-split` into `main` and is admitted; WIRE installs the githooks.

## Cases (all RED on `main`)

T450 `main` admits `hotfix/*`, `wire/*` and `kaal/*` heads of this repository; any other branch and any fork fails; another base is not applicable. T451 a hotfix or wire head needs every required check green on the head: no facts, an empty requirement, a missing, failed or running check all fail, and the message names the check. T452 `kaal/*` needs no check facts (unchanged) and `promotionFreshness` stays. T453 `promotion-source.sh` exits 2 for a hotfix or wire head with no sha to read checks at, and 0 for `kaal/*` without one.

## Not in this Change

No registry, qualifier record, new context or ruleset change; no change to F2 freshness or any other control; no hotfix qualifier (Hotfix capability's Change); no `kaal/*` tightening; no `wire/*` or `hotfix/*` ruleset (Owner); no auto-pull or GitHub App work (pull/C14).
