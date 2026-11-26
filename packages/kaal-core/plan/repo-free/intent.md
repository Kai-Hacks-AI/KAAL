# KAAL-Repo-Free Skill: Intent

This is `core/C150`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN.

Owner decision of 26 Nov 2026 (Kai): a published Skill package must be free of the KAAL repo, and the KAAL product is desired in it. The Controls package alignment calls the first half requirement N8, the Skill is setup-agnostic, and had no proof for it.

- **core/I38.** A Skill that is published is free of the KAAL repo. Its files name no path inside the repository, no Change, pull request or issue id, no station of the repository's delivery process, and no wiring flag. A consumer who has never seen the repository can follow every line.
- **core/I39.** The KAAL product is welcome in a Skill. Naming the product's packages, commands, Definitions and vocabulary (`kaal-core`, `kaal skill check`, Skill, Control, Intent) is how a Skill teaches the product, and is never a finding. The check separates the repo, which a consumer does not have, from the product, which the consumer installs.
- **core/I40.** The check is Core's, beside the Skill standard of `core/C52`. The Skill standard is Core's and a published Skill's conformance is `core/F99`'s lifecycle. This Change adds the repo-free property to it. Core states the rule as data and judges the files it is given. Which Skills are published, and what a verdict blocks, stay a control's.

## Why Core and not Engineering

Engineering owns the repository's layout and delivery, so it is the owner of the vocabulary this check forbids, not of the check. A check owned by Engineering would sit outside the package that ships to consumers and would need the Skill standard to be read from Core anyway. Core already judges a Skill directory, its lifecycle and its ratchet, from files only. The repo vocabulary is a rule table inside the standard, so Engineering can review it without owning the mechanism. Kai may move the ownership.

## Not in this Change

- Package-wide alignment: Test Cases, package metadata, the declarations of controls, the changelog. They are Controls' alignment steps 2 to 4.
- Which Skills are published, the baseline of existing offenders and any WIRE. A control adopts the check later, taking identity and lifecycle from `core/C53` evidence.
- Judging meaning. The check finds the patterns of the table. A reference it cannot recognise is a review's.
