---
id: release/CTL40
title: verify Promotion origin
description: It reveals whether a pull request into the default branch comes from a delivery branch of this repository.
type: preventive
status: designed
has: [release/I50]
evidence: [fixture:2, real:2, provoked:1:fail]
---
# release/CTL40 verify Promotion origin

A preventive control that gates nothing yet. `judge-origin.mjs` reads the event's refs alone and runs `promotionOrigin` of the Promotion Source checker (engineering/github/lineage.ts) through the controls adapter, in detective mode while the check is not required. PASS: the rule holds. REPORT (FAIL in preventive mode): the rule does not hold, one finding with the checker's own message. UNKNOWN: a fact cannot be read; that never counts as a pass. A pull request it does not judge answers not applicable and writes no record, so it is never verification evidence.

It is one of two controls of the replacement of the Promotion Source check that runs on `pull_request_target` (release/C153, check 4), so it has the one Intent that asks for that replacement, release/I50. It runs only when the workflow source `promotion-source-plain.yml` is installed by a WIRE, and it gates only when a ruleset names its job; both need the Owner's go. Its delivery map row is written with that WIRE.
