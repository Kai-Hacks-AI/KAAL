---
id: release/CTL6
title: scan Vulnerabilities
description: It reveals when a dependency already on main has a known vulnerability, daily.
type: detective
has: [release/I31]
---
# release/CTL6 scan Vulnerabilities

A detective control. `scan Vulnerabilities (main)` runs daily and on request over the lockfile of `main`. It reports every runtime dependency with a known advisory of severity low or above, with no exemption, and says what it analyzed. A finding or an unreadable result is a red run. It blocks nothing: a ruleset that required it would be another control with its own Owner decision.

It has one Intent, release/I31. It complements `analyze Vulnerabilities` (release/CTL2), which compares base and head of a change and cannot see an advisory published against a dependency already on `main`.
