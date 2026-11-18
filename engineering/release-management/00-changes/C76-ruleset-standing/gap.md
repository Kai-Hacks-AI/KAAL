# C76 gap

Gap id `release/G99`.

| Target artefact | Baseline | Gap |
| --- | --- | --- |
| `05-src/stages/stages.json` | a stage declares rules but no standing | the enforcement, the refs and the bypass list are not declared, nor the control that answers for them |
| `05-src/stages/judge.mjs` | refs and an empty bypass list are fixed in code, `enforcement` is not judged | a ruleset that is not active passes; no standing traces to a control with an Intent |
| `04-controls`, `01-intent` | no control or Intent for the standing of a ruleset | the settings have no answer chain |
