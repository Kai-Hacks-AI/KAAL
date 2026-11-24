# C49 interface

The draft of the control, as it is declared in the DO. Case T600 reads it. It is not a control on the collector until the DO.

## Draft of CTL2.md

````
---
id: release/CTL2
title: analyze Vulnerabilities
description: It reveals when a change brings a dependency with a known vulnerability, per stage.
type: detective
has: [release/I4]
---
# release/CTL2 analyze Vulnerabilities

A detective control. `analyze Vulnerabilities (Integrating)` and `analyze Vulnerabilities (Promoting)` report the dependencies a change adds or changes and the known vulnerabilities among them, and say what they analyzed. They block nothing by itself: a ruleset that requires a report is what would make a finding stop a change, and that is another control with its own Owner decision.

It has one Intent, release/I4. Whether a vulnerable dependency can enter unnoticed is answered from the Intent, by its Requirements and Architecture, not stated here.
````

## Where it lives

`engineering/release-management/04-controls/CTL2-analyze-vulnerabilities/CTL2.md`, with its control test `T600.test.mjs` beside it.
