---
id: release/CTL2
title: analyze Vulnerabilities
description: It reveals when a change brings a dependency with a known vulnerability, per stage.
type: detective
status: implemented
has: [release/I4]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL2 analyze Vulnerabilities

A detective control. `analyze Vulnerabilities (Integrating)` and `analyze Vulnerabilities (Promoting)` report the dependencies a change adds or changes and the known vulnerabilities among them, and say what they analyzed. They block nothing by itself: a ruleset that requires a report is what would make a finding stop a change, and that is another control with its own Owner decision.

It has one Intent, release/I4. Whether a vulnerable dependency can enter unnoticed is answered from the Intent, by its Requirements and Architecture, not stated here.
