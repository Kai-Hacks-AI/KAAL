---
name: kaal-intent
description: Capture what a person or Agent wants to achieve, and why, as a self-contained Intent, whatever the source. Use when an intention is raised in a conversation, review, defect, observation or task and should not be lost, or when stating or refining an Intent.
license: MIT
---

# Capturing Intents

Use this to capture an intention so that it outlives where it was raised. What an Intent is, and what this capability means, is stated by the Node `Intent` in a KAAL Engine: read it there, starting from the Engine's `AGENTS.md`. This file only tells you how to do the work.

## Steps

1. **Recognize the intention.** Someone wants something achieved. Most messages, decisions and tasks are not intentions worth keeping; capture one only when what is wanted has to outlive the place it was said.
2. **State what is wanted and why**, in the terms of whoever wants it, complete enough to be understood with nothing else at hand. Keep the constraints they gave as part of what is wanted.
3. **Write it** in the form in [references/intent.md](references/intent.md). Capturing needs no prior approval.
4. **Return it for authorization when it is to drive product work.** The Product Owner validates and authorizes it before implementation proceeds.

## Keep it an Intent

- Add nothing that was not intended: no requirements, acceptance criteria, design, solution, priority, status or plan. Those may follow from an Intent; they are not part of it.
- Do not make the meaning depend on where it came from. Context from a conversation or review is restated in the Intent, not referenced as something the reader must open.
- Never edit an Intent once written. A refined or different intention is a new Intent that states its whole meaning.
- Capturing an Intent authorizes nothing. Do not act on it as if it were authorized.
- This Skill does not decide where Intents are kept, and it does not relate them to requirements, Changes or each other.
