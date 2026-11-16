---
id: release/CTL3
title: readiness before pack
description: It stops a release of a package that npm or a consumer could not take, before anything is packed.
type: preventive
has: [release/I28]
---
# release/CTL3 readiness before pack

A preventive control. For one package, `judgeReadiness` names every finding about its manifest and about the registry before the package is packed. A release run that calls it stops on `failed`, and also on `unknown`, which never passes.

It stops one action: packing a package for release. It does so only inside a run that calls the judge; publishing by hand, and any run that does not call it, are not covered. No run in release-management calls it yet, so no operation is claimed.

It has one Intent, release/I28. Whether a package can reach the registry intact is answered from the Intent, by its Requirements and Architecture, not stated here.
