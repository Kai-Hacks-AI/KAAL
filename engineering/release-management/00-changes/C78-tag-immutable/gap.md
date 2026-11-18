# C78 gap

Gap id `release/G101`.

| Target artefact | Baseline | Gap |
| --- | --- | --- |
| `05-src/stages/stages.json` | Publishing is `kind: tag` with `rule: update` | the rule has no control and is not declared in the form of the branch stages |
| `05-src/stages/judge.mjs` | Publishing is judged against a single key | the rule does not trace to a control with an Intent |
| `04-controls`, `01-intent` | no control or Intent for the tag | the `update` rule has no answer chain |
