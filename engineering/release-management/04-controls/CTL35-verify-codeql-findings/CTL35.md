---
id: release/CTL35
title: verify CodeQL findings
description: It reveals an open CodeQL alert on the merge ref at or above the threshold, or that it cannot tell.
type: preventive
status: designed
has: [release/I69]
evidence: [fixture:3, real:2, provoked:1:fail]
---
# release/CTL35 verify CodeQL findings

A preventive control, and it blocks nothing yet. `judge-codeql-findings.mjs` reads the open code-scanning alerts of the ref of its run and writes the findings, a list of names `alert:<number>`, one for each alert at or above either threshold: `security_alerts_threshold` (`high_or_higher`) and `alerts_threshold` (`errors`), declared in the workflow source. The verdict is kaal-controls' `judge-mode --mode preventive` over those findings. When it cannot tell, an expected analysis that is not there included (an alert set it cannot trust is never clean), it writes no file and the verdict is UNKNOWN, which never passes. It does not name a missing or errored analysis: that is release/CTL34.

## Scope: the findings are PR-scoped

It reads the open alerts of the merge ref, and the experiment (`do.md`, "Inherited-finding experiment") observed that the merge ref of a pull request lists only the alerts that pull request introduces. An alert that is open only on the base branch does not show on the merge ref of an unrelated pull request, so it does not block that pull request: an unrelated pull request passes, and a pull request that introduces an alert fails. The control therefore judges what a change adds. It does not judge the base branch itself.

Coverage of alerts that stay open on the base branch (a separate base-branch check, for example on the default branch or on a schedule) is not part of this control. Whether to have it is an Owner decision, not made here.

It operates only once the workflow job is installed by a WIRE and a ruleset names the check; both need the Owner's go. It is no ratchet: there is no baseline. It has one Intent, release/I69.
