# C70 interface

## The idea (Owner, 17 Nov 2026)

A ruleset setting is the answer to a control. The control answers an Intent; the Requirements answer the Intent and the Architecture answers the Requirements. Test Cases cover each setting, and the ruleset source is the code that turns them from red to green. The judge checks the first link of that chain for every rule and setting of a ruleset source: it traces to a declared control that has an Intent. The rest of the chain (Requirements, Architecture) is each Intent's own; the control's Case, beside it, proves its settings.

## The declaration

A branch stage in `stages.json` (Integrating, each of its parts, Promoting) holds `rules`, the list of rules its ruleset source holds. A rule is `{ "type", "control", "parameters" }`: its ruleset rule type, the control that requires it, and every setting (parameter) it holds. A `required_status_checks` rule also lists `"checks": [{ "name", "integration_id", "control" }]`, each check traced to its own control. `requires` and `also` are replaced by it:

```
"rules": [{ "type": "required_status_checks", "control": "release/CTL1",
  "parameters": { "strict_required_status_checks_policy": false, "do_not_enforce_on_create": true },
  "checks": [
    { "name": "verify Stages (Integrating)", "integration_id": 15368, "control": "release/CTL1" },
    { "name": "verify Stages (Developing)", "integration_id": 15368, "control": "release/CTL1" } ] }]
```

Promoting: `verify Stages (Promoting)` (release/CTL1) and `analyze Vulnerabilities (Promoting)` (release/CTL5), `do_not_enforce_on_create` false. Each part: its own `verify Stages` check (release/CTL1). Publishing is as before: a tag rule that holds no check, not yet traced (see change.md, Left open).

## The judge

For each branch ruleset the judge reads the declaration of its stage and the controls declared under `04-controls` (the `id` and `has` of each `CTL<n>.md`, the facts `controls`), and passes when:

1. the stage declares its rules as a list, and the ruleset source holds exactly those rule types, in any order;
2. each rule's settings in the source equal the declared `parameters`, exactly: a setting that differs, or that the source holds and the declaration does not, is a finding naming the setting;
3. for a status-check rule, the source requires exactly the declared checks, in any order, each with its declared `integration_id`;
4. every declared rule and every declared check is traced to a control that is declared and has at least one Intent.

Anything else is a finding naming the ruleset and what differs. The judge reads no shape: one rule, two rules or N rules differ only in the data. The target, the refs and the empty bypass list are judged as before.
