# C105 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists.

## Draft of I54.md

`````
---
id: release/I54
title: main history is kept
---
# release/I54 main history is kept

Contract: the branch `main` is only ever moved forward. Every commit that was `main` stays reachable from `main`. A force-push, which rewrites `main`, destroys the record that Changes, reviews and promotions rest on. Reason: a delivery that can be rewritten cannot be audited. Owner: release management. The gate of the Promoting station holds this: the `promoting` ruleset carries the rule `non_fast_forward`, which refuses a push that does not move `main` forward before it lands. release/CTL25 `gate Promotion` is that preventive control and release/CTL26 `verify Promotion gate` reveals whether what the station declares is in force. A deletion of `main` is a different protection, held today by the `deletion` rule of the old ruleset; it is not claimed here and is tracked as its own Intent and control.
`````

## Draft of F77.md

`````
---
id: release/F77
title: gate-promotion-history
kind: functional
serves: [release/I54]
---
# release/F77 gate-promotion-history

The gate of the Promoting station holds the rule `non_fast_forward` for the default branch, active, with an empty bypass list, so a push that does not move `main` forward is refused before it lands. The rule has no parameters. The station declares it in `stages.json`, traced to release/CTL25 `gate Promotion`, and states it in the ruleset source `05-src/wiring/rulesets/promoting.json`, so `verify Stages` judges the source against the declaration. The required list belongs to the station's declaration: the detections that the gate requires do not name it. The requirement changes no other setting of the ruleset, does not touch `integrating` and makes no claim about a deletion of `main`. It operates only once the Owner has loaded the ruleset.
`````

## Draft of A68.md

`````
---
id: release/A68
title: gate-promotion-history
addresses: [release/F77]
---
# release/A68 gate-promotion-history

The source `05-src/wiring/rulesets/promoting.json` lists `{ "type": "non_fast_forward" }` after the required status checks, and `stages.json` declares `{ "type": "non_fast_forward", "control": "release/CTL25" }` in the rules of the Promoting stage, so `verify Stages` judges the source against the declaration with the judge it has, which already compares the rule types and their settings and traces each rule to a declared control that has an Intent. The control release/CTL25 `gate Promotion` is the gate of the station: its required set is the rules and checks the station declares, and later slices move the gate controls release/CTL5 and release/CTL20 (and likely release/CTL10) into it, each its own Change. The push judge `05-src/history/verify-history.mjs`, its workflow source `05-src/wiring/workflows/verify-history.yml` and the control release/CTL22 leave: they could only reveal a rewrite after it had happened. Loading the ruleset is the Owner's step, by the ruleset update procedure, and the Owner retires the old ruleset's rule only after the new one is loaded and has been observed in force.
`````

## Draft of F81.md

`````
---
id: release/F81
title: verify-promotion-gate
kind: functional
serves: [release/I54]
---
# release/F81 verify-promotion-gate

A check reads the rules the Promoting station declares and the rules in force for the default branch, both handed to it as lists of rules. It says PASS when every declared rule is in force with the settings declared, every declared required check included, FAIL naming each declared rule or check that is not in force or whose settings differ, and UNKNOWN when either list is not a list of rules, could not be read or the station declares no rule, which never passes. A rule in force that the station does not declare is no finding. It reads no ruleset source, no Git and no network: which rules are in force is the wiring's fact. It does not prevent anything and does not approve or merge.
`````

## Draft of A72.md

`````
---
id: release/A72
title: verify-promotion-gate
addresses: [release/F81]
---
# release/A72 verify-promotion-gate

One module `05-src/history/judge-held.mjs` with a pure judge `judgeGate({ declared, live })` and a command line `--declared <file of the declared rules> --live <file of the rules in force>` that exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN. The module is the judge release/CTL26 declares. The declared rules are the rules of the Promoting stage in `stages.json`, so the station, not the judge, owns the list; the rules in force are what GitHub lists for the default branch. Reading them, through Hosting, and running the check on a schedule or on a push are later slices with their own Changes.
`````

## Draft of CTL25.md

`````
---
id: release/CTL25
title: gate Promotion
description: It stops a promotion into main unless the station's required detections pass and its rules hold, history among them.
type: preventive
status: designed
has: [release/I54]
evidence: [fixture:2, real:2, provoked:1:fail]
---
# release/CTL25 gate Promotion

A preventive control, the gate of the Promoting station. The real prevention is the CI of the station: the `promoting` ruleset requires the checks that the detections report and holds the rules the station declares, and what the station declares is its own list, in `stages.json`; the detections do not name stations. This first slice adds the rule `non_fast_forward` to the gate, so a push that does not move `main` forward, a force-push above all, is refused before it lands. It replaces the same rule of the old promotion ruleset, and the push judge release/CTL22 `verify History`, which could only reveal a rewrite afterwards, is retired.

Later slices, each its own Change, move the gate controls release/CTL5 (`gate analyze Vulnerabilities`) and release/CTL20 (`gate verify Triggers`), and likely release/CTL10, into this gate's required set, so the gate holds one declaration with the detections it requires and retires the single-check gates. Until then they stay as they are.

The requirement is stated in the ruleset source, `05-src/wiring/rulesets/promoting.json`, and declared in `stages.json`. It operates only once the Owner has loaded that ruleset, by the ruleset update procedure, and then the Owner retires the rule of the old ruleset, in that order, so that no moment is unprotected. It declares its own minimum evidence: two fixture runs of the source and its declaration, two real observations that the declared rules are in force on the real repository (release/CTL26), one when the ruleset is loaded and one after the old ruleset's rule is retired, and one provoked failure, a force-push refused on a scratch branch under an equivalent live ruleset, counted only when the same push is accepted without the rule. The provoked run needs a live ruleset on a scratch branch, which the Owner creates.

It makes no claim about a deletion of `main`. It has one Intent for now, release/I54; the Intents of the single-check gates join it as they move in.
`````

## Draft of CTL26.md

`````
---
id: release/CTL26
title: verify Promotion gate
description: It reveals whether the rules the Promoting station declares are in force.
type: detective
status: designed
has: [release/I54]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL26 verify Promotion gate

A detective control, the partner of release/CTL25. `verify Promotion gate` compares the rules the Promoting station declares with the rules in force for the default branch and says PASS when every declared rule is in force with its declared settings and checks, FAIL naming what is not, and UNKNOWN when either side could not be read or the station declares nothing, which never passes. PASS is not an approval and not a merge decision.

It reveals; it does not prevent. It reads the rules that are in force, not the ruleset source, so it sees what the source cannot: a ruleset that was never loaded, disabled or edited in the settings. A rule in force that the station does not declare is no finding. Reading them from GitHub and running the check are later slices. A fixture with a declared rule missing counts as its provoked failure.

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
// verify Promotion gate: is every rule that the Promoting station declares in force for the default branch?
// The declared rules (the rules of the stage in stages.json) and the rules in force (as GitHub lists the rules that apply to a branch: only those in force)
// are handed over by the wiring. This module reads no source, no Git and no network. A rule in force that is not declared is no finding:
// the station owns its required list, and other rulesets may hold more.
import { readFileSync } from 'node:fs';

const isRule = (r) => r && typeof r === 'object' && !Array.isArray(r) && typeof r.type === 'string';
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sorted = (o) => Object.fromEntries(Object.entries(o ?? {}).sort(([a], [b]) => (a < b ? -1 : 1)));
const settingsOf = (r) => { const { required_status_checks: _checks, ...settings } = r.parameters ?? {}; return sorted(settings); };
const checksOf = (r) => (r.checks ?? r.parameters?.required_status_checks ?? []).map((c) => ({ name: c.name ?? c.context, key: `${c.name ?? c.context}#${c.integration_id}` }));

export function judgeGate({ declared, live }) {
  if (![declared, live].every((l) => Array.isArray(l) && l.every(isRule))) return { verdict: 'UNKNOWN', message: 'the declared rules or the rules in force could not be read' };
  if (!declared.length) return { verdict: 'UNKNOWN', message: 'the station declares no rule' };
  const missing = [];
  for (const d of declared) {
    const ofType = live.filter((r) => r.type === d.type);
    if (!ofType.some((r) => same(settingsOf(r), settingsOf(d)))) { missing.push(d.type); continue; }
    const inForce = new Set(ofType.flatMap((r) => checksOf(r).map((c) => c.key)));
    for (const c of checksOf(d)) if (!inForce.has(c.key)) missing.push(`${d.type} (${c.name})`);
  }
  if (missing.length) return { verdict: 'FAIL', missing, message: `declared by the station and not in force: ${missing.join(', ')}` };
  return { verdict: 'PASS' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try { r = judgeGate({ declared: JSON.parse(readFileSync(arg('--declared'), 'utf8')), live: JSON.parse(readFileSync(arg('--live'), 'utf8')) }); } catch (e) { r = { verdict: 'UNKNOWN', message: String(e.message) }; }
  console.log(`${r.verdict}${r.message ? `: ${r.message}` : ''}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````
