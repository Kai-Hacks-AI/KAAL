# KAAL-Repo-Free Skill: Requirements

Each Requirement names, in brackets, the Intents it serves, and says what verifies it.

## Nonfunctional

- **core/N30** [core/I40]: The check is pure. It takes the files it is given, reads no registry and no repository, names no capability and gives the same result for the same input. Verified by core/T121.

## Functional

- **core/F112** [core/I38]: `judgeRepoFree(files)` takes a list of `{path, text}` and returns findings `{rule, path, line, text}`, one per match, in file and line order. A finding is a repo reference of one of these rules: `path` (a path inside the repository: `packages/<name>/`, `.github/`, `.githooks/`), `change-id` (`C` and digits as a whole word, or a pull request or issue number such as `#2552`), `station` (the repository's delivery stations PLAN, DO, ACT, WIRE as upper-case whole words), `pull-request` (the phrases pull request and merge queue) and `flag` (`KAAL_` followed by a capability and a control, upper-case). Verified by core/T120.
- **core/F113** [core/I39]: Product references are never findings: the packages and commands of the product (`kaal-core`, `kaal skill check`), a consumer's `.kaal/` and `.agents/` folders, Definitions and ordinary words that merely resemble a rule (`ACTION`, `UNDO`, `Cargo`). Verified by core/T120.
- **core/F114** [core/I38, core/I40]: `kaal skill check <dir>` runs the check on `SKILL.md`, `references/`, `scripts/` and `assets/` text files, and lists the findings as data with `--json`. With `--lifecycle published` a finding is a failing verdict and the exit status is 1. By default, in development, the findings are reported and do not block, as `core/F99` reports a published lifecycle's size. An unreadable directory is exit 2. Verified by core/T122.
- **core/F115** [core/I40]: The rule table is part of the Skill standard, stated in its Definition and exported as `standard.repoRules`, so a consumer reads what is forbidden. Verified by core/T123.

## Amended

- **core/F99** gains the repo-free finding for the published lifecycle. Size and layout findings remain reported and never block there.
