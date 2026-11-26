---
id: release/CTL36
title: verify Workflow names
description: It reveals a workflow with no display name, the bare name KAAL, or a name another workflow has, and a ratchet allows the five known ones until they are renamed.
type: preventive
status: designed
has: [release/I70]
evidence: [fixture:3, real:2, provoked:1:fail]
strategy: ratchet
baseline-source: engineering/release-management/04-controls/CTL36-verify-workflow-names/baseline.json
owner: release management
exit: The accepted baseline is empty, so the filter and the baseline file are removed and the control is a plain preventive control.
---
# release/CTL36 verify Workflow names

A preventive control on a ratchet, and it blocks nothing yet. `judge-workflow-names.mjs` reads `.github/workflows` of the folder it is given and writes the findings, a list of names: `<file>:missing-name`, `<file>:generic-name` (the bare repository name `KAAL`) and `<file>:duplicate-name`. It writes no verdict. The verdict is kaal-controls' `judge-mode --mode ratchet` over the findings of the head, the baseline file of the head and the accepted baseline `previous` read from the base of the pull request, never from the candidate. It says UNKNOWN, which never passes, when a workflow cannot be read or its name is not plain text.

The baseline is the five `generic-name` findings of today. A rename passes and shrinks it in the same pull request; a new finding, or a baseline that grows, fails. The rule is deliberately narrow: a display name that is present, not `KAAL`, and unique. A stricter naming scheme is a separate Change with its own baseline.

The ratchet is declared here and nowhere else: no `:ratchet` station, no third mode, and no deadline, which is a planning concern outside the control. It operates only once a workflow job that runs it is installed by a WIRE and a ruleset names the check; both need the Owner's go. It has one Intent, release/I70.
