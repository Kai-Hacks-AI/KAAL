# C105 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of I54.md

`````
---
id: release/I54
title: main history is kept
---
# release/I54 main history is kept

Contract: the branch `main` is only ever moved forward. Every commit that was `main` stays reachable from `main`. A force-push, which rewrites `main`, destroys the record that Changes, reviews and promotions rest on. Reason: a delivery that can be rewritten cannot be audited. Owner: release management. The promoting ruleset holds this with its `non_fast_forward` rule, which refuses a push that does not move `main` forward before it lands; release/CTL25 is that preventive control and release/CTL26 reveals whether the rule is in force. A deletion of `main` is a different protection, held today by the `deletion` rule; it is not claimed here and is tracked as its own Intent and control.
`````

## Draft of F77.md

`````
---
id: release/F77
title: hold-history
kind: functional
serves: [release/I54]
---
# release/F77 hold-history

The promoting ruleset holds the rule `non_fast_forward` for the default branch, active, with an empty bypass list, so a push that does not move `main` forward is refused before it lands. The rule has no parameters. The requirement is stated in the ruleset source `05-src/wiring/rulesets/promoting.json` and declared in `stages.json`, traced to release/CTL25, so `verify Stages` judges the source against the declaration. It changes no other setting of the ruleset, does not touch `integrating` and makes no claim about a deletion of `main`. It operates only once the Owner has loaded the ruleset.
`````

## Draft of A68.md

`````
---
id: release/A68
title: hold-history
addresses: [release/F77]
---
# release/A68 hold-history

The source `05-src/wiring/rulesets/promoting.json` lists `{ "type": "non_fast_forward" }` after the required status checks, and `stages.json` declares `{ "type": "non_fast_forward", "control": "release/CTL25" }` in the rules of the Promoting stage, so `verify Stages` judges the source against the declaration with the judge it has, which already compares the rule types and their settings and traces each rule to a declared control that has an Intent. The push judge `05-src/history/verify-history.mjs`, its workflow source `05-src/wiring/workflows/verify-history.yml` and the control release/CTL22 leave: they could only reveal a rewrite after it had happened. Loading the ruleset is the Owner's step, by the ruleset update procedure, and the Owner retires the old ruleset's rule only after the new one is loaded and has been observed in force.
`````

## Draft of F81.md

`````
---
id: release/F81
title: verify-history-held
kind: functional
serves: [release/I54]
---
# release/F81 verify-history-held

A check reads the rules in force for the default branch, handed to it as a list of rules, and says PASS when a rule of type `non_fast_forward` is among them, FAIL when none is, and UNKNOWN when the list is not a list of rules or could not be read, which never passes. It reads no ruleset source, no Git and no network: which rules are in force is the wiring's fact. It does not prevent anything and does not approve or merge.
`````

## Draft of A72.md

`````
---
id: release/A72
title: verify-history-held
addresses: [release/F81]
---
# release/A72 verify-history-held

One module `05-src/history/judge-held.mjs` with a pure judge `judgeHeld({ rules })` and a command line `--rules <file of the rules in force>` that exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN. The module is the judge release/CTL26 declares. Reading the rules in force for the default branch from GitHub, through Hosting, and running the check on a schedule or on a push are later slices with their own Changes.
`````

## Draft of CTL25.md

`````
---
id: release/CTL25
title: hold History
description: It refuses a push that would rewrite the history of main.
type: preventive
status: designed
has: [release/I54]
evidence: [fixture:2, real:2, provoked:1:fail]
---
# release/CTL25 hold History

A preventive control. The `promoting` ruleset holds the rule `non_fast_forward` for the default branch, so a push that does not move `main` forward, a force-push above all, is refused before it lands. It replaces the same rule of the old promotion ruleset, and the push judge release/CTL22 `verify History`, which could only reveal a rewrite afterwards, is retired.

The requirement is stated in the ruleset source, `05-src/wiring/rulesets/promoting.json`, and declared in `stages.json`. It operates only once the Owner has loaded that ruleset, by the ruleset update procedure, and then the Owner retires the rule of the old ruleset, in that order, so that no moment is unprotected. It declares its own minimum evidence: two fixture runs of the source and its declaration, two real observations that the rule is in force on the real repository (release/CTL26), one when the ruleset is loaded and one after the old ruleset's rule is retired, and one provoked failure, a force-push refused on a scratch branch under an equivalent live ruleset, counted only when the same push is accepted without the rule. The provoked run needs a live ruleset on a scratch branch, which the Owner creates.

It makes no claim about a deletion of `main`. It has one Intent, release/I54.
`````

## Draft of CTL26.md

`````
---
id: release/CTL26
title: verify History held
description: It reveals whether the rule that refuses a rewrite of main is in force.
type: detective
status: designed
has: [release/I54]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL26 verify History held

A detective control, the partner of release/CTL25. `verify History held` reads the rules in force for the default branch and says PASS when `non_fast_forward` is among them, FAIL when it is not, and UNKNOWN when the rules could not be read, which never passes. PASS is not an approval and not a merge decision.

It reveals; it does not prevent. It reads the rules that are in force, not the ruleset source, so it sees what the source cannot: a ruleset that was never loaded, disabled or edited in the settings. Reading them from GitHub and running the check are later slices. A fixture with the rule removed counts as its provoked failure.

It has one Intent, release/I54.
`````

## Draft of promoting.json

`````
{
  "name": "promoting",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "exclude": [],
      "include": [
        "~DEFAULT_BRANCH"
      ]
    }
  },
  "bypass_actors": [],
  "rules": [
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          {
            "context": "verify Stages (Promoting)",
            "integration_id": 15368
          },
          {
            "context": "analyze Vulnerabilities (Promoting)",
            "integration_id": 15368
          },
          {
            "context": "verify Triggers",
            "integration_id": 15368
          }
        ]
      }
    },
    {
      "type": "non_fast_forward"
    }
  ]
}
`````

## Draft of stages-rule.json

`````
{ "type": "non_fast_forward", "control": "release/CTL25" }
`````

## Draft of judge-held.mjs

`````
// verify History held: do the rules in force for the default branch include non_fast_forward?
// The rules are handed over by the wiring (as GitHub lists the rules that apply to a branch: only those in force). This module reads no ruleset source, no Git and no network.
import { readFileSync } from 'node:fs';

export function judgeHeld({ rules }) {
  if (!Array.isArray(rules) || rules.some((r) => !r || typeof r.type !== 'string')) return { verdict: 'UNKNOWN', message: 'the rules in force could not be read' };
  if (rules.some((r) => r.type === 'non_fast_forward')) return { verdict: 'PASS' };
  return { verdict: 'FAIL', message: 'the rule non_fast_forward is not in force for the default branch' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const i = process.argv.indexOf('--rules');
  let r;
  try { r = judgeHeld({ rules: JSON.parse(readFileSync(process.argv[i + 1], 'utf8')) }); } catch (e) { r = { verdict: 'UNKNOWN', message: String(e.message) }; }
  console.log(`${r.verdict}${r.message ? `: ${r.message}` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````
