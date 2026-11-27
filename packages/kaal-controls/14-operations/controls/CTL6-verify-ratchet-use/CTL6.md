---
id: controls/CTL6
title: verify Ratchet use
description: It reveals a control that declares strategy ratchet and does not use the ratchet library.
type: detective
status: designed
has: [controls/I31]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# controls/CTL6 verify Ratchet use

A detective control with one property: a control that declares `strategy: ratchet` takes its baseline, comparison and regression rule from the ratchet library and computes no allowance of its own, as observed in the control's entry. Unknown is never a finding and never baselined. It is meant to become preventive as a ratchet by the change protocol, with the baseline Release adopts, and it is not wired by this Change.
