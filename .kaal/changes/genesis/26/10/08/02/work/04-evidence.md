# Evidence

## Acceptance (`engineering/kaal-intent`, `npm test`; 22 tests)

- **Delivery.** Core carries no such Skill; registering through Core's `registerSkill()` adds exactly one Node and its seal, found by its type alone; bytes and identity are the sealed ones (`Intent` `7317b19e2a09ee18bbac37c3ed5ccb4e20e108bf2aa569faae5d7348b0ed22cf`); the Node says Intent states what is wanted and why for the Owner, stays out of Requirements, Architecture and implementation, is fixed once established (another want is another Intent), prescribes no template, owns no process and is optional; it names no mechanism, process, host or neighbouring capability; the Agent Skill points at the Nodes, declares no sibling and names no process; the one script knows nothing of Git, GitHub, a Change, review, seals or any process; passes `check-skill` and `register-skill --check`.
- **The script.** Accepts Intents of several shapes (bare, titled with `# Intent — …`, with its own headings, Unicode); refuses, with the reason and nothing on standard output, twelve non-Intents (no head, another title, `# Intention`, a deeper heading, a head after text, nothing after the head, only blank lines, no final newline, carriage returns, a NUL, invalid UTF-8, empty); `identity` prints the literal SHA-256 of the exact bytes; a missing file fails; six malformed usages exit 2; it never writes.
- **Consumption.** Sealing's `artifact-id` on the same file prints the same identity (one meaning of identity). An Intent is reviewed through Review's delivered script with `--of Intent`: findings, then converged, `converged` agrees with the identity, and an edited Intent has another identity on which review has not converged. `change-state` reads a change with and without Intent installed alike and writes nothing. In the change's `work/`, an edited `01-intent.md` shows a different identity from the established one. Changing KAAL's text keeps its fixed-target sentences, names Intent without declaring it, and ships none of it.
- **Host.** On a repository that is not KAAL, `install-kaal` alone installs nothing of it, a name selects nothing, `--select <Node ID>` installs it and projects its Agent Skill, `check-kaal-install` holds, and the installed script checks and identifies an Intent there.
- Root `npm test` green (all suites, `check-kaal-config` included), `npm run check-kaal-seals` and `npm run check-kaal-install` pass, `packages/kaal-intent` builds and tests alone (`npm test` there, 3 tests).
- The Intent of this change (`work/01-intent.md`) passes `intent.mjs check`.

## What was and was not changed

- Added: `packages/kaal-intent/**`, `engineering/kaal-intent/**`, this change's `work/`, one line and one entry in the root `package.json`, `kaal-intent` in the root `package-lock.json`.
- Edited by wording only: `packages/kaal-changing/skills/kaal-changing/SKILL.md` step 2 and the Worker line of `references/rowing.md`, with their installed projection in `skills/kaal-changing/` produced by `npm run install-kaal`. `change-state.mjs`, `next-change.mjs`, sealed Nodes, Core and `.github` are byte-identical to `kaal/genesis`.
- This Work was done by the Worker alone. No subagent was started, briefed or counted as a reviewer. Nothing here is a Reviewer's round.

## Defaults the Work picked where the brief forked

- The smallest capability is a Node, a guidance-first Agent Skill and a two-verb script (`check`, `identity`); no `write`, no sealing, no location, no template.
- The Intent is identified by the SHA-256 of its exact bytes, as every KAAL file is, so no second identity was invented.
- Changing KAAL consumes it by wording, as it consumed Review: its evaluator is untouched, so its fixed-target discipline stays where it was and gains an exact thing to hold against.
- The Node is sealed here, as the package's own Node, as for the other capabilities.

## Open for the Owner

See "Not decided" in `02-requirements.md`.
