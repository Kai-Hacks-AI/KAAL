# Ruleset set 1: controls

The minimal set 1 (release/C35): six rulesets, each carrying only what is listed here. `verify Stages (Developing)` is judged by its own job and also runs locally before a push (release/C37). Enforcement is additive: a branch gets Integrating plus the applicable specialized ruleset. Every other control (approvals, merge queue, scanning, deletion, force-push, the other checks, Guard) is still enforced by the old three live rulesets and migrates into these one at a time, each in its own Change. The old three stay active. Nothing here is installed. Shared controls live in `integrating`; no control is listed twice.

| ruleset | target | rule | check | why |
| --- | --- | --- | --- | --- |
| integrating | `kaal/**`, `hotfix/**`, `wire/**` | required_status_checks | `verify Stages (Integrating)`, `verify Stages (Developing)` | the integration stages exist in Engineering; Integration challenges Developing (the `.githooks` tree is intact, release/C37); the shared home of future common controls |
| collecting | `kaal/**` | required_status_checks | `verify Stages (Collecting)` | the collector stage exists in Engineering |
| hotfixing | `hotfix/**` | required_status_checks | `verify Stages (Hotfixing)` | the hotfix stage exists in Engineering |
| wiring | `wire/**` | required_status_checks | `verify Stages (Wiring)` | the wiring stage exists in Engineering |
| promoting | the default branch (`main`) | required_status_checks | `verify Stages (Promoting)` | the promoting stage exists in Engineering; the job also judges Publishing |
| publishing | tags `trial-*@*` | update | none (a tag ruleset cannot require a check) | a published tag cannot be moved; the smallest rule that makes the stage exist |

All six: bypass list empty, no "up to date" (`strict_required_status_checks_policy` false), enforcement active. The branch rulesets that gate integration branches set `do_not_enforce_on_create` so a new branch can be pushed before its first check; `promoting` enforces on create.
