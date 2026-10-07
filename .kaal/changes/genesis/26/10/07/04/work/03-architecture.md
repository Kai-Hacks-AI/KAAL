# Architecture

The existing evaluator stands: `engineering/change-seal/helpers/process.ts` (`stateOf`) is the one place that derives where a Change is, and the commands and the Skill consult it. No new artifact, Node, package, API or file is introduced.

Assessed against the Requirements, requirements 1, 3, 4, 7 and 8 already hold, and have acceptance tests in `engineering/change-seal/acceptance/process.test.ts`. Two gaps remain inside the stated scope:

- **Role (2, 5).** `next` named a role only in some stages. "seal work" and "seal Change" did not say who, and "do the work", "complete the work" and "resolve the findings" did not either. Each `next` now names the role (the Worker works, resolves findings and seals work; the Reviewer writes rounds, the last retro, and seals the Change), in the Skill's own terms and with the roles the Skill already assigns. Only wording changes; stages, order and exit codes are untouched.
- **Tampering (6).** After a sealed Work or Change was altered, `state` printed the stage of what remained, for example `WORK OPEN`, with a `next` telling the agent to remove retrospectives, while the true state was in `problem:` lines only. `stateOf` now wraps the derivation: when any problem says a sealed record was altered or removed, `next` says to restore it and that nothing else is valid until then. The stage and problem lines are unchanged, with one addition from review round 02: a Change directory removed whole while its seals remain cannot be derived at all, so `stateOf` answers `CHANGE MISSING` with the same restore instruction and the sealed-record problems (non-zero exit). An address nothing sealed, in a KAAL with no such violation, is still an error.

Out of scope here, deliberately: moving the evaluator beside the Skill (its own header already says it is a candidate), and a shipped script.
