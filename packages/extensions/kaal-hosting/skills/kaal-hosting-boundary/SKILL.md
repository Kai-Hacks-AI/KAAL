---
name: kaal-hosting-boundary
description: Review a kaal-hosting-boundary result, the platform coupling conformance of a KAAL capability. Use when the command or boundarySuite fails, exits 3 with review requested, or reports a coupling, registration, dilution or setup finding to judge.
---

# Reviewing a Hosting boundary result

## Description

Review a kaal-hosting-boundary result, the platform coupling conformance of a KAAL capability. Use when the command or `boundarySuite` fails, exits 3 with review requested, or reports a coupling, registration, dilution or setup finding to judge.

Hosting is the one KAAL capability that realizes host differences. Every other capability leaves the host to Hosting, in its production code and in its tests. The suite tests what can be decided, and asks a reviewer about the rest. The rules and the questions are Hosting's; the judgment and its record are Review's.

## Bare: reading the line with no Skill

Everything you need to start is in the output:

- The suite writes one line, `kaal-hosting-boundary {…}`, whose JSON is the whole result.
- `result` speaks only for the deterministic cases in `cases`: `verified`, `failed`, or `unknown` when the inspection could not complete, with each reason in `failures`.
- `review` is `requested` while any request in `reviews` is open. Each request has a stable `id`, `kaal-hosting/<rule>@<file>:<line>:<column>`, the `finding` at that place, and the `question` to answer.
- The command exits 0 when verified with no review requested, 1 when failed, 2 when unknown, and 3 when verified with a review requested. Exit 3 is an open obligation, not a pass.
- Under `node:test`, `judgment requested` is reported as todo while a review is open, and each request is a diagnostic.

## Skill: what each case asks

| Case | Fails when | What to do |
| --- | --- | --- |
| `inspection completes` | the root is not a directory or cannot be read | Fix the root or the runner; nothing else was inspected, so the result is `unknown`. |
| `host modules are declared` | production or test code imports a host module the capability did not declare (`violations`) | Declare it if the capability may use it, or go through Hosting. |
| `production code leaves the host to Hosting` | production code asks which platform it is or uses a host-specific API | Move the decision behind a Hosting operation. An acknowledgement never passes this case. |

## Skill: what each kind asks of a reviewer

- **coupling**: a platform literal in production code. Look at what the literal decides. A name in a message or a table of data may be fine; a branch on it is a decision Hosting should mediate.
- **registration**: a platform decides whether a test is registered or run (a skip option, `t.skip()` or `t.todo()` in a branch, a test inside a branch, an early return). Ask whether a behaviour goes untested on that platform. It is settled only by evidence that the behaviour cannot exist there, or by the test running everywhere.
- **dilution**: a platform decides what is asserted. Ask whether the assertion is weaker on that platform. Settle it by asserting the same thing everywhere, with Hosting providing what differs.
- **setup**: anything else, such as a fixture built per platform with the same assertions afterwards. Check that the assertions really are the same on every platform.

## Acknowledged findings

A capability may write `// kaal-hosting: platform <reason>` at the end of the finding's line or on the line above it. The finding then carries `acknowledged` with that reason. It is still reported, with the same kind, and still counted. The reason is evidence for you to weigh, never an approval: it neither passes a case nor closes a review request.

## Escalation

An agent records its judgment through Review, citing the request's `id`. When an agent's authority is not enough to settle a request, it escalates to a human through PREACH. The request stays open in the result until Review's record says otherwise.

## Hosts and applicability

For host facts, the fixtures that need them, the applicability rules, the portability audit and the `host-applicability` review, read `HOSTS.md` beside this Skill.
