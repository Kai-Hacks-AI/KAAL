# engineering/C16 change: main admits the delivery branches (kaal, hotfix, wire)

Smallest path, at the Owner's direction (15 Nov 2026): no extra registry, records or contexts. Earlier designs (class-aware extension, then a registry-and-qualifier stock model) are replaced by this one. Ids C16 and T450-T453 were checked on `main` only, not against every collector and open PR.

## From, to, because

- **From:** `Promotion Source` (`promotionSource` in `engineering/github/lineage.ts`) admits a pull request into `main` only from a `kaal/` head. `hotfix/<name>` and `wire/<name>` cannot enter, so the first WIRE (#1705, the githooks split) and every hotfix are blocked.
- **To:** `main` admits heads of three kinds, all of this repository: `kaal/<capability>/*`, `hotfix/*`, `wire/*`. Every other branch is development and is not deliverable. Each head is admitted only when every check its own branch ruleset requires is green on the exact head sha ("the branch passes all tests"), with no exception for KAAL collectors. The branch's ruleset is the registration; nothing else is added.
- **Because:** the delivery paths are development -> `kaal/**`, `hotfix/*`, `wire/*` -> `main`, each protected by its own ruleset with its own checks. `main` needs to recognize them without baking in a one-off route.

## Design (git and GitHub terms)

Owner ruling at the CPO review of `7b717ea`: each branch must pass all qualifying tests applicable to its stock before it can travel OUT, with no exception for KAAL collectors. A KAAL PLAN may carry RED Cases during development; that is a collector in development, not one ready to travel. This Change grants no temporary bypass and never reads PLAN-accepted RED as ready.

1. **Route table in `lineage.ts`** (Engineering owns KAAL specifics; nothing goes into a package or `.kaal/`): `kaal/<capability>/*` (at least two segments after `kaal/`), `hotfix/*`, `wire/*`. Base must be the default branch (else not applicable); head repository must be this repository; any other head fails with the guide link.
2. **One rule for all three stocks: GREEN.** A head is admitted when every status check required by the rules that apply to its own branch has a successful latest completed run on the exact head sha. `kaal/*` is not admitted by prefix alone. Which checks make a KAAL collector GREEN (full PDCA) is defined by the collector ruleset's required checks, in its own Change; C16 only consumes whatever that ruleset requires.
3. **Required checks are read from the effective rules**, not from a file: `GET /repos/{repo}/rules/branches/{headRef}` returns the rules of every ruleset that applies to the branch; `readRequired` takes the union of their `required_status_checks` contexts (with the integration id) and ignores other rule types. A response that is not a rule list, or any read failure, cannot be judged (exit 2). An empty union fails the head (a ruleset requiring nothing proves nothing). Classic branch protection is not read; this repository uses rulesets only, and the limit is stated rather than assumed away.
4. **Runs on the head** (`GET /repos/{repo}/commits/{sha}/check-runs`, paginated; each run carries its own `head_sha` and app): for each required context, only runs on **this exact commit** by the required app count, and the **newest** of them (highest id) decides. It must be completed with `success`; a failure, a missing run, or a newer evaluation still in progress is not green, so an earlier success never stands in for a newer pending run, and a run on another commit is no evidence. A rerun that succeeds after a failure is green; a later failure is red. `Promotion Source` is excluded only from its own recursive evaluation; no other required check is suppressed. The message names every check that is not green. The script waits for pending checks (bounded: 30 tries, 20 seconds apart) and still fails closed if they have not finished.
5. **Where it runs.** In the existing `Promotion Source` check: `promotion-source.sh` gathers the two facts with `gh api` (the head sha comes from the event), then `lineage.ts` judges. No new context, no new registry or verdict format, no ruleset change to `main`. Nothing of the head is checked out or run. No head sha or unreadable facts: exit 2.
6. **The OUT rule is the opener's.** A pull request is opened only after the branch is green, so the checks exist at the first run; the check runs again on `synchronize`, `edited` and `reopened`. A request opened early is red until re-run.
7. **Checked against live data (15 Nov):** the rules for a collector branch name 14 checks and the tip of `kaal/release/pull-lane` carries completed runs for them, including reruns after a first failed `Branching` run, so the rule does not block a ready collector.
8. **Independent and untouched:** `promotionFreshness` (F2), Change Isolation (and review), Branching, ci, CodeQL, Dependency Review, the merge queue, Publishing (tags).

## Sequence (each its own Change)

1. This PLAN, CPO review at the exact head. T450-T453 are RED on `main`.
2. DO (done in the DO pull request) on collector `kaal/engineering/delivery-admission`: `lineage.ts` (`promotionSource`, `readRequired`, the run reading), `promotion-source.sh`, and the existing `promotionSource` tests brought to the new rule. Then ACT and promotion to `main`. **Prerequisite, found in the DO:** the job must supply `KAAL_HEAD_SHA` and a read-only `GH_TOKEN`; without them the new script exits 2 for every promotion. That is one `.github`-only Change (Change Isolation: it travels alone) and it must be on `main` **before** this DO is promoted. Adding the two variables is harmless to the old script.
3. Owner (needs Kai's go): create the `wire/*` ruleset with the WIRE judge (release/C27) among its required checks. A `hotfix/*` ruleset follows later the same way (its RED-then-GREEN check is the Hotfix capability's Change).
4. #1705 opens as `wire/githooks-split` into `main` and is admitted; WIRE installs the githooks.

## Cases (all RED on `main`)

T450 `kaal/<capability>/*`, `hotfix/*` and `wire/*` heads of this repository are admitted only with green checks; with no check facts or a red required check they fail (no exception for KAAL); a bare `kaal/<name>`, any other branch and any fork fail; another base is not applicable. T451 GREEN needs every required check's successful latest run: an empty requirement, a missing, failed or running check all fail and the message names the check. T452 the newest run on the exact head decides (a rerun success is green, a later failure red, a newer run in progress is not green), a run on another commit or from another app does not count, and `Promotion Source` is excluded only from its own evaluation. T453 `readRequired` is the union over every ruleset that applies and fails closed on an unreadable response; the script exits 2 without a head sha.

## Not in this Change

No registry, record, new context or ruleset change; no change to F2 freshness or any other control; no definition of full PDCA for collectors (the collector ruleset's Change); no hotfix qualifier (Hotfix capability's Change); no `wire/*` or `hotfix/*` ruleset (Owner); no classic branch protection; no auto-pull or GitHub App work (pull/C14).
