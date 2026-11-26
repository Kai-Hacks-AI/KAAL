# Ruleset set 1: controls

The minimal set 1 (release/C35): six rulesets, each named by its stage number (release/C106: 00 all, 10 development, 2x integrating, 30 promoting, 40 publishing; the stage declares the name and `verify Stages` judges the source against it), each carrying only what is listed here. `verify Stages (Developing)` is judged by its own job and also runs locally before a push (release/C37). Enforcement is additive: a branch gets Integrating plus the applicable specialized ruleset. Every other control (approvals, scanning, deletion, force-push, the other checks, Guard) is still enforced by the old three live rulesets and migrates into these one at a time, each in its own Change. The old three stay active. Nothing here is installed. Shared controls live in `integrating`; no control is listed twice.

| ruleset | target | rule | check | why |
| --- | --- | --- | --- | --- |
| 20 - integrating | `kaal/**`, `hotfix/**`, `wire/**` | required_status_checks | `verify Stages (Integrating)`, `verify Stages (Developing)` | the integration stages exist in Engineering; Integration challenges Developing (the `.githooks` tree is intact, release/C37); the shared home of future common controls |
| 23 - collecting | `kaal/**` | required_status_checks | `verify Stages (Collecting)` | the collector stage exists in Engineering |
| 21 - hotfixing | `hotfix/**` | required_status_checks | `verify Stages (Hotfixing)` | the hotfix stage exists in Engineering |
| 22 - wiring | `wire/**` | required_status_checks | `verify Stages (Wiring)` | the wiring stage exists in Engineering |
| 30 - promoting | the default branch (`main`) | required_status_checks, merge_queue | `verify Stages (Promoting)`, `analyze Vulnerabilities (Promoting)` (release/CTL5); the queue lands by squash, one entry at a time (release/C117) | the promoting stage exists in Engineering and the job also judges Publishing; a promotion with a known vulnerability, or whose dependencies cannot be analyzed, does not proceed (release/CTL5, preventive; the report is release/CTL2); a promotion lands through the queue, which builds it on the tip of `main` (release/C117) |
| 40 - publishing | tags `trial-*@*` | update | none (a tag ruleset cannot require a check) | a published tag cannot be moved; the smallest rule that makes the stage exist |

All six: bypass list empty, no "up to date" (`strict_required_status_checks_policy` false), enforcement active. The branch rulesets that gate integration branches set `do_not_enforce_on_create` so a new branch can be pushed before its first check; `promoting` enforces on create.

## Detective reports

A detective report is a check a stage reports and no ruleset requires. It does not appear in the table above and gates nothing; requiring one would be enforcement, a separate preventive control with its own explicit Owner decision. The workflow source is `05-src/wiring/workflows/` and a WIRE installs it.

| control | stage | check | status |
| --- | --- | --- | --- |
| analyze Vulnerabilities (release/C5, release/C48) | Integrating | `analyze Vulnerabilities (Integrating)` | detective, required by no ruleset |
