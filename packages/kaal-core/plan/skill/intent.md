# Canonical Skill Bytes: Intent

This is `core/C22`, a PLAN Change. It ships no code. `core/C23` turns its planned tests GREEN.

Today, Agent Realization renders every `SKILL.md` it deploys, the canonical one at `.agents/skills/<name>/` included. It rewrites the frontmatter to exactly `name` and a `description` copied from `## Description`, and drops every other field, such as `license`. `core/F7` and `core/F21` state that rendering as Core's rule. So Core defines a Skill format, and the bytes it installs at the canonical location are not the bytes the Capability ships. Architecture met this on #485: its catalogue would have to recognize both the shipped and the rendered `SKILL.md`. The Owner's review of #485 assigns Skill-format policy to Engineer Skill. Core's Agent Realization owns placement and provider rendering, and preserves canonical source bytes.

- **core/I14.** Core defers Skill format to Engineer Skill. It deploys every file of a Skill as the Capability ships it, at the canonical location and in every provider copy. It transforms a provider derivative only where its placement names that transformation explicitly, and no placement names one today. What a canonical `SKILL.md` must carry, and whether it conforms, is Engineer Skill's to state and check.

`core/I4` stands: each Skill has one authoritative canonical source, and Core generates and refreshes the copies a provider needs. Those copies are now byte copies.
