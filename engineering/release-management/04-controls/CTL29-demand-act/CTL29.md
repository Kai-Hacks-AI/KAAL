---
id: release/CTL29
title: demand Act
description: It reveals a promotion of a finished collector whose Changes are not reflected by a retro.
type: detective
status: designed
has: [release/I58]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL29 demand Act

A detective control that is meant to become preventive. A collector is not to be promoted when its work is finished and a Change it carries is reflected by no retro, or when more than one retro reflects the Changes it carries: once the Promoting station requires the check of release/A74 on the promotion, the ACT cannot be skipped. A collector that is not finished owes no ACT yet, and a Change that has its retro is not asked for more; what a retro must contain is the control `verify Act`. It sits on the promotion and never on the collector, where it would hold back the DO that closes the last red Case. It has one Intent, release/I58, which holds the details with the Requirements and Architecture under it. It rolls out detective first: (1) its verdict is observed on real promotions without blocking; (2) it runs as an advisory CI check behind a feature flag and the evidence is collected; (3) only after validation and the Owner's explicit authorization is it declared on the Promoting station and loaded by the Owner, and from then on the control is preventive and its type changes in the Change that makes it so; release/CTL26 then observes that the requirement is in force. The judge only judges; once the check is required UNKNOWN does not pass.
