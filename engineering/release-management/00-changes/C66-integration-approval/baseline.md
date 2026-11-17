# C66 baseline

The baseline is the collector `kaal/release/integration-approval` at `main` c90b9fb, with no commit of its own.

- `05-src/wiring/rulesets/integrating.json` has one rule, `required_status_checks` (`verify Stages (Integrating)` and `verify Stages (Developing)`), no `pull_request` rule, an empty bypass list and the targets `kaal/**`, `hotfix/**`, `wire/**`. `collecting.json`, `hotfixing.json` and `wiring.json` hold only their own check.
- The live old integration ruleset (24952357) is on `kaal/**` only. It requires 14 checks, a `pull_request` rule (one approval, no Code Owner review), `non_fast_forward` and code scanning. Nothing requires an approval on `hotfix/**` or `wire/**` from the new set, and the new set requires none on any branch.
- The judge of `verify Stages` (`05-src/stages/judge.mjs`) accepts only `required_status_checks` as the rule of a branch ruleset (`the only rule must be required_status_checks`). A second rule in `integrating.json` fails it. It is the default branch's own judge when a PROMOTION is checked, so a second rule can only pass once main's judge accepts a rule the stage declares (as release/C59 did for a second check). That precursor Change is requested from the coordinator; this Change does not deliver before it.
- The approvals in `kaal/**` today are the CPO's formal approving review of the exact head. A catch-up merge dismisses it; release/CTL8 (on main, switched off) gives a pure SYNC a bot approval.
- `CODEOWNERS` names only `@kaihacksai`.
- Whether `require_extra_approval_for_unattributed_changes` is set on `kaal/**` is not confirmed.
