---
id: release/CTL38
title: verify Synchronization
description: It reveals whether what is proposed to a lineage is a valid synchronization or an ordinary Change.
type: preventive
status: designed
has: [release/I50]
evidence: [fixture:2, real:2, provoked:1:fail]
---
# release/CTL38 verify Synchronization

A preventive control that gates nothing yet. `judge-synchronization.mjs` reads its facts from Git and runs `synchronization` of the Branching checker (engineering/github/lineage.ts) through the controls adapter, in detective mode while the check is not required. PASS: the rule holds. REPORT (FAIL in preventive mode): the rule does not hold, one finding with the checker's own message. UNKNOWN: a fact cannot be read; that never counts as a pass.

It is one of three controls of the replacement of the Branching check that runs on `pull_request_target` (release/C153, check 2), so it has the one Intent that asks for that replacement, release/I50. It runs only when the workflow source `branching-plain.yml` is installed by a WIRE, and it gates only when a ruleset names its job; both need the Owner's go. Its delivery map row is written with that WIRE.
