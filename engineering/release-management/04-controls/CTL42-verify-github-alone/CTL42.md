---
id: release/CTL42
title: verify Github alone
description: It reveals whether a change that touches .github contains a path outside it.
type: preventive
status: designed
has: [release/I50]
evidence: [fixture:2, real:2, provoked:1:fail]
---
# release/CTL42 verify Github alone

A preventive control that gates nothing yet. `judge-github-alone.mjs` reads the paths of a change and runs the `.github` rule of the Change Isolation checker (engineering/change-isolation/check.mjs) through the controls adapter, in detective mode while the check is not required. PASS: the change touches no `.github` path, or only `.github` paths. REPORT (FAIL in preventive mode): a path outside `.github/` next to a `.github` path, one finding per such path. UNKNOWN: the changed paths cannot be read; that never counts as a pass.

The transition ledger of the checker is not carried into this control: no ledger input is supplied, so a ledger entry admits nothing here. Its retirement is its own Change (engineering/change-isolation/README.md). The delivery rule is not part of it: it is verify Delivery (release/CTL23), hosted by its own entry.

It is a part of the replacement of the Change Isolation check that runs on `pull_request_target` (release/C153, check 1), so it has the one Intent that asks for that replacement, release/I50. It runs only when the workflow source `change-isolation-plain.yml` is installed by a WIRE, and it gates only when a ruleset names its job; both need the Owner's go. Its delivery map row is written with that WIRE.
