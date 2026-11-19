---
id: release/CTL23
title: verify Delivery
description: It reveals whether a change mixes delivery paths with solution paths.
type: detective
status: designed
has: [release/I53]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL23 verify Delivery

A detective control. `verify Delivery` reads the paths of a change and the delivery declaration (release/A67) and says whether a change that touches a delivery location, a declared root or a declared root file, carries a path that is not delivery. PASS: no delivery location is touched, or every path is delivery. FAIL: a delivery path together with a solution path. UNKNOWN: the declaration or the reader cannot be read; that never counts as a pass.

It reveals; it gates nothing. It runs inside Change Isolation, after that gate's own verdict, and prints one line per path that is not delivery. Making it preventive is a different control with the same judge, made only after this one is Tested and the Owner decides. Core's own special rule is retired and not part of it.

It declares its own minimum evidence in the kinds controls/F30 asks of every control: two runs against a fixture (the wrapper on a scratch repository), one real run of Change Isolation on a pull request into `main` whose log shows a judged line, and one provoked failure (a mixed change made on purpose, RED on a `main` without the reachable reader and GREEN with it).

It has one Intent, release/I53.
