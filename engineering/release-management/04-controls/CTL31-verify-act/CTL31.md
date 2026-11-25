---
id: release/CTL31
title: verify Act
description: It reveals a retro of a collector that is not in the form of a retro.
type: detective
status: designed
has: [release/I60]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL31 verify Act

A detective control that is meant to become preventive. A retro that reflects a Change of the collector is to be well formed, as kaal-retro judges its form, before the collector is promoted: a malformed retro, or a file that looks like a retro and that the finder of kaal-retro refuses, is revealed, so the ACT that `hold Act` and `demand Act` count is a retro. It does not say whether a retro is true, and it does not decide the form: that is kaal-retro's. It has one Intent, release/I60, which holds the details with the Requirements and Architecture under it. It rolls out detective first: (1) its verdict is observed on real retros without blocking; (2) it runs as an advisory CI check behind a feature flag and the evidence is collected; (3) only after validation and the Owner's explicit authorization is it declared on a station and loaded by the Owner, and from then on the control is preventive and its type changes in the Change that makes it so; release/CTL26 then observes that the requirement is in force. The judge only judges; once the check is required UNKNOWN does not pass.
