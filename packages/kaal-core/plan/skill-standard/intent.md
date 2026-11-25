# Skill Standard: Intent

This is `core/C52`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN.

Owner/CPO decisions of 25 Nov 2026, recorded in issue #2452: Core owns the common Skill vocabulary and standard, not the content or inventory of any capability's Skills. The Owner added that Controls provides only the generic machinery that runs a check and owns hardly any of its content. The rule and its content are Core's.

- **core/I27.** Core owns the standard every Skill follows, above the Agent Skills format: its vocabulary and conventions, the mandatory top-level layout with its single entry point, and its size thresholds. Lower levels of a Skill stay free where the standard says so. Core knows no capability and keeps no registry or inventory of Skills.
- **core/I28.** One Skill contract serves both deployment paths. A published capability goes npm.js, then `.kaal/`, then Skill-only exposure in `.agents/skills/`. A capability still in development goes through Engineering, then a Skill-only WIRE into `.agents/skills/`. The capability keeps ownership of its Skill and Engineering only transports it. WIRE governance applies to agent-facing deployment. A Skill that conforms on one path conforms on the other, and an agent is shown the Skill and nothing else.
- **core/I29.** A `SKILL.md` has three size levels, in words: above 200 a soft warning (review the whole router), above 400 a medium warning (restructure), above 600 a hard warning that blocks delivery until corrected. Every warning restates the Core rules that apply and asks for whole-router review, consolidation and moving detail to references, never only for fewer words.

## The boundary with Engineering's layout

Engineering's package layout is the outer frame: it governs a capability package down to its folders, and puts the Skill under the package's `13-source`, from which `dist` is built. Core's Skill standard governs inside a Skill folder, from its `SKILL.md` down. The two meet at the Skill directory and neither reaches into the other. A package's own `13-source/scripts` is not a Skill's `scripts/`. The Owner confirmed this boundary on 25 Nov 2026, and Engineering's earlier folder-structure PLAN of 4 November, which the numbered layout replaced, stops at the package level too.

## What this changes in Core

`core/I14` says Core defines no Skill format, and `core/N13` says Core never parses or rewrites a `SKILL.md`. Engineer Skill owns Agent Skills conformance and `checkSkill`. All of that stands for the file format. `core/C52` narrows the sentence, not the split: Core defines no *file* format, it defines the KAAL *standard* above it, and it reads a `SKILL.md` only to count its words and never rewrites one.

## Not in this Change

- The Skills of any capability, or whether they conform. Each capability's own Change brings its Skill to the standard.
- WIRE, the Skill-only transport, and what npm content looks like inside `.kaal/`. They belong to Release, Engineering and Hosting, who are asked to confirm their part (see Architecture).
- Agent Skills frontmatter conformance, which stays `checkSkill`'s.
- Link reachability inside a router, which would parse Markdown and is left open (see Architecture).
