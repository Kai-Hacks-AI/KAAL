# Skill Standard: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A48** [core/F92, core/N25, core/N27]: The standard has one source: a new entry point `kaal-core/skill`, a pure module holding the rules (`entry`, `layout`, `router`, `detail`, `lane`, `size`), the permitted top-level set and the thresholds 200, 400 and 600. The `Skill Standard` Definition (`payload/core/Skill-Standard.md`) states the responsibilities in words and carries no number, so there is nothing to keep in step with the module. It is carried like `CASE` and `LOVE`, so the Kernel's bytes and every existing id stay unchanged.
- **core/A49** [core/F93, core/F94, core/F98, core/N26]: `judgeSize(text)` returns `{ words, level, warning }`. It finds the end of the frontmatter block by its two delimiter lines and counts the rest. A warning is data: `{ level, words, rules, remedy, response, required, blocks }`, from which the message is rendered. `rules` are ids from A48, `remedy` is `review-router`, `consolidate`, `move-to-references`, `required` grows by stage, and `blocks` is true only for `hard`. Tests read the data, never the message.
- **core/A50** [core/F95]: `judgeLayout(paths)` is pure over relative paths and returns findings `{ rule, path }`. The caller lists the directory, so Core stays free of I/O.
- **core/A51** [core/F96, core/N25, core/N26]: `kaal skill check <dir>` is the one place that reads a directory, through Hosting, and calls the pure functions. It is the mechanism Controls, WIRE or CI run, and it is the same call on both deployment paths.
- **core/A52** [core/F97, core/N26]: The ratchet is a filter in front of the verdict, as Controls' ratchet strategy builds it: the check emits `hard` and the filter subtracts the baseline. Core supplies the comparison for this one rule and reads the baseline as data. Where the baseline file lives, who accepts a change to it and how a run reads the last accepted one from the base branch are the gate's. Release proposed owning that gate.

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. Core carries the standard and a pure check; Controls and WIRE only run it** (recommended) | One entry point, one Definition, one CLI verb. | Core reads `SKILL.md` to find the frontmatter's end and count words, which narrows `core/N13`. |
| B. The check lives in Engineer Skill's `checkSkill` | Rules sit beside the format check. | Core is the owner of the rules but cannot run them, and Core may not depend on a discipline (`core/N11`). |
| C. Each capability keeps its own cap | No change. | Fifteen caps today, 600 words in Controls and 500 lines in Engineer Skill, and no one standard. |

## Evidence: the 15 `SKILL.md` on `main` at 357229a, counted body-only (25 Nov 2026)

The first version of this PLAN counted the whole file and found seven hard Skills. Counted under the rule the Owner agreed, six are hard and the seventh moves down.

| Level | Skills, body words |
| --- | --- |
| `hard`, above 600 | testing 1446, hosting 1198, release 1102, guard 858, change 724, and Guard's delivery template 700 |
| `medium`, above 400 | foundation 586 (it was 637 with its frontmatter), architecture 545, controls 527, engineer-skill 485, research 450, retro 408, graph 401 |
| `soft`, above 200 | review 331, engineering 306 |

The baseline of the `skill-size` ratchet is therefore six findings, `kaal-testing: 1446`, `kaal-hosting: 1198`, `kaal-release: 1102`, `kaal-guard: 858`, `kaal-change: 724` and the template's `kaal-guard: 700` (two Skills carry that directory name, which the DO must distinguish), each at its current word count. Every Skill has at least a soft stage. Layout today: ten have `SKILL.md`, `references/` and `scripts/`, and the rest have `SKILL.md` alone or with `references/` only, which `core/F95` accepts.

## Decided by the Owner (25 Nov, review of this PLAN)

1. Hard blocking is active, with a named shrink-only ratchet and a body-only baseline. No new violations or growth.
2. agentskills.io is the floor. The top-level set is `SKILL.md`, `references/`, `scripts/`, `assets/`, and only `SKILL.md` is mandatory.
3. `SKILL.md` is a crisp, clear, concise router. Link reachability can follow separately.
4. Staged escalation at 200, 400 and 600. Exactly 600 is permitted.
5. Frontmatter is excluded from the count and reviewed separately.

## Open for confirmation

- **The baseline's home.** Release proposed owning the gate and the baseline. This PLAN takes that and keeps Core out of it (`core/A52`).
- **Two Skills named `kaal-guard`.** The package's and the template's. The baseline key is the directory name, so the template's entry needs another key, or the template is not judged until it is delivered.

## Who confirms what

| Owner | Asked |
| --- | --- |
| Release | WIRE governance and the delivery set for agent-facing deployment, and the gate that runs the check with this baseline. **Answered (25 Nov):** `.agents` is already a wirable delivery root, and a Skill-only WIRE is a normal WIRE. It needs the check as one command with the exit contract 0 clean, 1 finding, 2 unknown, findings as data, and the candidate passed as data so the check runs from the base branch. It owns the gate policy, as a ratchet with a baseline of the long Skills, preventive only on the Owner's go. `core/F96` adopts the contract. |
| Engineering | The Skill-only transport, and agreement on the layout. **Confirmed (25 Nov):** the layout agrees with its package layout, which puts the Skill under `13-source` and builds `dist` from it. It agrees to the Skill-only transport on two conditions, which this PLAN adopts: (a) `kaal skill check` runs on the directory as delivered (the built `dist` copy, not the source tree), so one contract serves both paths; (b) the WIRE copies the Skill directory unchanged and nothing outside it. Each WIRE still needs the Owner's go. |
| Hosting | How npm content is exposed in `.kaal/` for a published capability. **Answered (25 Nov):** today it is not exposed at all (Hosting ships only `dist/`, has no Installation Contract, and places nothing under `.kaal/hosting` or `.agents/skills`). Its proposal, not yet a Change: an `installation.kaal.json` mapping the Skill directory to `.agents/skills/kaal-hosting/` through Core's `realizeIn`, and everything else to `.kaal/hosting/`, so an agent sees the Skill directory only and `kaal skill check` can run on it. Its `SKILL.md` is a baseline finding, restructured in its own Change after this standard merges. |
| The owners of #1703 (Intent), #2113 (Defect), #2146 (Architecture), #1698 (Graph) and #1717 (Requirements) | That their Skill generation meets the standard, once it is merged. Defect has answered: its draft is 739 words and will be revised to a router of at most 200 with the detail in `references/`. |
| Controls | Only the mechanism that runs `kaal skill check`. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C52` PLAN, this Change | Core | none |
| `core/C52` DO: `kaal-core/skill`, the Definition, the CLI verb | Core | the merged PLAN |
| The control that runs the check with the `skill-size` baseline, and WIRE governance | Release and Controls | the DO |
| Each capability's Skill brought to the standard | each owner | the DO |
