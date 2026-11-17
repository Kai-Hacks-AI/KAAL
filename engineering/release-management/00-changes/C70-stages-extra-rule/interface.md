# C70 interface

## The declaration

A stage object in `stages.json` may hold `alsoRules`, a list of rules as the ruleset source states them, for example `"alsoRules": [{ "type": "pull_request", "parameters": { "required_approving_review_count": 1, "dismiss_stale_reviews_on_push": true, "require_code_owner_review": false, "require_last_push_approval": false, "required_review_thread_resolution": false } }]`. Absent, it is the empty list. A value that is not a list of `{ type, parameters }` objects is a finding.

## The judge

For a branch ruleset of a stage the rules are `required_status_checks` first, followed by the rules in `alsoRules` of that stage, in that order. The ruleset source must hold exactly these rules: the same types in the same order and, for each declared rule, the same parameters, and nothing else. The checks and the "up to date" rule are judged as before. A stage that declares no `alsoRules` is judged as before. For a stage with parts (Integrating) the declaration is on the Integrating stage and applies to the Integrating ruleset only; a part (Collecting, Hotfixing, Wiring) holds `required_status_checks` alone.

In the judge:

```
const also = by(name)?.alsoRules ?? [];
if (!Array.isArray(also) || also.some((r) => !r || typeof r.type !== "string" || typeof r.parameters !== "object")) add(name, `${name}: alsoRules must be a list of rules`);
else if (!same(rules.map((x) => x.type), ["required_status_checks", ...also.map((r) => r.type)])) add(name, `${name}: the rules must be required_status_checks${also.map((r) => ` and ${r.type}`).join("")}`);
else if (!same(rules.slice(1), also)) add(name, `${name}: a declared rule differs from the ruleset source`);
```
