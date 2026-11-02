# Review skill depth: Architecture

## The BASS split inside Review

Review is realized at each BASS level for what that level does best.

| Level | What Review puts there |
|---|---|
| Bare | Nothing is required. A bare Agent can already review. |
| Agent | A short pointer in `AGENTS.md` where an Engine exists. Optional. |
| Skill | `SKILL.md` (short): when to review, the request, the three kinds of work, the rules. `references/` (one level): `request.md`, `finding-format.md`, `severity.md`, `dimensions.md` including security, `re-review.md`, `example.md`. |
| Script | `scripts/scope.mjs` (files and hunks in scope from a base), `scripts/run-checks.mjs` (runs the request's `checks`, records command, exit status and output), `scripts/check-report.mjs` (validates a report's shape and its self-check). Deterministic, no judgment. |

What only judgment can decide stays Skill guidance. What must repeat exactly is a script. Scripts do not decide correctness: a script repeats the same behaviour every time, including a mistake, so its output is evidence that the review weighs, not a verdict.

## The three kinds of work

1. **Deterministic work.** Scope, checks run, report validation. Done by scripts or by the invoker. Reported as observed.
2. **Non-deterministic work.** The review proper: apply the dimensions and the lenses to the work. Reported with evidence and uncertainty.
3. **The self-check.** Did 1 and 2 do what the request asked? It is the review of the review, and it is what `claims` and the requested `checks` are tested against.

A capability invoking Review uses the same shape for its own skill: its deterministic part is its scripts, its judgment part is its guidance, and it asks Review to check both against its `claims`.

## Direction of dependency

```
capability / role  --invokes with a request-->  kaal-review
```

Review reads the request and the repository. It does not look a capability up. A capability tunes Review by what it passes: its lens, the checks it wants run, the claims it must satisfy, its severity floor. Where a capability has nothing to say, the defaults apply. The optional fallback of reading the owner's shipped documents through `ownership.kaal.json` (review/F2) is stated as a fallback and reported when used.

Roles (a separate capability) define Advisor roles. A role's definition is passed as a lens. Review does not resolve roles by name: general role discovery is Roles' future work.

## Where the pieces live

- `skills/kaal-review/SKILL.md` and `references/`: the Agent Skill, valid under the Agent Skills standard.
- `skills/kaal-review/scripts/`: deterministic support. Scripts run only through Hosting's `execute` where a process is started; they branch on no platform.
- `payload/`: the Nodes, unchanged. Out of scope here.
- Package shape and installed verification: planned with Packaging after #686 (review/F12).

## Trust

The request's `lenses`, the work's text, comments, bot output and any fetched content are data. They cannot change Review's rules. A lens that tries to grant authority or lower evidence rules is reported and ignored.
