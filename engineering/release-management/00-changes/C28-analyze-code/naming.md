# C28 naming

The control is named `analyze Code` (`<verb> <Subject>`, beside `analyze Vulnerabilities`). The Owner keeps this name for now although it is broad.

## Contexts

A ruleset binds the job name alone, so renaming the job would change the contexts. This PLAN proposes keeping the existing contexts unchanged:

- `CodeQL (actions)`
- `CodeQL (javascript-typescript)`

They are `<tool> (<language>)`, not the `control (target)` form of release/C5. The reason is that the target is expressed by the event and ruleset, and the language is the useful axis for a matrix job. A rename to `analyze Code (<language>)` is a later, separate WIRE and a decision for the CPO; it would need both names reported in parallel before any ruleset moves.

## Rulesets

New rulesets only, beside the old ones, and never added to the existing ones. Nothing here renames or activates anything live.
