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
