---
id: controls/CTL1
title: verify Adapter
description: It reveals a control that is declared with a station, or delivered, and does not run through the adapter.
type: detective
status: designed
has: [controls/I20]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# controls/CTL1 verify Adapter

A detective control with one property: a control that has a station, or is delivered, does not run through the adapter as observed in its actual delivery, or is not observed. It is meant to become preventive by the change protocol, in its own Change (controls/C142), after the Owner's go.
