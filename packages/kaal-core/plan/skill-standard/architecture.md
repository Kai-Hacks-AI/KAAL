# Skill Standard: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A48** [core/F92, core/N25, core/N27]: The standard has one source: a new entry point `kaal-core/skill`, a pure module holding the rules (`entry`, `layout`, `router`, `detail`, `lane`, `size`), the permitted top-level set and the thresholds 200, 400 and 600. The `Skill Standard` Definition (`payload/core/Skill-Standard.md`) states the responsibilities in words and carries no number, so there is nothing to keep in step with the module. It is carried like `CASE` and `LOVE`, so the Kernel's bytes and every existing id stay unchanged.
- **core/A49** [core/F93, core/F94, core/F98, core/N26]: `judgeSize(text)` returns `{ words, level, warning }`. It finds the end of the frontmatter block by its two delimiter lines and counts the rest. A warning is data: `{ level, words, rules, remedy, response, required, blocks }`, from which the message is rendered. `rules` are ids from A48, `remedy` is `review-router`, `consolidate`, `move-to-references`, `required` grows by stage, and `blocks` is true only for `hard`. Tests read the data, never the message.
- **core/A50** [core/F95]: `judgeLayout(paths)` is pure over relative paths and returns findings `{ rule, path }`. The caller lists the directory, so Core stays free of I/O.
- **core/A51** [core/F96, core/N25, core/N26]: `kaal skill check <dir>` is the one place that reads a directory, through Hosting, and calls the pure functions. It is the mechanism Controls, WIRE or CI run, and it is the same call on both deployment paths.
- **core/A52** [core/F97, core/N26]: The ratchet is a filter in front of the verdict, as Controls' ratchet strategy builds it: the check emits `hard` and the filter subtracts the baseline. Core supplies the comparison for this one rule and reads the baseline as data, keyed by the canonical Skill's name and carrying its owner. Where the baseline file lives, who accepts a change to it and how a run reads the last accepted one from the base branch are the gate's. Release proposed owning that gate.
- **core/A53** [core/F99, core/F102, core/F103, core/N25, core/N26]: Identity is the Skill's name, the directory name agentskills.io requires `name` to equal. `compareTrees(sourceFiles, instanceFiles)` is the one pure comparison, by SHA-256 of the exact bytes. Core reports the alignment as data, and whether it blocks is the control's choice, through `--enforce alignment`. Core infers no role from a name, and its only look at a path is that a `.kaal/` location is installed content (`core/F101`).
- **core/A54** [core/F100, core/F101, core/F104, core/N26]: Who declares and who supplies. The owning capability authors the variant declaration in its own package, and the control passes it with `--owner`, derived from where the canonical lives, never from where the instance is. The npmjs artifact and the tagged source are supplied by the control for the version the installation record names. Core compares them and records the version, and reads no registry, tag or record itself. The lifecycle is chosen by the role, not by a path: development for the package, `engineering` and `deployed --from engineering`; published for `installed` and `deployed --from kaal`.

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. Core carries the standard and a pure check; Controls and WIRE only run it** (recommended) | One entry point, one Definition, one CLI verb. | Core reads `SKILL.md` to find the frontmatter's end and count words, which narrows `core/N13`. |
| B. The check lives in Engineer Skill's `checkSkill` | Rules sit beside the format check. | Core is the owner of the rules but cannot run them, and Core may not depend on a discipline (`core/N11`). |
| C. Each capability keeps its own cap | No change. | Fifteen caps today, 600 words in Controls and 500 lines in Engineer Skill, and no one standard. |

## Evidence: the 15 `SKILL.md` on `main` at 357229a, counted body-only (25 Nov 2026)

The first version of this PLAN counted the whole file and found seven hard Skills. Counted under the rule the Owner agreed, six instances are hard: five canonical Skills and Guard's delivery template, a variant of `kaal-guard`.

| Level | Skills, body words |
| --- | --- |
| `hard`, above 600 | testing 1446, hosting 1198, release 1102, guard 858, change 724 (canonical), and Guard's delivery template 700 (a variant of guard) |
| `medium`, above 400 | foundation 586 (it was 637 with its frontmatter), architecture 545, controls 527, engineer-skill 485, research 450, retro 408, graph 401 |
| `soft`, above 200 | review 331, engineering 306 |

The baseline of the `skill-size` ratchet is therefore five entries, `kaal-testing: 1446`, `kaal-hosting: 1198`, `kaal-release: 1102`, `kaal-guard: 858` (owner guard) and `kaal-change: 724`, each at its current word count: five canonical Skills. Guard's delivery template, at 700, is a variant of `kaal-guard`, so it has no entry; it is held to the `kaal-guard` ceiling of 858 (`core/F99`). Every Skill has at least a soft stage. Layout today: ten have `SKILL.md`, `references/` and `scripts/`, and the rest have `SKILL.md` alone or with `references/` only, which `core/F95` accepts.

## Canonical Skills and their instances (CPO correction, 25 Nov)

The five canonical Skills with entries are not five times as many Skills as the paths show. A Skill appears in its owning package, Engineering's deployment source, `.kaal/`, `.agents/skills/` and `.claude/skills/`; those are locations of one Skill.

**Are the two `kaal-guard` entries two Skills?** No. Checked on the repository at the PLAN's base:

| Test | Package (`packages/kaal-guard/skills/kaal-guard`) | Template (`engineering/guard/external/templates/skills/kaal-guard`) |
| --- | --- | --- |
| Ownership | Guard | Guard's External delivery tooling (`guard/N14`, `guard/F25`); Engineering transports it |
| Name | `kaal-guard` | `kaal-guard`, the same, which `deliver.mjs` writes to `.agents/skills/kaal-guard/SKILL.md` |
| Content | The product Skill, which names the `kaal-guard` command and its declarations | The same sections and the same rules, with External's wording: the delivered `.githooks/guard.sh` replaces the command, and no KAAL or npm |
| Semantics | The Skill of the installed product | What a target repository receives as its `kaal-guard` Skill |
| Relation | The source | Derived from it: `guard/N14` requires it, and `guard/C105` plans the declared transformation that will produce it byte for byte |

The template is a variant of the canonical `kaal-guard`. It is not a second Skill, so it has no baseline entry. It is held to the canonical's allowance: 700 is at or below 858 and passes, and if the canonical shrinks below it, the template blocks as `grew` until its derivation follows. The template is Engineering's delivery, so it is of the development lifecycle. A copy in `.kaal/`, `.agents/skills/` or `.claude/skills/` must be identical to its selected source, and one that differs is a `differs` finding (`core/F99`), not a second Skill and not a way to an allowance of its own. `core/T109` and `core/T112` carry this.

## Provenance, versions and lifecycle (CPO clarifications, 25 Nov)

Two questions stay apart. Is this content the content it claims to be, from the version it claims? That is alignment, a detective finding, the same for every role. Is this content within the Skill standard? That is conformance, and it follows the lifecycle the content belongs to.

| Location | Selected source | Alignment compares | Conformance |
| --- | --- | --- | --- |
| Owning package | none: it is N+1 | none | development: standard and ratchet, `stale` included |
| Engineering | the package, N+1 (`core/F102`) | copy against package, both named with source and version | development: the entry as a ceiling |
| `.kaal/` | the exact published version (`core/F101`) | content against the npmjs artifact, and the artifact against its Git tag | as published: reported, never blocking |
| `.agents/skills/`, `.claude/skills/` | `.kaal/` or Engineering (`core/F103`) | content against that source, owner-declared variants respected | as its source: published or development |
| A variant, such as Guard's External template | the package, under the owner's declaration (`core/F100`) | declared, `unauthorized` or `undeclared` | development: the canonical's entry as a ceiling |

Exact identity of installed content with its published artifact remains a product invariant. It is reported as a finding for now, because it starts as a detective control and does not make a deviation legitimate. Making it preventive is the Owner's go, through `--enforce alignment`. Improving N+1 so that the allowance shrinks does not invalidate a published N: the ratchet reads the development lifecycle only, and a new publication comes from an N+1 that met the standard.

## Decided by the Owner (25 Nov, review of this PLAN)

1. Hard blocking is active, with a named shrink-only ratchet and a body-only baseline. No new violations or growth.
2. agentskills.io is the floor. The top-level set is `SKILL.md`, `references/`, `scripts/`, `assets/`, and only `SKILL.md` is mandatory.
3. `SKILL.md` is a crisp, clear, concise router. Link reachability can follow separately.
4. Staged escalation at 200, 400 and 600. Exactly 600 is permitted.
5. Frontmatter is excluded from the count and reviewed separately.

## Open for confirmation

- **The baseline's home.** Release proposed owning the gate and the baseline. This PLAN takes that and keeps Core out of it (`core/A52`).
- **Detective, then preventive.** Alignment starts as a finding with exit 0, as the Owner decided. The control registered for it reaches `--enforce alignment` on the Owner's go, by the protocol detective, advisory, preventive.
- **Where the declaration and the registry copy come from.** The owner's declaration lives in the owner's package. Guard's `guard/C105` declares the transformation for its template. The gate and Hosting supply the published artifact. Both are agreed with Release and Hosting before the DO.

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
