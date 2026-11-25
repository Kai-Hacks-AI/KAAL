# Skill Standard: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A48** [core/F92, core/N25]: The standard has one source: a new entry point `kaal-core/skill`, a pure module holding the rules (`entry`, `layout`, `router`, `detail`, `size`), the permitted top-level set and the thresholds 200, 400 and 600. The `Skill Standard` Definition (`payload/core/Skill-Standard.md`) states the responsibilities in words and carries no number, so there is nothing to keep in step with the module. It is carried like `CASE` and `LOVE`, so the Kernel's bytes and every existing id stay unchanged.
- **core/A49** [core/F93, core/F94, core/N26]: `judgeSize(text)` returns `{ words, level, warning }`. A warning is data: `{ level, words, rules, remedy, blocks }`, from which the message is rendered. `rules` are ids from A48, `remedy` is `review-router`, `consolidate`, `move-to-references`, and `blocks` is true only for `hard`. Tests read the data, never the message.
- **core/A50** [core/F95]: `judgeLayout(paths)` is pure over relative paths and returns findings `{ rule, path }`. The caller lists the directory, so Core stays free of I/O.
- **core/A51** [core/F96, core/N25]: `kaal skill check <dir>` is the one place that reads a directory, through Hosting, and calls the two pure functions. Exit 1 means `hard` or a layout finding. It is the mechanism Controls, WIRE or CI run, and it is the same call on both deployment paths.

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. Core carries the standard and a pure check; Controls and WIRE only run it** (recommended) | One entry point, one Definition, one CLI verb. | Core reads `SKILL.md` to count words, which narrows `core/N13`. |
| B. The check lives in Engineer Skill's `checkSkill` | Rules sit beside the format check. | Core is the owner of the rules but cannot run them, and Core may not depend on a discipline (`core/N11`). |
| C. Each capability keeps its own cap | No change. | Fifteen caps today, 600 words in Controls and 500 lines in Engineer Skill, and no one standard. |

## Evidence: the 15 `SKILL.md` on `main` against the thresholds (word counts, 25 Nov 2026)

| Level | Skills |
| --- | --- |
| `hard`, above 600 | change 806, foundation 637, guard 907, hosting 1260, release 1166, testing 1513, and Guard's delivery template 750 |
| `medium`, above 400 | architecture 598, controls 593, engineer-skill 540, graph 466, research 527, retro 489 |
| `soft`, above 200 | engineering 365, review 376 |

Every Skill has at least a soft warning, and seven would block on day one. Layout today: ten have `SKILL.md`, `references/` and `scripts/`, and the rest have `SKILL.md` alone or with `references/` only, which `core/F95` accepts. A blocking check cannot start strict. This is the Owner's decision (see Open questions).

## Who confirms what

| Owner | Asked |
| --- | --- |
| Release | WIRE governance and the delivery set for agent-facing deployment. |
| Engineering | The Skill-only transport, and agreement on the layout. **Confirmed (25 Nov):** the layout agrees with its package layout, which puts the Skill under `13-source` and builds `dist` from it, so the standard applies to the Skill directory itself. It agrees to the Skill-only transport on two conditions, which this PLAN adopts: (a) `kaal skill check` runs on the directory as delivered (the built `dist` copy, not the source tree), so one contract serves both paths; (b) the WIRE copies the Skill directory unchanged and nothing outside it. Each WIRE still needs the Owner's go. |
| Hosting | How npm content is exposed in `.kaal/` for a published capability. **Answered (25 Nov):** today it is not exposed at all (Hosting ships only `dist/`, has no Installation Contract, and places nothing under `.kaal/hosting` or `.agents/skills`). Its proposal, not yet a Change: an `installation.kaal.json` mapping the Skill directory to `.agents/skills/kaal-hosting/` through Core's `realizeIn`, and everything else to `.kaal/hosting/`, so an agent sees the Skill directory only and `kaal skill check` can run on it. Its 1260-word `SKILL.md` becomes a registered known finding, restructured in its own Change after this standard merges. |
| The owners of #1703 (Intent), #2113 (Defect), #2146 (Architecture), #1698 (Graph) and #1717 (Requirements) | That their Skill generation meets the standard, once it is merged. |
| Controls | Only the mechanism that runs `kaal skill check`. |

## Open questions for the Owner

1. **Day-one blocking.** Seven Skills exceed 600. Recommendation: the hard level blocks, and the seven are registered as known findings that may only shrink (the per-package baseline of named findings, never a count), so no Change is blocked for what it did not touch.
2. **The top-level set.** Proposed: `SKILL.md`, `references/`, `scripts/`, `assets/` (the Agent Skills set). Say if KAAL permits fewer.
3. **Navigation.** The Owner's decision names navigation. This PLAN requires one entry point and no more, because checking that the router links each reference would parse Markdown. Link reachability can follow as its own Change.
4. **Boundary.** Exactly 600 words passes, as Controls' cap does today.
5. **Words.** Counted over the whole file as given, frontmatter included, as the existing caps count.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C52` PLAN, this Change | Core | none |
| `core/C52` DO: `kaal-core/skill`, the Definition, the CLI verb | Core | the merged PLAN |
| The control that runs the check, and WIRE governance | Controls and Release | the DO |
| Each capability's Skill brought to the standard | each owner | the DO |
