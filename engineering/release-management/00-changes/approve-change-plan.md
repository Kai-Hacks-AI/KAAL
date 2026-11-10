# release-management/C19 PLAN: approve Change as the first control of the new Integration ruleset

The target documents of this control are built in the target layout of Release management (`01-intent` to `05-src`), limited to what approve Change (F15) uses; later controls add their own parts. This PLAN is the Change (A to B) and references them by id.

Capability: Release management (hosted in `engineering/`). Collector: `kaal/release/approve-change`.

Serves: I1 (through F15), see [Intent](../01-intent/intent.md) and [Requirements](../02-requirements/requirements.md). Triggered by: release-management/D1 ([Defect](../06-defects/D1-two-level-collector-unprotected.md)).

## Why

Intent of this Change: reach F15 as native GitHub configuration, so that only an approved push reaches a collector (I1).

The Owner (10 November 2026) asked to bring the release controls into production one at a time, each in its own collector, each judged and then used to retire the legacy control it covers. The stations are intended to be controlled where they live: local is Development, GitHub is Integration and Promotion, npmjs is Publishing. Integration is first, and its first control is **approve Change (F15)**.

approve Change is native GitHub configuration, the smallest sufficient realization: no KAAL judgment is duplicated. It needs one rule that the live `integration` ruleset (24952357) does not have: **approval of the most recent push** (`require_last_push_approval`). Dismiss-stale-on-push is already on. The approver is never the account that pushed; the Owner confirmed they are different.

## How

- A new ruleset named `integration` is applied **beside** the live one. The live ruleset is renamed `legacy-integration` (same id, same rules) and is emptied control by control as each new control covers it; the layering is GitHub's own: every active ruleset applies, the stricter value wins, so the new ruleset can only add restriction.
- `05-src/rulesets/integration.ruleset.draft.json` is the declarative form (realization 2): a `pull_request` rule with approval of the most recent push on, plus `non_fast_forward` and `deletion` so a collector can neither be rewritten nor deleted (the legacy ruleset's own rules reach only one-level branches), merge methods `squash` and `merge` only (`rebase` removed: no flow uses it, SYNC is a merge commit and a Change is a squash). No status checks, no bypass actors, no merge queue. Required checks for two-level collectors are not added here: the legacy contexts reach only one-level branches, so widening that ruleset's include pattern is a separate ruleset change with its own go.
- Its include pattern is `refs/heads/kaal/**` **and** `refs/heads/kaal/**/*`. Observed on 10 November: `refs/heads/kaal/**` does not reach two-level branches (`kaal/release/plan` had no rule and `protected: false`), so without the second pattern two-level collectors are unprotected and this Change's own DO pull request would not be judged.
- Landing path, as always: work branch into `kaal/release/approve-change` by squash, then the whole collector into `main` by promotion. Nothing goes direct to `main`.

## Cases (RED, unwired: `04-test/approve-change.red.mjs`)

- `release-management/F15/T1` (permanent) drift: the effective rules GitHub reports for a collector branch include a `pull_request` rule with approval of the most recent push supplied by a ruleset other than the legacy one (the list holds one rule per applying ruleset). RED until the Owner imports it.
- `release-management/C19/T2` the draft covers one-level and two-level collectors.
- `release-management/C19/T3` the draft adds approval and the rewrite protection only.

## Replacement evidence the retirement plan will need (C17)

1. Realization: native (named here).
2. Effective configuration: `GET /rules/branches/<collector>` read back showing the new ruleset supplies the rule (T1).
3. Enforcement behavior: a throwaway pull request into a collector is refused without an approval of its latest push; recorded with the run.
4. Detective follow-up: a scheduled report of pull requests merged into `kaal/*` or `main` with no approval of their latest push (audit Lineage F5 is the run to extend), planned and not part of this PLAN.

approve Change retires nothing by itself: it tightens. Retiring `Change Isolation (review)` needs approve Promotion (F11) on `main` as well as this control, and has its own go.

## What this PLAN does not do

It applies nothing. The rename of the live ruleset, the import of the new one, the first enforcement and any retirement each need the Owner's own go. The DO is a small Change after that go (the evidence record). The number C19 is the next free one after C18 (#1380); the register lives in the old collector (`kaal/engineering-release-management`) and gets this row when that collector is drained or promoted. The Change fragment is `.kaal/changes/engineering/26/11/10/05/README.md`; its folder number is provisional (`26/11/10/01` to `04` are taken in the old collector).

## Learning from #1381

#1381 merged into the collector with `Branching` red and no recorded review, because two-level collectors have no rule behind them (the live `integration` pattern `refs/heads/kaal/**` does not reach them). This is the gap the draft closes, and it shows why the first import should include the rewrite protection. The CTO findings (rewrite protection, T1, the retirement wording) are corrected in this follow-up.
