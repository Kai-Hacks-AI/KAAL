---
name: kaal-guard
description: Resolve a failing Guard verdict from this repository's pre-push hook or a Guard CI job. Use when a push is blocked or a Guard job fails with a "fail:" or "cannot judge:" line, or when reproducing, adding or reviewing one of the checks in .githooks/guard.sh.
---

# Resolving a Guard verdict

## Description

Resolve a failing Guard verdict from this repository's pre-push hook or a Guard CI job. Use when a push is blocked or a Guard job fails with a "fail:" or "cannot judge:" line, or when reproducing, adding or reviewing one of the checks in .githooks/guard.sh.

Guard is plain files in this repository: `.githooks/guard.sh` lists the checks and runs them, `.githooks/pre-push` runs the local ones before a push, and `.github/workflows/guard.yml` runs the CI ones, one job each. `GUARD.md` describes them. Guard runs each check and reports its exit status as a verdict. It never interprets what a check tests or what it prints. The check decides; you resolve its cause.

## Bare: reading a verdict with no Skill

Everything you need to start is in the output:

- Guard prints one line per check: `<verdict>: <check>: exit status <n>`.
- A `fail` or `cannot judge` line is followed by `do: <next step>`. Start there.
- The check's own output appears unchanged beside those lines, in the terminal or the CI log. That output is the check's evidence, not Guard's.
- After a fail or cannot judge, Guard names where this Skill is.

## Agent: how instruction files may point here

The repository's agent instruction files are its own, and Guard writes none. Where an agent does not discover skills from `.agents/skills/` by itself, the repository may add one line to its own instruction file naming this Skill's path, for example: "When a Guard verdict fails, read `.agents/skills/kaal-guard/SKILL.md`." Point to this file; do not copy its content.

## Skill: what each verdict asks of you

| Verdict | Exit status | What it asks |
| --- | --- | --- |
| `pass` | 0 | Nothing. |
| `fail` | 1 | The check found what it checks for. Read its own output, fix the cause in the change, and run it again. |
| `cannot judge` | 2, or any status other than 0 to 3 | The check could not decide, so it blocks. Fix the cause it names, such as a fact Git could not give, or a check name the runner does not list. |
| `not applicable` | 3 | The check does not apply to this change. It never counts as a pass of it. |

### Reproduce a check

```sh
sh .githooks/guard.sh --check <name>     # one check, as its CI job runs it
sh .githooks/guard.sh --local            # every check the hook runs
```

The hook gives the checks the facts `GUARD_HEAD`, `GUARD_BASE`, `GUARD_BASE_REF` and `GUARD_CHANGED` (a file of changed paths, NUL-separated), and prints the base commit it used. To reproduce a hook run, set the same variables before `--check`. A fact Git cannot give is left unset, so a check that needs it should exit 2. When the hook passes and CI fails, compare the hook's base with CI's, run `git fetch`, and push again.

### What is whose

Everything here belongs to this repository: each check's command in `.githooks/guard.sh`, its `LOCAL` and `CI` lists, the workflow and its jobs, the branch protection that may require those jobs, and the agent instruction files. A fix to a verdict belongs in the check's cause, or, when the check itself is wrong, in a reviewed change to the check.

### What never resolves a verdict

- Taking a failing check out of `LOCAL`, `CI` or the workflow matrix to silence it, or changing its command so it no longer checks what it did.
- Skipping the hook with `git push --no-verify`. The hook is local feedback; CI still decides.
- Re-running until it passes. A verdict that changes without a change to its facts is a finding to report, not a pass.

### What a good failure prints

When you write or change a check, have its failure print, for a person or an agent to act on:

1. the contract it checks;
2. what was expected;
3. what was observed;
4. the evidence;
5. the next action, or the command that reproduces it.

Guard parses none of this. It is guidance, not a format.

## Script

None. Every step above is a command this repository already has.
