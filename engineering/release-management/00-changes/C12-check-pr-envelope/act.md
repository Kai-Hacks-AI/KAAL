# C12 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Review rounds on the PLAN moved the design from a fixed list of types to a registry derived from declared templates, before any code existed. That made the DO a small step with four Cases to turn green. The reviewer's corrections on the DO each became a Case that fails on the previous head, so the fixes are proven and not only claimed.

## Learned

A judge that treats missing evidence like empty evidence passes what it never looked at: absent commits gave no finding. Absent must be reported as not judged, and empty as a failure. A regex that strips HTML comments is flagged by the code scanner as incomplete sanitization, and a small scanner that walks the markers avoids it. Disabling and re-enabling auto-merge starts a Branching run that fails while it is off, and the next run passes, so only the latest run counts.

## Lacked

A way to tell a Branching run that failed only because auto-merge was off from a real failure without reading its log. A shared strip-comments helper for the older checkers, which still use the flagged regex. The contract for declared templates on main, so the reader could be exercised on the real template files.

## Longed For

Every incomplete or not judged outcome refused as an admission before any enforcement. The older checkers moved onto the same comment scanner. The Hotfix delivery route defined, so the HOTFIX row can be written and C12 can leave the collector.
