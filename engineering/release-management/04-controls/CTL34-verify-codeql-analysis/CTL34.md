---
id: release/CTL34
title: verify CodeQL analysis
description: It reveals whether an expected CodeQL configuration has no analysis of the merge-result sha, or an analysis that reports an error, or whether it cannot tell.
type: preventive
status: designed
has: [release/I68]
evidence: [fixture:3, real:2, provoked:1:fail]
---
# release/CTL34 verify CodeQL analysis

A preventive control, and it blocks nothing yet. `judge-codeql-analysis.mjs` reads the code-scanning analyses of the sha and ref of its run and writes the findings, a list of names: `missing:<category>` for an expected configuration with no analysis of the sha and `errored:<category>` for one whose analysis reports an error. The expected configurations are declared in the workflow source (`CODEQL_EXPECTED`) and the verdict is kaal-controls' `judge-mode --mode preventive` over those findings. When it cannot tell (the API fails, an input is unset, an analysis is still absent when a bounded wait of ten minutes ends) it writes no file and the verdict is UNKNOWN, which never passes. It says nothing about what the analysis found: that is release/CTL35.

It operates only once the workflow job that runs it is installed by a WIRE and a ruleset names the check; both need the Owner's go. It is no ratchet: there is no baseline and it is in or out from the first run. It has one Intent, release/I68.
