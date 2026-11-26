# KAAL-Repo-Free Skill: Requirements

Each Requirement names, in brackets, the Intents it serves, and says what verifies it.

## Nonfunctional

- **core/N30** [core/I40]: The check is pure. It takes the files it is given, reads no registry and no repository, names no capability and gives the same result for the same input. Verified by core/T121.

- **core/N31** [core/I38, core/I40]: The check is a named-pattern check and says so: a clean verdict means no named repository pattern was found, never that the Skill is repository-independent. The verdict and the Definition do not claim more, and a finding that needs context carries no judgement of meaning. Verified by core/T120 and core/T123.

## Functional

- **core/F112** [core/I38]: `judgeRepoFree(files)` takes a list of `{path, text}` and returns findings `{rule, path, line, text}`, one per match, in file and line order. A finding is a repo reference of one of these rules: `path` (a path inside the repository: `packages/<name>/`, `.github/`, `.githooks/`), `change-id` (`C` and digits as a whole word, or an issue or pull request number such as `#2552`), `delivery` (a repository delivery instruction: a station name PLAN, DO, ACT or WIRE, upper-case, directly joined to a delivery object (pull request, branch, collector, PR, merge), a collector or Change branch name such as `kaal/<capability>/<name>` or `claude/<name>`, and a repository ruleset or workflow name), and `flag` (`KAAL_` followed by a capability and a control, upper-case). Verified by core/T120.
- **core/F116** [core/I38, core/I39]: A separate rule `hosting` finds Git and GitHub vocabulary: the phrases pull request, merge queue, merge group, branch protection and ruleset, case-insensitive, whole words. It is a finding in every Skill unless the caller passes `allow: ["hosting"]` (`--allow hosting`), where it is never one. Allowing `hosting` never exempts a repo rule. Verified by core/T124.
- **core/F119** [core/I38, core/I40]: The allowance is authoritative identity established by the adopter, never a claim of the Skill. Core reads the allowance only from the caller's argument. Nothing in the Skill's own files (text, frontmatter or `metadata`) can grant, widen or request it, and a Skill that says it is a Git adapter is judged as any other. The adopting control takes the identity of the adapter package from C53 evidence. Verified by core/T127.
- **core/F113** [core/I39]: Product references are never findings, and neither is the product's own PDCA vocabulary: PLAN, DO, ACT, WIRE, Change, Intent and Requirement as ordinary words, not joined to a delivery object. Further: the packages and commands of the product (`kaal-core`, `kaal skill check`), a consumer's `.kaal/` and `.agents/` folders, Definitions and ordinary words that merely resemble a rule (`ACTION`, `UNDO`, `Cargo`). Verified by core/T120.
- **core/F114** [core/I38, core/I40]: `kaal skill check <dir>` runs the check on `SKILL.md`, `references/`, `scripts/` and `assets/` text files, and lists the findings as data with `--json`. With `--lifecycle published` a finding is a failing verdict (`--allow hosting` is the adopter's, per F119) and the exit status is 1. By default, in development, the findings are reported and do not block, as `core/F99` reports a published lifecycle's size. An unreadable directory is exit 2. Verified by core/T122.
- **core/F115** [core/I40]: The rule table is part of the Skill standard, stated in its Definition and exported as `standard.repoRules`, so a consumer reads what is forbidden. Verified by core/T123.

## Amended

- **core/F99** gains the repo-free finding for the published lifecycle. Size and layout findings remain reported and never block there.
