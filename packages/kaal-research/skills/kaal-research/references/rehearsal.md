# A rehearsal record

One plain-text file `RH<n>.md` in the consumer's `<capability>/02-learnings/rehearsals/`, with its evidence files beside it, inside its own folder. `key: value` lines; a list entry starts with `- key: value`, and its other fields are indented two spaces.

## Front matter

`id` (`<capability>/RH<n>`), `kind: rehearsal`, `question`, `verdict` (`favourable`, `unfavourable` or `inconclusive`), `verdict-about` (a claim scope), `verdict-rests-on` (claim ids), `technique` (`<name>@<n>`, see [techniques](techniques/judged-trial.md)). A record that challenges another adds `challenges` (its id), `outcome` (`replicates`, `differs` or `inconclusive`) and `differs-in` (what differs from the challenged record, or `none`).

## Sections

- **Design**: `arms`, `untreated` (an arm, or `none`), `n` per arm (`arm=3, arm=3`), `fresh-means`, `model`, `settings`, `harness` (the tool or platform that started and observed the agents), `blind` (`yes` with `blind-how`, or `no`). Optional: `key-frozen` and `treatment-fixed` times, the key first.
- **Evidence**: entries with `role`, `path` (relative, inside the folder), `sha256`. Essential roles: `prompt`, `answers`, `scores`. Optional: `subject`, `key`, `rubric`, `excerpt`.
- **Runs**: entries with `run`, `arm`, `exposure` (`none` in the untreated arm; otherwise `opened`, `delivered` or `unchecked`), and `excerpt` (an evidence path) when `opened`. The count of runs per arm equals its `n`.
- **Claims**: entries with `id`, `claim`, `scope`, `rests-on` (run ids), `demonstrated` (`yes`, `partly`, `no`) and `not-shown` unless `yes`.
- **Protocol**: `materials` (evidence paths a rerun needs; they include the prompt), `run` (how each arm is run), `score` (how and by whom), `confirms` and `refutes` (what a rerun would show for and against the claims). Written so that someone with another setup can rerun it from the record alone. What a rerun needs and was not kept is said here too.
- **Limits**: `n-shows`, what the run counts can and cannot show.

## A challenge

A rerun by someone with a different setup is a record of its own with `challenges: <id>`. It states its own design, evidence, runs and claims, and an `outcome` about the rerun; it does not edit the record it challenges, and it need not use the same technique.

## When a claim may be `yes`

- `description`: it rests on runs, and the runs say it.
- `comparison`: it rests on runs of at least two arms.
- `effect`: it rests on untreated and treated runs, with blind scoring, a key frozen before the treatment and named as evidence, and every treated run it rests on `opened`.

An honest record without these is well-formed. It limits what its claims may say.
