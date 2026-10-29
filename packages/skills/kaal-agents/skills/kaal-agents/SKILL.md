---
name: kaal-agents
description: Start work in a repository from durable sources, and escalate what a program cannot resolve. Use at the start of a session, when unsure what is settled, in flight or authorized, or when a program reports an ambiguity or error it cannot resolve.
---

# Starting work and escalating with KAAL Agents

## Description

Start work in a repository from durable sources, and escalate what a program cannot resolve. Use at the start of a session, when unsure what is settled, in flight or authorized, or when a program reports an ambiguity or error it cannot resolve.

This Skill realizes two Definitions that the package carries. NEW, Next Experience Works, is about starting from what is durable, not from memory of earlier sessions. PREACH, Program Reports Errors, Agent Consults Human, is about handling what a program cannot resolve.

## Bare: starting with no Skill

Everything you need is in the repository:

- Read the instruction files at its root, such as `AGENTS.md` and `CLAUDE.md`.
- Run `git status` and `git log -1` to see what is in flight and where HEAD is.
- Treat nothing you remember from an earlier session as settled until a durable source confirms it.

## Agent: starting a session

Run, from the repository:

```sh
npx --no kaal-agents orient
```

Read its report in this order:

1. **`authority: unresolved`.** This line is always there. `orient` discovers; it does not authorize. The `sources` it lists are where your authority may be stated. Read them yourself.
2. **setting:** whether KAAL is engineered in this repository, embedded in it, or used from outside.
3. **repository and in flight:** HEAD, the branch, the upstream, and the paths already changed. Work that is in flight is someone's, possibly yours from an earlier session. Find out whose before you change it.
4. **instructions and owners:** the instruction files and the ownership claims. A claim says who owns which paths, not what you may do there.
5. **catalog:** what Core lists for the Engine, when there is one.
6. **unresolved:** whatever `orient` could not establish. Each entry is a gap, not a pass.

Exit status 0 means discovery was complete, and 2 means part of it is unresolved. Neither one says anything about authority.

Act only where the sources make your authority clear. Where they do not, ask the person accountable before acting.

## Skill: escalating with PREACH

When a program reports something it cannot resolve, such as two definitions that share a term:

1. Take the program's report as facts and candidates. Do not equate, merge, choose or drop candidates, and keep each one's scope.
2. Resolve it yourself only under an authority you can cite: an instruction, a decision or an ownership claim that already settles it.
3. Otherwise, consult the accountable person with the facts, the candidates and one question. They decide.

Not everything escalates to a person. What existing authority settles ends with you.

To record the escalation, write a report and check its structure:

```sh
npx --no kaal-agents preach check report.json
```

```json
{
  "finding": { "...": "the program's report, verbatim" },
  "reportedBy": "the program",
  "candidates": [{ "term": "Case", "scope": "testing", "owner": "Testing", "definition": "testing/Case" }],
  "resolution": { "status": "unresolved", "consult": "the Owner", "question": "Do these share one meaning?" }
}
```

A resolution you claim names `chosen` (its `scope` and `term`) and the `authority` you cite, in place of `consult` and `question`.

`preach check` is structural only. "Structurally valid" means the report is well formed. It never means the question is settled, and a claimed resolution is printed with "(authority not verified)". Settling the meaning and the authority stays with you and the person you consult.

### What this Skill never does

- Grant authority, or treat an instruction filename, a claim or Core's catalog as authority.
- Decide what a term means, or what a domain's work should be. That belongs to its owner.
- Keep state or a registry of its own.
