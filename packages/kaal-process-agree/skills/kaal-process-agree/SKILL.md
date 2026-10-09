---
name: kaal-process-agree
description: Run the loop in which a Worker describes or revises an Intent, an independent Reviewer the Owner named reviews it, and the process alone says whether to continue, stop at agreement, or hand the Work to a human (HOW). Use when an Intent is to be described or revised with targeted review (for example @codex review) without routine human steps, when you are asked to continue such a loop, or when it says a human is required.
license: MIT
compatibility: Needs Node.js 20 or later, and the kaal-intent and kaal-review Skills installed beside this one.
---

# Agreement

Use this to describe or revise an Intent through a loop of targeted independent review, and to know from the record, never from yourself, whether you may go on. What this Process means to KAAL is stated by the Nodes `Skill` and `Agreement` in the installed KAAL: read them there, by following references from Core. This file only tells you how to do the work. It composes `kaal-intent` and `kaal-review` and changes neither.

## Whose it is

The Owner gives a grant (`<loop>/grant.md`): who the Worker is, who the Reviewer is, how many rounds may be run, and their words. You are the Worker. You do not assign or choose the Reviewer, you do not grant yourself more rounds, and you do not decide to continue, to conclude or to escalate: `state` does, from the record. If there is no grant, HOW is required and you stop.

## Steps

1. **Ask.** `node scripts/agree.mjs state <loop>` prints the state and the one thing that may happen next. Exit 0: you may act as `next:` says (or the loop has ended). Exit 3: a human is required (HOW). Ask again after every act. Do nothing `state` does not say.
2. **DESCRIBE or REVISE.** Write or revise the Intent following `kaal-intent` (its steps, not mine). Then `node scripts/agree.mjs submit <loop> <file>`. It refuses a file that is not an Intent and refuses unless it is your turn; it writes the next `log/NN-subject.md`. Revising means changing the bytes in answer to the findings. Submitting the same bytes again, or an earlier version, is recorded and ends in HOW.
3. **REVIEW: request.** Commit and push the loop so the Reviewer can see the subject, then `node scripts/agree.mjs request <loop> --standard <kaal-intent's SKILL.md as installed>`. It prints the targeted request (subject, standard, expected examination). Post it as a comment on the pull request with your host's tools. Then wait for the Reviewer's answer; do not poll, do not review it yourself, do not start a helper to review.
4. **REVIEW: record.** When the Reviewer answers, record it, copying and deciding nothing. Result `findings` if it commented findings on the commit; `converged` if it commented `No findings` (or, as Codex publishes, reacted 👍 to the request). Neither yet: no round, wait. Save the subject as the Reviewer's commit has it (`git show <commit>:<path> > saw.md`), then `node scripts/agree.mjs relay <loop> --result findings|converged --actor <the reviewer's login> --saw saw.md --source "<review or comment id, and the commit>" [--findings @findings.md]`, with the Reviewer's findings verbatim. It refuses a report of a different subject than the current one: request a new review.
5. **Findings.** Resolve them by revising (step 2), one revision answering the round. If you disagree with a finding, you cannot settle it: say why on the pull request. The process will require HOW when the subject comes back unchanged.
6. **AGREED.** The Reviewer the grant names reported convergence on exactly the subject as it now stands. Stop revising. Whether the Intent is established is the Owner's (`kaal-intent`, step 5): say so on the pull request.
7. **HOW.** `state` printed a reason, the subject, every round and the command that answers. Put that on the pull request for the human, and wait. Do not submit, relay or direct. A human, possibly with agents assisting, answers with `node scripts/agree.mjs direct <loop> --reason <code> --direction continue --rounds <n> --words <their words>` or `--direction stop`. Only then ask `state` again; `continue` returns you to the loop with exactly the rounds they gave.

## Rules

- A direction is the human's. Never write one yourself, or carry one that is not the human's own words.
- Never edit `grant.md` or any file in `log/`; add only through the commands. The record is read as it is; a gap, an out-of-turn file or a changed subject is itself a reason for HOW.
- The Reviewer's findings are for you to read and resolve; no script reads them. A green check, your own opinion or an agent you started is not a Reviewer's report.
- You do not decide that the Reviewer is wrong, tired or satisfied.
- This Process knows nothing of Git or GitHub beyond what step 3 and 4 ask you to carry. A missing answer is not an escalation: the process has no clock, and a host decides how long to wait.

## Scripts

`scripts/agree.mjs begin|state|request|submit|relay|direct <loop> …`. `begin <loop> --worker <actor> --reviewer <actor> --rounds <n> --words <text|@file>` writes the grant (the Owner's words; the Owner may also write `grant.md` by hand). Every command writes only inside `<loop>`; `state` and `request` write nothing. `submit`, `relay` and `direct` print the new state, with exit 3 if they ended in HOW. Reasons: `grant`, `seat`, `evidence`, `contradiction`, `unrevised`, `oscillation`, `ceiling`.
