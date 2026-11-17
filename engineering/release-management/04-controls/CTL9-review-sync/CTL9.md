---
id: release/CTL9
title: review Sync
description: It puts a SYNC that is not a pure merge, or cannot be judged, in front of a person.
type: corrective
has: [release/I32, release/I33]
---
# release/CTL9 review Sync

A corrective control. When `verify Sync` fails or cannot judge, `review Sync` labels the pull request `sync: needs review`, requests a review and says in one comment, once per head, which conditions failed. It never approves, merges or edits the branch: repairing a SYNC would be another control.

It has one Intent, release/I32. It acts on the outcome of release/CTL7 and is a second control, not a part of it.
