# Evidence

## Acceptance (`engineering/kaal-review`, `npm test`; 27 tests after round 01)

- **Delivery.** Core carries no such Skill; registering through Core's `registerSkill()` adds exactly one Node and its seal, found by its type alone; bytes and identity are the sealed ones (`Review` `7c3d4d8e6f56f9d3a6bf6e49d1ed912ec1808ac44e61541196160ddf9ab46d5f`); the Node says Review is a capability and not a role, for any result from any viewpoint, that the reviewer holds authority and independence and cannot report convergence without stating them, what it does not decide, and that it is optional, and names no mechanism, process, host or particular result; the Agent Skill points at the Nodes and declares no sibling; the one script knows nothing of Git, GitHub, a Change, seals or any process; passes `check-skill` and `register-skill --check`.
- **The form.** Canonical bytes written out as literal text; any flag order; `@file`; converged rounds write `None.`; eighteen refusals (no or empty Reviewer statement, findings missing, empty, `None.` or given to a converged round, heading lines, bad name, identity or outcome, unknown, repeated or valueless flags) write nothing; an existing file is never replaced; `check` accepts rounds, including the reviewer's own parts between and after, and rejects twenty near forms; `converged` is 0 only when the latest round converged on exactly the identity (a changed result, a later round with findings, a gap, a stray file, a non-round and a missing directory all fail); only `write` creates anything; no verb but `write`, `check`, `converged`.
- **Every round in this repository** that states its Reviewer under `## Reviewer` passes `check`. Earlier rounds that use another heading (for example `## Reviewer and scope`) predate the form and are not accepted; none is altered.
- **Consumption.** From the delivered Skills alone, rounds written by `review.mjs` (`--of Work`) are read unchanged by `change-state` (findings, work changed since, converged, changed after converging), and `converged` agrees with it. With Review absent `change-state` works as before and writes nothing. Changing KAAL's text names Review and does not declare it.
- **Host.** On a repository that is not KAAL, `install-kaal` alone installs nothing of it, a name selects nothing, `--select <Node ID>` installs it and projects its Agent Skill, `check-kaal-install` holds, and a round written there is checked by the installed script.
- Root `npm test` green (22 suites, no failure); `check-kaal-seals`, `check-kaal-config`, `check-kaal-install`, `check-kaal-agent` exit 0.

## Resolution of review/01.md (Worker, in work/)

- **Finding 1 (duplicate reserved sections), resolved.** `parse` rejects a second `## Reviewer` or `## Findings` anywhere; the reviewer's other parts remain allowed. Regression: a converged round with an appended contradictory `## Findings`, and a duplicate `## Reviewer`, fail `check` (scripts test).
- **Finding 2 (metadata-looking text), resolved without touching the evaluator.** `write` refuses supplied text with a line starting `Result:` or `<Name>:`; `check` requires exactly one of each in the file, so a hand-added second line also fails. Indented quotation is allowed. The consumption test shows the reproduced input is refused with nothing written, and that an indented quotation yields a round `change-state` reads as REVIEW CONVERGED. SKILL.md states both rules. Acceptance is now 27 tests; the earlier count of 26 is superseded.

## What the Work found

- The smallest reusable Review is the round and convergence. The round form is the one `references/rowing.md` already describes, with the result's name as the only place a kind of result appears, so Changing KAAL's rounds are the same rounds and its evaluator did not move.
- `change-state` still reads the two lines (`Work:`, `Result:`) itself, so those two lines are parsed in two places. Left open (see Requirements, Not decided) rather than making Changing KAAL need Review.
- The Intent's account instruction (use ChBrain) is operational and not part of the target; it is not copied into `01-intent.md`.

## Review provenance

Round `review/01.md` was written by a Reviewer Kai assigned (a ChatGPT/Codex session); the Worker started no reviewer. The Worker resolved its two findings above and waits for the next round.
