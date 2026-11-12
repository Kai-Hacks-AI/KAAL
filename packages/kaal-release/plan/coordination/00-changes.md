# Coordination: Change (A to B)

This is `coordination/C1`, a PLAN Change. It ships no code. It adds one read-only script to the `kaal-release` Skill. The id scope `coordination/` is provisional: `release/` is already used both by the kaal-release PLAN (#1350) and by `engineering/release-management`, and the ids would collide. See "Open for the CPO".

## A: the present

- `kaal-release` is Skill-only (#1350, not yet merged; no package on `main`).
- The CPO and CTO reconstruct by hand which pull request deserves attention, whether it needs creating, review, revision or auto-merge, and which collector is promoted next.
- Nothing reports a pull request that does not exist yet.

## B: the target

One deterministic script in the Skill turns declared policy and gathered facts into an ordered action list. See [requirements.md](requirements.md) and [testing.md](testing.md). Analysis: [analysis.md](analysis.md).

## The route

1. This PLAN, approved by exact-head CPO review, into the `kaal/release/plan` collector.
2. Amend #1350 (below). Land #1350's PLAN first.
3. DO: the package shape from #1350's DO must exist; then the script, Cases RED then GREEN.
4. A second Change adds the live gatherer, run on the Owner's device.

## Amendments to #1350 (these become a PLAN edit once #1350 is in the collector)

| #1350 text | Amendment |
| --- | --- |
| N3: ships no Script | 0.0.1 ships one Script. It still verifies nobody's release and only recommends. |
| T9: README states no Script | README states one read-only Script and what it does not do. |
| Open item 2: Skill-only or with a first Script | Resolved by the Owner (12 Nov): with a first Script. |
| I5 and USE vs BUILD row: Script later, only when a behaviour must repeat exactly | Release coordination is that behaviour. |
| Architecture and BASS rows: no deterministic element shipped | The deterministic element is this Script. |
| T5: scans shipped files for KAAL identities | Also scans the Script and its fixtures. F5 itself is unchanged. |
| T8 / N2: no KAAL runtime dependency | Unchanged. The Script has no dependencies and imports nothing from KAAL. |

## Out of scope

- Any write: creating pull requests, approving, merging, enabling auto-merge, commenting.
- Proposing DO or ACT pull requests from Change state (a later increment).
- The hotfix route, the npm release step, and wiring into hooks, CI, Guard or rulesets.
- The live `gh` gatherer (its own Change).
- Retiring track Work (a MERIT decision after the Script is on `main`).

## Open for the CPO

1. Id scope. `coordination/` is a stand-in until the `release/` collision is settled.
2. Sequencing. Wait for #1350's PLAN and DO, or fold the Script into #1350.
3. Whether `OPEN PR` and `PR` are acceptable words in a generic Skill, or the host-neutral term should be used with `PR` as a worked-example synonym.
4. Whether `kaal-engineer-skill`'s checker accepts a `scripts/` directory (unverified).
