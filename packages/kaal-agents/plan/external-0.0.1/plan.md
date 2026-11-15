# Agents 0.0.1: the External part (agents/C9 PLAN)

This PLAN ships no code. It fixes what the Agents capability offers to an Agent that never installs anything, and puts three planned tests behind it. The DO that satisfies it is agents/C10. It authorizes no sync, promotion, publication or version bump.

## Intent

The portfolio view rates Agents high on External value: NEW (orient with little prompting) and PREACH (escalate what a program cannot resolve) are priming content that an Agent can use from plain text. What the portfolio leaves open is which part of Agents is that knowledge and which part is the Embedded CLI. This PLAN answers it for Agents alone:

- **External (needs no installation):** the NEW and PREACH Definitions, and the `kaal-agents` Skill. An Agent reads them as Markdown. The Skill's Bare form already works with only `git` and the files in the repository.
- **Embedded (needs the package):** `kaal-agents orient` and `kaal-agents preach check`. They make discovery repeatable and a PREACH report checkable, and nothing in the External part depends on them.

External application must imply no installation, registration or write authority. Agents already holds to that in code (`orient` never writes, and authority is always `unresolved`). This PLAN makes the same claim readable and testable in the text an outside Agent reads.

## Requirements

- **agents/F10** [agents/I2]: The Skill states its effects once, near the top: it and the CLI only read, they write nothing in the repository, and they grant no authority.
- **agents/F11** [agents/I1]: The README has a section, "Without installing", that names the Definitions and the Skill by path and says they are the whole External part. It says the CLI is optional.
- **agents/F12** [agents/I3]: The Skill's PREACH section says that a package's "cannot judge" or "unresolved" result is a program report in PREACH's sense: its facts and candidates are carried as they are, and the Skill's steps apply. It does not say how another package words its output, because that stays with the package's owner.

Not in this PLAN: a repository-wide marker for what a Skill may write (Engineering's, with the Owner), an External entry point for the whole repository, a published knowledge snapshot, and any change to what `orient` or `preach check` do.

## Architecture

Text only. The change touches the Skill, the README and `docs/` where they repeat the claim, and the shipped manifest. It adds no file to `files`, no dependency and no command.

## Testing

The three planned tests are in `test/plan/external.test.mjs`. They run with `node --test test/plan/external.test.mjs`, outside `test:publisher`, so CI is not red. Each fails today on the behaviour it checks, not on a missing file. agents/C10 turns them GREEN without changing them, then moves them into the package's tests.

| Test | Checks | Loop |
| --- | --- | --- |
| agents/T22: the Skill has an Effects statement before its first procedure: it reads and writes nothing, and grants no authority | agents/F10 | Intent |
| agents/T23: the README has a "Without installing" section that links the NEW and PREACH Definitions and the Skill by path, and says the CLI is optional | agents/F11 | Requirements |
| agents/T24: the Skill's PREACH section names "cannot judge" and "unresolved" results as program reports whose facts and candidates are carried unchanged | agents/F12 | Requirements |

Validated by review: that the wording is true to what `orient` does, which agents/T5 and agents/T6 already check in code.
