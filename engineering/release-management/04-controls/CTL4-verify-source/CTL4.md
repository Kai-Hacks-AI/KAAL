---
id: release/CTL4
title: verify Source
description: It reveals when the source tests of a package did not run, or did not pass, in the package's own directory before it is released.
type: detective
has: [release/I29]
---
# release/CTL4 verify Source

A detective control. For one package, `judgeSource` decides from the record of its source test run whether the declared command ran in the package's directory and exited 0, and gives `verified`, `failed` or `unknown`; `unknown` never passes. It reveals; it blocks nothing by itself.

Making it preventive is a separate, second control that wires this one into a release run or a ruleset. That control is not made here, and no run in release-management calls the judge yet, so no operation is claimed.

It has one Intent, release/I29. Whether a package was tested before release is answered from the Intent, by its Requirements and Architecture, not stated here.
