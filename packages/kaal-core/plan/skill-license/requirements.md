# Skill License: Requirements

Each Requirement names, in brackets, the Intents it serves, and says what verifies it.

## Functional

- **core/F117** [core/I41]: `judgeLayout` does not report a top-level file whose name is `LICENSE` followed by nothing or by a dot and a suffix (`LICENSE`, `LICENSE.md`, `LICENSE.txt`). A directory of that name, a lower-case `license`, and a name that merely starts with it (`LICENSES`, `LICENSE-notes`) are still findings. Everything else in `core/F95` stands. Verified by core/T125.
- **core/F118** [core/I42]: The `Skill Standard` Definition says a Skill may bundle a license file at its top, and that by default it is the license of the package. Core's check neither reads the file nor compares it. Verified by core/T126.

## Amended

- **core/F95** gains the license file in its list of allowed top-level entries.
