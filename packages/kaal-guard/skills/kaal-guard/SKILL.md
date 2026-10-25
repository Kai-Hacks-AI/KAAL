---
name: kaal-guard
description: Resolve a failing kaal-guard verdict from a Git pre-push hook or a CI job. Use when a push is blocked or a CI job fails with a "fail:" or "cannot judge:" line, or when reproducing, declaring or reviewing one of the repository's Guard checks.
---

# Resolving a Guard verdict

## Description

Resolve a failing kaal-guard verdict from a Git pre-push hook or a CI job. Use when a push is blocked or a CI job fails with a "fail:" or "cannot judge:" line, or when reproducing, declaring or reviewing one of the repository's Guard checks.

Guard runs the repository's own checks and reports each one's exit status as a verdict. It never interprets what a check tests or what it prints. The check decides; you resolve its cause.

## Bare: reading a verdict with no Skill

Everything you need to start is in the output, without this Skill:

- Guard prints one line per check: `<verdict>: <check>: <evidence>`.
- A `fail` or `cannot judge` line is followed by `do: <next step>`. Start there.
- The check's own output, its stdout and stderr, appears unchanged around those lines, in the terminal or the CI log. That output is the check's evidence, not Guard's.
- After the verdict lines of a run that failed or could not judge, Guard adds one line naming where this Skill is.

## Agent: how instruction files may point here

The repository's agent instruction files are the repository's. Guard never writes them. Where an agent does not discover skills from `.agents/skills/` by itself, the repository may add one line to its own instruction file, naming this Skill's path, for example: "When a kaal-guard verdict fails, read `.agents/skills/kaal-guard/SKILL.md`." Point to this file; do not copy its content.

## Skill: what each verdict asks of you

| Verdict | Exit status | What it asks |
| --- | --- | --- |
| `pass` | 0 | Nothing. |
| `fail` | 1 | The check found what it checks for. Read its own output, fix the cause in the change, and run it again. |
| `cannot judge` | 2, or any status the declaration does not name | The check could not decide, so it blocks. Fix the named cause: a missing fact, a declaration Guard refuses, a command that does not start, or a configuration Guard cannot find. |
| `not applicable` | 3 | The check does not apply to this change. It never counts as a pass of it. |
| `held` | a status the declaration names as held | The check reports a known, accepted state. It is shown as a warning, never as a pass or a fail. Read its own output for the reason. |

### Reproduce a check with the same facts

Run the one check as CI or the hook ran it:

```sh
npx --no kaal-guard run --check <name> --head <commit> --base <commit> --base-ref <name> --changed <file>
```

- `--head` is the candidate commit, `--base` and `--base-ref` the target commit and its name, and `--changed` a file listing the changed paths, NUL-separated.
- Give only the facts the check's declaration lists under `facts`. A fact the check needs and does not get makes it `cannot judge`.
- The hook prints the base commit it used. When the hook passes and CI fails, compare that base with CI's, run `git fetch`, and push again.
- `npx --no kaal-guard run --hook` and `npx --no kaal-guard run --ci` run every check registered for that surface.

### What is the repository's and what is Guard's

- **The repository's:** each check's program, its declaration in `.kaal/config/guard/<name>.md`, the Test Cases it runs, its workflows and their jobs, its branch protection, and its agent instruction files. A fix to a verdict belongs here.
- **Guard's:** the verdict line, its `do:` line, the hook and workflow files it installed, and the installation record `.kaal/state/guard/installation.json`. Only Guard's own commands (`init`, `upgrade`, `remove`) change them.

### What never resolves a verdict

- Editing a check's declaration to silence it: removing it from `runs`, naming a failing status as `held`, or dropping a `facts` entry it needs.
- Skipping the hook with `git push --no-verify`. The hook is local feedback; CI still decides.
- Changing a trusted checker in the candidate. A declaration's `trusted` files are taken from the base commit, so editing them in the change does not change the verdict; the change to the checker lands through its own reviewed change first.
- Re-running until it passes. A verdict that changes without a change to its facts is a finding to report, not a pass.

### What a good failure prints

When you write or change a check, have its failure print, for a person or an agent to act on:

1. the contract it checks;
2. what was expected;
3. what was observed;
4. the evidence;
5. the next action, or the command that reproduces it.

Guard parses none of this. It is guidance, not a format, and a check that ignores it loses nothing.

## Script

None. Every step above is a command Guard already provides.
