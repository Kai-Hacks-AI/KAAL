---
name: kaal-intent
description: Capture what a person or Agent wants to achieve, and why, as a self-contained Intent, whatever the source. Use when an intention is raised in a conversation, review, defect, observation or task and should not be lost, or when stating or refining an Intent.
license: MIT
---

# Capturing Intents

Use this to capture an intention so that it outlives where it was raised. What an Intent is, and what this capability means, is stated by the Node `Intent` in a KAAL Engine: read it there, starting from the Engine's `AGENTS.md`. This file only tells you how to do the work.

## Steps

1. **Recognize the intention.** Someone wants something achieved. Most messages, decisions and tasks are not intentions worth keeping; capture one only when what is wanted has to outlive the place it was said.
2. **Identify its holder.** The holder is whoever wants it achieved. You may capture an intention for its holder, but it stays theirs.
3. **State what is wanted and why**, in the holder's terms, complete enough to be understood with nothing else at hand. Keep the constraints the holder gave as part of what they want.
4. **Write it** in the form in [references/intent.md](references/intent.md).
5. **Confirm it with the holder.** Only the holder can say the Intent says what they want.

## Keep it an Intent

- Add nothing the holder did not intend: no requirements, acceptance criteria, design, solution, priority, status or plan. Those may follow from an Intent; they are not part of it.
- Do not make the meaning depend on where it came from. Context from a conversation or review is restated in the Intent, not referenced as something the reader must open.
- Never edit an Intent once written. A refined or different intention is a new Intent that states its whole meaning.
- An Intent authorizes nothing. Whether anything is done about it is decided by its holder, outside the Intent.
- This Skill does not decide where Intents are kept, and it does not relate them to requirements, Changes or each other.
