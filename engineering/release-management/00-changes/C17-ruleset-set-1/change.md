# engineering/C17 change: ruleset set 1, as source in Engineering, built from controls

Owner direction (16 Nov 2026): rulesets are in Engineering; we get set 1 together; the rulesets are set up from controls (ruleset settings are controls, not only required checks). Baseline 0 is `.githooks` on `main`; the `wiring` ruleset of this set is what admits it (C16 reads the head branch's own rulesets). This builds on release/C29 (the target set of five, PLAN merged into `kaal/release/ruleset-set`, DO not authorized) and replaces nothing of it: C29 names the five; this Change delivers them as source. Ids C17 and T454-T459 were checked on `main` only, not against every collector and open PR.

## From, to, because

- **From:** three live rulesets (`old integration` 24952357 on `kaal/**`, `old promotion` 24951062 on the default branch, `old publishing` 26921478 on `trial-*@*` tags), unrecorded as source, no ruleset for `hotfix/*` or `wire/*`, "branch up to date" required on two of them, and `Guard` missing from the promotion checks.
- **To:** five rulesets as JSON in `engineering/release-management/05-src/wiring/rulesets/` (`<target>.json`, the layout release/C18 already uses) (promotion, integration, hotfixing, wiring, publishing), and `engineering/release-management/05-src/wiring/rulesets/controls.md`, one row per setting (rule type, parameter, required context): what it protects, which stock or station it belongs to, and where it came from. Source and table must agree (a Case). Guard is required in all five. No "up to date". No bypass. No protection of the old three is lost without a listed reason.
- **Because:** a ruleset's settings protect delivery as much as its required checks do, so each must be an agreed control in its place; and the `wiring` and `hotfixing` rulesets are what let `wire/*` and `hotfix/*` heads be admitted to `main` by C16.

## The set (proposal; every value is a row in `controls.md` at the DO)

| Ruleset | Target | Settings as controls | Required checks |
| --- | --- | --- | --- |
| promotion | the default branch (`main`) | no deletion; no force push; PR with 1 approval, code-owner review, stale reviews dismissed on push, threads resolved, extra approval for unattributed changes; squash or rebase; merge queue (squash, 1 entry, all green); CodeQL code scanning (errors, high or higher); no bypass | the 12 of `old promotion` plus `Guard`, `Guard (macOS)`, `Guard (Windows)` |
| integration | `kaal/**` | no force push; PR with 1 approval, stale reviews dismissed, threads resolved; CodeQL; no bypass; not enforced on create | the 14 of `old integration` (includes the three Guard contexts) |
| hotfixing | `hotfix/**` | as integration | as integration, to start; the hotfix qualifier (Defect, RED then GREEN) is the Hotfix capability's later Change |
| wiring | `wire/**` | as integration | as integration, to start; the WIRE judge (release/C27) becoming a required check is a later Change |
| publishing | tags `trial-*@*` | no creation, update, deletion or force push by anyone, as `old publishing`; no bypass | none can apply to a tag rule: Guard for tags is OPEN (release/C29 left the Guard fit to the DO and the CPO) and is recorded as an open row, not dropped |

Differences from the old three, all listed in `controls.md` as `changed`: `strict_required_status_checks_policy` becomes false (the Owner's rule: no "up to date" in new rulesets); promotion gains the three Guard contexts; hotfixing and wiring are new. The old three stay active beside set 1 and drain later, so while both apply a branch gets the union (stricter, never weaker). Because `hotfixing` and `wiring` require status checks, a push to a `hotfix/*` or `wire/*` branch needs the checks first, so they are fed by pull requests like collectors; a branch that already exists is unaffected by `do_not_enforce_on_create`.

## Sequence (each its own Change)

1. This PLAN, CPO review at the exact head. T454-T459 RED on `main` (the set and the table do not exist).
2. DO on collector `kaal/engineering/ruleset-set`: the five JSON files, `controls.md`, the tests. No live ruleset touched. Then ACT and promotion to `main` (Engineering source only).
3. Owner (needs Kai's go): install set 1 together, beside the old three, from the JSON on `main`. A ruleset installed by hand once; later changes go through WIRE.
4. `#1705` (`wire/githooks-split`) is admitted by the `wiring` ruleset and C16 reads the head's checks green: baseline 0.
5. Drain: the old three retire control by control, each only when its set 1 successor is verified (a later Change per control).

## Cases (all RED on `main`)

T454 set 1 is exactly five rulesets (promotion, integration, hotfixing, wiring, publishing), each in import shape, named without the `old` prefix, with no ruleset id. T455 `controls.md` and the JSON agree: every rule type, parameter and required context in the JSON is a row of the table and every row is in the JSON. T456 Guard (all three contexts) is required in promotion, integration, hotfixing and wiring, and publishing carries an explicit OPEN row for it. T457 no "up to date" (strict false), empty bypass lists, `do_not_enforce_on_create` set only for the branch stocks. T458 nothing silently lost: every rule type, parameter and required context of each old ruleset (recorded in `baseline-old.json`, captured live on 16 Nov) exists in its successor or is a listed `changed` row with its reason. T459 promotion keeps deletion, non-fast-forward, code-owner review, squash and rebase only, and the squash merge queue exactly as `old promotion`.

## Not in this Change

No live ruleset is created, changed, enabled or retired; no required check is added beyond Guard in promotion; no hotfix qualifier, WIRE judge check or Guard-for-tags design (their own Changes); no replacement for `Promotion Source` (C16 is a bridge); no change to release/C29's record.

## Home and relation to release/C18

Per the Owner (16 Nov): the rulesets belong in release management. Set 1 therefore lives in `engineering/release-management/05-src/wiring/rulesets/`, the same `<target>.json` layout release/C18 uses. release/C18's `integration.json` and `promotion.json` (analyze Vulnerabilities contexts) are the same files: this Change's DO builds on them after that collector is synchronized with `main`, so the two contexts become rows of `controls.md` and no competing file exists. The folder id `C17` also exists in release-management (`C17-wire-hotfix-template`); the coordinator is asked for a free id before the DO.
