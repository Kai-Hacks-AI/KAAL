# C56 interface

The drafts of what the DO adds. Case T730 reads the control draft and T731 the Intent draft. None of them exists on `main` yet.

## Draft of CTL5.md

````
---
id: release/CTL5
title: gate analyze Vulnerabilities
description: It stops a promotion whose dependency changes carry a known vulnerability.
type: preventive
has: [release/I30]
---
# release/CTL5 gate analyze Vulnerabilities

A preventive control. The promoting ruleset requires `analyze Vulnerabilities (Promoting)`, the report of release/CTL2, so a promotion that adds or changes a runtime dependency with a known advisory, at any severity, cannot merge. It fails closed: a promotion whose dependency changes cannot be analyzed (the analysis is unavailable, incomplete or inconclusive) ends the step non-zero and does not merge, because UNKNOWN never passes. The report is the detection and stays release/CTL2; this control is the requirement that uses it.

The requirement is stated in the ruleset source, `05-src/wiring/rulesets/promoting.json`. It operates only once the Owner has loaded that ruleset, by the ruleset update procedure, and the workflow that makes the check is installed. Until then no operation is claimed.

It has one Intent, release/I30. Whether a vulnerable dependency can reach main in a promotion is answered from the Intent, by its Requirements and Architecture, not stated here.
````

## Draft of I30.md

````
---
id: release/I30
title: no vulnerable promotion
---
# release/I30 no vulnerable promotion

A promotion never brings into main a runtime dependency with a known vulnerability. A promotion whose dependency changes cannot be analyzed does not proceed either. Owner: release management.
````

## The workflow source

`05-src/wiring/workflows/analyze-vulnerabilities.yml`: in the `dependency-review-action` step of both jobs, `with:` holds `fail-on-severity: low` and `fail-on-scopes: runtime`, and no `allow-ghsas`. The `integrating` job holds `warn-only: true` in that step and `continue-on-error: true` on the `Interpret the result` step. The `promoting` job holds neither.

## The ruleset source

`05-src/wiring/rulesets/promoting.json`: `required_status_checks` lists `verify Stages (Promoting)` then `analyze Vulnerabilities (Promoting)`, each with `integration_id` 15368. `integrating.json` and the other four are unchanged.

## Where it lives

`engineering/release-management/04-controls/CTL5-gate-analyze-vulnerabilities/CTL5.md` with its control test `T730.test.mjs` beside it; `01-intent/I30-no-vulnerable-promotion/I30.md` with `T731.test.mjs`; Cases T732 to T735 in this folder.
