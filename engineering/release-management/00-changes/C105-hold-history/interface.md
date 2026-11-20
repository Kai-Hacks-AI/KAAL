# C105 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of I54.md

`````
---
id: release/I54
title: main history is kept
---
# release/I54 main history is kept

Contract: the branch `main` is only ever moved forward. Every commit that was `main` stays reachable from `main`. A force-push, which rewrites `main`, destroys the record that Changes, reviews and promotions rest on. Reason: a delivery that can be rewritten cannot be audited. Owner: release management. release/CTL25 `hold History` keeps it, by refusing a push that does not move `main` forward before it lands; release/CTL26 `verify History held` reveals whether that keeping is in force. A deletion of `main` is a different protection, held today by the `deletion` rule of the old ruleset; it is not claimed here and is tracked as its own Intent and control.
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

A push to the default branch that does not move it forward is refused before it lands, whoever pushes: no bypass. The Promoting station declares what refuses it, an entry traced to release/CTL25 `hold History`, beside the detections the station requires; the station owns its list, and a detection does not name the station. The requirement changes no other entry of the station, does not touch the integration branches and makes no claim about a deletion of `main`. It operates only once the Owner has loaded what the station declares.
`````

## Draft of A68.md

`````
---
id: release/A68
title: hold-history
addresses: [release/F77]
---
# release/A68 hold-history

The ruleset source `05-src/wiring/rulesets/promoting.json` lists `{ "type": "non_fast_forward" }` after the required status checks, active, with an empty bypass list, and `stages.json` declares `{ "type": "non_fast_forward", "control": "release/CTL25" }` in the rules of the Promoting stage, so `verify Stages` judges the source against the declaration with the judge it has, which already compares the rule types and their settings and traces each rule to a declared control that has an Intent. A control that is realized by requiring a detection at the station is an entry of the station's declaration too, and stays a control named by what it controls: release/CTL5 and release/CTL20 (and likely release/CTL10) stay preventive controls, to be renamed and re-explained by what they control in later slices, each its own Change. The push judge `05-src/history/verify-history.mjs`, its workflow source `05-src/wiring/workflows/verify-history.yml` and the control release/CTL22 leave: they could only reveal a rewrite after it had happened. Loading the ruleset is the Owner's step, by the ruleset update procedure, and the Owner retires the old ruleset's rule only after the new one is loaded and has been observed in force.
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

A check reads the entries the Promoting station declares for release/CTL25 `hold History` and the rules in force for the default branch, both handed to it as lists of rules. It says PASS when every entry declared for the control is in force with the settings declared, FAIL naming each entry that is not, and UNKNOWN when either list is not a list of rules or could not be read, or the station declares no entry for the control, which never passes. An entry of another control is not its business and a rule in force that the station does not declare is no finding. It reads no ruleset source, no Git and no network: which rules are in force is the wiring's fact. It does not prevent anything and does not approve or merge.
`````

## Draft of A72.md

`````
---
id: release/A72
title: verify-history-held
addresses: [release/F81]
---
# release/A72 verify-history-held

One module `05-src/history/judge-held.mjs` with a pure judge `judgeHeld({ declared, live, control })` and a command line `--declared <file of the declared entries> --live <file of the rules in force> --control <control id>` that exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN. The module is the judge release/CTL26 declares. The declared entries are the rules of the Promoting stage in `stages.json`, each traced to its control, so the station, not the judge, owns the list and the same judge serves any other control that is implemented as a ruleset rule; the rules in force are what GitHub lists for the default branch. Reading them, through Hosting, and running the check on a schedule or on a push are later slices with their own Changes.
`````

## Draft of CTL25.md

`````
---
id: release/CTL25
title: hold History
description: It keeps the history of main from being rewritten: a push that does not move main forward is refused.
type: preventive
status: designed
has: [release/I54]
evidence: [fixture:2, real:2, provoked:1:fail]
---
# release/CTL25 hold History

A preventive control. The history of `main` is never rewritten: a push that does not move `main` forward, a force-push above all, is refused before it lands, and no one may bypass it. It replaces the same protection of the old promotion ruleset, and the push judge release/CTL22 `verify History`, which could only reveal a rewrite afterwards, is retired.

It is explained by what it controls. How it is realized is a detail of the station: the Promoting station declares an entry for it in `stages.json`, beside the detections the station requires, and the ruleset source `05-src/wiring/rulesets/promoting.json` carries it as a rule. The same holds for the preventive controls that are realized by requiring a detection at the station: release/CTL5 and release/CTL20, and likely release/CTL10, stay controls and are renamed and re-explained by what they control in later slices, each its own Change.

It operates only once the Owner has loaded the ruleset, by the ruleset update procedure, and then retires the rule of the old ruleset, in that order, so that no moment is unprotected. It declares its own minimum evidence: two fixture runs of the source and its declaration, two real observations that it is in force on the real repository (release/CTL26), one when the ruleset is loaded and one after the old ruleset's rule is retired, and one provoked failure, a force-push refused on a scratch branch under an equivalent live ruleset, counted only when the same push is accepted without the rule. The provoked run needs a live ruleset on a scratch branch, which the Owner creates.

It makes no claim about a deletion of `main`. It has one Intent, release/I54.
`````

## Draft of CTL26.md

`````
---
id: release/CTL26
title: verify History held
description: It reveals whether the keeping of main's history is in force.
type: detective
status: designed
has: [release/I54]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL26 verify History held

A detective control, the partner of release/CTL25. `verify History held` compares what the Promoting station declares for `hold History` with the rules in force for the default branch and says PASS when it is in force as declared, FAIL naming what is not, and UNKNOWN when either side could not be read or the station declares nothing for it, which never passes. PASS is not an approval and not a merge decision.

It reveals; it does not prevent. It reads what is in force, not the ruleset source, so it sees what the source cannot: a ruleset that was never loaded, disabled or edited in the settings. Entries of other controls are not its business, and a rule in force that the station does not declare is no finding. Reading the rules from GitHub and running the check are later slices. A fixture with the declared entry missing counts as its provoked failure.

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
// verify History held: is every rule that the Promoting station declares for a control in force for the default branch?
// The declared entries (the rules of the stage in stages.json, each traced to the control it implements) and the rules in force (as GitHub lists the rules
// that apply to a branch: only those in force) are handed over by the wiring. This module reads no source, no Git and no network. Entries traced to
// another control are not its business, and a rule in force that is not declared is no finding: the station owns its list.
import { readFileSync } from 'node:fs';

const isRule = (r) => r && typeof r === 'object' && !Array.isArray(r) && typeof r.type === 'string';
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sorted = (o) => Object.fromEntries(Object.entries(o ?? {}).sort(([a], [b]) => (a < b ? -1 : 1)));
const settingsOf = (r) => { const { required_status_checks: _checks, ...settings } = r.parameters ?? {}; return sorted(settings); };
const checksOf = (r) => (r.checks ?? r.parameters?.required_status_checks ?? []).map((c) => ({ name: c.name ?? c.context, key: `${c.name ?? c.context}#${c.integration_id}` }));

export function judgeHeld({ declared, live, control }) {
  if (![declared, live].every((l) => Array.isArray(l) && l.every(isRule)) || typeof control !== 'string') return { verdict: 'UNKNOWN', message: 'the declared rules or the rules in force could not be read' };
  const own = declared.filter((d) => d.control === control);
  if (!own.length) return { verdict: 'UNKNOWN', message: `the station declares no rule for ${control}` };
  const missing = [];
  for (const d of own) {
    const ofType = live.filter((r) => r.type === d.type);
    if (!ofType.some((r) => same(settingsOf(r), settingsOf(d)))) { missing.push(d.type); continue; }
    const inForce = new Set(ofType.flatMap((r) => checksOf(r).map((c) => c.key)));
    for (const c of checksOf(d)) if (!inForce.has(c.key)) missing.push(`${d.type} (${c.name})`);
  }
  if (missing.length) return { verdict: 'FAIL', missing, message: `declared for ${control} and not in force: ${missing.join(', ')}` };
  return { verdict: 'PASS' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try { r = judgeHeld({ declared: JSON.parse(readFileSync(arg('--declared'), 'utf8')), live: JSON.parse(readFileSync(arg('--live'), 'utf8')), control: arg('--control') }); } catch (e) { r = { verdict: 'UNKNOWN', message: String(e.message) }; }
  console.log(`${r.verdict}${r.message ? `: ${r.message}` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````
