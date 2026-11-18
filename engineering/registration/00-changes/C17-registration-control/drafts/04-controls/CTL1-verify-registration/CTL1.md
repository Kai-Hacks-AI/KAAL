---
id: engineering/CTL1
title: verify Registration
description: It reveals each capability, Engineering area and Change that has no kaal-guard.json, or one with no executable check.
type: detective
status: implemented
has: [engineering/I1]
---
# engineering/CTL1 verify Registration

A detective control. `verify Registration` reads the changed files of a pull request, or the whole repository, and reports each place (a capability root, an Engineering area root, a Change folder) whose `kaal-guard.json` is missing, unreadable, empty, or holds a check with no id, no run command or a repeated id.

Boundary. It reads files only. It runs no registered check, writes nothing, needs no network and names no stage: registration declares what Guard executes, never where. Whether a registered check is green is Guard's and the integration controls' to judge. Wiring this control into a blocking gate is a second, preventive control and needs the Owner's decision.

It has one Intent, engineering/I1.
