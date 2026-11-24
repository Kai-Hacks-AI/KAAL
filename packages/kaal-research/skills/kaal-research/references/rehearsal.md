# A rehearsal record

One plain-text file `RH<n>.md` in the consumer's `<capability>/02-learnings/rehearsals/`, with its evidence files beside it, inside its own folder. `key: value` lines; a list entry starts with `- key: value`, and its other fields are indented two spaces.

## Front matter

`id` (`<capability>/RH<n>`), `kind: rehearsal`, `question`, `verdict` (`favourable`, `unfavourable` or `inconclusive`), `verdict-about` (a claim scope), `verdict-rests-on` (claim ids).

## Sections

- **Design**: `arms`, `untreated` (an arm, or `none`), `n` per arm (`arm=3, arm=3`), `fresh-means`, `model`, `settings`, `blind` (`yes` with `blind-how`, or `no`). Optional: `key-frozen` and `treatment-fixed` times, the key first.
- **Evidence**: entries with `role`, `path` (relative, inside the folder), `sha256`. Essential roles: `prompt`, `answers`, `scores`. Optional: `subject`, `key`, `rubric`, `excerpt`.
- **Runs**: entries with `run`, `arm`, `exposure` (`none` in the untreated arm; otherwise `opened`, `delivered` or `unchecked`), and `excerpt` (an evidence path) when `opened`. The count of runs per arm equals its `n`.
- **Claims**: entries with `id`, `claim`, `scope`, `rests-on` (run ids), `demonstrated` (`yes`, `partly`, `no`) and `not-shown` unless `yes`.
- **Limits**: `n-shows`, what the run counts can and cannot show.

## When a claim may be `yes`

- `description`: it rests on runs, and the runs say it.
- `comparison`: it rests on runs of at least two arms.
- `effect`: it rests on untreated and treated runs, with blind scoring, a key frozen before the treatment and named as evidence, and every treated run it rests on `opened`.

An honest record without these is well-formed. It limits what its claims may say.
