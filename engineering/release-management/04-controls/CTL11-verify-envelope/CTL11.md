---
id: release/CTL11
title: verify Envelope
description: It reveals whether the envelope of a pull request is well formed, whatever its type.
type: detective
status: designed
has: [release/I7]
---
# release/CTL11 verify Envelope

A detective control. `verify Envelope` reads a pull request, or a drafted body, against the rules its type's template declares, and says whether its envelope is well formed: the route (base and head), the title, the chapters, their order and what each must hold, the `HOW TO WORK` table, the `Driven-by` identity of its commits and, for a WIRE, the control it names. It judges the envelope only. It never judges whether what is written is true; that is for review and approval.

It says PASS when the envelope is well formed, FAIL with the rule it breaks, and UNKNOWN when a fact could not be read, which never passes. PASS is not an approval and not a merge decision.

It runs as the same check in three places, each a declared instance with its own stage: the command line, by hand, at Developing; the pre-push hook, the local part only, at Developing; and CI on the pull request, the full envelope, read only. Only the CI run can later be required by a ruleset, and that would be another control with its own Owner decision.

It has one Intent, release/I7.
