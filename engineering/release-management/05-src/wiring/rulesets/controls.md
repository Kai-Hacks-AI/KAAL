# Ruleset set 1: controls

Every setting of the five rulesets is a control with its place (release/C34). `kept` = as in the old ruleset it succeeds; `changed` = deliberately different, with its reason; `new` = no old counterpart; `open` = decided later, not dropped. The table and the `<ruleset>.json` files agree (Case T455). Nothing here is installed: the Owner installs set 1 beside the old three.

Not in set 1, each its own Change: the WIRE judge and the hotfix qualifier as required checks, Guard for tags, a replacement for `Promotion Source`.

| ruleset | rule | parameter or context | value | status | protects |
| --- | --- | --- | --- | --- | --- |
| promotion | target | branch ~DEFAULT_BRANCH | | kept | which refs this ruleset protects |
| promotion | bypass_actors | | [] | kept | no one bypasses |
| promotion | deletion | | | kept | the branch cannot be deleted |
| promotion | non_fast_forward | | | kept | history cannot be rewritten (no force push) |
| promotion | pull_request | | | kept | every change arrives through a reviewed pull request |
| promotion | pull_request | required_approving_review_count | 1 | kept | approvals needed |
| promotion | pull_request | dismiss_stale_reviews_on_push | true | kept | a push dismisses earlier approvals |
| promotion | pull_request | required_reviewers | [] | kept | no fixed reviewer teams |
| promotion | pull_request | require_code_owner_review | true | kept | code owners must approve |
| promotion | pull_request | dismissal_restriction | {"enabled": false, "allowed_actors": []} | kept | nobody may dismiss reviews |
| promotion | pull_request | require_last_push_approval | false | kept | the last pusher may approve |
| promotion | pull_request | required_review_thread_resolution | true | kept | threads must be resolved |
| promotion | pull_request | require_extra_approval_for_unattributed_changes | true | kept | extra approval for unattributed changes |
| promotion | pull_request | allowed_merge_methods | ["squash", "rebase"] | kept | merge methods allowed |
| promotion | required_status_checks | | | kept | a head merges only with the named checks green |
| promotion | required_status_checks | strict_required_status_checks_policy | false | changed (the Owner: no "up to date" in new rulesets) | strict required status checks policy |
| promotion | required_status_checks | do_not_enforce_on_create | false | kept | do not enforce on create |
| promotion | required_status_checks | Change Isolation | | kept | check must be green |
| promotion | required_status_checks | Branching | | kept | check must be green |
| promotion | required_status_checks | Promotion Source | | kept | check must be green |
| promotion | required_status_checks | Hosting (Linux) | | kept | check must be green |
| promotion | required_status_checks | Hosting (Windows) | | kept | check must be green |
| promotion | required_status_checks | Hosting (macOS) | | kept | check must be green |
| promotion | required_status_checks | Workspaces | | kept | check must be green |
| promotion | required_status_checks | Acceptance | | kept | check must be green |
| promotion | required_status_checks | Engineering | | kept | check must be green |
| promotion | required_status_checks | CodeQL (actions) | | kept | check must be green |
| promotion | required_status_checks | CodeQL (javascript-typescript) | | kept | check must be green |
| promotion | required_status_checks | Change Isolation (review) | | kept | check must be green |
| promotion | required_status_checks | Guard | | changed (added: Guard is required in all five) | check must be green |
| promotion | required_status_checks | Guard (macOS) | | changed (added: Guard is required in all five) | check must be green |
| promotion | required_status_checks | Guard (Windows) | | changed (added: Guard is required in all five) | check must be green |
| promotion | code_scanning | | | kept | CodeQL alerts block the merge |
| promotion | code_scanning | code_scanning_tools | [{"tool": "CodeQL", "security_alerts_threshold": "high_or_higher", "alerts_threshold": "errors"}] | kept | CodeQL, errors, high or higher |
| promotion | merge_queue | | | kept | one squash merge at a time, all green |
| promotion | merge_queue | merge_method | "SQUASH" | kept | merge method |
| promotion | merge_queue | max_entries_to_build | 1 | kept | max entries to build |
| promotion | merge_queue | min_entries_to_merge | 1 | kept | min entries to merge |
| promotion | merge_queue | max_entries_to_merge | 1 | kept | max entries to merge |
| promotion | merge_queue | min_entries_to_merge_wait_minutes | 0 | kept | min entries to merge wait minutes |
| promotion | merge_queue | grouping_strategy | "ALLGREEN" | kept | grouping strategy |
| promotion | merge_queue | check_response_timeout_minutes | 60 | kept | check response timeout minutes |
| integration | target | branch refs/heads/kaal/**, refs/heads/kaal/**/* | | kept | which refs this ruleset protects |
| integration | bypass_actors | | [] | kept | no one bypasses |
| integration | non_fast_forward | | | kept | history cannot be rewritten (no force push) |
| integration | pull_request | | | kept | every change arrives through a reviewed pull request |
| integration | pull_request | required_approving_review_count | 1 | kept | approvals needed |
| integration | pull_request | dismiss_stale_reviews_on_push | true | kept | a push dismisses earlier approvals |
| integration | pull_request | required_reviewers | [] | kept | no fixed reviewer teams |
| integration | pull_request | require_code_owner_review | false | kept | code owners must approve |
| integration | pull_request | dismissal_restriction | {"enabled": false, "allowed_actors": []} | kept | nobody may dismiss reviews |
| integration | pull_request | require_last_push_approval | false | kept | the last pusher may approve |
| integration | pull_request | required_review_thread_resolution | true | kept | threads must be resolved |
| integration | pull_request | require_extra_approval_for_unattributed_changes | true | kept | extra approval for unattributed changes |
| integration | pull_request | allowed_merge_methods | ["squash", "rebase", "merge"] | kept | merge methods allowed |
| integration | required_status_checks | | | kept | a head merges only with the named checks green |
| integration | required_status_checks | strict_required_status_checks_policy | false | changed (the Owner: no "up to date" in new rulesets) | strict required status checks policy |
| integration | required_status_checks | do_not_enforce_on_create | true | kept | do not enforce on create |
| integration | required_status_checks | Change Isolation | | kept | check must be green |
| integration | required_status_checks | Hosting (Linux) | | kept | check must be green |
| integration | required_status_checks | Hosting (Windows) | | kept | check must be green |
| integration | required_status_checks | Hosting (macOS) | | kept | check must be green |
| integration | required_status_checks | Workspaces | | kept | check must be green |
| integration | required_status_checks | Branching | | kept | check must be green |
| integration | required_status_checks | Acceptance | | kept | check must be green |
| integration | required_status_checks | Engineering | | kept | check must be green |
| integration | required_status_checks | Promotion Source | | kept | check must be green |
| integration | required_status_checks | CodeQL (actions) | | kept | check must be green |
| integration | required_status_checks | CodeQL (javascript-typescript) | | kept | check must be green |
| integration | required_status_checks | Guard | | kept | check must be green |
| integration | required_status_checks | Guard (macOS) | | kept | check must be green |
| integration | required_status_checks | Guard (Windows) | | kept | check must be green |
| integration | code_scanning | | | kept | CodeQL alerts block the merge |
| integration | code_scanning | code_scanning_tools | [{"tool": "CodeQL", "security_alerts_threshold": "high_or_higher", "alerts_threshold": "errors"}] | kept | CodeQL, errors, high or higher |
| hotfixing | target | branch refs/heads/hotfix/** | | new | which refs this ruleset protects |
| hotfixing | bypass_actors | | [] | new | no one bypasses |
| hotfixing | non_fast_forward | | | new (copy of integration) | history cannot be rewritten (no force push) |
| hotfixing | pull_request | | | new (copy of integration) | every change arrives through a reviewed pull request |
| hotfixing | pull_request | required_approving_review_count | 1 | new (copy of integration) | approvals needed |
| hotfixing | pull_request | dismiss_stale_reviews_on_push | true | new (copy of integration) | a push dismisses earlier approvals |
| hotfixing | pull_request | required_reviewers | [] | new (copy of integration) | no fixed reviewer teams |
| hotfixing | pull_request | require_code_owner_review | false | new (copy of integration) | code owners must approve |
| hotfixing | pull_request | dismissal_restriction | {"enabled": false, "allowed_actors": []} | new (copy of integration) | nobody may dismiss reviews |
| hotfixing | pull_request | require_last_push_approval | false | new (copy of integration) | the last pusher may approve |
| hotfixing | pull_request | required_review_thread_resolution | true | new (copy of integration) | threads must be resolved |
| hotfixing | pull_request | require_extra_approval_for_unattributed_changes | true | new (copy of integration) | extra approval for unattributed changes |
| hotfixing | pull_request | allowed_merge_methods | ["squash", "rebase", "merge"] | new (copy of integration) | merge methods allowed |
| hotfixing | required_status_checks | | | new (copy of integration) | a head merges only with the named checks green |
| hotfixing | required_status_checks | strict_required_status_checks_policy | false | new (copy of integration) | strict required status checks policy |
| hotfixing | required_status_checks | do_not_enforce_on_create | true | new (copy of integration) | do not enforce on create |
| hotfixing | required_status_checks | Change Isolation | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Hosting (Linux) | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Hosting (Windows) | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Hosting (macOS) | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Workspaces | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Branching | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Acceptance | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Engineering | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Promotion Source | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | CodeQL (actions) | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | CodeQL (javascript-typescript) | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Guard | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Guard (macOS) | | new (copy of integration) | check must be green |
| hotfixing | required_status_checks | Guard (Windows) | | new (copy of integration) | check must be green |
| hotfixing | code_scanning | | | new (copy of integration) | CodeQL alerts block the merge |
| hotfixing | code_scanning | code_scanning_tools | [{"tool": "CodeQL", "security_alerts_threshold": "high_or_higher", "alerts_threshold": "errors"}] | new (copy of integration) | CodeQL, errors, high or higher |
| wiring | target | branch refs/heads/wire/** | | new | which refs this ruleset protects |
| wiring | bypass_actors | | [] | new | no one bypasses |
| wiring | non_fast_forward | | | new (copy of integration) | history cannot be rewritten (no force push) |
| wiring | pull_request | | | new (copy of integration) | every change arrives through a reviewed pull request |
| wiring | pull_request | required_approving_review_count | 1 | new (copy of integration) | approvals needed |
| wiring | pull_request | dismiss_stale_reviews_on_push | true | new (copy of integration) | a push dismisses earlier approvals |
| wiring | pull_request | required_reviewers | [] | new (copy of integration) | no fixed reviewer teams |
| wiring | pull_request | require_code_owner_review | false | new (copy of integration) | code owners must approve |
| wiring | pull_request | dismissal_restriction | {"enabled": false, "allowed_actors": []} | new (copy of integration) | nobody may dismiss reviews |
| wiring | pull_request | require_last_push_approval | false | new (copy of integration) | the last pusher may approve |
| wiring | pull_request | required_review_thread_resolution | true | new (copy of integration) | threads must be resolved |
| wiring | pull_request | require_extra_approval_for_unattributed_changes | true | new (copy of integration) | extra approval for unattributed changes |
| wiring | pull_request | allowed_merge_methods | ["squash", "rebase", "merge"] | new (copy of integration) | merge methods allowed |
| wiring | required_status_checks | | | new (copy of integration) | a head merges only with the named checks green |
| wiring | required_status_checks | strict_required_status_checks_policy | false | new (copy of integration) | strict required status checks policy |
| wiring | required_status_checks | do_not_enforce_on_create | true | new (copy of integration) | do not enforce on create |
| wiring | required_status_checks | Change Isolation | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Hosting (Linux) | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Hosting (Windows) | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Hosting (macOS) | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Workspaces | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Branching | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Acceptance | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Engineering | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Promotion Source | | new (copy of integration) | check must be green |
| wiring | required_status_checks | CodeQL (actions) | | new (copy of integration) | check must be green |
| wiring | required_status_checks | CodeQL (javascript-typescript) | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Guard | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Guard (macOS) | | new (copy of integration) | check must be green |
| wiring | required_status_checks | Guard (Windows) | | new (copy of integration) | check must be green |
| wiring | code_scanning | | | new (copy of integration) | CodeQL alerts block the merge |
| wiring | code_scanning | code_scanning_tools | [{"tool": "CodeQL", "security_alerts_threshold": "high_or_higher", "alerts_threshold": "errors"}] | new (copy of integration) | CodeQL, errors, high or higher |
| publishing | target | tag refs/tags/trial-*@* | | kept | which refs this ruleset protects |
| publishing | bypass_actors | | [] | kept | no one bypasses |
| publishing | creation | | | kept | tags of this pattern cannot be created by anyone |
| publishing | update | | | kept | tags of this pattern cannot be moved |
| publishing | deletion | | | kept | the branch cannot be deleted |
| publishing | non_fast_forward | | | kept | history cannot be rewritten (no force push) |
| publishing | guard | | OPEN | open | Guard for tags: a tag rule cannot require status checks; the design is a later Change (release/C29 left it open) |
