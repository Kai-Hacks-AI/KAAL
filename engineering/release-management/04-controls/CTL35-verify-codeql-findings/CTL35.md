---
id: release/CTL35
title: verify CodeQL findings
description: It reveals an open CodeQL alert on the merge ref at or above the threshold, or that it cannot tell.
type: preventive
status: designed
has: [release/I69]
evidence: [fixture:3, provoked:1:fail]
---
# release/CTL35 verify CodeQL findings

A preventive control, and it blocks nothing yet. `judge-codeql-findings.mjs` reads the open code-scanning alerts of the ref of its run and writes the findings, a list of names `alert:<number>`, one for each alert at or above either threshold: `security_alerts_threshold` (`high_or_higher`) and `alerts_threshold` (`errors`), declared in the workflow source. The verdict is kaal-controls' `judge-mode --mode preventive` over those findings. When it cannot tell, an expected analysis that is not there included (an alert set it cannot trust is never clean), it writes no file and the verdict is UNKNOWN, which never passes. It does not name a missing or errored analysis: that is release/CTL34.

It reads the open alerts of the merge ref, so an alert already open on the base is a finding for every change that merges into it; whether that blocks an unrelated change is demonstrated before any activation (`do.md`). It operates only once the workflow job is installed by a WIRE and a ruleset names the check; both need the Owner's go. It is no ratchet: there is no baseline. It has one Intent, release/I69.
