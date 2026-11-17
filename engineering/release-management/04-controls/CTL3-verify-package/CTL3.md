---
id: release/CTL3
title: verify Package
description: It reveals when a package is one that npm or a consumer could not take, before anything is packed.
type: detective
has: [release/I28]
---
# release/CTL3 verify Package

A detective control. For one package, `judgePackage` names every finding about its manifest and about the registry before the package is packed, and gives `verified`, `failed` or `unknown`; `unknown` never passes. It reveals; it blocks nothing by itself.

Making it preventive is a separate, second control that wires this one into a release run or a ruleset. That control is not made here, and no run in release-management calls the judge yet, so no operation is claimed.

It has one Intent, release/I28. Whether a package can reach the registry intact is answered from the Intent, by its Requirements and Architecture, not stated here.
