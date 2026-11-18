# C77 gap

Gap id `release/G100`.

| Target artefact | Baseline | Gap |
| --- | --- | --- |
| `05-src/stages/stages.json` | a rule has one `control` for all its settings | each setting has no control of its own |
| `05-src/stages/judge.mjs` | settings are traced through the rule's control | a setting that no control answers for is accepted if the rule's control exists |
| `04-controls`, `01-intent` | no control or Intent for the check policy | the two settings have no answer chain |
