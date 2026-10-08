# Architecture

One package built from `kaal-review`'s shape, plus two sentences of wording in Changing KAAL. No `kaal-core`, no `.github`, no existing Node, no sealed byte, no installer, no evaluator is changed.

**`packages/kaal-intent`**

- `kaal/`: one Node, `Intent.md` (name `Intent`), typed by Core's `Skill` Node by exact ID, and its own seal written with the repository's `seal-kaal-artifact` helper.
- `skills/kaal-intent/`: an Agent Skill (`SKILL.md`, pointing at the Nodes and not restating them) and exactly one script, `intent.mjs`, offering `check` and `identity` only.
- `src/index.ts` with `payload()` only, `test/`, README, MIT licence, its own lockfile.

**The Intent.** A text file. Its first line is `# Intent`, optionally followed by a space and a title (an Intent may be `# Intent — Something`). Something follows. It is valid UTF-8, has no NUL or carriage return, and ends with a newline. That is all `intent.mjs check` says, and `identity` prints the SHA-256 of the exact bytes of a file that passes. The reasons for the byte rules are only that an identity be the same wherever the file is kept. Nothing about parts, headings or content is required: an Intent states what is wanted and why with its outcomes and boundaries in whatever shape fits.

**Why `identity` is in the script.** Review and Changing both need one token to name an Intent exactly. The identity is the one KAAL gives every file, so the script does not define a second one; acceptance proves it equals Sealing's `artifact-id` for the same file. Gating `identity` on `check` means no one takes the identity of something that is not an Intent. Sealing is not a dependency: an Intent without Sealing installed still has its identity.

**Why no `write`.** An Intent is the Owner's thought in the Owner's terms. The structure is not Intent's to impose, the way a round or a retrospective is; the Agent Skill supplies the discipline of the conversation and the file is written with ordinary tools. The script therefore never writes.

**Consumption.** Review: unchanged, an Intent is a result named `--of Intent`. Changing KAAL: `SKILL.md` step 2 and `references/rowing.md` (and the projection in `skills/kaal-changing/`) say that where an Intent was established with Intent the Worker keeps it in `work/01-intent.md` byte for byte, that its identity is the target for the rounds and the Owner's judgment, and that a different want is another Intent for another change. The fixed-target sentences are kept as they were; the new text only gives the discipline something exact to hold against. `change-state.mjs` is untouched. The `compatibility` line of Changing declares no sibling.

**Engineering.** `engineering/kaal-intent` holds acceptance (delivery, script, consumption, host), wired into the root `npm test` by one line.
