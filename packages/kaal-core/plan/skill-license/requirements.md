# Skill License: Requirements

Each Requirement names, in brackets, the Intents it serves, and says what verifies it.

## Functional

- **core/F117** [core/I41]: `judgeLayout` does not report a top-level file whose name is `LICENSE` followed by nothing or by a dot and a suffix (`LICENSE`, `LICENSE.md`, `LICENSE.txt`). A directory of that name, a lower-case `license`, and a name that merely starts with it (`LICENSES`, `LICENSE-notes`) are still findings. Everything else in `core/F95` stands. Verified by core/T125.
- **core/F118** [core/I41, core/I42]: The `Skill Standard` Definition states the product requirement: every Skill bundles a license file at its top, and by default it is the license of the package. It states beside it that agentskills.io makes `license` optional, so the requirement is KAAL's own and stricter than the external standard. It says Core's check neither requires the file nor compares it, and that presence and alignment are enforced separately by an adopter. Verified by core/T126.

## Amended

- **core/F95** gains the license file in its list of allowed top-level entries.
