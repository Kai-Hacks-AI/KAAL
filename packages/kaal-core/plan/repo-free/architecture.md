# KAAL-Repo-Free Skill: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A57** [core/F112, core/F113, core/F115, core/N30]: `kaal-core/skill` gains `judgeRepoFree(files, {allow?})` and `standard.repoRules`, a table of `{id, pattern}` (the four repo rules `path`, `change-id`, `delivery` and `flag`, and `hosting`). It is pure over text and lists the finding of each match with its 1-based line. No code fence or quotation is exempt: a Skill that quotes the repo still names it.
- **core/A58** [core/F114]: `kaal skill check` lists the text files of the Skill directory through Hosting, as it already does for the layout, and calls `judgeRepoFree`. The verdict gains `repoFree` findings. With `--lifecycle published` they set `conforms` false and the exit status 1.
- **core/A59** [core/F115]: The `Skill Standard` Definition states the distinction in plain words: the repo is not shipped, the product is.

- **core/A62** [core/F119, core/N31]: `allow` is read from the call only, never derived from file content. The CLI flag is the same call. The Definition states the limits: a named-pattern check, supporting N8 and not proving it, and Review for context.

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. A rule table in Core's Skill standard, judged with the lifecycle** (recommended) | One pure function, one more finding kind. | The table is pattern based, so it finds the named patterns and not meaning. |
| B. Engineering owns a repo-wide scan | A scan of the repository for forbidden words. | It sits outside the shipped package and Core's standard is read from elsewhere. |
| C. A review checklist only | Nothing is automated. | N8 stays unproven. |

## Limits

The table has false negatives by design. A reference without an id, path, station or flag is not found. The Definition says so and a review remains the judge of meaning.
