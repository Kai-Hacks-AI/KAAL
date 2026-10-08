# Architecture

One package built from `kaal-retro`'s shape. No `kaal-core`, no `.github`, no existing Node, no sealed byte, no installer, no evaluator is changed.

**`packages/kaal-review`**

- `kaal/`: one Node, `Review.md` (name `Review`), typed by Core's `Skill` Node by exact ID, and its own seal, written with the Sealing capability's scripts.
- `skills/kaal-review/`: an Agent Skill (`SKILL.md`, which points at the Nodes and does not restate them) and exactly one script, `review.mjs`, offering `write`, `check` and `converged` only.
- `src/index.ts` with `payload()` only, `test/`, README, MIT licence, its own lockfile.

**The round.** Canonical form, defined once in the script:

```
# Review

<Result>: <identity>
Result: findings | converged

## Reviewer

<text>

## Findings

<text>
```

`write <destination> --of <Name> --identity <id> --outcome findings|converged --reviewer <text|@file> [--findings <text|@file>]` creates the file with `wx`. `<Name>` is a capitalised word naming the result reviewed (`Work`, `Skill`, `Node`, …) and is the only place a particular kind of result appears; `<id>` is one token. `--findings` is required for `findings` and forbidden for `converged`, whose findings are `None.`. A text may not hold a line starting with `#`, `Result:` or `<Name>:`: those lines belong to the round alone (an indented quotation is allowed). `check` additionally requires exactly one `Result:` line, one `<Name>:` line, one `## Reviewer` and one `## Findings` in the whole file; the reviewer's own further parts are allowed but can redefine none of these.

`check <file>` exits 0 only for a round: the head, the two lines, a non-empty `## Reviewer`, and `## Findings` that agrees with the outcome. Anything after Findings is the Reviewer's own account and is not judged (earlier rounds of this repository carry an Assessment, Evidence and Handoff after theirs).

`converged <directory> <identity>` reads `NN.md` from `01`, refuses a gap, a stray file or a file that is not a round, and exits 0 only if the last round says converged and names exactly that identity.

**Why the flag is `--of`.** The first line of a round names the result and its identity in one line, and Changing KAAL's evaluator already reads `Work: <identity>`; one naming flag keeps Review generic and Changing's rounds unchanged, with no second form.

**Consumption.** Changing KAAL's `SKILL.md` and `references/rowing.md` (and their installed projection in `skills/kaal-changing/`) say the Reviewer writes a round with Review where Review is installed, with `--of Work`, and checks convergence the same way. Changing keeps the lifecycle, the seats and the order. `change-state.mjs` is untouched, so the one definition of the process order does not move; a delivery test shows a round written by Review is read by it unchanged.

**Engineering.** `engineering/kaal-review` holds acceptance (delivery, script, host), wired into the root `npm test` by one line.
